# CTRoadmap Public Fork Conversion

## Purpose

Convert the public `main` branch into a deliberately simplified, fork-friendly diagram application based on the current public codebase.

This edition is intended for people who fork the repository and begin with a fresh installation. It does **not** need compatibility with atlas files, browser preferences, uploaded assets, or saved state produced by the privately developed/full CTRoadmap application.

The resulting application should preserve the core diagramming purpose:

- Create, edit, move, duplicate, and delete typed tiles.
- Create and edit relationships.
- Use Layers, filters, Families, stacks, Planning Mode, search, lock controls, autosave, import/export, and the Canvas customization editor where those features are otherwise independent.
- Save the canonical atlas as JSON.
- Run through the existing Docker-based deployment.

## Repository Rules

1. Work directly from the public repository's `main` branch.
2. Follow `AGENTS.md` as the authoritative instruction file.
3. Files protected by `AGENTS.md` must not be edited, deleted, reformatted, renamed, or regenerated.
4. In particular, preserve the public release/distribution files exactly as directed by `AGENTS.md`, including:
   - `latest.json`
   - `README.md`
   - `CTR_install.sh`
   - `CTR_uninstall.sh`
   - `CTRBETA_release-compose.yml`
5. Do not merge or copy implementation code from the private development repository.
6. Do not preserve compatibility solely for users of the full/private CTRoadmap edition.
7. Prefer complete removal of obsolete code over hiding controls or leaving dormant feature flags.

## Product Target

The converted application should be a single-mode Canvas diagram editor with:

- CLASSIC application shell only.
- CYBER as the only built-in Canvas theme.
- HEX as the only built-in Canvas background.
- The existing Canvas customization editor retained and adapted to use CYBER/HEX as its fixed base.
- Default built-in tile-type icons only.
- No bundled demo atlas.
- No authentication/passcode requirement.
- No Handbook.
- No update-checking or alert system.
- No Discord promotion block.
- No ZIMA application mode.

## Explicit Removal Targets

### 1. Handbook and hierarchy presentation

Remove the Handbook feature completely.

Remove, as applicable:

- Handbook view components.
- Handbook table of contents and outline components.
- Handbook utilities/selectors.
- Handbook light/dark preference state.
- Canvas/Handbook mode controls.
- Handbook-specific keyboard, selection, focus, and navigation paths.
- Handbook-specific CSS.
- Handbook-only tests.
- Handbook-only export or rendering behavior.
- `layered_hierarchy` UI behavior and any compatibility path that only exists to open legacy atlases in Handbook.

The resulting application should open and remain in Canvas mode.

Because this fork edition starts fresh, legacy `layered_hierarchy` compatibility is not required. Remove it from defaults, frontend unions, backend validation, imports, tests, and dead branches where doing so produces a cleaner model.

If `layout_template` becomes a meaningless single-value field, the plan should decide whether to:

- remove it from the fork edition's schema, or
- retain it as a constant `canvas_topology` value to avoid disproportionate unrelated churn.

The plan must state which choice is cleaner and why.

### 2. Local Access Passcode

Remove the passcode/authentication feature completely.

Remove, as applicable:

- Passcode setup and validation UI.
- Lock screen or gating behavior.
- Passcode settings.
- Passcode notice banners.
- Authentication API routes.
- Cookie/session handling used only by this feature.
- Passcode persistence files or state.
- Passcode-specific types, API helpers, tests, CSS, and dependencies.

The app should open directly into the Canvas editor.

### 3. Icon library and icon customization

Remove all user-selectable and uploaded icon functionality.

Remove, as applicable:

- Icon upload controls.
- Uploaded icon library.
- Lucide icon picker/chooser.
- Icon edit/delete mode.
- Custom icon API calls.
- Upload/delete backend endpoints.
- Uploaded icon static file serving.
- Icon asset directory initialization used only by uploads.
- `icon_ref` handling.
- Custom icon resolver code.
- Custom-icon rendering branches.
- Icon customization CSS, tests, types, and dependencies.

Retain only the built-in default icon assigned to each tile type.

No compatibility with existing `icon_ref` values or uploaded icon assets is required.

### 4. Appearance simplification

Remove all application and Canvas appearance choices except:

- Application shell: CLASSIC.
- Canvas theme: CYBER.
- Canvas background: HEX.

Remove, as applicable:

- ZIMA mode.
- App Mode selector.
- ZIMA branding and background assets.
- Per-mode appearance memory.
- Other built-in themes.
- Other built-in Canvas backgrounds.
- Theme/background selectors that no longer select among multiple built-ins.
- Legacy appearance preference migration.
- Unsupported appearance registry entries.
- Unsupported CSS selectors and visual assets.
- Tests that only validate removed modes, themes, or backgrounds.

Retain the Canvas customization editor.

Adapt the editor so it customizes a single CYBER-derived Canvas theme with HEX as the fixed base background. Preserve draft/preview/reset/apply behavior where it remains useful.

Use a clean fork-specific local-storage preference key rather than carrying forward the full edition's multi-mode preference model.

The plan should explicitly identify:

- Which appearance modules remain.
- Which registries can be collapsed.
- Which local-storage keys are removed.
- Which CSS attributes/selectors become unnecessary.
- How reset behavior returns to CYBER/HEX defaults.

### 5. Discord settings block

Remove the Discord promotional/invite block from Settings.

Also remove Discord-specific CSS, assets, imports, handlers, and tests that become unused.

Remove DISCORD details and button from UPDATEPopup 

Do not modify protected public files merely because they contain Discord or project information.

### 6. Update detection and alerts

Remove all runtime update detection and alert behavior from the application.

Remove update popup feature users see after update. 

Remove, as applicable:

- Remote update manifest requests.
- Update advisory backend module.
- Update advisory API endpoints.
- Update settings UI.
- Update popup/modal.
- Reminder timing and browser-local dismissal state.
- Update badges, banners, and notification state.
- `update_state.json` persistence.
- Update-related API types and helpers.
- Update-specific tests and dependencies.

Important:

- `latest.json` is protected and must remain unchanged.
- The converted app simply stops consuming it.
- Preserve static build/version metadata and a simple version display if they are independent of update checking.
- Do not remove build arguments or version identifiers solely because update detection is removed.

### 7. Demo loading

Keep the visible **Load Demo** option.

Remove the bundled/tracked demo atlas from the repository.

The preferred fork-friendly behavior is:

1. Load Demo looks for an optional runtime file at `data/demo.json`.
2. The file is validated through the normal backend atlas validation path.
3. The user receives the existing destructive replacement confirmation before loading it.
4. If the file does not exist, show a clear, non-fatal message explaining that the fork owner can provide `data/demo.json`.
5. The application must still build and run when no demo file exists.

Do not require a frontend rebuild merely to replace the optional demo atlas.

If the current architecture makes another runtime path substantially cleaner, the plan may propose it, but it must preserve these properties:

- No bundled demo content.
- No broken import at build time.
- Clear missing-file behavior.
- Fork owners can provide their own demo without editing application source.

## Features Expected to Remain

Unless removal is required by one of the targets above, preserve:

- Canvas topology editor.
- Tile Palette.
- Default tile-type icons.
- Tile creation, editing, duplication, movement, and deletion.
- Parent/subtile relationships.
- Typed links and relationship editing.
- Layers and filtering.
- Families.
- Stacks.
- Planning Mode and lifecycle behavior.
- Search and focus behavior.
- Canvas interaction lock.
- Connector routing controls.
- Autosave and manual save.
- Atlas import preview and replacement.
- Atlas JSON download.
- Markdown, YAML, and Mermaid export.
- Debug log tools.
- Docker build and runtime.
- Backend validation.
- Canvas customization editor.

## Schema and Compatibility Policy

This edition is a clean fork base.

Do not spend time preserving compatibility with:

- Full/private CTRoadmap atlas files.
- Handbook layout state.
- `layered_hierarchy`.
- Custom uploaded icons.
- `icon_ref`.
- ZIMA preferences.
- Removed themes/backgrounds.
- Passcode state.
- Update advisory state.
- Existing full-edition browser local-storage keys.

The converted application must be internally consistent and functional for new users starting from scratch.

Prefer simplifying frontend types, backend models, defaults, validation, seed data, and tests to match the reduced product.

## Order of Operations

### Phase 0 — Preflight and inventory

Before editing:

1. Read `AGENTS.md`.
2. Confirm the protected-file list.
3. Confirm the current branch and clean/known working-tree state.
4. Record the current build baseline.
5. Identify all files, routes, components, types, assets, CSS selectors, dependencies, tests, and local-storage keys related to each removal target.
6. Produce an implementation plan before modifying code.

### Phase 1 — Remove isolated runtime services

Remove the least entangled application services first:

1. Discord Settings block.
2. Update detection, update UI, update backend routes/state.
3. Passcode/authentication frontend and backend.

Checkpoint:

- Frontend build.
- Backend compile/import check.
- App opens directly without update or passcode behavior.

### Phase 2 — Remove Handbook and hierarchy paths

1. Remove Handbook components and utilities.
2. Remove Canvas/Handbook switching.
3. Remove Handbook state and preferences.
4. Remove `layered_hierarchy` behavior and obsolete schema/test paths.
5. Make Canvas the only view.
6. Remove Handbook-specific CSS and dead imports.

Checkpoint:

- App loads directly into Canvas.
- Tile selection, Layers, Families, stacks, search, and inspector still work.
- Frontend build passes.

### Phase 3 — Remove icon customization

1. Remove Inspector icon controls.
2. Remove icon picker/resolver branches.
3. Remove uploaded icon APIs and backend static serving.
4. Remove `icon_ref` handling and related types.
5. Remove unused dependencies, CSS, assets, and tests.
6. Confirm all tile types still render their default built-in icons.

Checkpoint:

- Existing core tile creation/rendering works.
- Backend routes compile.
- No icon customization controls or network calls remain.

### Phase 4 — Collapse appearance system

1. Remove ZIMA mode and mode selection.
2. Remove all built-in themes except CYBER.
3. Remove all built-in backgrounds except HEX.
4. Collapse appearance registries/resolvers.
5. Adapt the customization editor to a single CYBER/HEX base.
6. Replace the old multi-mode local-storage model with a clean fork-specific preference model.
7. Remove obsolete assets, CSS, and tests.

Checkpoint:

- CLASSIC shell always renders.
- CYBER/HEX always provides the default/reset appearance.
- Customization preview/apply/reset still works.
- Reload preserves supported customization values.
- No removed mode/theme/background identifiers remain in runtime code.

### Phase 5 — Rework Load Demo

1. Remove the tracked demo atlas.
2. Add optional runtime `data/demo.json` loading.
3. Add missing-file handling.
4. Reuse normal atlas validation and replacement confirmation.
5. Confirm app startup and build do not depend on demo file existence.

Checkpoint:

- Missing demo file produces a clear message.
- A valid user-supplied demo file loads successfully.
- Invalid demo content is rejected safely.

### Phase 6 — Dead-code and dependency cleanup

1. Remove unused imports, types, utilities, components, routes, assets, and CSS.
2. Remove frontend and backend dependencies used only by deleted features.
3. Remove obsolete tests.
4. Search repository-wide for removed feature names and identifiers.
5. Review unprotected technical documentation and comments for accuracy.
6. Do not modify protected files.

### Phase 7 — Focused validation

Run only validation relevant to the converted product.

Minimum automated checks:

```bash
npm --prefix frontend run build
docker compose build
docker compose up -d
docker compose exec ctroadmap python -m compileall backend
```

Use focused tests for retained behavior rather than repairing every historical test for deleted features.

Minimum smoke test:

- App opens directly into Canvas.
- No authentication/passcode UI appears.
- No Handbook control or route exists.
- Settings contains no ZIMA mode, mode selector, Discord block, update controls, or removed appearance selectors.
- CYBER/HEX render correctly.
- Canvas customization editor previews, applies, resets, and persists.
- Tiles use default type icons.
- Tile creation/editing/deletion works.
- Relationships work.
- Layers, Families, stacks, Planning Mode, search, and lock work.
- Autosave/reload works.
- Atlas import works.
- Atlas JSON download works.
- Markdown/YAML/Mermaid export works.
- Load Demo handles missing, valid, and invalid optional demo files correctly.
- No update-related remote request occurs.
- Protected files have no diff.

## Planning Requirements for Codex

The Plan Mode output must:

1. Inspect the actual current codebase rather than relying only on this document.
2. Name the exact files and symbols expected to change or be deleted.
3. Identify cross-feature entanglement before proposing deletions.
4. Call out any requested removal that would unintentionally damage a retained feature.
5. Separate:
   - frontend removal,
   - backend removal,
   - schema/type simplification,
   - CSS/assets cleanup,
   - dependency cleanup,
   - test cleanup,
   - validation.
6. Use the order of operations above unless inspection reveals a safer dependency order.
7. State explicit checkpoints after major phases.
8. Keep protected files untouched.
9. Avoid compatibility work for the full/private CTRoadmap edition.
10. Do not implement changes while in Plan Mode.

## Definition of Done

The conversion is complete when:

- The application is a functional Canvas-only diagram editor.
- All listed product features are removed from both UI and runtime infrastructure.
- The retained diagramming features still work.
- The codebase no longer contains meaningful dead paths for removed features.
- The appearance system is reduced to CLASSIC + CYBER + HEX with a functional customization editor.
- Load Demo remains usable with an optional owner-supplied runtime file.
- The app builds and runs successfully through Docker.
- Protected files remain byte-for-byte untouched.
