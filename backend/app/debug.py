from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


MAX_DEBUG_EVENTS = 300
_debug_events: deque[dict[str, Any]] = deque(maxlen=MAX_DEBUG_EVENTS)


def record_debug_event(action: str, message: str, severity: str = "info", context: dict[str, Any] | None = None) -> None:
    _debug_events.append(
        {
            "id": str(uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "backend",
            "severity": severity,
            "action": action,
            "message": message,
            "context": sanitize_context(context or {}),
        }
    )


def get_debug_events() -> list[dict[str, Any]]:
    return list(_debug_events)


def clear_debug_events() -> None:
    _debug_events.clear()


def sanitize_context(context: dict[str, Any]) -> dict[str, Any]:
    safe: dict[str, Any] = {}
    for key, value in context.items():
        normalized = key.lower().replace("-", "_")
        if any(marker in normalized for marker in ("secret", "password", "token", "key", "credential")):
            safe[key] = "[redacted]"
        elif isinstance(value, (str, int, float, bool)) or value is None:
            safe[key] = value
        else:
            safe[key] = str(value)
    return safe
