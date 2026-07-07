# CTRoadmap Technical Architecture

This document describes how CTRoadmap is built and how its frontend, backend, storage, and deployment pieces fit together. It is intended for engineers evaluating the current design or planning future feature work.

## High-Level Shape

CTRoadmap is a local-first infrastructure atlas editor. The canonical data store is a JSON file, `data/atlas.json`, validated by the backend before save/load. The frontend is a React application that renders an interactive graph editor and calls backend HTTP APIs for persistence, import validation, exports, update advisory data, debug logs, and uploaded icon assets.

The app does not execute shell commands, SSH, Docker commands, live checks, or automation workflows. Flow and check tiles are documentation objects only.

At runtime there is one FastAPI process:

- Serves `/api/...` backend endpoints.
- Serves uploaded icon assets from `data/assets/icons`.
- Serves the built frontend from `frontend/dist` when running from the Docker image.

The frontend talks to the backend with relative URLs such as `/api/atlas`, so the same origin can serve both the UI and API in Docker.

## Repository Layout

```text
backend/
  app/
    main.py              FastAPI app, API routes, static frontend serving
    models.py            Pydantic atlas schema and validation
    storage.py           JSON read/write helpers for atlas persistence
    exports.py           Markdown/YAML/Mermaid export rendering/writing
    config.py            Path configuration via environment variables
    debug.py             Backend debug event store
    update_advisory.py   Advisory-only update metadata/settings

frontend/
  src/
    App.tsx              Main editor state, React Flow canvas, API orchestration
    main.tsx             React entrypoint
    styles.css           Global UI, canvas, tile, palette, theme styling
    types/atlas.ts       TypeScript mirror of atlas/API contracts
    lib/api.ts           Fetch wrappers for backend endpoints
    lib/constants.ts     Tile/link type UI metadata and defaults
    lib/theme.ts         Local theme/background preference helpers
    lib/validation.ts    Frontend warning helpers
    lib/seed.ts          Demo atlas loader
    lib/debug.ts         Frontend debug event helpers/export
    components/
      FamilyNode.tsx     React Flow family/grouping rectangle renderer
      TileNode.tsx       React Flow tile renderer
      Inspector.tsx      Right-side tile/link/stack/family inspector
      SettingsPanel.tsx  Settings/debug/update UI

data/
  atlas.json             Canonical local atlas data
  assets/icons/          Uploaded per-tile icon files

exports/                 Generated Markdown/YAML/Mermaid export files
```

## Backend

The backend is a Python 3.12 FastAPI app in `backend/app/main.py`. It is intentionally small and file-backed.

Key responsibilities:

- Validate atlas JSON using Pydantic models from `backend/app/models.py`.
- Read/write `data/atlas.json` through `backend/app/storage.py`.
- Preview imported atlas payloads before replacement.
- Generate and download exports.
- Upload and serve local tile icon assets.
- Provide health/version/update-advisory/debug endpoints.
- Serve the compiled frontend bundle when `frontend/dist` exists.

Important endpoints:

```text
GET  /api/health
GET  /api/app/version
GET  /api/app/update
PUT  /api/app/update/settings
GET  /api/atlas
PUT  /api/atlas
POST /api/atlas/preview
POST /api/assets/icons
GET  /api/assets/icons/{filename}
POST /api/export/{format}
GET  /api/export/{format}/download
GET  /api/debug/log
POST /api/debug/log/clear
```

Path configuration is centralized in `backend/app/config.py`:

- `CTR_DATA_DIR` controls the data directory, defaulting to `data/`.
- `CTR_EXPORTS_DIR` controls the export directory, defaulting to `exports/`.
- `CTR_FRONTEND_DIST` controls the static frontend directory, defaulting to `frontend/dist`.
- Icon uploads always live under `DATA_DIR/assets/icons`.

## Atlas Data Model

The backend Pydantic model is the authoritative schema. The frontend TypeScript types mirror it, but backend validation is the final gate.

Top-level atlas shape:

```text
Atlas
  version
  metadata
  tiles[]
  links[]
  views[]                User-facing "Layers"; stored as views for compatibility
  stacks[]
  families[]
```

Tiles represent infrastructure/documentation objects:

- Types include `node`, `service`, `container`, `drive`, `mount`, `script`, `config`, `secret_ref`, `flow`, `iot_device`, `url`, `check`, and `note`.
- Each tile has an `id`, `type`, `title`, optional `parent`, `position`, `lifecycle`, `fields`, notes, and tags.
- `parent` drives hierarchy/subtile behavior and the layered hierarchy layout.
- `position` is used by the freeform canvas topology layout.
- Type-specific data lives in `fields`.
- Uploaded icon references are stored in `fields.icon_ref`.
- Primary node state is stored in `fields.primary_node`.
- New tile creation generates placeholder names such as `NEW DRIVE 1` rather than prompting for a title.

Links represent relationships between tiles:

- Links contain `from`, `to`, `type`, optional port metadata, lifecycle, label, notes, and directionality.
- Parent/child containment is represented both by tile `parent` and a `contains` link for visual relationship rendering.
- Non-hierarchy links use IN/OUT ports; containment links use parent/child ports.

Layers are the user-facing name for saved display filters and layout preference. The persisted schema remains `views[]` and the backend/frontend model name remains `View` for compatibility:

- `visible_types`
- `visible_links`
- `camera`
- `layout_template`, either `canvas_topology` or `layered_hierarchy`
- New/demo atlases currently default to Hardware, Software, Infrastructure, and Everything layer presets.

Stacks are persistent visual grouping state:

- Same-parent/same-type sibling stacks hide member tiles under a representative.
- Mount-child stacks hide mixed child tiles under the mount tile.
- Stacks do not create a new tile type and do not rewrite canonical tile/link relationships.
- At render time, links to hidden stack members are visually rerouted to the representative.

Families are persistent semantic/canvas grouping rectangles:

- Families live in top-level `families[]`.
- They group existing tiles by `member_tile_ids` without changing tile `parent`, links, stacks, or lifecycle.
- Each family has an `id`, title, description, member tile IDs, position, size, order, and optional color/tag.
- Families render only in `canvas_topology`.
- The Family rectangle sits behind links and tiles; only its header is intentionally interactive.
- Family movement starts from the header, resizing commits on resize end, and membership is edited from the Inspector.
- The Tile Palette includes a Family entry, but Family is not a `TileType` and is not exported or validated as a tile.

Backend validation also enforces important safety rules:

- Tile and link IDs must be unique.
- Tile parent references must exist and cannot form cycles.
- Link endpoints must reference existing tiles.
- `secret_ref` tiles cannot store secret values.
- `check` tiles cannot enable command execution.
- Flow steps must have valid shape and tile references.
- Invalid or stale stacks are normalized or dropped.
- Invalid or stale family members are de-duplicated and removed.

## Frontend

The frontend is a React 18 + TypeScript + Vite application. The graph canvas uses React Flow from `@xyflow/react`. Icons come from `lucide-react`.

`frontend/src/App.tsx` is the main orchestration file. It owns most editor state:

- Loaded atlas data.
- Active layer, stored internally as the active `View`, and layout template.
- React Flow nodes/edges derived from atlas data.
- Selection, search, context menu, stack/family state, and inspector behavior.
- Autosave state and save coordination.
- Local UI preferences such as theme palette, canvas background, collapsible sidebar sections, and layer bar visibility.
- Import/export/debug/update/settings workflows.
- Topbar workflows such as manual Save, Import atlas.json, Download your Atlas, Load Demo, and the consolidated 3rd Party Export menu.

`TileNode.tsx` renders each tile on the canvas. It handles:

- Tile icon/default icon/custom uploaded icon display.
- Title/type/parent/field/tag previews.
- Planned lifecycle badge.
- Primary node visual styling.
- Stack badge and stack metadata.
- URL and Path preview interactions.
- React Flow handles for links.

`FamilyNode.tsx` renders Family rectangles. It handles the larger angled header label, header-only interaction surface, live resize preview, and React Flow `NodeResizer` behavior.

`Inspector.tsx` is the right-side editor. It edits selected tiles, links, visual stacks, and families. It is responsible for many feature-level mutations, but it receives callbacks from `App.tsx` so atlas updates remain centralized.

`SettingsPanel.tsx` handles theme, background, app metadata, backend health, update advisory settings, and debug log tools.

## Frontend Data Flow

The frontend loads the atlas from `GET /api/atlas` on startup.

Most atlas mutations flow through centralized update helpers in `App.tsx`. The UI updates immediately, then autosave persists the latest atlas through `PUT /api/atlas` after a short debounce. Manual Save still forces an immediate save through the same save path.

Autosave behavior:

- Atlas mutations mark the atlas dirty.
- Saves are debounced to avoid writing every small edit.
- Drag movement is local while dragging; tile positions commit only on drag stop.
- Overlapping saves are prevented. If a save is already in flight and another change occurs, a follow-up save is queued using the newest atlas.
- Failed saves leave the atlas dirty and allow manual retry.

Browser-local preferences are intentionally not stored in atlas JSON:

- Theme palette.
- Canvas background.
- Sidebar collapse state.
- Layer bar collapse state.
- Search term and other transient UI state.

## Layout Templates

CTRoadmap has two stored layout template modes, though the user-facing template control currently exposes Canvas and a disabled TBD hierarchy placeholder.

`canvas_topology`:

- Uses each tile's saved `position`.
- Allows dragging when the canvas is interactive and the tile lifecycle is editable in the current mode.
- Drag stop commits new positions to the atlas.

`layered_hierarchy`:

- Ignores saved tile positions for display.
- Computes temporary positions from each tile's `parent` field.
- Root tiles appear in the first column.
- Children appear one column to the right of their parent.
- Vertical order follows the atlas tile order as the tree is walked.
- Tiles are locked because the layout is generated, not manually placed.

This means hierarchy is changed by changing tile parent relationships, not by dragging tiles in layered mode.

The layered hierarchy logic is intentionally retained in code and data contracts, but the current UI hides it behind a disabled TBD button because a future hierarchy-focused feature is expected to replace the old direct template switch.

## Backend/Frontend Wiring

The frontend API client in `frontend/src/lib/api.ts` uses relative fetch URLs:

```text
loadAtlas()          -> GET  /api/atlas
saveAtlas()          -> PUT  /api/atlas
previewAtlasImport() -> POST /api/atlas/preview
uploadTileIcon()     -> POST /api/assets/icons
generateExport()     -> POST /api/export/{format}
downloadExport()     -> GET  /api/export/{format}/download
```

Because URLs are relative, local development can use Vite's dev server with backend proxying/configuration as needed, while Docker serves the compiled frontend and backend from the same FastAPI origin.

The Docker image is multi-stage:

1. Node 22 builds the Vite frontend.
2. Python 3.12 installs backend dependencies.
3. Built frontend files are copied into `/app/frontend/dist`.
4. Uvicorn serves `backend.app.main:app` on port `8088`.

`docker-compose.yml` mounts:

```text
./data    -> /app/data
./exports -> /app/exports
```

This keeps atlas data, uploaded icons, update state, and generated exports persistent outside the container.

## Import, Export, And Assets

Import flow:

- The browser reads a selected JSON file.
- The frontend sends it to `POST /api/atlas/preview`.
- The backend validates it with the canonical Pydantic model and returns counts, warnings, or errors.
- Only after user confirmation does the frontend replace the atlas through `PUT /api/atlas`.

Export flow:

- The frontend saves the latest atlas first.
- It calls `POST /api/export/{markdown|yaml|mermaid}`. The toolbar exposes these through a consolidated 3rd Party Export menu.
- The backend reads the saved atlas and writes the export file under `exports/`.
- The browser downloads from `/api/export/{format}/download`.
- Markdown export labels saved filters as Layers, includes Families and Stacks sections when present, and keeps YAML as a full atlas serialization using `views[]`.

Icon asset flow:

- The inspector uploads PNG/JPEG/WebP files to `POST /api/assets/icons`.
- Uploads are size-limited and saved under generated safe filenames.
- The backend stores files under `data/assets/icons`.
- Tiles reference uploaded icons through `fields.icon_ref`.
- Tile rendering falls back to default tile-type icons if the uploaded asset is missing or invalid.

## Planning Mode And Lifecycle

Tiles and links have a `lifecycle` value:

- `live`
- `planned`

The app has two modes:

- Live mode edits live objects.
- Planning Mode edits planned objects.

Objects outside the active mode are muted/locked rather than deleted. Planned items can be promoted to live. The lifecycle model is part of the atlas and persists in `atlas.json`.

## Styling And Themes

Most styling is in `frontend/src/styles.css`.

Theme palettes and canvas backgrounds are separate local preferences:

- Palettes affect chrome, tile colors, connector colors, and related variables.
- Canvas backgrounds are applied through `data-background` on the canvas frame.
- Blueprint palette intentionally selects the Blueprint background once, but users can choose another background afterward.
- Grid and Hex reset to neutral canvas variables when paired with the Blueprint palette so those backgrounds do not inherit Blueprint blue.
- The Tile Palette, sidebar section collapse state, and canvas/layer controls are styled in `styles.css` and stored as browser-local preferences.

Current canvas backgrounds include Grid, Hex, Circuit, Blueprint, and PCB Board. React Flow's moving dot layer remains separate from the static CSS background patterns.

## Debugging And Observability

The app has lightweight frontend and backend debug event logs. They are intended for troubleshooting UI/API flows, not telemetry.

- Frontend events are generated in `frontend/src/lib/debug.ts` and kept in browser state.
- Backend events are recorded through `backend/app/debug.py`.
- Settings can export a combined debug log.
- Secret-like debug context keys are redacted by the frontend debug export helpers.

## Extension Guidance

For most new features, prefer this order:

1. Decide whether the state is canonical atlas data or browser-local UI preference.
2. If canonical, update backend Pydantic models first.
3. Mirror the contract in `frontend/src/types/atlas.ts`.
4. Add/update frontend mutation paths through `App.tsx` helpers so autosave sees the change.
5. Keep visual-only behavior out of backend models unless it must persist across browsers/devices.
6. Preserve `data/atlas.json` as the source of truth unless there is a deliberate storage migration.

Useful rules of thumb:

- Backend schema is authoritative.
- Frontend validation should improve UX, not become the only source of canonical rules.
- Do not add command execution behavior to checks or flows without a deliberate security redesign.
- Do not mutate canonical relationships for visual-only features such as stacks.
- Avoid saving continuous drag ticks; commit final positions on drag stop.
- Treat uploaded assets as data-directory companions to `atlas.json`, not embedded JSON data.

## Validation Commands

Frontend validation:

```bash
npm --prefix frontend run build
```

Backend validation should use Docker because the target runtime is Python 3.12:

```bash
docker compose build
docker compose up -d
docker compose exec ctroadmap python -c "import fastapi, pydantic; print('backend deps ok')"
docker compose exec ctroadmap python -m compileall backend
```
