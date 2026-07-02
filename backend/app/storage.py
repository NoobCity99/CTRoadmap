from __future__ import annotations

import json
from datetime import datetime, timezone

from .config import ATLAS_PATH, DATA_DIR, EXPORTS_DIR, ICONS_DIR, ROOT_DIR
from .models import Atlas, empty_atlas


def ensure_directories() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    ICONS_DIR.mkdir(parents=True, exist_ok=True)


def read_atlas() -> Atlas:
    ensure_directories()
    if not ATLAS_PATH.exists():
        atlas = empty_atlas()
        write_atlas(atlas)
        return atlas

    with ATLAS_PATH.open("r", encoding="utf-8") as atlas_file:
        raw = json.load(atlas_file)
    atlas = Atlas.model_validate(raw)
    return atlas


def write_atlas(atlas: Atlas) -> Atlas:
    ensure_directories()
    validated = Atlas.model_validate(atlas.model_dump(by_alias=True))
    validated.metadata.updated_at = datetime.now(timezone.utc).isoformat()
    with ATLAS_PATH.open("w", encoding="utf-8") as atlas_file:
        json.dump(validated.model_dump(by_alias=True), atlas_file, indent=2)
        atlas_file.write("\n")
    return validated
