# CTRoadmap Project Log

This file tracks planning questions, product decisions, bugs, and bug fixes discussed during the CTRoadmap build.

## Questions And Answers

| Date | Question | Answer |
|---|---|---|
| 2026-06-28 | What should the first completed build milestone include? | MVP editor only: tiles, subtiles, relationships, save/load, Docker. Exports are deferred. |
| 2026-06-28 | Which GUI template should be default or included? | Ship both `canvas_topology` and `layered_hierarchy` templates. |
| 2026-06-28 | How should first-run sample data work? | Start blank by default and provide optional CTDC seed loading. |

## Product Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-06-28 | `data/atlas.json` is the canonical source of truth. | Keeps the app local-first, readable, and backup-friendly. |
| 2026-06-28 | The MVP does not execute shell, SSH, Docker, or validation commands. | Preserves the atlas/documentation scope and avoids unsafe automation paths. |
| 2026-06-28 | Export controls are scaffolded but disabled in the MVP UI. | Keeps the user-facing layout aligned with the planned product without implementing Phase 2 behavior early. |

## Bugs And Fixes

| Date | Bug | Fix |
|---|---|---|
| 2026-06-28 | Local backend dependency install failed under Python 3.14 because pinned `pydantic-core` does not support that interpreter yet. | Kept Docker on Python 3.12 and documented Python 3.12/3.13 for local backend development. |
| 2026-06-28 | Local Node/NPM validation is blocked because this WSL environment reports WSL 1 unsupported for Node. | Frontend files were statically reviewed; build should be run in Docker or a supported Node environment. |
