"""Persistent, optional tile artwork for the public Canvas editor."""
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from .config import ICONS_DIR
from .debug import record_debug_event

router = APIRouter(prefix="/api/assets/icons")
MAX_ICON_BYTES = 512 * 1024
ICON_MEDIA_TYPES = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}


class IconAssetResult(BaseModel):
    id: str
    filename: str
    url: str
    media_type: str


class IconAssetListResult(BaseModel):
    icons: list[IconAssetResult]


def media_type_for_icon(path: Path) -> str | None:
    return {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}.get(path.suffix.lower())


def resolve_icon(filename: str) -> Path:
    if Path(filename).name != filename or "\\" in filename:
        raise HTTPException(status_code=404, detail="Icon not found")
    path = ICONS_DIR / filename
    if path.is_symlink() or not path.is_file() or media_type_for_icon(path) not in ICON_MEDIA_TYPES:
        raise HTTPException(status_code=404, detail="Icon not found")
    return path


@router.post("", response_model=IconAssetResult)
async def upload_icon(file: UploadFile = File(...)) -> IconAssetResult:
    media_type = file.content_type or ""
    extension = ICON_MEDIA_TYPES.get(media_type)
    if not extension:
        raise HTTPException(status_code=415, detail="Icon must be PNG, JPEG, or WebP")
    content = await file.read(MAX_ICON_BYTES + 1)
    if len(content) > MAX_ICON_BYTES:
        raise HTTPException(status_code=413, detail="Icon must be 512 KB or smaller")
    if not content:
        raise HTTPException(status_code=400, detail="Icon file is empty")
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    icon_id = uuid4().hex
    filename = f"{icon_id}{extension}"
    (ICONS_DIR / filename).write_bytes(content)
    record_debug_event("assets.icon.upload", "Tile icon uploaded", context={"filename": filename, "media_type": media_type, "bytes": len(content)})
    return IconAssetResult(id=icon_id, filename=filename, url=f"/api/assets/icons/{filename}", media_type=media_type)


@router.get("", response_model=IconAssetListResult)
def list_icons() -> IconAssetListResult:
    if not ICONS_DIR.exists():
        return IconAssetListResult(icons=[])
    paths = [path for path in ICONS_DIR.iterdir() if not path.is_symlink() and path.is_file() and media_type_for_icon(path) in ICON_MEDIA_TYPES]
    paths.sort(key=lambda path: (path.stat().st_mtime, path.name), reverse=True)
    return IconAssetListResult(icons=[IconAssetResult(id=f"uploaded:{path.name}", filename=path.name,
        url=f"/api/assets/icons/{path.name}", media_type=media_type_for_icon(path)) for path in paths])


@router.get("/{filename}")
def get_icon(filename: str) -> FileResponse:
    path = resolve_icon(filename)
    return FileResponse(path, media_type=media_type_for_icon(path))


@router.delete("/{filename}")
def delete_icon(filename: str) -> dict[str, str]:
    path = resolve_icon(filename)
    path.unlink()
    record_debug_event("assets.icon.delete", "Tile icon deleted", context={"filename": filename})
    return {"status": "deleted"}
