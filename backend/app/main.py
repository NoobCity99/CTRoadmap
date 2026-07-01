from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pydantic import ValidationError

from .debug import clear_debug_events, get_debug_events, record_debug_event
from .exports import EXPORT_FILES, EXPORT_MEDIA_TYPES, ExportFormat, export_path, write_export
from .models import Atlas
from .storage import ROOT_DIR, read_atlas, write_atlas
from .update_advisory import AppVersion, UpdateAdvisory, UpdateSettings, UpdateState, get_app_version, get_update_advisory, update_settings


app = FastAPI(title="CTRoadmap", version="0.1.0")


class ExportResult(BaseModel):
    format: ExportFormat
    filename: str
    download_url: str
    generated_at: str


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


@app.get("/api/app/update", response_model=UpdateAdvisory)
def app_update() -> UpdateAdvisory:
    advisory = get_update_advisory()
    record_debug_event("app.update", "Update advisory checked", context={"status": advisory.status, "latest_version": advisory.latest_version})
    return advisory


@app.put("/api/app/update/settings", response_model=UpdateState)
def put_update_settings(settings: UpdateSettings) -> UpdateState:
    state = update_settings(settings)
    record_debug_event("app.update.settings", "Update advisory settings changed", context={"enabled": state.update_checks_enabled, "interval": state.check_interval_hours})
    return state


@app.get("/api/atlas", response_model=Atlas)
def get_atlas() -> Atlas:
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
def put_atlas(atlas: Atlas) -> Atlas:
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


@app.post("/api/export/{format_}", response_model=ExportResult)
def generate_export(format_: ExportFormat) -> ExportResult:
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
def download_export(format_: ExportFormat) -> FileResponse:
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
def get_debug_log() -> dict[str, object]:
    return {"events": get_debug_events()}


@app.post("/api/debug/log/clear")
def clear_debug_log() -> dict[str, str]:
    clear_debug_events()
    record_debug_event("debug.clear", "Backend debug log cleared")
    return {"status": "ok"}


FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"

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
