# CTRoadmap

CTRoadmap is a local-first infrastructure atlas for documenting nodes, services, storage, scripts, configs, URLs, checks, and operational relationships.

The MVP is a GUI-first editor backed by `data/atlas.json`. It does not execute commands, SSH, Docker calls, or live checks.

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

## MVP Features

- Create, edit, delete, drag, search, and filter typed tiles.
- Create subtiles from the inspector; this creates a `contains` relationship.
- Draw typed relationships between tiles in the canvas.
- Edit relationship type, label, notes, endpoints, and directionality.
- Save and reload the canonical atlas at `data/atlas.json`.
- Switch between `canvas_topology` and `layered_hierarchy` templates.
- Load optional CTDC sample data from the toolbar.
- Export buttons are present but disabled until Phase 2.

## API

```text
GET  /api/health
GET  /api/atlas
PUT  /api/atlas
```

## Project Log

Planning decisions, questions and answers, bugs, and fixes are tracked in `PROJECT_LOG.md`.
