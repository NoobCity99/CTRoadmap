from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ValidationError

from .config import DEMO_PATH, FRONTEND_DIST
from .debug import clear_debug_events, get_debug_events, record_debug_event
from .exports import EXPORT_FILES, EXPORT_MEDIA_TYPES, ExportFormat, export_path, write_export
from .models import Atlas
from .storage import read_atlas, read_demo_atlas, write_atlas
from .version import AppVersion, get_app_version


app = FastAPI(title="CTRoadmap", version="0.7.0-beta")


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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
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


@app.get("/api/atlas", response_model=Atlas)
def get_atlas() -> Atlas:
    try:
        atlas = read_atlas()
        record_debug_event(
            "atlas.load",
            "Atlas loaded",
            context={"tiles": len(atlas.tiles), "links": len(
                atlas.links), "views": len(atlas.views)},
        )
        return atlas
    except (OSError, json.JSONDecodeError, ValidationError, ValueError) as exc:
        record_debug_event("atlas.load", "Atlas load failed",
                           "error", {"error": str(exc)})
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/atlas/demo", response_model=Atlas)
def get_demo_atlas() -> Atlas:
    try:
        atlas = read_demo_atlas()
    except FileNotFoundError as exc:
        message = "No demo is configured. Fork owners can provide data/demo.json."
        record_debug_event("atlas.demo", "Optional demo atlas not found", "warning", {
                           "path": str(DEMO_PATH)})
        raise HTTPException(status_code=404, detail=message) from exc
    except (json.JSONDecodeError, ValidationError, ValueError) as exc:
        record_debug_event("atlas.demo", "Demo atlas validation failed", "warning", {
                           "error": str(exc)})
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except OSError as exc:
        record_debug_event("atlas.demo", "Demo atlas load failed", "error", {
                           "error": str(exc)})
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    record_debug_event(
        "atlas.demo",
        "Demo atlas validated",
        context={"tiles": len(atlas.tiles), "links": len(
            atlas.links), "views": len(atlas.views)},
    )
    return atlas


@app.put("/api/atlas", response_model=Atlas)
def put_atlas(atlas: Atlas) -> Atlas:
    try:
        saved = write_atlas(atlas)
        record_debug_event(
            "atlas.save",
            "Atlas saved",
            context={"tiles": len(saved.tiles), "links": len(
                saved.links), "views": len(saved.views)},
        )
        return saved
    except (OSError, ValidationError, ValueError) as exc:
        record_debug_event("atlas.save", "Atlas save failed",
                           "error", {"error": str(exc)})
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/atlas/preview", response_model=AtlasImportPreview)
def preview_atlas_import(payload: Any = Body(...)) -> AtlasImportPreview:
    try:
        atlas = Atlas.model_validate(payload)
    except ValidationError as exc:
        errors = [format_validation_error(error) for error in exc.errors()]
        record_debug_event("atlas.preview", "Atlas import preview failed", "warning", {
                           "errors": len(errors)})
        return AtlasImportPreview(valid=False, errors=errors)
    except ValueError as exc:
        record_debug_event("atlas.preview", "Atlas import preview failed", "warning", {
                           "error": str(exc)})
        return AtlasImportPreview(valid=False, errors=[str(exc)])

    warnings = atlas_preview_warnings(atlas)
    record_debug_event(
        "atlas.preview",
        "Atlas import preview validated",
        context={"tiles": len(atlas.tiles), "links": len(atlas.links), "views": len(
            atlas.views), "families": len(atlas.families), "warnings": len(warnings)},
    )
    return AtlasImportPreview(
        valid=True,
        tiles=len(atlas.tiles),
        links=len(atlas.links),
        views=len(atlas.views),
        families=len(atlas.families),
        warnings=warnings,
    )


@app.post("/api/export/{format_}", response_model=ExportResult)
def generate_export(format_: ExportFormat) -> ExportResult:
    try:
        atlas = read_atlas()
        write_export(format_, atlas)
    except (OSError, ValidationError, ValueError) as exc:
        record_debug_event("export.generate", "Export generation failed", "error", {
                           "format": format_, "error": str(exc)})
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    record_debug_event("export.generate", "Export generated", context={
                       "format": format_, "filename": EXPORT_FILES[format_]})
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
            record_debug_event("export.download", "Export download generation failed", "error", {
                               "format": format_, "error": str(exc)})
            raise HTTPException(status_code=500, detail=str(exc)) from exc
    record_debug_event("export.download", "Export downloaded", context={
                       "format": format_, "filename": EXPORT_FILES[format_]})
    return FileResponse(path, filename=EXPORT_FILES[format_], media_type=EXPORT_MEDIA_TYPES[format_])


@app.get("/api/debug/log")
def get_debug_log() -> dict[str, object]:
    return {"events": get_debug_events()}


@app.post("/api/debug/log/clear")
def clear_debug_log() -> dict[str, str]:
    clear_debug_events()
    record_debug_event("debug.clear", "Backend debug log cleared")
    return {"status": "ok"}


@app.api_route("/api/{full_path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def unknown_api_route(full_path: str) -> None:
    raise HTTPException(
        status_code=404, detail=f"Unknown API route: /api/{full_path}")


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
        warnings.append(
            "The imported atlas has no layers; default layers will be applied.")
    return warnings


def format_validation_error(error: dict[str, Any]) -> str:
    location = ".".join(str(part) for part in error.get("loc", ()))
    message = str(error.get("msg", "Invalid value"))
    return f"{location}: {message}" if location else message
