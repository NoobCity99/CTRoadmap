# CTRoadmap Project Log

This file tracks planning questions, product decisions, bugs, and bug fixes discussed during the CTRoadmap build.

## Questions And Answers

| Date | Question | Answer |
|---|---|---|
| 2026-06-28 | What should the first completed build milestone include? | MVP editor only: tiles, subtiles, relationships, save/load, Docker. Exports are deferred. |
| 2026-06-28 | Which GUI template should be default or included? | Ship both `canvas_topology` and `layered_hierarchy` templates. |
| 2026-06-28 | How should first-run sample data work? | Start blank by default and provide optional CTDC seed loading. |
| 2026-06-28 | What should Phase 2 exports include by default? | Full atlas exports, not active-view-only exports. |
| 2026-06-28 | How far should Phase 2 saved-view editing go? | Add create, edit, and delete saved views. |
| 2026-06-28 | How should imported atlas JSON behave? | Validate through the backend and replace the current atlas only after validation succeeds. |
| 2026-06-28 | How should Phase 3 expose flow-step editing? | Add ordered step editing inside the flow tile inspector. |
| 2026-06-28 | Should flow step endpoints be free text or tile references? | Flow step `from` and `to` values must reference existing atlas tiles. |
| 2026-06-28 | Should Phase 3 add HERMES-specific YAML? | Defer HERMES-specific YAML structure; preserve canonical flow/check data only. |
| 2026-06-29 | What should the first Settings release include? | Active Settings panel with UI palette selection, app metadata, backend health status, and exportable debug log. |
| 2026-06-29 | Should debug log exports include atlas contents? | No. Debug exports include event metadata and summary counts only, with secret-like context keys redacted. |

## Product Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-06-28 | `data/atlas.json` is the canonical source of truth. | Keeps the app local-first, readable, and backup-friendly. |
| 2026-06-28 | The MVP does not execute shell, SSH, Docker, or validation commands. | Preserves the atlas/documentation scope and avoids unsafe automation paths. |
| 2026-06-28 | Export controls are scaffolded but disabled in the MVP UI. | Keeps the user-facing layout aligned with the planned product without implementing Phase 2 behavior early. |
| 2026-06-28 | Tile creation should live in the left Tile Palette, not the top toolbar. | The top `New Tile` button and tile-type dropdown duplicated the palette; palette buttons now create tiles by click or drag/drop. |
| 2026-06-28 | Phase 2 exports should generate Markdown, YAML, and Mermaid files from the full canonical atlas. | Keeps documentation output complete and avoids adding per-view export complexity before it is needed. |
| 2026-06-28 | Saved view filters should be stored in `atlas.views`. | Makes view behavior persistent, backup-friendly, and available to exports/imports. |
| 2026-06-28 | Flow/check features remain non-executing in Phase 3. | The app is still an atlas and planning tool, not an automation or monitoring runner. |
| 2026-06-29 | Settings are browser-local UI preferences, not atlas data. | Palette and collapse state should not modify `data/atlas.json` or require schema migration. |
| 2026-06-29 | Parent collapse/expand state is local UI state for this pass. | It improves canvas navigation without changing canonical topology data. |
| 2026-06-29 | Search results should be actionable from the left panel. | Users need direct selection/focus of matching tiles and relationships, including items hidden under collapsed parents. |
| 2026-06-29 | Hierarchy and communication should use separate visual linkage paths. | Parent/child containment remains bottom-to-top, while calls/flows/dependencies use right-side `OUT` to left-side `IN` handles. |
| 2026-06-29 | Collapse/expand controls should be removed from the canvas. | Testing showed hiding descendants is not necessary, and always-visible hierarchy avoids stale local collapse state hiding tiles. |
| 2026-06-29 | Planning work should persist as atlas data. | Planned objects are stored as `lifecycle: planned` on normal tiles and links instead of a temporary overlay or separate file. |
| 2026-06-29 | Live View remains editable for live objects. | Planning Mode edits only planned objects, while Live View can still maintain current live atlas data and promote planned work. |
| 2026-06-28 | Beta users should install from a published Docker image instead of cloning the repo. | The first release target is a Docker-image-based install using `ghcr.io/noobcity99/ctroadmap:beta`. |
| 2026-06-29 | Optional sample seed data should be stored as atlas JSON instead of hardcoded TypeScript. | Keeps the seed file aligned with exported atlas data and makes future seed replacement straightforward. |
| 2026-07-01 | Update Advisory must remain informational only. | CTRoadmap can check a public version manifest and show update guidance, but it must not auto-update, run Docker commands, mount the Docker socket, or execute system-management actions. |

## Release Changes

| Date/Time | Files Created/Changed | Summary | Assumptions | Validation Results |
|---|---|---|---|---|
| 2026-06-28 23:56 PDT | Created `CTRBETA_release-compose.yml`, `CTR_install.sh`, `CTR_uninstall.sh`; changed `README.md` and `PROJECT_LOG.md`. | Docker-image-based beta release bootstrap added. | Image will be published as `ghcr.io/noobcity99/ctroadmap:beta`; installer targets Linux with Docker Compose v2. | `bash -n CTR_install.sh` passed; `bash -n CTR_uninstall.sh` passed; `docker compose -f CTRBETA_release-compose.yml config` passed; `git diff --check` passed. |
| 2026-07-01 | Created `backend/app/update_advisory.py` and `latest.json`; changed Dockerfile, backend API, frontend API/types/settings/UI, README, `.gitignore`, and project log. | Advisory-only update checks added with persisted `data/update_state.json` state and Settings/toolbar guidance. | Default deployment is Docker beta; default manifest is GitHub raw `main/latest.json`; users manually run the copied update command. | `python3 -m compileall backend` passed; `npm --prefix frontend run build` passed; `python3 -m json.tool latest.json` passed; targeted `git diff --check` passed for source changes. Repo-wide whitespace check still reports unrelated CRLF/trailing-whitespace issues in modified docs. |

## Bugs And Fixes

| Date | Bug | Fix |
|---|---|---|
| 2026-06-29 | Layered template node clicks could pan to a blank area because focus used saved canvas coordinates instead of the rendered layered position. | Tile focus now centers on the current rendered React Flow node position with saved position as a fallback. |
| 2026-06-29 | Flow tile step action previews overflowed the tile when a flow had more than two steps. | Changed the flow tile `steps` preview to display only the numeric step count. |
| 2026-06-29 | Flow tiles displayed `[object Object]` for step data on the canvas because node field previews stringified the `steps` object array directly. | Added tile field preview formatting that renders flow step `action` text and uses safe summaries for other object or array fields. |
| 2026-06-29 | Dragging an existing tile could blank the canvas until refresh because React Flow controlled node updates were being written through canonical atlas state on every drag tick, and the debug export did not capture drag/error context. | Moved drag movement into local React Flow node state, commit final positions to the atlas on drag stop, and added drag/anomaly/error debug events. |
| 2026-06-28 | Docker frontend build failed because `LinkType.replaceAll` required a newer string lib and `NodeChange.id` was read before narrowing the React Flow union. | Replaced `replaceAll` with regex `replace` and added a typed position-change guard before reading `id` or `position`. |
| 2026-06-28 | Local backend dependency install failed under Python 3.14 because pinned `pydantic-core` does not support that interpreter yet. | Kept Docker on Python 3.12 and documented Python 3.12/3.13 for local backend development. |
| 2026-06-28 | Local Node/NPM validation is blocked because this WSL environment reports WSL 1 unsupported for Node. | Frontend files were statically reviewed; build should be run in Docker or a supported Node environment. |
| 2026-06-29 | Settings gear showed disabled cursor and `Settings planned` hover text. | Replaced it with an active Settings panel and removed the disabled button behavior. |
| 2026-06-29 | Search only filtered the canvas and did not show left-panel result targets. | Added a search results list with clickable tile/link results and focus behavior. |
| 2026-06-29 | Parent tiles did not support hiding descendants on dense maps. | Added local collapse/expand state and parent node controls that hide descendant tiles and related hidden edges. |
| 2026-06-29 | Non-hierarchy links visually reused the same top/bottom handle path as parent/child links. | Added optional link port metadata plus IN/OUT handles so relationship routing persists across save/load. |
| 2026-06-29 | Top-bar search required backspacing to clear a query. | Added an inline clear button that resets search and keeps focus in the search input. |
| 2026-06-29 | Persistent IN/OUT port labels obstructed tile content. | Changed port labels to appear only when hovering or focusing the matching connection handle. |
| 2026-06-29 | Fit View framed the atlas too tightly. | Added shared padded fit-view options for initial fit and the Controls fit button. |
| 2026-06-29 | Double-clicking blank canvas zoomed into the clicked area instead of fitting the full view. | Disabled React Flow double-click zoom and mapped blank-canvas double-click to padded Fit View. |
| 2026-06-29 | Interactivity lock prevented link creation but still allowed tile movement. | Added app-owned interactivity state that locks both node dragging and link creation while preserving selection and inspector editing. |
| 2026-06-29 | CTRoadmap needed a way to model planned infrastructure separately from current live infrastructure. | Added Planning Mode with lifecycle-aware styling, locking, editing, and Go Live promotion for planned tiles and relationships. |
| 2026-06-29 | Beta LAN deployment crashed in Chrome with `TypeError: crypto.randomUUID is not a function` because plain `http://SERVER-IP:8088` is not a secure browser context. | Replaced the unguarded frontend debug-event UUID call with a feature-detected ID helper that falls back to `crypto.getRandomValues()` or a timestamp/counter ID. |
