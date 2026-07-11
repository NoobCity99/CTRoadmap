from __future__ import annotations

import os
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]


def configured_path(env_name: str, default: Path) -> Path:
    value = os.environ.get(env_name)
    if not value:
        return default
    path = Path(value).expanduser()
    if path.is_absolute():
        return path
    return ROOT_DIR / path


DATA_DIR = configured_path("CTR_DATA_DIR", ROOT_DIR / "data")
EXPORTS_DIR = configured_path("CTR_EXPORTS_DIR", ROOT_DIR / "exports")
ICONS_DIR = DATA_DIR / "assets" / "icons"
ATLAS_PATH = DATA_DIR / "atlas.json"
AUTH_PATH = DATA_DIR / "auth.json"
FRONTEND_DIST = configured_path("CTR_FRONTEND_DIST", ROOT_DIR / "frontend" / "dist")
