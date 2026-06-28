from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from .models import Atlas
from .storage import ROOT_DIR, read_atlas, write_atlas


app = FastAPI(title="CTRoadmap", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": "CTRoadmap"}


@app.get("/api/atlas", response_model=Atlas)
def get_atlas() -> Atlas:
    try:
        return read_atlas()
    except (OSError, ValidationError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.put("/api/atlas", response_model=Atlas)
def put_atlas(atlas: Atlas) -> Atlas:
    try:
        return write_atlas(atlas)
    except (OSError, ValidationError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


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
