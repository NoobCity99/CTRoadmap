# CTRoadmap — Localization Rollout Plan

**Planning date:** 2026-11-18  
**Target:** private `NoobCity99/CTR_Dev_Core`, branch `v0.10.1`, examined at `b4f7aa9ff2c107eccd43bc7baf676de0a9106a38`  
**Research basis:** *Localization Research.pdf* (November 17, 2026)  
**Status:** Proposed engineering plan; no repository edits authorized by this document.

## Executive decision

Adopt the research-selected **i18next + react-i18next**, **stable semantic keys**, **English master catalogs**, and **bundled per-language resources**. Build the substrate and test a narrow vertical slice in the desktop shell before converting workspaces. Keep every converted English interface message visually/functionally equivalent before expanding the next batch. Never rewrite an Atlas's authored content merely because the UI language changes.

There are two distinct meanings of “add a language at any time”:

1. **Supported initial behavior:** add a new catalog and manifest entry, validate it, build/release the Docker app. No component/feature code edits. This is consistent with the research-selected bundled approach.
2. **Optional future behavior:** install a new catalog directly into persistent host storage at runtime, without replacing the Docker image. This requires a separately validated catalog-loading/trust/compatibility pathway and should not be conflated with the initial rollout.

Design the catalog format so both delivery mechanisms could eventually use it, but **implement bundled catalogs first**. The initial pilot does not need language-pack upload UI, backend runtime catalog APIs, translation vendors, or RTL layout transformation.

## Branch-specific findings

The inspected branch contains no `i18next`/`react-i18next` dependency or shared app-locales directory. `frontend/package.json` declares version `0.10.0-beta` even though the target branch is `v0.10.1`. Relevant source seams are:

| Area | Verified source owners / examples | Implication |
| --- | --- | --- |
| Bootstrap | `frontend/src/main.tsx`, `RootApp.tsx` | Initialize one shared i18next instance before desktop/mobile lazy shells render. |
| Top bar | `components/TopBar.tsx`, `ExportMenu.tsx`, `features/ingest/ImportMenu.tsx`, `SearchBox.tsx` | Simple and dynamic labels, `title`, `aria-label`, menu items, error/status texts; ideal pilot. |
| Workspace navigation | `components/WorkspaceSwitcher.tsx`, `LeftSidebar.tsx` | Stable workspace IDs must remain unchanged; translated labels become display-only. |
| Settings | `components/settings/registry.ts`, `SettingsNav.tsx`, `SettingsModal.tsx`, `sections/PreferencesSettings.tsx` | Current section/tab registries store English `label` strings; use key metadata and translate at render time. Place initial language control in Settings > Preferences > General/Application (new minimal preference section). |
| Shared tile metadata | `lib/constants.ts` (`TILE_TYPE_CONFIG`) | Preserve tile IDs/schema; replace language-dependent label consumption with a lookup keyed by stable tile type. Do not translate internal IDs. |
| Canvas/editor | `App.tsx`, `Inspector.tsx`, `TileNode.tsx`, Canvas components, `lib/validation.ts` | Mix of UI text, dynamic status/error strings, user data, and generated defaults; migrate after pilot. |
| Handbook | `components/HandbookView.tsx`, `lib/handbook.ts`, `features/handbookNotes/` | Generated headings, relationship labels, warnings, user-authored notes; requires explicit classification. |
| Rack/physical documentation | `features/rack/`, `features/physicalPorts/`, `features/physicalDocumentation/` | Large independent UI and metadata surface; physical schemas/IDs must stay unchanged. |
| Swimlane/INGEST | `features/swimlane/`, `features/ingest/` | Rich dialogs/status, plural counts, warning display, dynamic status values. |
| Mobile | `mobile/MobileShell.tsx`, `MobileNav.tsx`, other mobile views | Separate lazy shell must use the same active language and browser-local preference. |
| Experiences | `content/experiences/`, `features/experiences/` | Distinguish bundled user-facing authored copy from experience theme/definition IDs and any future user-created content. |
| Exports | `backend/app/exports.py`, `backend/app/handbook_pdf/render.py`, `frontend/src/features/handbookPdf/model.ts`, PNG scenes | Python-generated headings/dates are English today; separate cross-language integration milestone. Current PDF HTML has `lang="en"`, `Handbook`, `Generated`, `Table of Contents`, etc. |
| Code-editor language catalog | `features/codeNotes/languageCatalog.ts` | Not the natural-language UI catalog. Preserve syntax/language identifiers and extension mappings. |

**Limit of inspection:** This is a sampled source-level architecture review, not an exhaustive extraction of every literal. Codex must produce the exhaustive inventory before code migration.

## Invariants / non-negotiable boundaries

- `data/atlas.json`, canonical field names, tile/relationship IDs, saved schema, data interchange, and history must not change just because a language changes.
- Never auto-translate existing user-authored titles, Family and layer names, notes, paths, code, IPs, URLs, metadata names, or imported labels.
- Do translate system chrome, empty-state text, tooltips, accessibility labels, default UI-only field labels, confirmation and notification messages, generated export headings, and application-owned warnings.
- Classify potentially persisted default names (e.g., newly created tile title / system-generated Layer name) before migrating; do **not** swap their stored values for translated text without a separate product decision.
- Do not translate protocol identifiers, machine-readable enum values, CSS selectors, routes, API error codes, keyboard shortcuts, or file-format tokens.
- Language selection is a **browser-local UI preference**, not Atlas state or backend account state. It must not trigger autosave or Undo/Redo.
- Keep the frontend's old English visible copy equivalent during each refactor batch, unless a wording change is explicitly approved.
- Do not migrate backend validation messages directly into different-language API strings. Prefer stable frontend-mappable error codes when possible, with legacy English details as safe fallback.

## Target catalog contract

Suggested namespaces (adjust after ownership audit):

```text
locales/
  manifest.json                # supported languages, native names, namespace set, status
  en/
    common.json                # shared actions, accessibility, navigation
    canvas.json                # tile palette, Inspector, Layers, controls
    handbook.json              # documentation and NotePages UI
    rack.json                  # Rack, ports, connections, physical documentation
    swimlane.json
    ingest.json                # Atlas import, Snapshot, LLM-assist, staging
    settings.json              # Settings and language preference UI
    mobile.json                # mobile-only shell copy
    exports.json               # preview/export controls, print/PDF headings
    errors.json                # human-readable app-level errors and statuses
    experiences.json           # bundled experience strings where applicable
  es/
    common.json
    canvas.json
    ...
  _meta/
    context.json               # key purpose, placeholders, screenshot hints, ownership
```

Locations are illustrative until Codex verifies Vite, tests, and the Docker build. **One authoritative source of catalogs** must feed both browser resources and any later Python export translations; do not separately maintain contradictory translations in frontend and backend.

Example key convention:

```json
// en/common.json (illustrative)
{
  "actions": {
    "save": "Save",
    "undo": "Undo",
    "undo_available": "Undo — {{count}} available",
    "download_atlas": "Download Atlas"
  },
  "navigation": { "workspaces": "Workspaces" }
}
```

Keys should identify meaning, not the exact English sentence. Reuse `common.actions.save` only where the action has the same meaning. `Canvas`, `Handbook`, and `Rack` remain stable workspace IDs in code; their visible titles become lookups such as `common:workspace.canvas`.

The **master template** is not a second, manually maintained mega-file: English namespace JSON files together form the master. Provide an automated generator to produce a translation worklist/template for any new language containing all keys, English source text, context, placeholders, and status. Runtime locale catalogs should contain reviewed translations; missing entries should be **omitted** and fall back to English, not shipped as empty strings or `TODO` text. The validator reports missing/stale entries and placeholder mismatches. A source-meaning change marks affected translations for review even when the stable key is unchanged.

Language metadata should store code, native display name (e.g. `Español`), direction, enablement/preview status, and catalog compatibility. Avoid TypeScript literal unions of installed language codes; keep runtime validation through the manifest. Keep strict typed English keys using the actual installed i18next version's supported TypeScript API.

## Runtime language policy

1. Saved browser-local choice (suggested storage key `ctroadmap.uiLanguage.v1`) takes precedence.
2. Otherwise select a supported `navigator.languages` preference, optionally reducing region variants to their supported base.
3. Otherwise choose `en`. Configure `supportedLngs` and `fallbackLng: 'en'` explicitly.
4. Apply choice through one shared runtime, with `document.documentElement.lang` updated. Initially keep LTR (`dir=ltr`) until RTL is deliberately designed and tested.
5. Switching languages must update mounted dialogs, tooltips, menus, status messages, newly opened views, and later exports without an Atlas save or full page reload.
6. Bundle supported catalogs with production Docker image; no live machine translation, CDN, or telemetry.
7. Use `Intl`/appropriate locale-aware date and number formatting for human-readable quantities. Keep literal machine data (IPs, port numbers, IDs, code) unchanged.
8. Enable a language for normal users only when its promised scope has been reviewed. Keep the Spanish/pseudolocale pilot behind development/preview gating until coverage is acceptable.

## Milestones and gates

### M0 — Read-only source inventory and scope map (Codex first)

Codex searches the entire exact branch, **without editing**. Produce a version-controlled draft inventory with: source path, line/example, original English, text type (JSX, attribute, TS constant, error, CSS, Python, template, CLI), feature owner, proposed namespace/key, user-content or persisted-value risk, and suggested wave. Cover desktop, mobile, dialogs, tooltips, accessibility, errors, notifications, PDF/Markdown/Mermaid/PNG paths, and any host CLI output as **separate deferred scope**. Deduplicate shared semantics after review, not blindly by English text equality. Count confirmed/ambiguous/excluded text per wave. Identify existing test contracts that would need updates. **Gate:** inventory reviewed and high-risk exceptions classified.

### M1 — Core engine, English catalog, master-template tooling

Add pinned i18next/react-i18next versions; one initialized instance before `RootApp`; browser language detection/fallback/storage; explicit locale registry; versioned catalog structure; typed keys (use API supported by installed i18next), dev-only missing-key reporting, English catalog, generation/check tooling, and a minimal Language selector under Settings > Preferences. Do not restructure App, CSS, or schemas for this. **Gate:** English remains indistinguishable from baseline; change language + reload persist; no Atlas mutation; unsupported language safely falls back.

### M2 — Tiny vertical pilot (approximately 20–40 messages)

Translate a representative slice across `TopBar`, `ImportMenu`, `ExportMenu`, `WorkspaceSwitcher`, and `SearchBox`/sidebar. Include visible text, `title`, `aria-label`, one dynamic `{{count}}` message, one empty state, and at least one error/status/notification. Catalogs: full English keys for these surfaces + a small reviewed Spanish sample or dev-only pseudolocale. **Gate:** switch English ↔ pilot language while app is open, reload, open/close menus, keyboard navigation, no raw keys, no stale status strings, no layout clipping, no save/history change. Stop and fix architecture before bulk keying.

### M3 — Common shell and Canvas editor

Migrate remaining shared chrome, menus, search and sidebar; Canvas palette, tile/relationship type labels, Inspector, Layers/filters, selection controls, dialogs, validation/warnings, and Canvas PNG system captions. Extract UI-label accessors from static model registries, preserving type IDs. Do small component-sized PRs, not a single Canvas megadiff. **Gate:** all Canvas controls/paths render English exactly as before; pilot catalog and pseudolocale work; Canvas editing/Save/Undo/Redo/PNG unaffected.

### M4 — Handbook and NotePages UI

Migrate `HandbookView`, TOC, `lib/handbook.ts` derived headings/relationship labels, `HandbookAddressBook`, notes tabs/editor, code editor UI and Handbook-related dialog copy. Exclude user-authored Markdown/code/notes from translation. **Gate:** user text and references are unchanged, navigation unaffected, preview headings localize and preserve existing saved Atlas content. PDF itself deferred to M7 so frontend and Python contracts can be verified together.

### M5 — Rack, physical ports, cabling, physical documentation

Migrate Rack workspace/Inspector/toolbar, device/faceplate settings, physical ports, cable interactions, Connect Table and physical documentation. Preserve machine enums, port labels, Rack data, connection identities, and freeform labels. **Gate:** current Rack visuals, ports, cable relationships and exports remain behaviorally equivalent; long translated labels do not cover controls.

### M6 — Remaining application surfaces

Migrate Swimlane, Snapshot/INGEST, LLM-assisted import, Settings detail sections (beyond initial Language selector), authentication/access, update advisory, mobile shell and mobile-specific UI. Review bundled Experience content separately; treat authored experience definitions/Markdown and translation as a content-publishing workflow rather than a naive JSX-replace pass. **Gate:** desktop and mobile use the same preference, all modal keyboard workflows and error states remain accessible, and no internal enum/JSON value was translated.

### M7 — Server-rendered documents and export consistency

Audit and localize backend-generated Markdown headings and readable descriptions, Handbook PDF and physical documentation labels, and user-facing generated content in Mermaid/PNG where applicable. `backend/app/handbook_pdf/render.py` currently emits `lang="en"` and English headings and formats `Generated` date in English; `backend/app/exports.py` contains English Markdown labels. Plan an **additive validated locale** in the appropriate export request/payload, defaulting to `en` for older callers. Have backend and frontend resolve from the same source catalogs (or a generated, pinned copy), not two independently authored dictionaries. Support locale-aware date formatting and font glyph coverage. Preserve canonical YAML/JSON keys and machine-readable formats in English/stable schema; do **not** localize identifiers. **Gate:** generated documents match chosen locale, saved/user content remains untouched, offline export passes; PDF fallback/older clients still work.

### M8 — Catalog completion, automation, release readiness

Finalize English key coverage, translate a chosen launch language to a reviewed threshold, and run app-wide pseudolocalization. Add CI checks: JSON validity, key completeness, runtime missing/empty behavior, placeholder/plural agreement, unresolved keys, key changes, English semantics changes, and a ratcheting lint rule preventing newly introduced hard-coded UI text. Run frontend unit + Playwright, backend/print tests, and production Docker no-internet tests. Include narrow screen/mobile, keyboard, dialogs/tooltips, exported documents and fonts. Document how contributors add a language. **Gate:** no unexplained missing English keys, launch language only advertised at its verified completeness, production bundle contains catalogs, release regression checks green.

## Optional future M9 — Runtime-installable language packs

Only if “add a language at any time” means **no rebuild, restart, or application release**. Load validated catalogs through a dedicated read-only application catalog service or persistent `/app/data/locales/` override with explicitly approved manifest, catalog-schema and build-key compatibility, allowed locale IDs, namespace restrictions, file size limits, UTF-8/JSON checks, no executable content or external asset URLs, and controlled reload. This must be implemented as a separate milestone. Avoid proposing a Docker bind mount over compiled UI assets: it risks hiding built-ins or coupling hosts to image layout.

## Every PR / Codex implementation batch

- Branch and baseline SHA confirmed; preserve unrelated work.
- Narrow file list/namespace and scope documented.
- Add keys + authoritative English strings in the same change as JSX/TS/Python lookups.
- Translate complete messages (including placeholders/plurals), never sentence fragments.
- Preserve exact English text/behavior unless wording approval exists.
- Reuse shared keys only when meaning matches.
- Update tests/snapshots deliberately. No automatic replacement of string literals in data contracts.
- Build/typecheck/test affected feature. Check saved Atlas/Undo/Redo and key UI screenshot/interaction.
- Report missing strings, excluded user content, changed files, tests run, and whether ready for next wave.

## First next action

Ask Codex for **M0 only**: exhaustive read-only candidate-text inventory + architectural seam report at the exact `v0.10.1` head, no code or catalog creation. Review/adjust that inventory and the minimum pilot scope, then commission M1. Avoid issuing a combined “inventory, install i18next, and translate the entire app” prompt.

## Reference material

- User-supplied *Localization Research.pdf*, especially pp. 3–7, which selects named keys, React i18next, English catalog, feature namespaces, fallback, phased migration, pseudolocalization and QA.
- Live private branch file examples referenced above.
- i18next official configuration, fallback, and TypeScript documentation: <https://www.i18next.com/overview/configuration-options>, <https://www.i18next.com/principles/fallback>, <https://www.i18next.com/overview/typescript>.
