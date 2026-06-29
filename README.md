# CTRoadmap
![alt text](readmebanner.png)

CTRoadmap is a local-first infrastructure atlas for documenting nodes, services, storage, scripts, configs, URLs, checks, and operational relationships.

CTRoadmap is a GUI-first editor backed by `data/atlas.json`. It does not execute commands, SSH, Docker calls, or live checks.

## Run With Docker

```bash
docker compose up -d
```

Open:

```text
http://localhost:8088
```

Stop:

```bash
docker compose down
```

Logs:

```bash
docker compose logs -f
```

Backup data:

```bash
cp data/atlas.json data/atlas.backup.json
```

## Development

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.app.main:app --host 0.0.0.0 --port 8088
```

Use Python 3.12 or 3.13 for local backend development. The Docker image uses Python 3.12.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8088`.

## Features

- Create, edit, delete, drag, search, and filter typed tiles.
- Create subtiles from the inspector; this creates a `contains` relationship.
- Draw typed relationships between tiles in the canvas.
- Edit relationship type, label, notes, endpoints, and directionality.
- Duplicate tiles from the inspector or with `Ctrl/Cmd+D`.
- Add ordered flow steps to `flow` tiles from the inspector.
- PLANNING MODE: Plan nodes & connections before going live, visual distinction while planning.
- Document non-executing checks with command and expected-result fields.
- Save and reload the canonical atlas at `data/atlas.json`.
- Create, edit, delete, and switch saved views.
- Switch between `canvas_topology` and `layered_hierarchy` templates per view.
- Import a saved `atlas.json` after backend validation.
- Download the current atlas JSON from the browser.
- Export Markdown, YAML, and Mermaid files to `exports/`.
- Download generated export files from the toolbar.
- LOCK canvas to prevent accidental changes while navigating.
- See warnings for broken links and missing required tile data.
- See warnings for incomplete flows/checks.
- Load optional CTDC sample data from the toolbar.

Flow steps and check tiles are documentation only. CTRoadmap does not run check commands.

## Keyboard Shortcuts

```text
Ctrl/Cmd+S       Save
Ctrl/Cmd+D       Duplicate selected tile
Delete/Backspace Delete selected tile or relationship
/                Focus search
Escape           Clear selection
```

## API

```text
GET  /api/health
GET  /api/atlas
PUT  /api/atlas
POST /api/export/markdown
POST /api/export/yaml
POST /api/export/mermaid
GET  /api/export/markdown/download
GET  /api/export/yaml/download
GET  /api/export/mermaid/download
```

## Project Log

Planning decisions, questions and answers, bugs, and fixes are tracked in `PROJECT_LOG.md`.
