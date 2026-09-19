# OPThemesUD.md
# CTRoadmap Open-Source Themes & Custom Tile Icon Update

**Target repository:** `NoobCity99/CTRoadmap`  
**Target branch:** public/local `main`  
**Reference repository:** `NoobCity99/CTR_Dev_Core`  
**Reference branch:** `master`  
**Implementation environment:** VS Code + Codex (Astra Extra High)

---

## 1. Goal

Port the current private-edition implementation of the following features into the simplified public/open-source CTRoadmap edition:

1. **All current Tile / Canvas Themes**
2. **All current Canvas Background Themes**
3. **The current Custom Tile Icon system**

The private repository is the **reference implementation**, not the new base codebase. Codex should inspect `CTR_Dev_Core/master`, reuse self-contained files where practical, and adapt only the code necessary to make these features work cleanly in the public edition.

This is a **surgical feature port**, not a repo synchronization.

---

## 2. Porting Rules

Prefer the smallest clean change set.

### Do

- Copy self-contained appearance/background modules and assets when compatible.
- Copy/adapt isolated functions, types, CSS blocks, handlers, and tests.
- Preserve the public repo's simpler architecture.
- Keep the feature behavior aligned with current private `master`.
- Re-check private `master` immediately before implementation in case the feature has evolved.

### Do not

- Replace public `App.tsx` wholesale with private `App.tsx`.
- Replace public `styles.css` wholesale with private `styles.css`.
- Replace public backend `main.py` wholesale.
- Copy private Settings architecture merely to obtain appearance controls.
- Introduce runtime dependency on the private repository.
- Reintroduce unrelated full-edition features.

If a private component is highly entangled with removed features, extract/adapt only the feature logic needed by public CTRoadmap.

---

## 3. Public Product Boundary

The public edition remains the simplified Canvas-only fork.

This project **must not reintroduce**:

- Handbook
- Handbook PDF export
- ZIMA application shell / App Appearance Mode
- Local Access Passcode / auth
- Update advisory / update modal
- Discord integration
- Rack View
- private workspace/navigation systems
- Atlas History / Undo / Redo unless already present independently in public
- full-edition migration/compatibility systems
- private-only Flow/Swimlane behavior

### Zima Carbon exception

Private `master` currently includes **Zima Carbon** as a Canvas background.

Because this task requests **all current Canvas backgrounds**, port `zima_carbon` as an ordinary selectable background.

Do **not** restore:

- ZIMA App Mode
- ZIMA branding/logo
- ZIMA shell styling
- `data-app-appearance-mode="zima"`
- per-mode Classic/ZIMA appearance preferences

Zima Carbon becomes only a Canvas background in the public edition.

---

## 4. Protected Public Files

Read local `AGENTS.md` before changing anything.

`AGENTS.md` is authoritative for protected files. Previously designated protected public files include:

```text
latest.json
README.md
CTR_install.sh
CTR_uninstall.sh
CTRBETA_release-compose.yml
```

Do not edit, reformat, normalize line endings, regenerate, or otherwise touch protected files.

The appearance/icon port must not alter the public install/update distribution chain.

---

## 5. Current Public Baseline

The public version currently has a deliberately collapsed appearance model:

- Tile Theme: **Cyber**
- Canvas Background: **Hex**
- appearance state is fixed to that pair
- `CanvasThemeEditor` is effectively a fixed preview/reset panel
- `CanvasFrame` consumes the Hex overlay directly
- custom uploaded/Lucide icon selection was removed

This update restores only the requested appearance and icon capabilities.

### Default after update

The public default must remain:

```text
Cyber + Hex
```

Do **not** change the public default to the private Classic default of Cyber + Grid.

Existing public users should retain the same visual default unless they choose another style.

---

# PART A — TILE THEMES

## 6. Tile Themes to Port

Port every theme currently registered in private:

```text
frontend/src/appearance/registry.ts
```

Current private `master` reference set:

| ID | Name | Presentation |
|---|---|---|
| `cyber` | Cyber | Standard |
| `aurora` | Aurora | Standard |
| `ember` | Ember | Standard |
| `blueprint` | Blueprint | Blueprint variant |
| `blueprint-ii` | Blueprint II | Blueprint variant |
| `nes` | NES | NES variant |
| `revealer` | Revealer | Cover/reveal |
| `revealer-lite` | Revealer Lite | Cover/reveal |
| `stellar` | Stellar | Cover/reveal + celestial artwork |

If private `master` contains additional or renamed themes when implementation begins, use the current private registry as authoritative while preserving the scope rules in this spec.

---

## 7. Theme Registry & Types

Restore a multi-theme registry modeled on private `master`.

Public appearance code should again provide equivalents of:

```ts
CANVAS_THEMES
isCanvasThemeId()
getCanvasTheme()
```

Port/adapt the private types needed for:

```text
CanvasThemeId
CanvasThemeVariant
TilePresentation
TileSurfaceTone
CanvasThemeDefinition
CanvasThemeVisuals
TileVisualTokens
LinkVisualTokens
CanvasStyleSelection
```

Theme definitions should retain current private behavior for:

- theme ID/name/description
- swatches
- per-tile colors
- per-link colors
- tile surface/text colors
- label surface/text colors
- theme variant
- tile presentation mode
- optional bundled assets

Do **not** port `AppAppearanceMode` into public.

---

## 8. Theme Resolvers

Restore theme-aware resolver APIs equivalent to:

```ts
getTileVisualTokens(tileType, canvasThemeId)
getLinkVisualTokens(linkType, canvasThemeId)
```

The selected theme must control:

- tile accent color
- icon accent color
- tile surface
- primary text
- muted text
- tile border/glow
- link stroke
- link label surface/text
- tile presentation mode

The active theme must flow through public graph mapping, Canvas rendering, MiniMap colors where applicable, and edge rendering.

---

## 9. Theme CSS Modules

Private `master` currently contains:

```text
frontend/src/appearance/themes/blueprintSeries.css
frontend/src/appearance/themes/tilePresentations.css
frontend/src/appearance/themes/coverReveal.css
frontend/src/appearance/themes/revealer.css
frontend/src/appearance/themes/revealerLite.css
frontend/src/appearance/themes/stellar.css
```

Port the complete feature-relevant files and import them from the public frontend entry point using the same modular approach.

Do not replace public `styles.css` with private `styles.css`.

Any theme-specific selectors still living inside private `styles.css` should be copied/adapted selectively.

---

## 10. Revealer / Revealer Lite / Stellar

Restore the private cover/reveal presentation behavior.

Public tile rendering must expose the DOM/data attributes required by the private CSS, including equivalents of:

```text
data-tile-presentation="cover-reveal"
data-tile-selected
data-tile-dragging
.cover-reveal-art
```

Validate behavior for:

- idle tile
- hover
- selected tile
- dragging tile

### Stellar asset

Port:

```text
frontend/public/assets/tile-covers/stellar/StellarBodies.webp
```

and preserve the private asset path expected by the registry/CSS.

### Integration guidance

Private `TileCardSurface.tsx` now contains unrelated full-edition integrations.

Prefer adapting the existing public `TileNode.tsx` in place. If Codex chooses to extract a small public-safe shared surface component, it must omit private Swimlane/Handbook/workspace behavior.

---

# PART B — CANVAS BACKGROUNDS

## 11. Backgrounds to Port

Current private `master` reference set:

| ID | Name | Renderer |
|---|---|---|
| `grid` | Grid | Static |
| `hex` | Hex | Static |
| `tron_dark` | Tron Dark | Static |
| `tron_lite` | Tron Lite | Static |
| `blueprint` | Blueprint | Static |
| `blueprint_ii` | Blueprint II | Static |
| `nes_grid` | NES Grid | Static |
| `lt_draft_grid` | LT Draft Grid | Static |
| `zima_carbon` | Zima Carbon | Static |
| `nebula_dive` | Nebula Dive | Zoom transition |
| `tron_legacy` | Tron Legacy | Animated |
| `pcb_trace` | PCB Trace | Animated |

Private `master` is authoritative if this list changes before implementation.

---

## 12. Background Registry & Types

Port/adapt support for:

```text
CanvasBackgroundId
CanvasBackgroundRenderer
CanvasOverlayVariant
CanvasBackgroundOverlay
CanvasZoomTransitionDefinition
StaticCanvasBackgroundDefinition
ZoomCanvasBackgroundDefinition
AnimatedCanvasBackgroundDefinition
CanvasBackgroundDefinition
```

Restore equivalents of:

```ts
CANVAS_BACKGROUNDS
isCanvasBackgroundId()
getCanvasBackground()
```

The public default remains `hex`.

---

## 13. CanvasFrame Integration

Adapt public `CanvasFrame.tsx` to receive an active `canvasBackgroundId`.

It should:

1. Resolve the background from the registry.
2. Expose the active background on the Canvas root, equivalent to:

```tsx
data-background={canvasBackgroundId}
```

3. Render the specialized background layer where required.
4. Render the React Flow overlay using the selected background definition.

Do not copy private layout-template, Handbook, snap-grid, MiniMap-hiding, or navigation changes that are unrelated to this project.

---

## 14. Static Background CSS

Locate all private selectors needed by the listed static backgrounds, especially selectors keyed by:

```text
[data-background="..."]
```

Copy/adapt the complete CSS dependency chain for those backgrounds only.

Do not wholesale-copy private `styles.css`.

If practical, place self-contained static background styling in a dedicated appearance CSS module.

---

## 15. CanvasBackgroundLayer

Port/adapt the private renderer boundary:

```text
frontend/src/appearance/backgrounds/CanvasBackgroundLayer.tsx
```

This should remain the single ID-to-renderer boundary for non-static backgrounds.

Decorative animation state must remain inside small background components. Do not lift it into Atlas state or top-level `App` state.

---

## 16. Nebula Dive

Port the current private implementation and dependencies, currently including:

```text
frontend/src/appearance/backgrounds/NebulaDiveBackground.tsx
frontend/src/appearance/backgrounds/zoomCanvasBackground.css
frontend/src/appearance/backgrounds/zoomTransition.ts
frontend/src/appearance/backgrounds/zoomTransition.test.ts
frontend/src/appearance/backgrounds/starMaps.ts
```

Assets currently required:

```text
frontend/public/assets/backgrounds/nebula-dive/nebula.svg
frontend/public/assets/backgrounds/nebula-dive/clouds.svg
```

Requirements:

- reacts to React Flow viewport zoom
- keeps viewport subscription inside the small background component
- preserves current private transition thresholds from the registry
- preserves nebula/deep-space transition behavior
- does not write camera/animation state to Atlas
- does not interfere with Canvas pan/zoom/drag

The public repo does not need private PNG-export systems for this project. Do not port export infrastructure solely because the background component supports export behavior.

---

## 17. Tron Legacy

Port the private isolated implementation, currently including:

```text
frontend/src/appearance/backgrounds/TronLegacyBackground.tsx
frontend/src/appearance/backgrounds/tronLegacyBackground.css
frontend/src/appearance/backgrounds/tronLegacyRoutes.ts
frontend/src/appearance/backgrounds/tronLegacyScheduler.ts
frontend/src/appearance/backgrounds/tronLegacyScheduler.test.ts
frontend/src/appearance/backgrounds/tronLegacyMotion.ts
frontend/src/appearance/backgrounds/tronLegacyMotion.test.ts
```

Preserve:

- perspective grid
- randomized network tracers
- scheduler behavior
- tracer/grid phase synchronization
- `prefers-reduced-motion`
- document visibility handling
- clean timer/animation disposal

---

## 18. PCB Trace

Port the current private isolated implementation, currently including:

```text
frontend/src/appearance/backgrounds/PCBTraceBackground.tsx
frontend/src/appearance/backgrounds/PCBTraceArtwork.tsx
frontend/src/appearance/backgrounds/pcbTraceBackground.css
frontend/src/appearance/backgrounds/pcbTraceRoutes.ts
frontend/src/appearance/backgrounds/pcbTraceScheduler.ts
frontend/src/appearance/backgrounds/pcbTraceScheduler.test.ts
```

Preserve:

- board artwork
- randomized pulse routes
- CPU arrival glow
- scheduler behavior
- `prefers-reduced-motion`
- document visibility handling
- clean disposal

---

## 19. Zima Carbon

Port:

```text
frontend/public/assets/backgrounds/zima-carbon.svg
```

and the private CSS needed to render it.

It must work in the public Classic shell without ZIMA App Mode.

If private CSS is conditioned on `data-app-appearance-mode="zima"`, adapt those rules to the selected `data-background="zima_carbon"` state instead.

---

# PART C — APPEARANCE SETTINGS

## 20. CanvasThemeEditor

Restore the private editor behavior inside the **existing public Settings UI**.

Required controls:

### Canvas Theme

Populated from:

```ts
CANVAS_THEMES
```

### Canvas Background

Populated from:

```ts
CANVAS_BACKGROUNDS
```

### Draft preview

Changing dropdowns updates the preview only.

### Actions

- Reset to Default
- Cancel
- Apply Canvas Style

### Status

Indicate whether the preview differs from the active style.

### Public-specific reset

Reset must choose:

```text
Cyber + Hex
```

Do not port Classic/ZIMA App Mode selection or per-mode memory.

---

## 21. CanvasStylePreview

Adapt the private preview so it accepts a draft style selection and previews:

- chosen tile theme
- chosen Canvas background
- theme variant
- link styling
- cover/reveal presentation where applicable
- theme swatches

Preview changes must not affect the live Canvas until Apply is pressed.

For expensive animated backgrounds, follow the private lightweight/frozen preview behavior rather than starting unnecessary full animation loops inside Settings.

---

## 22. Public Appearance Preference Model

Do not copy private `AppearancePreferencesV2` because it includes application modes.

Use a public-specific multi-style model, recommended:

```ts
interface PublicCanvasAppearanceV2 {
  version: 2;
  canvasThemeId: CanvasThemeId;
  canvasBackgroundId: CanvasBackgroundId;
}
```

Recommended storage key:

```text
ctroadmap.public.canvasAppearance.v2
```

Defaults:

```text
canvasThemeId: cyber
canvasBackgroundId: hex
```

Requirements:

- validate stored IDs against current registries
- corrupt/unknown values fall back to Cyber + Hex
- appearance is browser-local
- applying appearance does not dirty/save Atlas JSON
- localStorage failure does not block the app

The old public v1 preference contains no meaningful user choice, so either ignore it or perform a trivial Cyber/Hex migration.

Do not port private Classic/ZIMA migration logic.

---

## 23. App Integration

Adapt public `App.tsx` only where necessary.

The app needs access to:

```text
canvasThemeId
canvasBackgroundId
applyCanvasStyle()
```

and should pass them into:

- graph mapping
- CanvasFrame
- Settings editor/preview
- theme-aware MiniMap/edge/tile rendering

Expose only needed root attributes such as:

```text
data-canvas-theme
data-canvas-theme-variant
```

Do not restore:

```text
data-app-appearance-mode
```

---

## 24. graphMapping

Update public:

```text
frontend/src/lib/graphMapping.ts
```

with the minimum theme-threading changes.

Tile mapping should use:

```ts
getTileVisualTokens(tile.type, canvasThemeId)
```

Link mapping should use:

```ts
getLinkVisualTokens(link.type, canvasThemeId)
```

Do not copy the private graph mapper wholesale because private `master` contains unrelated layout/routing/full-edition changes.

---

# PART D — CUSTOM TILE ICONS

## 25. Custom Icon Feature Scope

Restore the private custom Tile Icon system with both sources:

1. **Selectable Lucide icons**
2. **User-uploaded image icons**

The tile type's current built-in icon remains the default/fallback.

---

## 26. Icon Data Model

Port/adapt current private frontend types equivalent to:

```text
UploadedTileIconRef
LucideTileIconRef
TileIconRef
UploadedIconAsset
IconUploadResult
IconAssetListResult
```

Custom icon selection remains stored in:

```text
tile.fields.icon_ref
```

Do not introduce a new top-level Atlas schema field.

Follow current private serialization exactly.

Representative forms:

### Uploaded

```json
{
  "kind": "uploaded",
  "id": "uploaded:<filename>",
  "filename": "<filename>",
  "url": "/api/assets/icons/<filename>",
  "media_type": "image/png"
}
```

### Lucide

```json
{
  "kind": "lucide",
  "id": "lucide:<Name>",
  "name": "<Name>"
}
```

---

## 27. Frontend Icon Utility

Port/adapt:

```text
frontend/src/lib/icons.tsx
```

Preserve current private behavior for:

- `UPLOADED_ICON_PREFIX`
- `LUCIDE_ICON_PREFIX`
- the complete current private Lucide option list
- icon ref normalization
- conversion helpers
- labels
- `TileIconGlyph`
- uploaded-image load failure fallback

Codex should copy the current Lucide list from private `master` rather than reconstruct it manually.

---

## 28. Tile Rendering

Update public `TileNode.tsx` so it:

1. reads `fields.icon_ref`
2. renders custom Lucide icons
3. renders uploaded image icons
4. uses the tile-type icon when no custom icon exists
5. falls back to the tile-type icon when an uploaded image fails
6. hides `icon_ref` from the ordinary visible tile fields

Theme-derived icon colors should continue to apply to Lucide/default icons.

Uploaded raster images should retain their natural colors.

---

## 29. Inspector Icon Library

Port/adapt the private `TileIconEditor` into the current public Inspector.

Required UI:

- current icon preview
- current icon description
- Choose Icon
- Use Default
- Upload New Icon
- uploaded icon library
- Lucide icon library
- select uploaded icon
- select Lucide icon
- edit/delete uploaded icon mode

Behavior:

- choosing an icon updates `tile.fields.icon_ref`
- Use Default removes `icon_ref`
- successful upload becomes available immediately and follows private selection behavior
- deleting follows current private behavior
- temporary expansion/edit state resets when selecting another tile
- public lifecycle/editability rules remain authoritative

Do not copy Handbook or Swimlane-specific Inspector code.

---

# PART E — BACKEND ICON STORAGE/API

## 30. Persistent Icon Directory

Add public config support equivalent to:

```py
ICONS_DIR = DATA_DIR / "assets" / "icons"
```

Ensure the directory is created when required.

Uploaded icons must persist under the existing Docker-mounted `data/` directory:

```text
data/assets/icons/
```

They must survive container restart and image replacement.

Do not commit user-uploaded icon assets into source control.

---

## 31. Icon API Routes

Port/adapt these private routes:

```text
POST   /api/assets/icons
GET    /api/assets/icons
GET    /api/assets/icons/{filename}
DELETE /api/assets/icons/{filename}
```

### Critical public adaptation

Private routes use:

```py
Depends(require_local_auth)
```

The public edition intentionally has no built-in auth.

**Do not copy those auth dependencies.**

---

## 32. Upload Validation / Security

Preserve the current private policy:

Supported MIME types:

```text
image/png
image/jpeg
image/webp
```

Maximum file size:

```text
512 KB
```

Reject:

- unsupported MIME
- empty file
- oversized file

Generate server-side filenames using UUIDs.

Do not use a client-supplied filesystem path.

Preserve path traversal protection equivalent to:

```py
Path(filename).name == filename
```

Only known supported image types may be served/deleted.

Do **not** add SVG upload support in this task.

---

## 33. API Client

Adapt public:

```text
frontend/src/lib/api.ts
```

to support multipart/FormData without copying private auth/session behavior.

Add equivalents of:

```ts
uploadTileIcon(file)
listTileIcons()
deleteTileIcon(filename)
```

Add FormData request support.

Do not copy:

- `credentials: "include"`
- auth-required browser events
- private auth wrappers
- unrelated Handbook upload/PDF functions

---

## 34. Backend Dependency

Add:

```text
python-multipart==0.0.20
```

to:

```text
backend/requirements.txt
```

Do not copy unrelated private dependencies such as passcode hashing, Pillow, or WeasyPrint unless Codex proves they are independently required by these requested features.

No new frontend npm package is expected; `lucide-react` already exists in public.

---

# PART F — ASSETS & CSS

## 35. Appearance Assets

Current private implementation requires at least:

```text
frontend/public/assets/backgrounds/zima-carbon.svg
frontend/public/assets/backgrounds/nebula-dive/nebula.svg
frontend/public/assets/backgrounds/nebula-dive/clouds.svg
frontend/public/assets/tile-covers/stellar/StellarBodies.webp
```

Codex must inspect current private `master` and include any additional assets referenced by the live appearance registry/CSS/components.

Do not copy unrelated branding/settings assets.

---

## 36. CSS Rules

Private `frontend/src/styles.css` is much larger than public and contains many removed features.

Therefore:

> **Never replace public `styles.css` with private `styles.css`.**

Only port selectors needed for:

- theme/background editor
- Canvas preview
- static background styles
- theme root/data attributes
- icon editor
- icon library
- any required structural theme selectors not already isolated in theme modules

Prefer modular appearance CSS where practical.

---

## 37. Settings Architecture Boundary

Private `master` now has a newer Settings modal architecture under:

```text
frontend/src/components/settings/
```

That Settings redesign is **not part of this task**.

Integrate the new theme/background controls into the **existing public Settings UI**.

Do not port private Settings navigation/modal infrastructure as a dependency.

---

# PART G — EXPECTED SOURCE SURFACE

## 38. Private Files Codex Should Inspect

### Appearance core

```text
frontend/src/appearance/index.ts
frontend/src/appearance/types.ts
frontend/src/appearance/registry.ts
frontend/src/appearance/preferences.ts
frontend/src/appearance/useAppearancePreferences.ts
frontend/src/appearance/resolvers.ts
frontend/src/appearance/preferences.test.ts
frontend/src/appearance/resolvers.test.ts
```

### Theme subsystem

```text
frontend/src/appearance/themes/
```

### Background subsystem

```text
frontend/src/appearance/backgrounds/
```

### Appearance integration

```text
frontend/src/components/CanvasThemeEditor.tsx
frontend/src/components/CanvasStylePreview.tsx
frontend/src/components/CanvasFrame.tsx
frontend/src/components/TileCardSurface.tsx
frontend/src/components/TileNode.tsx
frontend/src/lib/graphMapping.ts
frontend/src/App.tsx
frontend/src/main.tsx
frontend/src/styles.css
```

### Icon frontend

```text
frontend/src/lib/icons.tsx
frontend/src/components/Inspector.tsx
frontend/src/types/atlas.ts
frontend/src/lib/api.ts
```

### Icon backend

```text
backend/app/main.py
backend/app/config.py
backend/app/storage.py
backend/requirements.txt
```

### Assets

```text
frontend/public/assets/backgrounds/
frontend/public/assets/tile-covers/
```

---

## 39. Likely Public Files to Modify/Add

Likely targets include:

```text
frontend/src/appearance/index.ts
frontend/src/appearance/types.ts
frontend/src/appearance/registry.ts
frontend/src/appearance/preferences.ts
frontend/src/appearance/useAppearancePreferences.ts
frontend/src/appearance/resolvers.ts
frontend/src/appearance/themes/*
frontend/src/appearance/backgrounds/*

frontend/src/components/CanvasThemeEditor.tsx
frontend/src/components/CanvasStylePreview.tsx
frontend/src/components/CanvasFrame.tsx
frontend/src/components/TileNode.tsx
frontend/src/components/Inspector.tsx
frontend/src/components/SettingsPanel.tsx

frontend/src/lib/icons.tsx
frontend/src/lib/graphMapping.ts
frontend/src/lib/api.ts
frontend/src/types/atlas.ts
frontend/src/App.tsx
frontend/src/main.tsx
frontend/src/styles.css

frontend/public/assets/backgrounds/*
frontend/public/assets/tile-covers/*

backend/app/main.py
backend/app/config.py
backend/app/storage.py
backend/requirements.txt
```

This is a discovery list, not an instruction to rewrite every file.

---

# PART H — ORDER OF OPERATIONS

## 40. Phase 0 — Preflight

Before editing:

1. Read `AGENTS.md`.
2. Confirm target repo is public `CTRoadmap`.
3. Confirm branch and clean/known worktree.
4. Record protected-file hashes/diff status.
5. Inspect current private `CTR_Dev_Core/master`.
6. Reconfirm theme/background/icon inventory.
7. Run current public test/build baseline.
8. Do not edit the private repo.

Checkpoint: protected files recorded; baseline known.

---

## 41. Phase 1 — Appearance Model

Implement public-safe:

- multi-theme types
- multi-background types
- registries
- resolvers
- public v2 preferences
- appearance hook

Keep Cyber + Hex defaults.

Checkpoint:

- appearance unit tests pass
- no Atlas changes

---

## 42. Phase 2 — Standard Tile Themes

Port:

```text
Cyber
Aurora
Ember
Blueprint
Blueprint II
NES
```

Wire theme choice through:

- App
- graph mapping
- tiles
- links
- MiniMap
- root theme attributes

Checkpoint: all six render and persist across reload.

---

## 43. Phase 3 — Cover/Reveal Themes

Port:

```text
Revealer
Revealer Lite
Stellar
```

Add required TileNode attributes/DOM and Stellar asset.

Checkpoint:

- idle/hover/selected/drag states work
- Stellar asset has no 404
- normal Canvas editing still works

---

## 44. Phase 4 — Static Backgrounds

Port:

```text
Grid
Hex
Tron Dark
Tron Lite
Blueprint
Blueprint II
NES Grid
LT Draft Grid
Zima Carbon
```

Checkpoint:

- all selectable
- Hex remains default
- Zima Carbon works without ZIMA App Mode

---

## 45. Phase 5 — Advanced Backgrounds

Port:

```text
Nebula Dive
Tron Legacy
PCB Trace
```

along with their isolated utilities/CSS/tests/assets.

Checkpoint:

- Canvas interaction unaffected
- reduced-motion works
- hidden-document behavior works
- timers/animations dispose when changing backgrounds
- Nebula transition responds correctly to zoom

---

## 46. Phase 6 — Settings Editor

Restore draft preview + Theme/Background selectors + Reset/Cancel/Apply.

Checkpoint:

- preview is non-destructive
- Reset = Cyber + Hex
- Apply changes live Canvas
- reload restores selection
- appearance never dirties Atlas

---

## 47. Phase 7 — Backend Icons

Add:

- persistent icon directory
- multipart dependency
- upload/list/get/delete routes
- validation/security controls

Checkpoint:

- empty library works
- valid PNG/JPEG/WebP works
- invalid/oversized/empty uploads fail correctly
- path traversal fails
- backend starts with empty `data/`

---

## 48. Phase 8 — Frontend Icons

Add:

- icon types
- `lib/icons.tsx`
- FormData API support
- TileIconEditor
- custom rendering/fallback
- `icon_ref` filtering from normal Fields UI

Checkpoint:

- default icon
- Lucide icon
- uploaded icon
- reset
- delete
- missing-file fallback
- Atlas save/reload

all work.

---

## 49. Phase 9 — Cleanup

Search newly modified runtime code for accidental private feature imports:

```text
Handbook
AppAppearanceMode
setAppAppearanceMode
data-app-appearance-mode
require_local_auth
UpdateAdvisory
Rack
Workspace
Swimlane
```

Remove any copied code that is not independently required by the requested appearance/icon features.

---

# PART I — VALIDATION

## 50. Automated Checks

At minimum:

```bash
npm --prefix frontend test
npm --prefix frontend run build
docker compose build
docker compose up -d
docker compose exec ctroadmap python -m compileall backend
```

Run existing public browser tests if available.

Port/adapt private appearance/background tests where they can remain independent of removed private features.

Do not bring over large unrelated private test suites.

---

## 51. Tile Theme Smoke Matrix

Test each theme with representative states:

```text
Cyber
Aurora
Ember
Blueprint
Blueprint II
NES
Revealer
Revealer Lite
Stellar
```

Against at least:

- Node tile
- Service tile
- Flow tile
- Note tile
- planned tile
- selected tile
- child tile
- stacked representative
- relationship/link label

No theme may make essential content unreadable or break pointer interaction.

---

## 52. Background Smoke Matrix

Test every background:

```text
Grid
Hex
Tron Dark
Tron Lite
Blueprint
Blueprint II
NES Grid
LT Draft Grid
Zima Carbon
Nebula Dive
Tron Legacy
PCB Trace
```

Check representative zoom levels, including roughly:

```text
0.2
0.7
1.0
1.1
1.8
```

Confirm:

- pan
- zoom
- drag
- link visibility
- Canvas controls
- pointer events

remain correct.

---

## 53. Animated Background Performance

Animated backgrounds are decorative only.

They must not:

- trigger Atlas saves
- trigger continuous top-level App renders
- interfere with drag/pan/zoom
- keep timers alive after unmount
- animate against `prefers-reduced-motion`
- keep active scheduling unnecessarily when the document is hidden

Preserve the private implementation's isolated scheduler approach.

---

## 54. Icon Smoke Matrix

### Default

- new tile uses default type icon
- existing tile with no `icon_ref` remains unchanged

### Lucide

- choose several Lucide icons
- save/reload
- selections persist

### Upload

- PNG works
- JPEG works
- WebP works
- uploaded asset appears in library
- selecting it updates the tile
- save/reload retains reference and rendering

### Reset

- Use Default removes `icon_ref`
- type default returns

### Delete

- asset disappears from library
- current/other referencing tiles fail gracefully to the default icon

### Validation

- SVG rejected
- >512 KB rejected
- empty upload rejected

---

## 55. Persistence Rules

### Appearance

Browser localStorage only.

Do not save Theme/Background selection in Atlas JSON.

### Uploaded files

Persist under:

```text
data/assets/icons/
```

### Tile icon choice

Persist under:

```text
tile.fields.icon_ref
```

inside Atlas JSON.

---

## 56. Failure/Fallback Behavior

The app must remain usable if:

- localStorage is unavailable
- appearance storage is corrupt
- a selected uploaded file is missing
- icon directory does not exist yet
- icon library is empty
- icon list request fails
- reduced motion is enabled
- animated background cannot animate

Fallback preference:

```text
Cyber + Hex
Default tile-type icon
Static/nonanimated behavior
```

Never block Atlas editing because an optional appearance asset failed.

---

# PART J — COMPLETION CRITERIA

## 57. Definition of Done

The task is complete when:

- all current private Tile Themes are available publicly
- all current private Canvas Backgrounds are available publicly
- Cyber + Hex remains the public default
- selection persists browser-locally
- appearance selection never modifies Atlas JSON
- Revealer/Revealer Lite/Stellar behave correctly
- Nebula Dive responds to zoom
- Tron Legacy works
- PCB Trace works
- reduced-motion/visibility behavior works
- Zima Carbon works without ZIMA App Mode
- the current private Lucide icon option set is available
- PNG/JPEG/WebP icon upload works
- uploads persist in `data/assets/icons/`
- tile custom icon choices persist in Atlas
- missing uploaded images fall back safely
- backend validation/security rules are retained
- frontend tests/build pass
- Docker build/run passes
- protected files remain byte-for-byte untouched
- no removed full-edition feature was restored as collateral

---

# 58. Codex Execution Instructions

When implementing this spec:

1. Read local `AGENTS.md` first.
2. Read `OPThemesUD.md` fully.
3. Inspect the local public repo before editing.
4. Inspect `NoobCity99/CTR_Dev_Core` `master` as the current reference implementation.
5. Compare source architecture before copying.
6. Directly reuse self-contained modules/assets where appropriate.
7. Surgically adapt entangled/shared files.
8. Never make public runtime depend on private GitHub access.
9. Never import unrelated private systems just to satisfy an appearance dependency.
10. Validate incrementally after each phase.
11. Before completion, verify protected-file hashes/diffs and confirm no distribution behavior changed.

If private `master` has evolved since this document was written, use the newer private implementation for the requested Theme/Background/Icon behavior while preserving the public product boundaries defined here.
