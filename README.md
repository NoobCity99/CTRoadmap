# CTRoadmap
![alt text](readmebanner4.png)

CTRoadmap is a local-first infrastructure atlas for documenting nodes, services, storage, scripts, configs, URLs, and operational relationships. It is a Docker-served beta application backed by the human-readable `data/atlas.json` file.

CTRoadmap is documentation-only software. It does not execute commands, open SSH sessions, issue Docker calls, or run live checks against your infrastructure.

## Beta Docker Install

The recommended beta release path is the published Docker image:

```text
ghcr.io/noobcity99/ctroadmap:beta
```

Beta users do not need to clone this repository or install Python, Node, or npm.

Requirements:

- Linux server
- Docker
- Docker Compose v2
- curl
- Port 8088 reachable if accessing CTRoadmap from another machine

Option A, safer:

```bash
curl -fsSL https://raw.githubusercontent.com/NoobCity99/CTRoadmap/main/CTR_install.sh -o CTR_install.sh
chmod +x CTR_install.sh
./CTR_install.sh
```

Option B, one-liner:

```bash
curl -fsSL https://raw.githubusercontent.com/NoobCity99/CTRoadmap/main/CTR_install.sh | bash
```

Custom install directory:

```bash
CTR_INSTALL_DIR=/opt/ctroadmap-beta ./CTR_install.sh
```

Management commands:

```bash
cd ~/ctroadmap-beta
docker compose logs -f
docker compose down
docker compose up -d
docker compose pull && docker compose up -d
```

Manual beta update:

```bash
cd ~/ctroadmap-beta && docker compose pull && docker compose up -d
```

Uninstall:

```bash
curl -fsSL https://raw.githubusercontent.com/NoobCity99/CTRoadmap/main/CTR_uninstall.sh -o CTR_uninstall.sh
chmod +x CTR_uninstall.sh
./CTR_uninstall.sh
```

Persistent data lives in:

```text
~/ctroadmap-beta/data
~/ctroadmap-beta/exports
```

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

Update Advisory is informational only. CTRoadmap does not auto-update, run Docker commands, mount the Docker socket, or execute system-management actions.

## Data And Backup

CTRoadmap stores its persistent state in bind-mounted directories so that replacing or updating the container does not replace your atlas.

- `data/atlas.json` is the canonical atlas containing tiles, relationships, families, stacks, and saved Layers.
- `data/assets/icons/` contains icons uploaded through the Icon Library.
- `data/auth.json` contains local passcode configuration and session state when Local Access Passcode is enabled.
- `data/update_state.json` stores update-advisory settings and cached advisory state.
- `exports/` contains generated Markdown, YAML, and Mermaid exports.

Back up the complete persistent state rather than only the atlas file:

```bash
cp -a data data.backup
cp -a exports exports.backup
```

Keep backups outside the installation directory before uninstalling or making destructive host changes.

<table>
  <tr>
    <td><img src="assets\FLOW.png" width="100%" alt="Image 1"></td>
    <td><img src="assets\DATA.png" width="100%" alt="Image 2"></td>
  </tr>
  <tr>
    <td><img src="assets\PlanMode.png" width="100%" alt="Image 3"></td>
    <td><img src="assets\Stack.png" width="100%" alt="Image 4"></td>
  </tr>
</table>

# FEATURES

## Local Access Passcode

Local Access Passcode provides optional authentication for the CTRoadmap web interface. It is disabled until a passcode is configured in Settings.

From Settings, an administrator can create or change the passcode, sign out the current browser, sign out all sessions, or remove passcode protection. This is application-level access control for a local deployment; continue to use appropriate network and host security for any exposed installation.


## Features

### Canvas Editor

- Create, edit, duplicate, delete, drag, search, and filter typed tiles.
- Model nodes, services, containers, drives, mounts, scripts, configs, secret references, flows, IoT devices, URLs, checks, and notes.
- Designate primary nodes and arrange child tiles within their parent nodes.
- Create typed relationships and edit their labels, notes, endpoints, and directionality.
- Choose connector routing that may pass through tiles or avoid them.
- Lock the canvas to prevent accidental changes while navigating.
- Document checks with command and expected-result fields without executing them.

### Flow Tiles And Swimlanes

- New Flow tiles use the Swimlane workspace. Add a Flow from the Tile Palette, select it, and choose **Open Flow Workspace**.
- Build free-form processes with editable lanes and Process, Decision, Wait, User Action, Start, End, and Note elements.
- Drag elements between lanes, create directed connections, and edit lanes, elements, connectors, Flow documentation, and Atlas references through the workspace panels.
- Link lanes to Atlas tiles or Families to show their current title, icon, type, and color without overwriting the lane's manual fallback information.
- New Flows begin with four uncolored lanes, a Start element in Lane 1, and an End element in Lane 4. Lane roles and positions remain user-defined.
- View a read-only Swimlane diagram beneath the Flow's documentation in the Handbook, then open the workspace or export that diagram as a PNG.
- Lifecycle-locked Swimlane Flows can still be opened read-only. Existing legacy Flow tiles retain their editable ordered-step editor, but new legacy Flows cannot be created or duplicated.

Swimlane data is stored inside the normal Flow tile in `data/atlas.json` using the `swimlane.v1` format. Workspace edits use the existing atlas autosave path; CTRoadmap does not execute the documented process.

### Handbook

- Browse the atlas as a structured handbook organized around primary nodes, families, and documented relationships.
- Add detailed operational notes and reference information to tiles and relationships.
- Move between handbook entries and the corresponding canvas items.

### Layers

- Create, rename, edit, and delete saved Layers for focused views of the atlas.
- Filter Layers by tile type, lifecycle, family, and relationship visibility.
- Switch between canvas topology, layered hierarchy, and handbook layouts where supported.

Layers are persisted in the atlas schema as `views` for compatibility.

### Planning Mode

- Model planned tiles and relationships before they go live.
- Visually distinguish planned infrastructure from live infrastructure.
- Promote planned items when they become operational.

### Families

- Group related tiles into named, color-coded families.
- Use family regions on the canvas to organize larger systems visually.
- Use family organization in the Handbook and Layer filters.

### Stacks

- Collapse related sibling tiles into compact stacks when they share a parent.
- Stack mount-child relationships to reduce visual clutter.
- Expand, focus, and unstack items without removing their underlying atlas data.

### Import And Export

- Import an atlas JSON file through backend validation and preview before replacing current data.
- Download the current atlas as a local JSON backup.
- Generate Markdown, YAML, and Mermaid exports in `exports/`.
- Download generated exports from the application toolbar.
- Export the complete active Canvas layer as a styled PNG directly in the browser.
- Configure the PNG title, optional title card, and LIGHT or DARK title-card treatment before downloading.
- Export a complete read-only Swimlane diagram from its Handbook article using **Export PNG**. The Flow export can include its own compact title card while retaining the diagram's current Handbook palette.

PNG generation is client-side and does not write an image to `exports/`, change `data/atlas.json`, or require a PNG API endpoint. Very large diagrams are subject to browser image-size safety limits.

### Appearance

- TWO APP MODES to choose from, CLASSIC & ZIMA.
  - ZIMA is Russian for "WINTER"
  
- USE CANVAS EDITOR in settings to chose the theme & background you want, previewing it before confirming. 
- Assign built-in or uploaded icons to tiles through the Icon Library.
- Adjust canvas and connector presentation without changing atlas content.

### Settings And Admin

- Check backend health and view the running application version.
- Review informational update advisories and configure update checks.
- Configure Local Access Passcode and manage active sessions.
- Upload, browse, and remove custom icon assets.
- Export frontend and backend debug information or clear the backend debug log.
- Checkbox at bottom of settings will turn on/off the infinite scrolling effect of the tile palette. 

Flow steps, check commands, and expected results are documentation only. CTRoadmap does not execute them.

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
GET  /api/app/version
GET  /api/app/update
PUT  /api/app/update/settings

GET  /api/auth/status
POST /api/auth/setup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/change-passcode
POST /api/auth/remove-passcode
POST /api/auth/logout-all

GET  /api/atlas
PUT  /api/atlas
POST /api/atlas/preview

POST   /api/assets/icons
GET    /api/assets/icons
GET    /api/assets/icons/{filename}
DELETE /api/assets/icons/{filename}

POST /api/export/{format}
GET  /api/export/{format}/download

GET  /api/debug/log
POST /api/debug/log/clear
```

Supported server export formats are `markdown`, `yaml`, and `mermaid`. PNG canvas export is generated client-side and does not use an API endpoint.

## Project Log

Planning decisions, questions and answers, bugs, and fixes are tracked in `PROJECT_LOG.md`.

## License

CTRoadmap is licensed under the Apache License 2.0. See [LICENSE](LICENSE).

## Contributors
- NoobCity99
