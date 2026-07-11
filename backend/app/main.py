from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import Body, Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from pydantic import ValidationError

from .auth import (
    AuthStatus,
    ChangePasscodeRequest,
    PasscodeRequest,
    RemovePasscodeRequest,
    auth_status,
    change_passcode,
    login,
    logout,
    logout_all,
    remove_passcode,
    require_local_auth,
    setup_passcode,
)
from .config import FRONTEND_DIST, ICONS_DIR
from .debug import clear_debug_events, get_debug_events, record_debug_event
from .exports import EXPORT_FILES, EXPORT_MEDIA_TYPES, ExportFormat, export_path, write_export
from .models import Atlas
from .storage import read_atlas, write_atlas
from .update_advisory import AppVersion, UpdateAdvisory, UpdateSettings, UpdateState, get_app_version, get_update_advisory, update_settings


app = FastAPI(title="CTRoadmap", version="0.2.0-beta")


MAX_ICON_BYTES = 512 * 1024
ICON_MEDIA_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
}


class ExportResult(BaseModel):
    format: ExportFormat
    filename: str
    download_url: str
    generated_at: str


class AtlasImportPreview(BaseModel):
    valid: bool
    tiles: int = 0
    links: int = 0
    views: int = 0
    families: int = 0
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)


class IconUploadResult(BaseModel):
    id: str
    filename: str
    url: str
    media_type: str


class IconAssetResult(BaseModel):
    id: str
    filename: str
    url: str
    media_type: str


class IconAssetListResult(BaseModel):
    icons: list[IconAssetResult]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    record_debug_event("health", "Health endpoint checked")
    return {"status": "ok", "app": "CTRoadmap"}


@app.get("/api/app/version", response_model=AppVersion)
def app_version() -> AppVersion:
    record_debug_event("app.version", "App version checked")
    return get_app_version()


@app.get("/api/auth/status", response_model=AuthStatus)
def get_auth_status(request: Request) -> AuthStatus:
    return auth_status(request)


@app.post("/api/auth/setup", response_model=AuthStatus)
def post_auth_setup(payload: PasscodeRequest, request: Request, response: Response) -> AuthStatus:
    result = setup_passcode(payload, request, response)
    record_debug_event("auth.setup", "Local Access Passcode configured")
    return result


@app.post("/api/auth/login", response_model=AuthStatus)
def post_auth_login(payload: PasscodeRequest, request: Request, response: Response) -> AuthStatus:
    result = login(payload, request, response)
    record_debug_event("auth.login", "Local Access Passcode login succeeded")
    return result


@app.post("/api/auth/logout")
def post_auth_logout(request: Request, response: Response, _: None = Depends(require_local_auth)) -> dict[str, str]:
    result = logout(request, response)
    record_debug_event("auth.logout", "Local Access Passcode session logged out")
    return result


@app.post("/api/auth/change-passcode", response_model=AuthStatus)
def post_auth_change_passcode(payload: ChangePasscodeRequest, request: Request, response: Response, _: None = Depends(require_local_auth)) -> AuthStatus:
    result = change_passcode(payload, request, response)
    record_debug_event("auth.change_passcode", "Local Access Passcode changed")
    return result


@app.post("/api/auth/remove-passcode", response_model=AuthStatus)
def post_auth_remove_passcode(payload: RemovePasscodeRequest, request: Request, response: Response, _: None = Depends(require_local_auth)) -> AuthStatus:
    result = remove_passcode(payload, request, response)
    record_debug_event("auth.remove_passcode", "Local Access Passcode removed")
    return result


@app.post("/api/auth/logout-all")
def post_auth_logout_all(request: Request, response: Response, _: None = Depends(require_local_auth)) -> dict[str, str]:
    result = logout_all(request, response)
    record_debug_event("auth.logout_all", "All Local Access Passcode sessions logged out")
    return result


@app.get("/api/app/update", response_model=UpdateAdvisory)
def app_update(_: None = Depends(require_local_auth)) -> UpdateAdvisory:
    advisory = get_update_advisory()
    record_debug_event("app.update", "Update advisory checked", context={"status": advisory.status, "latest_version": advisory.latest_version})
    return advisory


@app.put("/api/app/update/settings", response_model=UpdateState)
def put_update_settings(settings: UpdateSettings, _: None = Depends(require_local_auth)) -> UpdateState:
    state = update_settings(settings)
    record_debug_event("app.update.settings", "Update advisory settings changed", context={"enabled": state.update_checks_enabled, "interval": state.check_interval_hours})
    return state


@app.get("/api/atlas", response_model=Atlas)
def get_atlas(_: None = Depends(require_local_auth)) -> Atlas:
    try:
        atlas = read_atlas()
        record_debug_event(
            "atlas.load",
            "Atlas loaded",
            context={"tiles": len(atlas.tiles), "links": len(atlas.links), "views": len(atlas.views)},
        )
        return atlas
    except (OSError, ValidationError, ValueError) as exc:
        record_debug_event("atlas.load", "Atlas load failed", "error", {"error": str(exc)})
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.put("/api/atlas", response_model=Atlas)
def put_atlas(atlas: Atlas, _: None = Depends(require_local_auth)) -> Atlas:
    try:
        saved = write_atlas(atlas)
        record_debug_event(
            "atlas.save",
            "Atlas saved",
            context={"tiles": len(saved.tiles), "links": len(saved.links), "views": len(saved.views)},
        )
        return saved
    except (OSError, ValidationError, ValueError) as exc:
        record_debug_event("atlas.save", "Atlas save failed", "error", {"error": str(exc)})
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/atlas/preview", response_model=AtlasImportPreview)
def preview_atlas_import(payload: Any = Body(...), _: None = Depends(require_local_auth)) -> AtlasImportPreview:
    try:
        atlas = Atlas.model_validate(payload)
    except ValidationError as exc:
        errors = [format_validation_error(error) for error in exc.errors()]
        record_debug_event("atlas.preview", "Atlas import preview failed", "warning", {"errors": len(errors)})
        return AtlasImportPreview(valid=False, errors=errors)
    except ValueError as exc:
        record_debug_event("atlas.preview", "Atlas import preview failed", "warning", {"error": str(exc)})
        return AtlasImportPreview(valid=False, errors=[str(exc)])

    warnings = atlas_preview_warnings(atlas)
    record_debug_event(
        "atlas.preview",
        "Atlas import preview validated",
        context={"tiles": len(atlas.tiles), "links": len(atlas.links), "views": len(atlas.views), "families": len(atlas.families), "warnings": len(warnings)},
    )
    return AtlasImportPreview(
        valid=True,
        tiles=len(atlas.tiles),
        links=len(atlas.links),
        views=len(atlas.views),
        families=len(atlas.families),
        warnings=warnings,
    )


@app.post("/api/assets/icons", response_model=IconUploadResult)
async def upload_icon(file: UploadFile = File(...), _: None = Depends(require_local_auth)) -> IconUploadResult:
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
    path = ICONS_DIR / filename
    path.write_bytes(content)
    record_debug_event("assets.icon.upload", "Tile icon uploaded", context={"filename": filename, "media_type": media_type, "bytes": len(content)})
    return IconUploadResult(id=icon_id, filename=filename, url=f"/api/assets/icons/{filename}", media_type=media_type)


@app.get("/api/assets/icons", response_model=IconAssetListResult)
def list_icons(_: None = Depends(require_local_auth)) -> IconAssetListResult:
    if not ICONS_DIR.exists():
        return IconAssetListResult(icons=[])

    icon_paths = [
        path
        for path in ICONS_DIR.iterdir()
        if path.is_file() and media_type_for_icon(path) in ICON_MEDIA_TYPES
    ]
    icon_paths.sort(key=lambda path: (path.stat().st_mtime, path.name), reverse=True)
    icons = [
        IconAssetResult(
            id=f"uploaded:{path.name}",
            filename=path.name,
            url=f"/api/assets/icons/{path.name}",
            media_type=media_type_for_icon(path),
        )
        for path in icon_paths
    ]
    return IconAssetListResult(icons=icons)


@app.get("/api/assets/icons/{filename}")
def get_icon(filename: str, _: None = Depends(require_local_auth)) -> FileResponse:
    if Path(filename).name != filename:
        raise HTTPException(status_code=404, detail="Icon not found")
    path = ICONS_DIR / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Icon not found")
    media_type = media_type_for_icon(path)
    return FileResponse(path, media_type=media_type)


@app.delete("/api/assets/icons/{filename}")
def delete_icon(filename: str, _: None = Depends(require_local_auth)) -> dict[str, str]:
    if Path(filename).name != filename:
        raise HTTPException(status_code=404, detail="Icon not found")
    path = ICONS_DIR / filename
    if not path.exists() or not path.is_file() or media_type_for_icon(path) not in ICON_MEDIA_TYPES:
        raise HTTPException(status_code=404, detail="Icon not found")
    path.unlink()
    record_debug_event("assets.icon.delete", "Tile icon deleted", context={"filename": filename})
    return {"status": "deleted"}


@app.post("/api/export/{format_}", response_model=ExportResult)
def generate_export(format_: ExportFormat, _: None = Depends(require_local_auth)) -> ExportResult:
    try:
        atlas = read_atlas()
        write_export(format_, atlas)
    except (OSError, ValidationError, ValueError) as exc:
        record_debug_event("export.generate", "Export generation failed", "error", {"format": format_, "error": str(exc)})
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    record_debug_event("export.generate", "Export generated", context={"format": format_, "filename": EXPORT_FILES[format_]})
    return ExportResult(
        format=format_,
        filename=EXPORT_FILES[format_],
        download_url=f"/api/export/{format_}/download",
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/api/export/{format_}/download")
def download_export(format_: ExportFormat, _: None = Depends(require_local_auth)) -> FileResponse:
    path = export_path(format_)
    if not path.exists():
        try:
            atlas = read_atlas()
            write_export(format_, atlas)
        except (OSError, ValidationError, ValueError) as exc:
            record_debug_event("export.download", "Export download generation failed", "error", {"format": format_, "error": str(exc)})
            raise HTTPException(status_code=500, detail=str(exc)) from exc
    record_debug_event("export.download", "Export downloaded", context={"format": format_, "filename": EXPORT_FILES[format_]})
    return FileResponse(
        path,
        filename=EXPORT_FILES[format_],
        media_type=EXPORT_MEDIA_TYPES[format_],
    )


@app.get("/api/debug/log")
def get_debug_log(_: None = Depends(require_local_auth)) -> dict[str, object]:
    return {"events": get_debug_events()}


@app.post("/api/debug/log/clear")
def clear_debug_log(_: None = Depends(require_local_auth)) -> dict[str, str]:
    clear_debug_events()
    record_debug_event("debug.clear", "Backend debug log cleared")
    return {"status": "ok"}


if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str) -> FileResponse:
        requested = FRONTEND_DIST / full_path
        if full_path and requested.exists() and requested.is_file():
            return FileResponse(requested)
        return FileResponse(FRONTEND_DIST / "index.html")


def atlas_preview_warnings(atlas: Atlas) -> list[str]:
    warnings: list[str] = []
    if not atlas.tiles:
        warnings.append("The imported atlas has no tiles.")
    if not atlas.views:
        warnings.append("The imported atlas has no layers; default layers will be applied.")
    return warnings


def format_validation_error(error: dict[str, Any]) -> str:
    location = ".".join(str(part) for part in error.get("loc", ()))
    message = str(error.get("msg", "Invalid value"))
    return f"{location}: {message}" if location else message


def media_type_for_icon(path: Path) -> str:
    extension = path.suffix.lower()
    if extension == ".png":
        return "image/png"
    if extension in {".jpg", ".jpeg"}:
        return "image/jpeg"
    if extension == ".webp":
        return "image/webp"
    return "application/octet-stream"
