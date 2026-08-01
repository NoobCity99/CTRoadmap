from __future__ import annotations

import json
from datetime import datetime, timezone

from pathlib import Path

from .config import ATLAS_PATH, DATA_DIR, DEMO_PATH, EXPORTS_DIR
from .models import Atlas, empty_atlas


def ensure_directories() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)


def read_atlas_file(path: Path) -> Atlas:
    with path.open("r", encoding="utf-8") as atlas_file:
        raw = json.load(atlas_file)
    return Atlas.model_validate(raw)


def read_atlas() -> Atlas:
    ensure_directories()
    if not ATLAS_PATH.exists():
        atlas = empty_atlas()
        write_atlas(atlas)
        return atlas

    return read_atlas_file(ATLAS_PATH)


def read_demo_atlas() -> Atlas:
    ensure_directories()
    return read_atlas_file(DEMO_PATH)


def write_atlas(atlas: Atlas) -> Atlas:
    ensure_directories()
    validated = Atlas.model_validate(atlas.model_dump(by_alias=True))
    validated.metadata.updated_at = datetime.now(timezone.utc).isoformat()
    with ATLAS_PATH.open("w", encoding="utf-8") as atlas_file:
        json.dump(validated.model_dump(by_alias=True), atlas_file, indent=2)
        atlas_file.write("\n")
    return validated
