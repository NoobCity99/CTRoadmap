from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from pydantic import BaseModel, Field, ValidationError

from .storage import DATA_DIR, ensure_directories


DeploymentType = Literal["docker", "linux_desktop", "windows_desktop"]
Channel = Literal["beta", "stable"]
UpdateStatus = Literal["available", "current", "disabled", "failed", "unknown"]

DEFAULT_VERSION = "0.2.0-beta"
DEFAULT_CHANNEL: Channel = "beta"
DEFAULT_DEPLOYMENT_TYPE: DeploymentType = "docker"
DEFAULT_MANIFEST_URL = "https://raw.githubusercontent.com/NoobCity99/CTRoadmap/main/latest.json"
DEFAULT_UPDATE_COMMAND = "cd ~/ctroadmap-beta && docker compose pull && docker compose up -d"
UPDATE_STATE_PATH = DATA_DIR / "update_state.json"


class AppVersion(BaseModel):
    deployment_type: DeploymentType = DEFAULT_DEPLOYMENT_TYPE
    channel: Channel = DEFAULT_CHANNEL
    current_version: str = DEFAULT_VERSION
    build_sha: str = "unknown"
    build_date: str = "unknown"


class UpdateTarget(BaseModel):
    update_command: str | None = None
    release_notes_url: str | None = None
    download_url: str | None = None
    sha256: str | None = None
    notes: str = ""


class UpdateState(BaseModel):
    last_checked_at: str | None = None
    last_result: UpdateStatus = "unknown"
    latest_seen_version: str | None = None
    target: UpdateTarget | None = None
    last_error: str | None = None
    update_checks_enabled: bool = True
    check_interval_hours: int = Field(default=24, ge=1, le=720)


class UpdateManifest(BaseModel):
    latest_version: str
    channel: Channel = DEFAULT_CHANNEL
    targets: dict[DeploymentType, UpdateTarget] = Field(default_factory=dict)


class UpdateAdvisory(BaseModel):
    deployment_type: DeploymentType
    channel: Channel
    current_version: str
    build_sha: str
    build_date: str
    status: UpdateStatus
    state: UpdateState
    latest_version: str | None = None
    manifest_url: str
    target: UpdateTarget | None = None
    error: str | None = None


class UpdateSettings(BaseModel):
    update_checks_enabled: bool
    check_interval_hours: int = Field(ge=1, le=720)


def get_app_version() -> AppVersion:
    return AppVersion(
        deployment_type=read_deployment_type(),
        channel=read_channel(),
        current_version=os.environ.get("CTR_VERSION", DEFAULT_VERSION),
        build_sha=os.environ.get("CTR_BUILD_SHA", "unknown"),
        build_date=os.environ.get("CTR_BUILD_DATE", "unknown"),
    )


def get_update_advisory(force_check: bool = False) -> UpdateAdvisory:
    version = get_app_version()
    state = read_update_state()
    manifest_url = os.environ.get("CTR_UPDATE_MANIFEST_URL", DEFAULT_MANIFEST_URL)

    if not state.update_checks_enabled:
        state.last_result = "disabled"
        write_update_state(state)
        return build_advisory(version, state, manifest_url, "disabled")

    if not force_check and not should_check_for_update(state):
        return build_advisory(version, state, manifest_url, state.last_result, state.latest_seen_version, state.target, state.last_error)

    try:
        manifest = fetch_update_manifest(manifest_url)
        target = manifest.targets.get(version.deployment_type) or default_target(version.deployment_type)
        status: UpdateStatus = "available" if is_newer_version(manifest.latest_version, version.current_version) else "current"
        state.last_checked_at = datetime.now(timezone.utc).isoformat()
        state.last_result = status
        state.latest_seen_version = manifest.latest_version
        state.target = target
        state.last_error = None
        write_update_state(state)
        return build_advisory(version, state, manifest_url, status, manifest.latest_version, target)
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, ValidationError) as exc:
        error = str(exc)
        state.last_checked_at = datetime.now(timezone.utc).isoformat()
        state.last_result = "failed"
        state.last_error = error
        write_update_state(state)
        return build_advisory(version, state, manifest_url, "failed", state.latest_seen_version, state.target, error)


def update_settings(settings: UpdateSettings) -> UpdateState:
    state = read_update_state()
    state.update_checks_enabled = settings.update_checks_enabled
    state.check_interval_hours = settings.check_interval_hours
    if not settings.update_checks_enabled:
        state.last_result = "disabled"
    elif state.last_result == "disabled":
        state.last_result = "unknown"
        state.last_checked_at = None
    write_update_state(state)
    return state


def read_update_state() -> UpdateState:
    ensure_directories()
    if not UPDATE_STATE_PATH.exists():
        state = UpdateState()
        write_update_state(state)
        return state
    with UPDATE_STATE_PATH.open("r", encoding="utf-8") as state_file:
        return UpdateState.model_validate(json.load(state_file))


def write_update_state(state: UpdateState) -> UpdateState:
    ensure_directories()
    with UPDATE_STATE_PATH.open("w", encoding="utf-8") as state_file:
        json.dump(state.model_dump(mode="json"), state_file, indent=2)
        state_file.write("\n")
    return state


def fetch_update_manifest(manifest_url: str) -> UpdateManifest:
    request = Request(manifest_url, headers={"User-Agent": "CTRoadmap Update Advisory"})
    with urlopen(request, timeout=2.5) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return UpdateManifest.model_validate(payload)


def default_target(deployment_type: DeploymentType) -> UpdateTarget | None:
    if deployment_type == "docker":
        return UpdateTarget(
            update_command=DEFAULT_UPDATE_COMMAND,
            release_notes_url="https://github.com/NoobCity99/CTRoadmap/releases",
            notes="Pull the latest beta image and restart the Docker Compose service.",
        )
    return None


def should_check_for_update(state: UpdateState) -> bool:
    if not state.last_checked_at:
        return True
    try:
        last_checked = datetime.fromisoformat(state.last_checked_at)
    except ValueError:
        return True
    if last_checked.tzinfo is None:
        last_checked = last_checked.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) - last_checked >= timedelta(hours=state.check_interval_hours)


def build_advisory(
    version: AppVersion,
    state: UpdateState,
    manifest_url: str,
    status: UpdateStatus,
    latest_version: str | None = None,
    target: UpdateTarget | None = None,
    error: str | None = None,
) -> UpdateAdvisory:
    return UpdateAdvisory(
        deployment_type=version.deployment_type,
        channel=version.channel,
        current_version=version.current_version,
        build_sha=version.build_sha,
        build_date=version.build_date,
        status=status,
        state=state,
        latest_version=latest_version,
        manifest_url=manifest_url,
        target=target,
        error=error,
    )


def is_newer_version(latest: str, current: str) -> bool:
    latest_parts = version_number_parts(latest)
    current_parts = version_number_parts(current)
    if latest_parts and current_parts:
        return latest_parts > current_parts
    return latest != current


def version_number_parts(value: str) -> tuple[int, ...]:
    cleaned = value.lower().lstrip("v").split("-", 1)[0]
    parts: list[int] = []
    for part in cleaned.split("."):
        if not part.isdigit():
            return ()
        parts.append(int(part))
    return tuple(parts)


def read_deployment_type() -> DeploymentType:
    value = os.environ.get("CTR_DEPLOYMENT_TYPE", DEFAULT_DEPLOYMENT_TYPE)
    if value in {"docker", "linux_desktop", "windows_desktop"}:
        return value  # type: ignore[return-value]
    return DEFAULT_DEPLOYMENT_TYPE


def read_channel() -> Channel:
    value = os.environ.get("CTR_CHANNEL", DEFAULT_CHANNEL)
    if value in {"beta", "stable"}:
        return value  # type: ignore[return-value]
    return DEFAULT_CHANNEL
