from __future__ import annotations

import hashlib
import json
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import RLock
from typing import Any

from fastapi import HTTPException, Request, Response
from pydantic import BaseModel
from pwdlib import PasswordHash

from .config import AUTH_PATH
from .storage import ensure_directories


SESSION_COOKIE_NAME = "ctroadmap_session"
SESSION_SECONDS = 7 * 24 * 60 * 60
FAILED_LOGIN_LIMIT = 5
FAILED_LOGIN_COOLDOWN_SECONDS = 60
MIN_PASSCODE_LENGTH = 8

_password_hash = PasswordHash.recommended()
_auth_lock = RLock()


class AuthStatus(BaseModel):
    passcode_configured: bool
    authenticated: bool
    session_expires_at: str | None = None


class PasscodeRequest(BaseModel):
    passcode: str


class ChangePasscodeRequest(BaseModel):
    current_passcode: str
    new_passcode: str


class RemovePasscodeRequest(BaseModel):
    current_passcode: str


def auth_status(request: Request) -> AuthStatus:
    state = read_auth_state()
    if not passcode_is_configured(state):
        return AuthStatus(passcode_configured=False, authenticated=True)

    session = valid_session_for_request(state, request)
    return AuthStatus(
        passcode_configured=True,
        authenticated=session is not None,
        session_expires_at=session.get("expires_at") if session else None,
    )


def setup_passcode(payload: PasscodeRequest, request: Request, response: Response) -> AuthStatus:
    validate_passcode(payload.passcode)
    state = read_auth_state()
    if passcode_is_configured(state):
        raise HTTPException(status_code=409, detail="A Local Access Passcode is already configured.")

    now = utc_now()
    state["passcode_hash"] = _password_hash.hash(payload.passcode)
    state["hash_metadata"] = {
        "algorithm": "argon2",
        "library": "pwdlib",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    state["sessions"] = []
    state["failed_login"] = empty_failed_login()
    token, session = add_session(state, now)
    write_auth_state(state)
    set_session_cookie(response, request, token)
    return AuthStatus(passcode_configured=True, authenticated=True, session_expires_at=session["expires_at"])


def login(payload: PasscodeRequest, request: Request, response: Response) -> AuthStatus:
    state = read_auth_state()
    if not passcode_is_configured(state):
        raise HTTPException(status_code=400, detail="No Local Access Passcode is configured.")

    enforce_login_throttle(state)
    if not verify_passcode(state, payload.passcode):
        record_failed_login(state)
        raise HTTPException(status_code=401, detail="Invalid Local Access Passcode.")

    state["failed_login"] = empty_failed_login()
    token, session = add_session(state, utc_now())
    write_auth_state(state)
    set_session_cookie(response, request, token)
    return AuthStatus(passcode_configured=True, authenticated=True, session_expires_at=session["expires_at"])


def logout(request: Request, response: Response) -> dict[str, str]:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token:
        state = read_auth_state()
        remove_session_by_token(state, token)
        write_auth_state(state)
    clear_session_cookie(response, request)
    return {"status": "ok"}


def change_passcode(payload: ChangePasscodeRequest, request: Request, response: Response) -> AuthStatus:
    validate_passcode(payload.new_passcode)
    state = require_session_state(request)
    if not verify_passcode(state, payload.current_passcode):
        raise HTTPException(status_code=401, detail="Current Local Access Passcode is incorrect.")

    token = request.cookies.get(SESSION_COOKIE_NAME)
    current_session_hash = token_hash(token) if token else ""
    now = utc_now()
    state["passcode_hash"] = _password_hash.hash(payload.new_passcode)
    state["hash_metadata"] = {
        "algorithm": "argon2",
        "library": "pwdlib",
        "created_at": state.get("hash_metadata", {}).get("created_at") or now.isoformat(),
        "updated_at": now.isoformat(),
    }
    state["failed_login"] = empty_failed_login()
    state["sessions"] = [session for session in state.get("sessions", []) if session.get("token_hash") == current_session_hash]
    if not state["sessions"]:
        new_token, session = add_session(state, now)
        set_session_cookie(response, request, new_token)
    else:
        session = state["sessions"][0]
    write_auth_state(state)
    return AuthStatus(passcode_configured=True, authenticated=True, session_expires_at=session.get("expires_at"))


def remove_passcode(payload: RemovePasscodeRequest, request: Request, response: Response) -> AuthStatus:
    state = require_session_state(request)
    if not verify_passcode(state, payload.current_passcode):
        raise HTTPException(status_code=401, detail="Current Local Access Passcode is incorrect.")

    state["passcode_hash"] = None
    state["hash_metadata"] = None
    state["sessions"] = []
    state["failed_login"] = empty_failed_login()
    write_auth_state(state)
    clear_session_cookie(response, request)
    return AuthStatus(passcode_configured=False, authenticated=True)


def logout_all(request: Request, response: Response) -> dict[str, str]:
    state = require_session_state(request)
    state["sessions"] = []
    write_auth_state(state)
    clear_session_cookie(response, request)
    return {"status": "ok"}


def require_local_auth(request: Request) -> None:
    state = read_auth_state()
    if not passcode_is_configured(state):
        return
    if valid_session_for_request(state, request):
        return
    raise HTTPException(status_code=401, detail="Local Access Passcode login required.")


def require_session_state(request: Request) -> dict[str, Any]:
    state = read_auth_state()
    if not passcode_is_configured(state):
        return state
    if valid_session_for_request(state, request):
        return state
    raise HTTPException(status_code=401, detail="Local Access Passcode login required.")


def validate_passcode(passcode: str) -> None:
    if len(passcode) < MIN_PASSCODE_LENGTH:
        raise HTTPException(status_code=422, detail="Local Access Passcode must be at least 8 characters.")
    if not passcode.strip():
        raise HTTPException(status_code=422, detail="Local Access Passcode cannot be only whitespace.")


def verify_passcode(state: dict[str, Any], passcode: str) -> bool:
    passcode_hash = state.get("passcode_hash")
    if not isinstance(passcode_hash, str) or not passcode_hash:
        return False
    try:
        return _password_hash.verify(passcode, passcode_hash)
    except Exception:
        return False


def enforce_login_throttle(state: dict[str, Any]) -> None:
    failed_login = normalize_failed_login(state.get("failed_login"))
    cooldown_until = parse_datetime(failed_login.get("cooldown_until"))
    if cooldown_until and cooldown_until > utc_now():
        seconds = max(1, int((cooldown_until - utc_now()).total_seconds()))
        raise HTTPException(status_code=429, detail=f"Too many failed attempts. Try again in {seconds} seconds.")


def record_failed_login(state: dict[str, Any]) -> None:
    now = utc_now()
    failed_login = normalize_failed_login(state.get("failed_login"))
    count = int(failed_login.get("count", 0)) + 1
    failed_login["count"] = count
    failed_login["last_failed_at"] = now.isoformat()
    if count >= FAILED_LOGIN_LIMIT:
        failed_login["cooldown_until"] = (now + timedelta(seconds=FAILED_LOGIN_COOLDOWN_SECONDS)).isoformat()
        failed_login["count"] = 0
    state["failed_login"] = failed_login
    write_auth_state(state)


def add_session(state: dict[str, Any], now: datetime) -> tuple[str, dict[str, str]]:
    token = secrets.token_urlsafe(32)
    expires_at = now + timedelta(seconds=SESSION_SECONDS)
    session = {
        "token_hash": token_hash(token),
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }
    sessions = [session for session in state.get("sessions", []) if isinstance(session, dict) and session_is_unexpired(session)]
    sessions.append(session)
    state["sessions"] = sessions
    return token, session


def remove_session_by_token(state: dict[str, Any], token: str) -> None:
    hashed = token_hash(token)
    state["sessions"] = [session for session in state.get("sessions", []) if session.get("token_hash") != hashed]


def valid_session_for_request(state: dict[str, Any], request: Request) -> dict[str, str] | None:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        return None
    hashed = token_hash(token)
    for session in state.get("sessions", []):
        if not isinstance(session, dict):
            continue
        if session.get("token_hash") == hashed and session_is_unexpired(session):
            return session
    return None


def session_is_unexpired(session: dict[str, Any]) -> bool:
    expires_at = parse_datetime(session.get("expires_at"))
    return bool(expires_at and expires_at > utc_now())


def set_session_cookie(response: Response, request: Request, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE_NAME,
        token,
        max_age=SESSION_SECONDS,
        httponly=True,
        samesite="lax",
        secure=request.url.scheme == "https",
        path="/",
    )


def clear_session_cookie(response: Response, request: Request) -> None:
    response.delete_cookie(
        SESSION_COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=request.url.scheme == "https",
        path="/",
    )


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def passcode_is_configured(state: dict[str, Any]) -> bool:
    return bool(state.get("passcode_hash"))


def read_auth_state() -> dict[str, Any]:
    with _auth_lock:
        ensure_directories()
        if not AUTH_PATH.exists():
            return default_auth_state()
        with AUTH_PATH.open("r", encoding="utf-8") as auth_file:
            raw = json.load(auth_file)
        state = normalize_auth_state(raw)
        if prune_expired_sessions(state):
            write_auth_state(state)
        return state


def write_auth_state(state: dict[str, Any]) -> None:
    with _auth_lock:
        ensure_directories()
        normalized = normalize_auth_state(state)
        temporary_path = AUTH_PATH.with_suffix(".json.tmp")
        with temporary_path.open("w", encoding="utf-8") as auth_file:
            json.dump(normalized, auth_file, indent=2)
            auth_file.write("\n")
        Path(temporary_path).replace(AUTH_PATH)


def normalize_auth_state(raw: Any) -> dict[str, Any]:
    state = raw if isinstance(raw, dict) else {}
    sessions = state.get("sessions")
    return {
        "version": 1,
        "passcode_hash": state.get("passcode_hash") if isinstance(state.get("passcode_hash"), str) else None,
        "hash_metadata": state.get("hash_metadata") if isinstance(state.get("hash_metadata"), dict) else None,
        "sessions": sessions if isinstance(sessions, list) else [],
        "failed_login": normalize_failed_login(state.get("failed_login")),
    }


def default_auth_state() -> dict[str, Any]:
    return {
        "version": 1,
        "passcode_hash": None,
        "hash_metadata": None,
        "sessions": [],
        "failed_login": empty_failed_login(),
    }


def empty_failed_login() -> dict[str, Any]:
    return {"count": 0, "last_failed_at": None, "cooldown_until": None}


def normalize_failed_login(raw: Any) -> dict[str, Any]:
    failed_login = raw if isinstance(raw, dict) else {}
    count = failed_login.get("count")
    return {
        "count": count if isinstance(count, int) and count >= 0 else 0,
        "last_failed_at": failed_login.get("last_failed_at") if isinstance(failed_login.get("last_failed_at"), str) else None,
        "cooldown_until": failed_login.get("cooldown_until") if isinstance(failed_login.get("cooldown_until"), str) else None,
    }


def prune_expired_sessions(state: dict[str, Any]) -> bool:
    sessions = state.get("sessions", [])
    retained = [session for session in sessions if isinstance(session, dict) and session_is_unexpired(session)]
    changed = len(retained) != len(sessions)
    state["sessions"] = retained
    return changed


def parse_datetime(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
