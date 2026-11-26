# CTRoadmap — M2 Build Specification

**Milestone:** M2 — Complete the small localization pilot + approximately 40%-expanded Pseudo-English  
**Target repository:** Private `NoobCity99/CTR_Dev_Core`  
**Target branch:** `v0.10.1`  
**Reviewed source baseline:** `e2b6579b7c11a734a7b5fa92ac4d6fb5d23d958f` (*M1c finalze m1*, November 19, 2026)  
**Status:** Implementation handoff to Codex; **implementation only, no permission to commit, push, deploy, tag, or release**  
**Roadmap authority:** `CTRoadmap_Localization_Roadmap_M2_Onward_Revised_2026-11-19.md`, grounded in `dev/Localize/CTRoadmap_Localization_Rollout_Plan_v0.10.1.md`. The revised roadmap may be supplied separately rather than checked into the repository; this specification explicitly restates all M2 requirements.

## 1. Mission and completion definition

Implement **only M2**. M0 and M1a/M1b/M1c are completed foundations, **not** work to repeat.

Finish the representative cross-feature pilot started by M1a, extending the current **20 English master keys** by the **20 precisely scoped messages below** to roughly **40 total keys**, while extending the existing English/Pseudo-English live-switch tests. This is intentionally **not** the M3 all-Canvas migration.

In the same milestone, upgrade **every existing and new `en-XA` catalog message** from accent substitution to accent substitution **plus approximately 40% longer translatable words**. Provide a reproducible authoring/checking approach, not an untestable one-off text edit.

**Success means:** English looks and works as before; the specified messages switch to clearly elongated Pseudo-English without a page reload; the Catalog/TypeScript/production-build contract stays intact; no user-authored or canonical Atlas data changes; and the representative TopBar/menu/sidebar interactions pass accessibility and visual-regression checks in Classic and ZIMA.

**Do not add Spanish or another real language in M2.** The separate font/script compatibility audit is **M2.5** and must remain unimplemented here.

## 2. Mandatory startup audit — preserve the upstream implementation

1. Read `AGENTS.md`, `PROJECT_LOG.md`, and relevant documents in `dev/Localize/`, especially the localization rollout plan and Roadmap M2 Onward Revised,  and M1c buildspec. Read `frontend/src/i18n/README.md` before editing catalogs.
2. Confirm `git branch --show-current`, `git rev-parse HEAD`, `git status --short`, and existing worktree changes. The reviewed SHA is **a reference, not permission to reset** a newer HEAD. Preserve all unrelated tracked/untracked changes.
3. Inspect the actual current source owners before editing:

   - `frontend/src/components/TopBar.tsx`, `ExportMenu.tsx`, `SearchBox.tsx`, `LeftSidebar.tsx`, `WorkspaceSwitcher.tsx`
   - `frontend/src/features/ingest/ImportMenu.tsx`, `availability.ts`
   - `frontend/src/App.tsx` where TopBar props, save-status messages and Undo/Redo counts originate
   - `frontend/src/i18n/{runtime.ts,preferences.ts,manifest.json,context.json,i18next.d.ts}` and `locales/en*/{common,canvas}.json`
   - `frontend/scripts/{catalogs.mjs,catalogs.test.mjs,locale-registry.mjs,locale-icon.mjs}`
   - `frontend/tests/{localization.spec.ts,settings-preferences.spec.ts,snapshot-availability.spec.ts,history.spec.ts,save-lifecycle.spec.ts}` as relevant
   - frontend styling for TopBar, toolbar popovers, sidebar, workspace navigation and Settings

4. If the original M0 inventory is available, consult its relevant TopBar/menu/SearchBox/sidebar entries and manually verify them against current source. The M0 *suggested keys* are **not** authoritative; the scope table below is the reviewed M2 contract.
5. Before changing code, make a brief **proposed target → actual owning code → risk/consumer** map in the implementation notes. If a named string has moved, find its current owner rather than adding duplicate translations. Report material inconsistencies before broadening scope; otherwise implement the smallest safe equivalent.

## 3. Hard safety boundaries

- Preserve the shared i18next singleton and generated registry, **English master**, strict translation key and placeholder typing, LTR-only metadata, fallback, validation and contributor workflow. Do not create another i18n system or per-component locale store.
- Keep `includeDevelopmentLocalesInBuilds: true`: **Pseudo-English must remain selectable in desktop development, production Vite and Docker builds**. Keep the existing `ctroadmap.language.v1` preference, instant switching, cross-tab sync, and `<html lang>` behavior.
- **Never translate or mutate** Atlas IDs, field names, Tile/Family/layer/user titles, equipment/custom labels, notes, paths, code, IPs, URLs, canonical default titles (`NEW NODE N`), relationship identities, search matching data, enums, CSS identifiers, export format IDs, file extensions, machine-readable output, or incoming backend errors. Translation must happen **at display boundaries**.
- Preserve exact English UI wording, punctuation, case and actions for each converted item. E.g. the visible text `PNG-CANVAS` and export format `"png"` are separate concepts; the latter is immutable.
- Do **not** change `TILE_TYPE_CONFIG`, `atlasMutations.ts`, model selectors, history serialization, backend APIs, exported PDF/Markdown/YAML/Mermaid contents, Docker configuration, or saved data as part of this pilot.
- No broad TopBar, import, export, Settings, notification, Canvas, Snapshot, Rack, Handbook, mobile, or backend conversion. Unselected English UI strings **must be listed as deferred**, not silently swept into M2.
- Do not replace literal developer data with translations just because the source string is English. No translation of incoming server messages or generated PDF/Markdown document body in M2.
- No external translation provider, remote catalog request, CDN, runtime language upload, or new database.
- Preserve all existing component IDs/keys, `data-experience-anchor`, keyboard/focus behaviors, aria relationships, hover effects, and drag/selection logic. Do not key React components by language.

## 4. Exact additional English message set — target 20 new keys

**Reviewed current starting point:** English `common.json` contains 9 keys and `canvas.json` contains 11, for **20 existing keys**. Keep those keys. Add **exactly these 20 logical messages** unless the actual current branch already contains one or requires a small, explicitly documented adjustment. Reuse a single key across matching visible/`title`/`aria-label` occurrences **only when meaning is identical**.

|    # | Proposed semantic key             | Exact current English message                                                     | Source / use                                             |
| ---: | --------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
|    1 | `common:history.undo`             | `Undo`                                                                            | TopBar: tooltip fallback and icon aria-label             |
|    2 | `common:history.undoAvailable`    | `Undo — {{count}} available`                                                      | TopBar: dynamic tooltip when `undoCount` is positive     |
|    3 | `common:history.redo`             | `Redo`                                                                            | TopBar: tooltip fallback and icon aria-label             |
|    4 | `common:history.redoAvailable`    | `Redo — {{count}} available`                                                      | TopBar: dynamic tooltip when `redoCount` is positive     |
|    5 | `common:actions.save`             | `Save`                                                                            | TopBar: icon button title and aria-label                 |
|    6 | `common:actions.downloadAtlas`    | `Download Atlas`                                                                  | TopBar: visible button and title                         |
|    7 | `common:settings.open`            | `Settings`                                                                        | TopBar: Settings button title and aria-label when closed |
|    8 | `common:settings.close`           | `Close settings`                                                                  | TopBar: Settings button title and aria-label when open   |
|    9 | `ingest:menu.open`                | `Import`                                                                          | ImportMenu trigger and menu accessible name              |
|   10 | `ingest:menu.atlasJson`           | `Import Atlas JSON`                                                               | ImportMenu first action label                            |
|   11 | `ingest:menu.snapshot`            | `System Snapshot`                                                                 | ImportMenu Snapshot action label                         |
|   12 | `ingest:menu.llm`                 | `LLM Assisted Import`                                                             | ImportMenu LLM action label                              |
|   13 | `ingest:snapshot.setupIncomplete` | `Snapshot setup is incomplete. See Update instructions to activate this feature.` | ImportMenu disabled Snapshot readiness tooltip/status    |
|   14 | `exports:menu.open`               | `Export`                                                                          | ExportMenu trigger/title/menu accessible name            |
|   15 | `exports:menu.handbookPdf`        | `Handbook PDF`                                                                    | ExportMenu one representative visible menu action        |
|   16 | `canvas:search.placeholder`       | `Search tiles...`                                                                 | SearchBox input placeholder                              |
|   17 | `canvas:search.clear`             | `Clear search`                                                                    | SearchBox clear-button aria-label and title              |
|   18 | `canvas:palette.heading`          | `Tile Palette`                                                                    | LeftSidebar expandable palette heading                   |
|   19 | `canvas:search.noMatches`         | `No matches`                                                                      | LeftSidebar results when a search returns nothing        |
|   20 | `canvas:search.emptyPrompt`       | `Use search to find tiles and relationships`                                      | LeftSidebar text when no search is entered               |

This table covers the originally requested **label, `title`, `aria-label`, interpolated `{{count}}`, empty states, and one conditional status** in multiple independent components. Existing M1a localized WorkspaceSwitcher, Node, Layers, Warnings and search-result previews are **regression targets**, not new keys.

### 4A. Namespace and catalog rules

- Extend `common` and `canvas`; introduce minimal `ingest` and `exports` JSON namespaces under both `frontend/src/i18n/locales/en/` and `frontend/src/i18n/locales/en-XA/`. Update **every registered locale's** namespace set in `manifest.json` so it passes the M1c exact-completeness contract; currently the registered locales are `en` and `en-XA`.
- Add the 20 full `namespace:key` entries to `frontend/src/i18n/context.json` with a precise UI surface, meaning, and named placeholder descriptions. `history.undoAvailable` and `history.redoAvailable` each describe `count`. No other new key needs interpolation.
- Do not add separate generic aliases for `Import`, `Export`, `Save`, etc., unless existing exact keys already represent the same purpose. Keep the table's messages complete rather than concatenating translated sentence fragments.
- English value for dynamic history title must remain byte-for-byte equivalent to the current outcome: `Undo — 3 available`, `Redo — 2 available`, etc.; zero-count uses the existing short `Undo`/`Redo` title. The existing count is **display data**, not a changed history state or storage value. No new plural grammar is required to change English wording in this pilot; future language-specific plural variants belong to a subsequent reviewed scope.
- Preserve technical acronyms such as `JSON`, `LLM`, and `PDF` as terminology in English and protect them where appropriate in pseudo authoring. Do not translate immutable format IDs.
- No additional real-language catalog and no changes to flag artwork, Language-tab radio labels, or locale metadata beyond the required namespace declarations.

### 4B. Component-specific mechanical safeguards

**TopBar:** Introduce `useTranslation("common")` (or equivalent existing hook) at the display owner. Translate only the eight tabled messages. Keep all count/disabled conditions, handlers, input refs, status-class derivation, `onDownloadAtlasJson`, undo/redo action semantics and Settings `aria-expanded` intact. Do **not** translate the `saveStatusText` passed by `App.tsx` in this milestone: it is generated upstream and includes raw error text; document its later presentation-layer migration as M3/M6 as appropriate. Avoid mutating `App` save/history logic just to demonstrate a translated status.

**ImportMenu:** Current `actions` is a tuple array with the English action label also used as React `key`. **Change it to stable action identifiers** (`atlasJson`, `snapshot`, `llm`) and render translated labels by those IDs. Keep `onAtlas`, `onSnapshot`, `onLlm` callbacks, keyboard roving/arrow behavior, focus return, `aria-disabled`, `aria-describedby`, tooltip ID and the authorization check controlled by `snapshotReady` unchanged. The imported `SNAPSHOT_UNAVAILABLE_MESSAGE` in `availability.ts` must stay English for other consumers/compatibility; translate the **ImportMenu presentation of that message** rather than altering the constant or the readiness predicate. Confirm whether the constant has other consumers and leave those outside M2 intact.

**ExportMenu:** Translate only the trigger/menu label and the visible `Handbook PDF` action. Preserve export format `"pdf"`, all other format IDs (`"png"`, `"markdown"`, `"yaml"`, `"mermaid"`), item availability logic, disabled tooltips, and menu handlers. Other visible export labels/hints are intentionally deferred to M3, even if mixed English/Pseudo-English during the pilot. Keep menu roles and accessible name in sync with the translated trigger.

**SearchBox/LeftSidebar:** Translate the placeholder, clear-button accessibility/title, palette heading and two existing result-empty states. Never alter `searchTerm`, search matching, `getSearchResults()`, result titles/detail metadata, selection, palette type IDs, generated `NEW NODE N` titles, or user-authored layer names. Existing `canvas` translation context should be reused, not a new state store. The clear button must still refocus the input.

## 5. Mandatory Pseudo-English upgrade — approximately +40% word length

**This is a first-class M2 deliverable, not optional polish.** Apply it to the **existing 20** Pseudo-English strings **and** all **20 newly added** keys, across `common`, `canvas`, `ingest`, and `exports`.

### 5A. Transformation requirements

1. Keep the existing visually pseudo/accented character treatment; also **lengthen alphabetic, user-facing words to approximately 1.4× their English letter count**. Short words necessarily round; do not create unreadable excess just to satisfy a four-letter token.
2. Protect and preserve **exactly** every `{{placeholder}}` (including spelling, braces and interpolation identity); punctuation and named HTML entities where present; digits/counts; paths, URLs, IPs, code, product acronyms and technical identifiers where applicable; and any user-authored runtime interpolation values. Never pseudo-transform strings **after** placeholders have been interpolated with user content.
3. The translations should still convey which UI action/status they represent. For `title` and `aria-label`, the entire message must remain intelligible to a tester. Preserve necessary punctuation and the semantics of one dynamic message even when the language rearranges words.
4. Existing Pseudo-English `canvas:search.tileDetail` / `linkDetail` templates may have a deliberately different word order from English. Preserve valid interpolation and meaningful preview behavior; **do not lose or translate the contents of** `typeLabel`, `source`, `target` or `lifecycle` values. The lifecycle labels themselves may be pseudolocalized.
5. Do not change `manifest.json`'s `nativeLabel` (`Pseudo-English`), `id` (`en-XA`), image icon references, or CSS/DOM identifiers to satisfy the expansion metric. The UI-message values are the subject of this work.
6. Pseudo-English remains enabled in every development/production/Docker build via the existing checked-in manifest policy.

### 5B. Reproducibility and measurable acceptance

- Implement the **smallest deterministic offline authoring/checking helper or validation workflow** that fits the M1c tooling, rather than manually elongating 40 values with no repeatable rule. A tool that proposes/refreshes pseudo catalogs and independently checks coverage/length is preferred; opt-in writes must be explicit, and normal builds must never silently overwrite hand-reviewed catalog files.
- State exactly how expansion is measured. **Recommended:** measure Unicode-letter counts for each English message and corresponding pseudo value, stripping interpolation tokens and excluding documented immutable technical acronyms; ignore decorative wrappers such as `⟦⟧` from the count. Report an **aggregate target near 1.40×** with a justified tolerance (suggest ±0.10), plus per-message outliers (short labels, technical-only values, intentionally reordered templates). A strong catalog-wide ratio may not hide individual unchanged long words; check them separately.
- Preserve the M1c requirements: complete namespaces/keys, no empty/TODO strings, identical placeholder sets, deterministic generation and correct TypeScript types. If adding a `pseudo:check` command, integrate it with existing catalog/build validation **without duplicating the entire validator**. Fail a malformed or materially underexpanded pseudo catalog with actionable diagnostics; do not make tiny labels fail because of integer rounding.
- Update `frontend/src/i18n/README.md` with the repeatable steps for adding a message and producing its expanded pseudo form; document any deliberate overrides and exceptions. Any pseudolocalization generation/check should work offline and be covered by focused tests.
- **Visual fidelity is the real acceptance gate.** Word-count ratios alone do not prove that labels fit.

## 6. Development-only missing-key diagnostics

M1 planning required missing-key diagnostics, but the reviewed M1c `runtime.ts` does not visibly install any such diagnostic. **Audit its actual runtime behavior.**

If none exists, implement **minimal, development-only, local diagnostic reporting** for unresolved translation keys, including the namespace/key and locale when available. It should be deduplicated/low-noise, opt out of all production builds, and must not send network requests, persist missing keys into Atlas/backend/localStorage, alter fallback behavior or change shown UI. Avoid an invasive translation-provider wrapper. Verify the diagnostic with a focused unit test or a documented isolated dev probe; a raw key should never appear in any newly localized M2 UI element.

Do not silently equate *unconverted hard-coded UI copy* with an i18next missing key. Full hard-coded-string detection/ratcheting CI is **M8**, not M2.

## 7. Visual, behavior, and data-integrity acceptance

Perform **English → Pseudo-English → English** switching in place and across reload. Include a second tab for synchronization, invalid/denied localStorage where existing tests cover it, and confirm the selected Language radio reflects actual runtime state.

### Required cross-feature browser scenarios

1. **TopBar labels and tooltips:** Verify Undo/Redo icons' `title` and accessible names, including counts **0, 1 and multiple**, the Save tooltip, Download Atlas visible/tooltip, and Settings open/close title/aria. Switching must not alter history capacity, canUndo/canRedo flags, or actual Undo/Redo operations.
2. **ImportMenu:** Open with keyboard and pointer; check `Import`, all three translated actions, Snapshot-disabled focusable item and translated readiness tooltip when `snapshotReady=false`; verify no action on the disabled item and unchanged click/callback behavior on enabled items. Check Escape, ArrowUp/Down, Home/End, Tab, focus return and stable React keys as applicable.
3. **ExportMenu:** Check the translated trigger, popover aria-label, translated Handbook PDF action, existing *unchanged* technical format labels, disabled-state tooltips/availability, focus and actual export callbacks. No export content changes.
4. **SearchBox/sidebar:** Check untranslated raw search query remains intact during live switch; placeholder/clear button in both languages; both empty states; clear-button focus restoration; palette collapse/expand; preserved search-result order and selection. Test existing M1a localized previews and authored names containing `&`, `'`, `<`, `>`.
5. **Long-text stress:** Check expanded `en-XA` in the WorkspaceSwitcher hover-reactive buttons; Canvas sidebar headings/palette/search rows; TopBar and menus/popovers; tooltips and accessible names; and Settings Language radio/Tab label. **Both Classic and ZIMA.** Use at least one comfortable desktop width and a narrow desktop width; use mobile-width where the target component actually exists. Include a representative **125% zoom or equivalent scale** stress check if the existing browser fixture supports it.
6. **Layout assertions:** No unexpected horizontal scrolling, labels covering other actionable controls, inaccessible focus targets, clipped actionable text without an accessible full label/tooltip, cut-off pseudo badges, or broken popover alignment. If existing UI intentionally truncates text, verify its accessible full value remains intact. Fix only affected local layout rules; no style-system overhaul or arbitrary globally reduced font sizes.
7. **State safety:** Language changes produce **zero Atlas PUT/refetch or backend settings writes** attributable to the switch, do not remount root app or CodeMirror, do not create Undo/Redo entries, and preserve any unsaved CodeMirror selection and draft. Follow the proven M1a/M1b/M1c test fixtures. Do not change save/history algorithms.
8. **Production behavior:** A real frontend production build and, if available, the Docker frontend-build stage must still include both language options and the expanded pseudo strings and icons. No locale catalog/flag fetches are needed at runtime. If Docker or browser runners are unavailable, report unperformed checks; never claim they passed.

### Regression test updates

- Update literal pseudo-English expectations in `frontend/src/i18n/runtime.test.ts`, `frontend/tests/localization.spec.ts`, and `frontend/tests/settings-preferences.spec.ts` as needed. Preserve all previous assertions regarding fallback, labels, user data, search, focus, locale persistence, flags, and editor/Atlas state. Do **not** simply delete failing cases.
- Add a focused M2 browser spec or extend the existing localization spec to cover the new TopBar/ImportMenu/ExportMenu/SearchBox/empty states/status. Prefer existing fixtures; do not establish another browser harness.
- Update only affected test selectors that currently depend on English accessible names; derive expected labels from the English and pseudo catalogs where feasible. Do not change component semantics to satisfy fragile tests.
- Keep Playwright artifacts in temporary **outside-repository** directories to avoid modifying tracked screenshots. No requirement to replace baseline screenshots without review.

## 8. Commands and verification gate

From `frontend/`, with dependencies installed from the existing lockfile:

```bash
npm ci --no-audit --no-fund
npm run i18n:check
node --test scripts/catalogs.test.mjs
npm run typecheck
npm test -- src/i18n/runtime.test.ts src/lib/tileDisplay.test.ts src/lib/tagFilters.test.ts
npm run build
npm run --silent i18n:template -- es
```

Run any new pseudo-generation/check tests and focused TopBar/import/export/history unit tests discovered during source inspection. Run the browser suites **with a unique temporary Playwright output path outside the checkout** (adjust command to the shell/environment):

```bash
npm run test:browser -- tests/localization.spec.ts tests/settings-preferences.spec.ts tests/snapshot-availability.spec.ts --output <temporary-output-dir>
```

Include additional focused existing history and save-lifecycle specs when they directly cover touched controls. Use the full test browser runner only if available and practical; list skipped suites and reasons.

**Specific failure injections:** Introduce an intentionally wrong `{{count}}` placeholder and a missing pseudo key in a **disposable fixture**; catalog checks and the regular build must reject them. Verify that the normal output remains identical and deterministic when inputs are unchanged. Exercise the developer missing-key diagnostic in development without altering shipped production behavior.

**Gate to finish M2:** All converted English text is equivalent to pre-M2 behavior, all 20 new and 20 prior messages remain valid, Pseudo-English achieves the documented approximate +40% word-length target, new UI copy switches without stale text, layout and keyboard checks pass, malformed catalogs stop builds, and save/history/user content/CodeMirror safety is demonstrated.

## 9. Explicit exclusions / deferred work — do not erase these from the roadmap

The following remain future work, even when files are adjacent to M2 edits:

- **M2.5:** Read-only-first browser font and Docker/PDF Unicode/script compatibility audit, font × script matrix, fallback planning; mandatory before advertising languages whose script coverage is unproven.
- **M3:** Remaining TopBar/reset/Planning Mode strings, full Import/Export menu items and hints, all other Canvas sidebar fields and type-label accessors, Inspector, dialogs, validation warnings, PNG captions and save-status presentation migration. Preserve `TILE_TYPE_CONFIG` and canonical model fields throughout.
- **M4:** Handbook/NotePages/Code Editor UI text and frontend documentation previews.
- **M5:** Rack, physical ports/cabling/connection documentation.
- **M6:** Swimlane, Snapshot/INGEST beyond the ImportMenu pilot, update advisory, remaining Settings/auth, mobile, bundled Experience copy classification and deferred host-CLI output.
- **M7:** Backend-generated PDF/Markdown/Mermaid/PNG readable text, added validated export locale, offline PDF font handling and old-client compatibility.
- **M8:** CI, comprehensive app-wide catalog coverage, hard-coded UI-string ratchet, reviewed real launch language, font/RTL/release-readiness checks.
- **Optional M9:** Secure runtime-installable language packs, distinct from the bundled registry.

Do not implement unrelated Cloudflare localization recommendations as new features. Original roadmap requirements retained in their existing milestones are unaffected.

## 10. Completion report and stop condition

On completion, provide a concise report containing:

1. Actual branch/HEAD and a **diff summary**; any deviations from the 20-key target table and why.
2. A checked English-key table with source locations, original copy, namespace and key. Confirm total key count and all locale namespaces.
3. Pseudo-English method, reproducible command(s), coverage metric and aggregate/per-message outlier report; include any accepted exceptions.
4. Screenshots/test observations for relevant long-label surfaces in Classic and ZIMA; record responsive/zoom constraints and any local CSS remedies.
5. Test commands with actual pass/fail counts, negative catalog checks, production build and Docker/browser status; distinguish executed tests from claims inferred by code inspection.
6. Evidence no Atlas/history/backend settings data or unsaved CodeMirror content was changed solely by language selection.
7. Explicit list of unconverted neighboring strings and their deferred milestone.
8. `PROJECT_LOG.md` entry documenting M2, tooling, the 40% pseudo policy and any limitations. Update `frontend/src/i18n/README.md` if the pseudo authoring process changed.

**STOP after M2.** Do not start the M2.5 font audit, M3 bulk migration, real-language translation, backend/PDF localization, full-app rewrite, commits, pushes or releases. Await separate authorization for the next milestone.
