# CTRoadmap — M3 Build Specification: Common Shell & Canvas Localization

**Execution model:** One authorized implementation task, divided into M3a → M3b → M3c → M3d. **Continue automatically through passing gates. Stop only for a genuine, unresolved blocker defined in §11.** Do not request approval between phases.

**Repository:** Private `NoobCity99/CTR_Dev_Core`  
**Target branch:** `v0.10.1`  
**Last inspected upstream HEAD:** `7da58a1013d0a74b73ecb6bc383d3ecfa2cfc47f` (*M2 pass 1*, 2026-11-20). Confirm the **actual** HEAD and working-tree state at execution; do not assume this reference is still current.  
**Source planning authority:** `dev/Localize/CTRoadmap_Localization_Roadmap_M2_Onward_Revised_2026-11-19.md`, M3; original `dev/Localize/CTRoadmap_Localization_Rollout_Plan_v0.10.1.md`, M3; M0 review findings and completed M1a–M2 implementation.  
**Additional approved scope decisions:** Everything that users can create, rename, or edit is **excluded from translation**—including **stock/default Tile field names**—even where English values are currently hard-coded. Fixed, app-owned Tile **type** names may be translated **only at presentation boundaries**. Apply language-neutral responsive design rather than `en-XA` layout patches.

## 1. End state and definition of done

Complete the remaining **common shell and Canvas/editor** user-interface localization, while **never translating user-editable information or changing what CTRoadmap stores**. Cover application-controlled text in TopBar/menus, Tile palette, Inspector chrome, Layers and filters, relationship controls, Canvas dialogs/confirmations/validation, and Canvas-only PNG interface and system captions. Continue the current English master / 40%-expanded Pseudo-English scheme.

This is **one uninterrupted Codex task**. Work in small implementation batches, execute the phase gates and fix any failures within scope, then proceed to the next phase automatically. Produce one consolidated final report. Do not implement M4–M9, a new real language, backend/PDF localization, or unrelated app redesign.

Success means:

- All **in-scope, application-owned display messages** are keyed, with semantically stable keys and the original English wording; ambiguous or editable content is explicitly inventoried as excluded rather than forcibly keyed.
- English and Pseudo-English (including existing 40 keys) remain valid, with deterministic approximately **40% word-length expansion** in `en-XA` and all catalog/build checks passing.
- Live language changes update currently mounted app UI, menus, dialogs, statuses and applicable Canvas export captions without reloading or affecting Atlas data, history or buffered drafts.
- Saved names/labels/default values, machine-readable identifiers and authored content are **byte-for-byte unchanged** by language switching and by ordinary create/edit/save/load/export operations.
- Language-neutral layout handles longer labels in the M3 surfaces; relevant control and export interactions work in Classic and ZIMA.

## 2. Mandatory classification rule: translate the tools, never editable information

**Primary product decision:** If text is itself user-editable/user-definable, **do not key it**. This includes the English *stock/default form* of those values. Merely being displayed next to an editor or being populated by a default does not make user content localizable.

| Surface / case | INCLUDE: app-owned UI text | EXCLUDE: editable, stored or technical content |
|---|---|---|
| TopBar and menus | Fixed actions (Reset, Load Demo, Wipe All Content, Planning Mode), help/tooltip/aria text, app-owned save indicators and confirmations | Atlas name, filenames, user data, raw backend error details, branded proper name `CTRoadmap`, file-format tokens such as `JSON`, `YAML`, `Markdown`, `Mermaid`, `PNG`, `PDF` |
| Tile palette | Fixed **Tile type** display names (Node, Equipment, Service, etc.), palette navigation, instructions, creation hints | Newly created Tile title, editable stock/default titles (`NEW NODE N`), editable Tile **field names** and values, custom icon/equipment names |
| Tile/Family/Stack Inspector | Fixed Inspector headings, tabs, buttons, prompts, contextual instructions, read-only notices, counts | Tile/Family/Stack names; user titles, descriptions and notes; custom labels; any field **key/name** displayed in the field editor, including stock names (`ip`, `hostname`, `MAC Address`, `CPU`, etc.); field values |
| Layers/Views, filters and tags | Fixed New/Edit/Delete, Filter, visibility, Show All, actions and dialog instructions | Layer/View titles, custom descriptions, Tag names, Family names, user filter names, persisted default names |
| Relationships | Fixed app-defined relationship **type** labels in selection controls, picker instructions, action messages | Custom Link label, connection endpoints/user Tile titles, notes, ports/IDs, relationship data and stored type IDs |
| Dialogs/warnings/errors | App-generated warnings and confirmation **templates**; dynamic counts using placeholders | Names/values/IDs interpolated into those messages, raw opaque error details, user-entered dialog values, debug/protocol/error codes |
| Search | Fixed UI affordances/categories/empty-state messages | Search query, authored result titles, text and metadata, match algorithm, sorting and selection identifiers |
| Canvas PNG | Canvas-only system-owned title-block captions, options dialog chrome, instructional text | User-supplied export title, Atlas/Layer names, Tile content, custom captions, metadata values, filename components, technical/machine identifiers |
| Responsive styling | Reflow, wrapping, sizing and overflow protection independent of locale | User-selected themes, font/custom styles, authored Canvas/Tile layout as data |

**Important distinction:** A fixed UI label such as `Add Field`, `Delete Tile`, `Fields` tab, `Type` selector title, or an instructional prompt *may* be translatable even though it operates on editable data. The actual displayed field name (e.g. `hostname`) and its stock version **must not** be translated. Similarly, the fixed enum `equipment` may display as a translated Tile type in a selector, but a user-defined Equipment label or persisted title is untouched.

**Decision algorithm for every candidate:**

1. Does the string originate from user input, uploaded/imported data, a stock/default editable field name/title, or something persisted and later customizable? **Exclude the string itself**, including its default value.
2. Is it an internal enum, Atlas key, CSS/API identifier, port/protocol/code, file-format token, debug event ID, route, or matching/sorting input? **Exclude.**
3. Is it application-owned *display-only* chrome, an instruction, a status, a tooltip, an accessible label, or a warning/confirmation template? **Include**, preserving interpolation variables and user data.
4. Does the same string serve both display and business/data behavior? **Introduce a typed display-only lookup/formatter** at the consuming UI. Never change canonical source constants to translated text.
5. If classification remains ambiguous after inspecting producers and consumers, **leave it unchanged and record the precise reason**. This is normally **not a blocker**; proceed with safe entries. Do not silently imply excluded strings are translated.

Protect the behavior identified in the M0 review: `TILE_TYPE_CONFIG` feeds creation/numbering, `nextGeneratedTileTitle`, `defaultStackName`, backend stack normalization, `New Family`, and copied-title suffixes. All persisted canonical names and numbering must stay identical. Preserve `features/codeNotes/languageCatalog.ts` (programming languages, unrelated to UI locales).

## 3. Preflight — perform once, then proceed

1. Read `AGENTS.md`, applicable CSS/style ownership guidance, `PROJECT_LOG.md`, M0 reviewed findings, M2 buildspec and the revised M2-onward roadmap. Confirm `git branch --show-current`, `git rev-parse HEAD`, `git status --short`, and preserve all pre-existing changes; never reset/clean/overwrite unrelated work.
2. Inspect current language infrastructure: `frontend/src/i18n/`, `frontend/scripts/catalogs.mjs`, `pseudo.mjs`, `locale-registry.mjs`, `frontend/src/i18n/README.md`, relevant Playwright suites and package scripts. **Do not recreate the localization engine.** Current manifest policy is `includeDevelopmentLocalesInBuilds: true` and browser preference key is `ctroadmap.language.v1`.
3. Check whether the independently planned **language-neutral TopBar/workspace-switcher responsive repair** has been merged since M2. If yes, reuse it. If not, avoid conflicting architectural duplication; M3d must still establish/verify language-neutral text accommodation on affected M3 controls, and record whether the separately scoped full shell repair remains pending. **Never reinstate `:lang(en-XA)` layout hacks.**
4. Build a concise **M3 surface inventory / risk ledger** grouped into phases: component/source owner, exact visible source text, classification (app UI / editable / persisted default / machine / deferred), proposed key, consumer risks, test owner. Use the prior M0 audit if accessible, but re-check today's sources—line numbers and assumptions may have changed.
5. Run a clean baseline as feasible (`npm run i18n:check`, `npm run typecheck`, focused localization tests, existing production build) and record pre-existing failures. Avoid destructive tests against real data; use fixture Atlases.

**Preflight gate:** No known unresolved data-safety or environment blocker; inventory has clear exclusions and a feasible test strategy. Then proceed **directly** to M3a.

## 4. Common technical rules for all phases

- Use existing **English master namespace catalogs** (`common`, `canvas`, `ingest`, `exports`) and add only justified new namespaces (for example, a dedicated app-level UI errors namespace) through the existing manifest-driven registry. Maintain identical namespace and key sets across all declared catalogs, complete `context.json`, typed keys and validation.
- Preserve **all current English display wording and punctuation** unless a change is explicitly necessary and documented. Translate **whole messages** for plural/dynamic text where feasible, not sentence-fragment concatenations. Use stable semantic keys, with appropriate context/placeholder descriptions. Reuse keys only when meanings match.
- Use `useTranslation` in mounted presentation components. For functions outside React or offscreen export renderers, pass a typed localizer or capture a validated locale at the appropriate boundary; **do not blindly call React hooks outside a provider**.
- Never write `t(...)` output into Atlas objects, stored defaults, URLs, backend payload values, browser histories, API contract fields or machine-readable output.
- Preserve dynamic user-authored values as **interpolation arguments**, rendered safely as React text. Do not parse generated English messages back to decide translation. Never use `dangerouslySetInnerHTML` for translated text. Keep raw backend error strings as data, with fixed human-readable surrounding text translated only when safe.
- `App.tsx` holds some user-facing statuses as **plain English state strings**. Where M3-owned statuses need live switching, prefer stable message descriptors (`key + params`), display-only adapters or equivalent memoized formatting. Avoid rerunning commands/effects, clearing status, or triggering additional saves on language changes. Keep debug/event-log codes and backend responses unchanged.
- Keep app key/enum registries (`TILE_TYPES`, `LINK_TYPES`, `TILE_TYPE_CONFIG`, `DEFAULT_FIELDS`, source/port IDs and lifecycle IDs) unmodified as authoritative data. For fixed type labels use a **total, compile-time checked display-only mapping keyed by stable enum**, with safe English fallback; support existing M1/M2 `Node` key without divergent meanings.
- Preserve element identity, list keys, aria-current/aria-expanded/aria-disabled semantics, clipboard behavior, keyboard navigation, focus return, mouse/drag behavior, and async operations when language changes. No forced component remount to refresh language.
- Maintain deterministic pseudo generation with `npm run i18n:pseudo -- --write` only after inspecting its proposal. Respect protected placeholders, URLs, acronyms, paths, IDs and user strings. Aggregate target ~1.40× with existing validator checks; do not hand-edit pseudo entries to bypass coverage.
- **Visual convention:** Prefer intrinsic sizing, `min-width: 0`, appropriate min/max bounds, natural wrapping and selected `overflow-wrap` on *text-bearing UI elements*. No global `overflow-wrap: anywhere` on the entire application, no arbitrary `:lang(en-XA)` layout selectors, no silent ellipsis or font shrinking as the default solution. Maintain existing UI aesthetics.
- **Font audit:** M2.5 is a separate audit/release gate for new scripts. Do **not** block English/Pseudo-English M3 on an unfinished M2.5 unless a glyph/render defect blocks the current test. Do not enable a new real locale here.

## 5. M3a — Remaining common shell, TopBar, menus, Tile palette and sidebar

### Implementation

1. Finish remaining **TopBar / shared shell** application-controlled text in `frontend/src/components/TopBar.tsx` and immediate display owners. Candidates include `Reset`, `Load Demo`, `Wipe All Content`, `Planning Mode`, brand subtitle/accessible description (but **not** the proper name `CTRoadmap`), and relevant title/aria-label/helper messages. Existing M2 Undo/Redo/Save/Download/Settings/Import/Export keys **must be reused**, not duplicated.
2. Complete remaining application-owned **Import/Export/Reset menu descriptions/tooltips** where owned by shared menus; leave format names (`Markdown`, `YAML`, `Mermaid`, `PNG`, `PDF`) intact as standardized tokens. Leave the rest of the Snapshot/INGEST and update-advisory experiences for M6. Preserve menu item IDs, existing enabled/disabled conditions, onClick payloads, focus behavior and import/export actions.
3. Translate fixed Tile palette **type** labels and creation hints for all remaining predefined types in `LeftSidebar.tsx`, including collapsed/expanded palette presentations, previous/next navigation, fixed Family-tool instructions and other fixed sidebar heading chrome. Maintain `TILE_TYPE_CONFIG` English labels and canonical factories. If the selected UI label comes from user-customizable classification data, keep that custom label unchanged.
4. Keep `SearchBox` and existing search-preview keys functional; complete remaining *fixed* sidebar/help text owned by this phase without changing search matching, user titles, tag values, custom type labels or selection IDs. Layer/filter and relationship-specific controls can be completed in M3c to avoid duplicate work.
5. For shared UI with cross-workspace display, use explicitly scoped presentation translations; avoid accidentally translating Handbook/Rack/INGEST pages that belong to M4–M6, or document safe shared-control coverage separately.

### M3a gate — verify, repair, continue

- English copy unchanged; all new keys exist in English, pseudo and context; pseudo generation/check, typecheck and focused frontend build succeed.
- Palette types and their tooltips change live without changing `TILE_TYPE_CONFIG`, canonical default titles (`NEW NODE 1`, `NEW SERVICE 1`, etc.), drag data, creation results or disabled behaviors.
- Test Import/Export/Reset menu opening, focus, action dispatch, and Pseudo-English labels (also with a menu already open during language switching). Test a long synthetic non-pseudo label where relevant.
- Existing M2 TopBar/menus, search and workspace tests remain green. After a passing gate, **start M3b automatically**.

## 6. M3b — Inspector and editing controls (excluding all editable field names)

### Implementation

1. Scope the fixed UI chrome in `frontend/src/components/Inspector.tsx`, including Tile, Link, Family and Stack inspector states, selection empty state, editor sections, tab labels, buttons, action affordances, read-only notices, static instructions, lifecycle display words, and accessibility/tooltips. Inspect adjacent *presentation-only* components used directly by the Inspector; do not expand into M4 NotePages/CodeMirror or M5 Rack Inspector internals.
2. **Do not translate the field editor's key/name output:** currently `Object.entries(selectedTile.fields)` displays the real field key. That includes stock fields (`role`, `hostname`, `ip`, `port`, `os`, etc.) and user-defined keys. If there is any label/alias map for editable fields, leave its stock and customized outputs untouched too. Preserve field editing, deletion, custom addition, coercion, order and serialized keys.
3. Translate **actions around fields**, not field names. Examples: `Fields` tab, `Add Field`, static `Field name` prompt, `Remove {{fieldName}}` accessible tooltip, selected-type instructions, where `fieldName` is left verbatim. `Notes` tab and editor chrome are eligible; user notes are not.
4. Separate immutable built-in Tile type display names from stored title and Stack/Family defaults. Translate only fixed enum-based labels in select options or informational headings where presentation-safe. Do not translate `selectedTile.title`, `selectedFamily.title`, `selectedStack.name`, `selectedLink.label`, user equipment classifications or fallback/default values used to save data.
5. Dynamic UI sentences such as member counts, stack/tile relationship summaries or read-only reasons should use complete messages and safe parameters. Keep language switches from remounting `BufferedInput`, `BufferedTextarea`, CodeMirror editors, icon upload controls, or losing focus/caret/drafts.
6. Preserve any protected execution field semantics (`execution_enabled` and related limits), the exact selected enum value in HTML inputs, and all technical type/port identifiers.

### M3b gate — verify, repair, continue

- Create/edit/read a Tile with a mixture of stock and custom fields, including names containing accents, spaces and HTML-like characters. In both locales, **field names and values remain identical**, while `Add Field`/other chrome updates.
- Verify Tile, Link, Family and Stack Inspector actions, type changes, field creation/deletion, buffered input focus/caret, Undo/Redo, save/reload and serialization. Confirm canonical generated titles and default Stack/Family naming remain unchanged.
- Check live language switching with a focused buffered field, an unsaved Code Note draft, pending icon state where applicable, and both expanded/pseudo labels. No Atlas PUTs, history changes or backend settings writes caused **by switching alone**.
- Pass relevant Inspector, Tile/Stack/Family/Atlas lifecycle unit and Playwright tests, catalog checks, typecheck and build. After a passing gate, **start M3c automatically**.

## 7. M3c — Layers/Views, filters, relationships, Canvas dialogs and validation

### Implementation

1. Complete **Canvas sidebar** Layers/Views creation/edit/delete buttons, section headings, Filter/Tag/Family toggles, visibility actions, relationship filter UI, empty states and tooltips. Keep every stored `view.title`, `view.description`, `family.title`, `family.tag`, tag string and custom name unchanged.
2. Translate the *fixed relationship-type presentation names* and static descriptions in `RelationshipTypeModal.tsx` and their safe Inspector/filter consumers. The modal currently derives an English label from `type.replace(/_/g, " ")`; use an exhaustive mapping from stable `LinkType` values to display-only translation keys. **Do not alter** the stable `LINK_TYPES` array, structure/rotation modes, connection endpoints, custom Link labels, `from`/`to`, `from_port`/`to_port`, or selection payloads.
3. Translate **Canvas-owned** prompts, confirmations, instructions and error/status messages where they are displayed. Concrete source seams include `App.tsx` handlers for Create/Edit/Delete Layer, Delete Tile, Delete Family, Load Demo, Wipe All Content and change-Flow-type confirmation; `CanvasFrame.tsx` Snap-to-Grid, connector routing and Stack context controls; and applicable local dialogs. Where a prompt supplies default editable text such as `New Family`, **translate only the prompt question/instruction, never the default input value or generated title**.
4. Audit `frontend/src/lib/validation.ts` and its UI consumers for **Canvas-owned warning display**. Current `AtlasWarning.message` strings contain technical/user values. Prefer a stable warning code/descriptor + safe interpolation at the **presentation boundary**, keeping the original English `message`, `warning.id`, severity, target IDs, validation and search behavior intact. Preserve downstream consumers of the original warnings (including Handbook/export/backends). Do not translate by English-string comparison and do not mutate warning objects just because locale changes. Messages sourced from deferred Swimlane/Rack or backend code can retain English fallback and must be classified explicitly.
5. Handle plural-sensitive counts as complete localized sentences/messages, preserving exact English output. Do not change stored count values or change warning sort/order merely because locale changes. Preserve all popup safety wording and destructive-action confirmation semantics.
6. Keep unrelated Snapshot/INGEST workflows, update advisory, passcode/auth, Rack deletion/port validation, Swimlane editors, mobile-only UI and Handbook writing UI for their later milestones. Do not turn M3 into a backend error-protocol migration.

### M3c gate — verify, repair, continue

- Create, edit and delete a Layer with a custom title/description; filter by a custom tag, Family and Tile type; create/update/delete a relationship through the picker, including disabled and suggested types; confirm original stable IDs and persisted data.
- Verify native `confirm`/`prompt` contents are translated but **passed editable defaults and returned values** are unchanged; verify Cancel and Undo behavior on destructive operations. Capture an actual generated English confirmation for comparison.
- Test empty Atlas and malformed references to exercise system warnings, preserving user titles/IDs with special characters. Switching language must update applicable visible warnings without rerunning validation as a side effect or mutating warning models.
- Run relevant warning, relationship-structure, tag/filter, Canvas deletion, history, save-lifecycle, modal keyboard, and TypeScript/catalog/build tests. After a passing gate, **start M3d automatically**.

## 8. M3d — Canvas PNG presentation, language-neutral layout, end-to-end acceptance

### Implementation

1. Cover remaining **Canvas-only** export UI options in `PngExportOptionsDialog.tsx` where applicable, Canvas `PngExportTitleBlock.tsx` system captions (`System`, `Date`, `Tiles`, `Relationships`), related system-only option/help labels, and other *application-generated readable captions* within the Canvas PNG scene. Keep user-selected export title, original Atlas title, user text on Tiles, Family/Layer labels, custom captions, filename components and other authored content verbatim. Existing other export formats (backend Markdown/YAML/Mermaid/PDF), Rack PNG and Flow PNG translation remain M5/M7, except safely shared button labels where justified.
2. **Shared component caution:** `PngExportTitleBlock` also renders `rack` and `compact-flow` variants. Do not silently change their generated output; localize the `canvas` variant intentionally. Where the export runs in an isolated/offscreen React tree, explicitly feed it a validated active-language snapshot or the existing provider. Test the **captured PNG pixels**, not only the ordinary app DOM. Preserve exact sizes, file identity and technical metadata.
3. Establish **reusable, language-neutral responsive styling conventions** for M3's affected shell/Canvas/Inspector/dialog/menus. Preserve compact English layout when content fits and allow longer labels/wrapping when it does not. Test long **synthetic English** and Pseudo-English. Do not introduce `:lang(en-XA)` or locale-specific width/height/position rules, and do not apply blanket aggressive word-breaking across Canvas Tile content. If the separate TopBar/workspace-switcher responsive refactor has already landed, **reuse and regression-test it**, do not reproduce it.
4. Run a scoped **post-M3 UI inventory**: count app-owned visible literals still present in M3 owners, record intentional exclusions and the later owner for deferred items. Check `title`, `aria-label`, placeholders, context menus, error paths, disabled states, hidden menus and headings—not only obvious JSX text. Do not falsely report completeness by ignoring embedded dialogs.
5. Update `frontend/src/i18n/README.md` for new namespaces, key conventions, display-label accessors, the **permanent exclusion of all editable/default Tile field names**, and how to test live switching/long text. Update `PROJECT_LOG.md` with phase summaries and measured results.

### M3d final gate — verify, repair, complete

- Verify English visual/text parity and all in-scope Pseudo-English surfaces. Switch languages with menus, Inspector, warnings and export dialogs open, preserving focus/state; test fresh/reload/cross-tab and denied storage scenarios as applicable.
- Check Classic and ZIMA, at least **1440, 1280, 1024, 920, 680 and 390 CSS-pixel** widths where each surface exists; use extra-long and unbroken *English* labels as an independent language-neutral stress test. Test visible text bounds, popover reachability, keyboard access, scroll containment and absence of horizontal document overflow. Report a real browser-zoom test separately from `deviceScaleFactor`—the latter is **not** browser zoom.
- Exercise Canvas create/edit/search/select/drag, Layer filters, relationship connections, delete/confirm/Undo/Redo, autosave, buffered drafts and export. Assert that changing language alone causes **zero Atlas PUTs/refetches, history mutations or backend settings writes**. Compare serialized Atlas and stable IDs before/after language switching.
- Export at least one Canvas PNG in English and one in Pseudo-English. Inspect/capture both: *system-owned captions* translate, all authored content (including edited field names and Title) remains unchanged, there is no missing text/glyph or clipping, and PNG dimensions/data invariants remain stable. Leave Rack and Flow output unchanged.
- Run complete relevant unit suites, targeted Chromium/Playwright regressions, full frontend typecheck and production build; run Docker frontend build if available, reporting Docker as **not run** rather than an automatic blocker if unavailable. Confirm Pseudo-English still ships in production. Preserve tracked screenshots with temp output paths.
- Produce a final **scope-coverage matrix** and completion report. After a passing gate, **stop as M3 complete; do not begin M4**.

## 9. Baseline and required commands

Run from `frontend/`, adapting only where repository scripts/tests have changed. **Run these at every gate as applicable**, with broad final verification at M3d:

```bash
npm ci --no-audit --no-fund
npm run i18n:check
npm run --silent i18n:pseudo                 # proposal; inspect before write
npm run i18n:pseudo -- --write                # only when English messages added/updated
npm run i18n:check                           # exact catalog + pseudo check after regeneration
node --test scripts/catalogs.test.mjs
npm run typecheck
npm test -- src/i18n/runtime.test.ts src/lib/tileDisplay.test.ts src/lib/tagFilters.test.ts
npm run build
```

Targeted existing browser suites (select/grow as required by implementation):

```bash
npm run test:browser -- tests/localization.spec.ts tests/settings-preferences.spec.ts tests/history.spec.ts tests/save-lifecycle.spec.ts tests/snapshot-availability.spec.ts --output <temporary-directory-outside-repository>
npm run test:browser -- tests/png-export.spec.ts tests/png-export-assets.spec.ts --output <temporary-directory-outside-repository>
```

Also inspect/run relevant existing tests for Canvas deletion, relationship structure, Stack, Family, filters, selection, validation, `PngExportTitleBlock`, and export dimensions. Add focused tests in existing test owners for the changed surfaces. Use test Atlases only, especially for Load Demo/Wipe/Delete operations; **never test destructive actions against real user data**. Do not weaken existing assertions merely because accessible text is now translated—assert both English and pseudo, or select stable semantic identities.

For layout acceptance, do not claim that `deviceScaleFactor: 1.25` simulates actual 125% browser zoom. Browser zoom can be separately verified manually or with an appropriately supported harness; an equivalent reduced CSS viewport is a useful but differently labeled check.

## 10. Phase-gate evidence and reporting format

Maintain one concise working log; **do not ask the user to approve a passing gate**:

| Gate | Files/strings changed | Exclusions and data-risk checks | Tests and results | Defects fixed | Decision |
|---|---|---|---|---|---|
| Preflight | Owners/inventory | Persisted-editable risks | Baseline | — | CONTINUE/BLOCKED |
| M3a | Common shell, palette, sidebar | Enum vs generated title | Catalog, browser, creation | … | CONTINUE/BLOCKED |
| M3b | Inspector | Field names/values, buffer | Editor, save/history | … | CONTINUE/BLOCKED |
| M3c | Layers, relationships, dialogs, warnings | IDs, confirmations, descriptors | Flow/filter/deletion | … | CONTINUE/BLOCKED |
| M3d | Canvas PNG, layout, QA | Export user content, shared variants | E2E, build/Docker | … | COMPLETE/BLOCKED |

At final completion provide: (a) exact starting and ending HEAD/working-tree state; (b) changed files and per-namespace new-key counts; (c) the in-scope translated surfaces; (d) **explicit exclusions** with reason and source owner; (e) the presentation-only type/relationship/warning architecture; (f) actual test commands/counts/failed or skipped checks; (g) English parity and Pseudo-English layout evidence; (h) whether the language-neutral TopBar repair had merged; (i) any remaining M3 gaps vs M4–M8 deferrals; (j) readiness recommendation.

Use source-literal/selection screenshots or structured tests as evidence, not a bare claim that everything is localized. Record the difference between tests **run** and tests merely inspected.

## 11. Automatic continuation; genuine blockers only

**You are authorized to proceed from M3a through M3d autonomously as one task.** Each gate is an internal checkpoint, not a separate approval request. When a gate fails, diagnose, fix and rerun it, then continue.

**A genuine blocker** requiring you to stop and report is limited to one of:

1. A demonstrated requirement would **mutate persisted/editable user content, canonical names, history or API contracts**, and no safe display-only alternative is possible within the phase's reasonable scope.
2. A critical build/typecheck/behavior regression persists after focused fixes, and proceeding would compound data-loss or serious functional risk.
3. A source conflict or unrelated working-tree modification prevents safe editing without overwriting someone else's work.
4. An essential safety test cannot be executed or reasonably substituted, preventing validation of a destructive-data or serialization change.
5. An unavoidable product-policy contradiction requires changing the agreed exclusion/locale policy (do not guess or silently reinterpret it).

**Not blockers:** ordinary test failures you can repair, individual ambiguous strings safely excluded and logged, a cosmetic layout discrepancy with a clear remediation, unavailable optional Docker/full-stack infrastructure if frontend fixture/regression evidence is adequate, or scope explicitly deferred to M4–M8. Re-run failing checks; do not waive failures as 'known' without diagnosing them. If necessary, leave a demonstrably noncritical source string excluded and document its exact reason rather than jeopardizing data safety.

**Source-control boundary:** This task authorizes implementation and testing **only**. Do **not** commit, push, merge, tag, release, deploy, alter public repository or begin a later milestone without explicit separate authorization. Preserve unrelated changes. At the end of M3d, stop and issue the consolidated report.

---

**Milestone boundary:** M2.5's font/script matrix remains a separate prerequisite **before advertising a new language needing unverified script support**, not a requirement to recode existing English/Pseudo-English UI. M4 Handbook/NotePages, M5 Rack/physical, M6 Snapshot/INGEST/mobile/Settings/auth/Experiences, M7 backend/PDF/Markdown/Mermaid exports, M8 comprehensive CI/release QA and optional M9 runtime-installable packs all remain scheduled and are **not** silently dropped or implemented by M3.
