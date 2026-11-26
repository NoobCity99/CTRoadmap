# CTRoadmap — M5 Execution Buildspec: Rack Builder & Physical Infrastructure Localization

**Execution contract:** **ONE authorized Codex implementation task**, comprising sequential internal phases **M5a → M5b → M5c → M5d**. After each phase, execute the stated acceptance gate, diagnose and repair ordinary failures, and **automatically continue when the gate passes**. **Stop only for a genuine unresolved blocker** as defined in §11. Do **not** request sign-off between phases.

**Repository:** Private `NoobCity99/CTR_Dev_Core`  
**Target branch:** `v0.10.1`  
**Last inspected upstream HEAD:** `faac2370afd626498f77145b25c3d2f1199396a5` (*M4 pass 2 test chk*, 2026-11-21). **Reconfirm the actual HEAD and working-tree status at execution.** This SHA is reference context, not permission to reset, cherry-pick or overwrite anyone's work.  
**Primary planning authorities:** `dev/Localize/CTRoadmap_Localization_Roadmap_M2_Onward_Revised_2026-11-19.md` §M5 and `dev/Localize/CTRoadmap_Localization_Rollout_Plan_v0.10.1.md` §M5. Follow the execution/test/exclusion conventions of `dev/Localize/CTRoadmap_M3_Canvas_Localization_Execution_Buildspec.md` and `dev/Localize/CTRoadmap_M4_Handbook_NotePages_CodeEditor_Localization_Buildspec.md`, current `AGENTS.md`, `PROJECT_LOG.md` and `frontend/src/i18n/README.md`.

**Governing product decision:** **Translate the tools used to create/edit information, never the editable information itself.** This exclusion applies to *all* user-editable strings, including stock/generated defaults; all Atlas data, machine values and technical identifiers remain canonical. Only fixed **application-owned display chrome** is localizable.

---

## 1. Objective, completion criteria and milestone boundary

Complete the remaining **frontend Rack and physical-infrastructure UI** localization using the existing English master + deterministic approximately **40%-expanded Pseudo-English** infrastructure. Cover:

- Rack workspace, palette, toolbar, Front/Rear/Both controls, presentation toggles, Inspector, rack creation/edit/delete, configuration, appearance, branding and associated actions.
- Hardware, drive-bay/backplane and server-drive setup; faceplate settings and ABS faceplate designer; physical-port inventory, port picker, PoE/connector/role controls, read-only explanations and warnings.
- Cable creation/attachment, loose ends, destination selection, context menus, color/label tools, circuit tracing/identification, Connect Table UI and its compact Rack presentation.
- Frontend physical documentation preview: device/Rack inventory, patch-panel schedules, cable schedule, labels, disclosures, empty states, tooltips and accessibility.
- Rack-specific PNG **options/dialog UI**, where currently still English, and the final language-neutral responsive/behavioral regression pass.

**Definition of done:**

1. All safely in-scope Rack/physical UI text—visible and accessible—uses stable translation keys, with explicit exclusions/deferred ownership documented. Preserve the original English wording unless a documented, necessary compatibility fix is unavoidable.
2. A justified `rack` namespace (and, **only if materially necessary**, another correctly owned namespace) is registered in the current locale manifest, complete in both `en` and `en-XA`, with `context.json` meaning/surface/placeholders. Existing English and pseudo catalogs, including all **882 pre-M5 keys**, remain identical unless a narrowly justified regression fix is documented.
3. English ↔ Pseudo-English language switching updates mounted Rack controls, popovers, menus, notices and physical documentation UI without remounting the workspace, reissuing data operations, changing active selections or causing Atlas autosave, refetches, backend settings calls or Undo/Redo changes.
4. Canonical Rack placements, local and Atlas-linked equipment, physical ports, bank/face/role/connector IDs, numbering history, patch-panel pairs, backplane/Drive assignments, PoE, cable identities/endpoints, route/trace logic, filters, and user-entered names remain unchanged when language changes. Ordinary edits still save and undo correctly.
5. Longer text is readable in Classic and ZIMA without blocking controls, changing Rack elevation geometry, or obscuring cable/port targets.
6. Existing exported Rack PNGs, Handbook PDFs and other generated output stay behaviorally and textually equivalent to the pre-M5 baseline. **Only the frontend controls and live documentation preview are localized in M5; generated/exported document content remains M7-owned.**
7. Complete all four phase gates and deliver one evidence-based report. Stop at M5; do not implement future milestones or unrelated features.

**Explicitly outside M5:** mobile-only Rack reader/shell and mobile-specific copy; the separate Swimlane workspace, Snapshot/INGEST, unrelated Settings/auth/updates/Experiences; backend/Python templates, server-rendered PDF/Markdown/Mermaid and printable/exported content; another real language; runtime language-pack loading; migrations or schema redesign; new Rack features and visual redesigns. If a shared component displays in multiple workspaces, limit changes to the Rack/physical UI branch and preserve already-localized Canvas/Handbook branches. Development-only faceplate calibration is not automatically a customer-facing Rack surface; inspect its runtime exposure (`main.tsx` currently gates it behind `import.meta.env.DEV` and `?rackCalibration=1`) and record it as a **dev-only exclusion** unless an actual supported user-facing route is found.

## 2. Nonnegotiable inclusion/exclusion rules

| UI domain | **INCLUDE: application-owned display text** | **EXCLUDE: editable, persisted or machine content** |
|---|---|---|
| Rack palette and workspace | Section headings, New/Edit/Delete, create/drag hints, no-racks/empty states, view/zoom controls, status and accessibility messages, app-defined component **type labels for display only** | Rack names, Tile/equipment titles (including generated defaults), Atlas search terms and matching inputs, stored component type IDs, drag payloads, placement IDs |
| Rack Inspector and settings | Fixed form labels, section/tab headings, orientation and width/depth option **display** captions, instructions, validation/confirmation UI, color picker chrome | Rack/equipment title values; generated stock titles; custom equipment labels, icon names, form inputs, dimensions, occupancy and coordinates, `RackPlacement`/`RackAppearance` model fields |
| Hardware, faceplates and storage | Configuration actions, mounting instructions, button labels, warning templates, “Drive Bay”, “Server Drive Slots” and fixed capability descriptions when used as UI | Hardware/profile IDs, asset filenames/URLs, physical/schematic geometry, graphics and sockets, saved visual parameters, Drive names, user graphics/brand text, user-defined panel names |
| Physical ports | Labels/instructions for editor, source/destination selection, preset help, connector-role headings, error templates, accessibility | Port IDs, port **names/labels** including stock/generated names, numbered faceplates, bank and physical socket references, `profile_socket_key`, signal/role/connector enum **values**, internal pairs, assignments |
| Cabling and trace controls | Fixed actions (connect/attach/disconnect/trace/end trace), pickers, color UI, notices, table headings and tooltips | Cable labels, descriptions (including defaults if editable), cable IDs and automatically assigned numbering, endpoints, locations, selected routing, colors as data, circuit keys, raw diagnostic strings |
| Connect Table and physical documentation | Headers, empty states, section titles, control labels and human-readable wrapper templates for the **live frontend UI** | Actual circuit/device/port/cable facts, addresses/IDs, relationship data, explicit connection direction, exported/printed labels in output paths |
| Rack PNG options | Rack-specific frontend dialog headings, elevation labels, include-table options, help/tooltips and action labels | User-supplied export title, Rack name, output filename and content/bytes, theme IDs, included content, captured Rack title block and rendered image captions |
| Layout and accessibility | Intrinsic sizing, contextual wrapping, scroll containment, keyboard focus and translated aria/name/tooltip text | User-customized artwork, geometry, transforms, source icons, cable endpoints/targets, stored dimensions, technical abbreviations and identifiers |

**Important distinction:** The UI label `Port name`, `Rack name`, `Custom cable type` or `Component type` can be translated. The actual text in the corresponding input, including any built-in default, **must not** be translated. A fixed type (e.g. `network-switch`, `patch-panel`) can have a localized **display** caption while its stable enum value is unchanged. Acronyms and technical notation (`RJ45`, `SFP`, `SATA`, `DAC`, `PoE`, `U`, `IPv6`, `USB`, `PDU`, `PNG`, `PDF`, connector IDs, port order/number labels) remain literal unless they're clearly an English descriptive UI sentence wrapped around those tokens.

**Per-string decision algorithm:**

1. Is it user-authored, editable, importable, stored, or a built-in/default value that the user can rename? **Exclude the value.** Translate only surrounding UI guidance/labels.
2. Does it control schema, enum matching, hardware compatibility, numbering, drag/drop, route/trace, library lookup, asset binding, CSS/SVG geometry, query/filter, tests or serialized exports? **Keep the canonical value.** Translate at the UI consumer using stable IDs only if safely display-owned.
3. Is it fixed app-authored chrome, a button/tooltip/aria label, explanatory copy, status, validation **template**, dialog or empty state? **Include** as a whole message with named interpolation arguments.
4. Does one string feed both frontend display **and** persistence, generation or export? Keep the producer's original model/English output and introduce a typed presentation adapter or structured UI message descriptor. **Never translate the source value in-place.**
5. If safe classification is genuinely ambiguous, **leave it unchanged, document exact source/consumer/rationale, and continue.** Ambiguity alone is not an execution blocker.

## 3. Source-grounded hazards requiring specific protection

The following were observed in the current repository. Reinspect at the **actual execution HEAD**—do not assume these are still the only risks.

1. **Model-derived default equipment names:** `frontend/src/features/rack/rackPresentation.ts` defines `RACK_COMPONENT_LABELS` and `RACK_FORM_FACTOR_LABELS`. `rackModel.ts` calls `nextComponentTitle(rack, RACK_COMPONENT_LABELS[componentType])` and stores the resulting `RackPlacement.title`. **Do not translate/replace either canonical registry or generated title.** Introduce a typed Rack **display-only** lookup for palette/selectors and leave naming/numbering exactly English/canonical.
2. **Rack-specific settings and animated controls:** `RackElevationControl.tsx` renders Front/Rear/Both and a shared `RotatingRackControl` also used by Handbook theme UI. Translate Rack caller-owned labels/tooltips/announcements without changing the shared primitive or Handbook/Settings behavior; preserve rotation and `mode` IDs. `RackViewToggle` sets visible `data-off-label`/`data-on-label`; they are display captions, not state identities. Preserve semantic `aria-checked`, DOM keys and existing CSS.
3. **Shared PNG UI versus exported content:** `components/PngExportOptionsDialog.tsx` has Rack-specific English (`Rack PNG Export Options`, `Elevation`, `Include Connection Table`) alongside existing translated shared Canvas options. The Rack renderer (`RackPngExportScene.tsx`) uses `PngExportTitleBlock` **rack variant**, whose labels are part of the captured PNG. Localize **Rack dialog UI only** now; keep Rack title-block captions, output bytes, dimensions, filename and render timing unchanged. Do not accidentally alter Canvas PNG or Flow variants.
4. **Rack notices and model errors:** `RackWorkspace.tsx` stores `notice: string | null`, and `RackInspector.tsx`, `PhysicalPortsEditor.tsx`, `CableInteractions.tsx` and other editors receive raw English errors from validators/actions. Prefer typed **transient UI descriptors** or stable reason codes at presentation boundaries. Preserve legacy English diagnostic strings and API/model/test contracts; never parse arbitrary user data for translation or translate raw unknown errors. If adapting a finite known error message, inspect all consumers and retain safe fallback.
5. **Port and cable data contracts:** `physicalPorts/types.ts` defines `PHYSICAL_ROLES`, `PHYSICAL_CONNECTORS`, `PhysicalPort` and `PhysicalEndpoint` identities. `physicalPorts/model.ts` validates and may generate port labels. `cables/cableCreation.ts`, cable routing/trace and `CableInteractions` use stable endpoint signatures. Never use translated text as source/target selection keys, React keys, comparison values, conflict-resolution values or stored labels. Preserve Patch Panel front/rear pairing, backplane mating and physical numbering behavior.
6. **Custom titles across hardware editors:** `RackInspector.tsx` contains an editable rack-local `Title`, plus component selection, icon/library labels, drive-bay and server-storage actions. `RackLogoPickerModal.tsx` stores branded text/library names. `CableLabelEditor.tsx` edits cable label/custom description; `PhysicalPortsEditor.tsx` edits port labels. Translate their form **chrome**; leave every input `value`, stock default, proposed name and custom label unchanged.
7. **Connect Table used in multiple render paths:** `physicalDocumentation/ConnectTable.tsx` accepts `compact` and `exportMode`. `PhysicalDocumentation.tsx` consumes `physicalDocumentation/model.ts`, which can also feed exports. Translate the live, non-export UI presentation **without mutating model rows, `data-circuit-key`, cable IDs/labels, table grouping, sort, filters, or printed/exportMode representations**. If the same component must render both modes, make display ownership explicit and preserve the export branch until M7.
8. **SVG/interactive renderers:** `RackPlacement.tsx`, `RackElevation.tsx`, faceplate overlays, Drive Bay slot controls, cable SVG layers and hardware callouts use small, fixed geometry. For long translated **tooltips and accessible names**, preserve hit targets and scene geometry. Do not increase SVG equipment heights or modify routing/layout to make text fit; move longer control chrome into scroll/wrap-capable surrounding UI. Do not translate technical numbers or labels painted onto exported Rack equipment.
9. **Physical documentation preview:** `PhysicalDocumentation.tsx` uses generated device/port/cable summaries; separate the fixed HTML headers, empty/error words and sentences from actual machine/user data. Keep `physicalDocumentation/model.ts` canonical and avoid new locale-specific coupling into its filtering, grouping or export-facing outputs.
10. **Legacy and read-only states:** Rack supports Atlas-linked and Rack-local components, legacy placements and deleted references, planned/live read-only behavior, Drive Bay setup and legacy `blank-panel` compatibility. Localizing warnings must not change any enabled/disabled decision, migration behavior, unavailable-image fallback, deletion warning or Undo/Redo contract.

## 4. Preflight — inspect, inventory, baseline; then proceed

1. Read `AGENTS.md`, applicable style ownership docs, current `PROJECT_LOG.md`, revised/initial localization roadmaps, M3/M4 buildspecs and the final M4 gate record. Confirm `git branch --show-current`, `git rev-parse HEAD`, `git status --short`, and staged/untracked changes. **Never reset/clean** or overwrite unrelated/concurrent work; if there are existing changes, identify their owners and preserve them.
2. Check the current `frontend/src/i18n/{manifest.json,README.md,context.json,locales/...}`, `frontend/scripts/{catalogs,pseudo,locale-registry}.mjs`, generated typed registry and locale runtime. Verify the M4 English master contains **882** keys at this inspected baseline (or record actual updated count), the previous namespaces remain complete, language synchronization is functional, and Pseudo-English is still offered in production Docker via `includeDevelopmentLocalesInBuilds: true`.
3. Inspect direct M5 source owners before modifying them:
   - `features/rack/{RackWorkspace,RackPalette,RackToolbar,RackInspector,RackSettingsPanel,RackCreateDialog,RackDeleteDialog,RackElevationControl,RackPresentationControl,RackViewToggle,RackEquipmentMenu,RackAppearanceControls,RackLogoPickerModal,RackHardwareSettings,RackPromotionDialog,RackPlacement,RackElevation,RackPngExportScene}.tsx`;
   - `features/rack/{AbsBlankPanelInspector,DriveBaySetup,DriveBaySlots,ServerStorageInspector,ServerStorageIndicators}.tsx` and `features/rack/faceplates/{FaceplateSettings,PortOverlay}.tsx`;
   - `features/physicalPorts/{PhysicalPortsEditor,PhysicalPortPicker,PoeControl}.tsx`, types/model/validation/numbering and faceplate association helpers;
   - `features/rack/cables/{CableInteractions,CablePopover,CableConnectionInfo,CableLabelEditor,CablePaletteSettings,RackConnectionStrip,RackCableLayer}.tsx` and their data/geometry/trace helpers;
   - `features/physicalDocumentation/{ConnectTable,PhysicalDocumentation}.tsx`, its model; `components/{PngExportOptionsDialog,PngExportTitleBlock}.tsx`; App and shared Handbook callers, as necessary to establish the UI/export boundary.
4. Build an **M5 scope/risk ledger** grouped by M5a–M5d. For every source owner record exact English UI text, translation inclusion/exclusion/defer status and reason, proposed stable key/namespace, all consumers, data/export risk, and test owner. Audit visible JSX and generated text, tooltips, placeholders, `aria-*`, `data-*` visible labels, native confirmations, menu labels, transient errors, disabled/empty states and SVG text. Include model-fed English diagnostics as separate classifications; do not blindly extract every English literal.
5. Verify actual test filenames, scripts, baseline English behavior and fixture designs. Run **one** clean dependency install if needed, then baseline catalog/type/build and the smallest relevant Rack/physical browser/unit suites. Capture pre-existing failures with their individual test names, not only aggregate counts. Use isolated Atlas/asset fixtures and temporary test outputs, never real user data.

**Preflight gate:** No unresolved worktree collision or data-safety blocker; the inventory clearly separates presentation from model/data/export and identifies reproducible tests for key Rack/physical workflows. **Proceed directly to M5a.**

## 5. Shared implementation requirements across all phases

- **Catalog:** English authoritative master. Prefer a single `rack` namespace for Rack, port/cable and frontend physical-documentation UI, with semantic groups such as `workspace`, `palette`, `toolbar`, `inspector`, `settings`, `dialogs`, `hardware`, `ports`, `cables`, `table`, `documentation`, `png`, `status`, `errors`. Add a second namespace only if a verified ownership boundary justifies it. Register once through manifest; create complete `locales/{en,en-XA}/rack.json`, and add translator notes to `context.json`, including exact named placeholders and meaning. Retain previous key sets and values; do not reinvent existing i18next infrastructure.
- **Pseudo-English:** Run the existing read-only proposal, inspect it, regenerate with `npm run i18n:pseudo -- --write`, then run `npm run i18n:check`. Target the existing deterministic ~1.40× translatable word length, preserving `{{parameters}}`, numeric/physical IDs, code, technical abbreviations and user strings. Do not hand-edit the generated pseudo strings to conceal missed sizing problems.
- **Typed display adapters:** Use compile-time checked maps keyed by stable `RackComponentType`, `RackFormFactor`, Rack view modes, fixed option enums and physical signal categories **only for display**. Preserve native `<option value>`, drag data, comparisons, model registry order and generated default labels. Reuse existing `tileTypeLabel` and other prior helpers only when genuinely appropriate.
- **Live updates:** For mounted React components use `useTranslation`; for pure model/export contexts pass presentation translators or typed descriptors only at the view boundary. Persist a **message descriptor/key + params**, not a finished translated string, for UI-owned notices/errors that must re-render during language changes. Preserve original raw diagnostics for model consumers and logs. Raw unknown server/model messages may stay verbatim inside a translated wrapper if no safe structured reason exists.
- **Data:** Never put `t(...)` output into `Atlas`, Rack or physical connection objects, model factories, enum registries, API requests, transfer payloads, session preferences unrelated to locale, exported JSON/YAML, filenames, backend history or source IDs. Preserve actual user content including `Rack.name`, `RackPlacement.title`, `PhysicalPort.label`, `PhysicalConnection.label`, `custom_type_description`, brand/logo text and stock editable labels.
- **Interactions:** Preserve component identities, React keys, `aria-pressed`/`aria-checked`/`aria-current`, keyboard Tab/Shift+F10/Escape, drag/drop/pointer capture, hover, focus-return, port picker and cable-menu anchors, selection, read-only gating, deferred placement, cable tracing, Undo/Redo and saving. Locale change alone must never call any onEdit callback or start a new save/geometry pass.
- **Layout:** Prefer intrinsic width and height for UI controls, `min-width:0`, sensible wrapping and scroll containers. Apply rules to **specific text/control owners**; no global word breaking, font shrinking as a default, locale-qualified CSS such as `:lang(en-XA)`, geometry changes to the Rack SVG, or overlaying controls on hit targets. Do not reverse the independently repaired Workspace Switcher behavior.
- **Exports:** No translation of captured Rack PNG title blocks, printed Cable/Connect Table labels, exportMode presentation, PDF or backend artifacts in M5. Verify actual output parity. Any UI-only shared component changes must leave Canvas/Handbook and their existing localized behavior intact.
- **Tests and dependencies:** Keep scripts/revisions unchanged unless necessary and documented; avoid new dependencies, server/network localization fetches, API/schema changes or broad unrelated refactors. Update assertions/selectors intentionally for localized accessible names while preserving their behavioral/contract assertions. Never skip/delete an applicable regression to pass a gate. Distinguish test harness defects from real regressions with evidence.
- **Focus of QA:** Use the current two themes **Classic/ZIMA**, English/Pseudo-English and **synthetic long English** (including a 72-character compound) at relevant desktop and narrow widths. Use real browser measurements for text/overlap and test keyboard/pointer interactions, not screenshots alone. Preserve existing export pixel baselines wherever feasible.

## 6. M5a — Rack workspace, palette, toolbar, Inspector shell and Rack settings

### Implementation

1. Localize app-owned text in `RackWorkspace`, `RackPalette`, `RackToolbar`, `RackElevationControl`, `RackViewToggle`, `RackPresentationControl` and direct Rack headings: Rack selector/empty state, palette categories, creation hints, Rack viewport descriptions, zoom/fit, Connect Table/Cables toggles, Front/Rear/Both, Images/Schematic, related-Drive hints, validation/selection statuses and accessible names. Preserve `viewMode`/presentation mode IDs, zoom, selected Rack, persisted show/hide preference and view geometry.
2. Localize `RackCreateDialog`, `RackDeleteDialog`, `RackSettingsPanel`, `RackInspector` **outer** shell and Rack-scoped `RackEquipmentMenu`: fixed New/Edit/Delete, Name/Height/Width/Form Factor/numbering labels, confirmation/help/warnings, title for Inspector and equipment controls, hide/show menu, status, origin/read-only text, and relevant tooltips. Preserve Rack name/title input values, `RackWidth` (10/19), height and U numbering, `RackFormFactor` enum, settings update operations and deletion flags/IDs.
3. Add a **typed display-only label lookup** for predefined `RackComponentType` and form factors. **Do not modify** the canonical `RACK_COMPONENT_LABELS` used by `rackModel.nextComponentTitle()` or other factories; do not overwrite legacy default placement names such as `Generic Server 1`. Translate only palette, selector and fixed descriptive display labels where not editable.
4. Complete Rack-owned appearance/branding controls (`RackAppearanceControls`, `RackLogoSettings`, `RackLogoPickerModal`, `RackMaterialControl` and directly owned captioning) with fixed labels and error templates. Preserve saved color hex values, finish/material enum IDs, skin IDs, uploaded asset names, built-in brand names, user-entered branding text and image-selection/preview geometry. If a display label is actually customizable, exclude it.
5. Preserve the shared `RotatingRackControl` consumed by Handbook settings. Only Rack-specific callers should change their displayed translations; previously localized Canvas/Handbook UI must not regress.
6. Treat asynchronous Rack status and model-supplied warnings carefully: translate app-owned known templates via descriptors; preserve unknown diagnostic detail and existing errors. Do not alter validation outcomes or mutation timing.

### M5a gate — repair, then automatically continue

- Live switching English ↔ Pseudo-English updates open Rack palette, inspector, create/edit/delete dialog and toolbar captions **in place**, maintaining current selected Rack/placement, input draft, focus, scroll, saved settings and active modes. No language-only Atlas write/refetch or history change.
- New Rack-local equipment generates **identical original default titles** and IDs across locales; same components created with the same drag/drop payload and position. Confirm `RACK_COMPONENT_LABELS`, form-factor IDs and legacy blank-panel behavior unchanged. Existing 882 catalog keys unchanged.
- Verify Rack create/edit/delete and cancel with Rack-local and Atlas-linked entries, empty workspace, toolbar zoom/Fit, Front/Rear/Both, hide/show and Image/Schematic, Rack appearance/branding selection and read-only states. No accidental close/remount or cross-workspace label regression.
- Run catalog/pseudo/typecheck/build checks and focused existing Rack model/palette/settings/view/appearance/browser regressions (confirm paths in §10); add new live-switch/label/default-name parity assertions. **PASS → M5b without approval.**

## 7. M5b — Hardware, faceplates, physical ports, Drive Bays and server storage

### Implementation

1. Localize Rack Inspector's **hardware-focused** sections and immediate children: component editor options, geometry/position/orientation instructions, form chrome, hardware capability explanations, read-only/blocked hints, promotion and conversion actions. Maintain all equipment placement values and selection semantics.
2. Localize `RackHardwareSettings`, `RackRearHardware` **accessible/interface chrome only**, `faceplates/FaceplateSettings` and `AbsBlankPanelInspector` (ABS designer) fixed controls: Front/Rear, schematic/custom image prompts, calibration-related instructions that are present in the actual user-facing editor, base surface/graphic gallery, remove/size/move actions, upload/errors, confirm/cancel. **Preserve** profile/variant IDs, socket assignments, geometry, image refs, XML/SVG and saved ABS design data, including default/custom graphic labels if editable.
3. Localize `PhysicalPortsEditor`, `PhysicalPortPicker`, `PoeControl` controls, presets, search, add/remove/reorder, role/connector/category headings, power-direction and port-face controls, paired termination guidance, legacy adoption confirmations, errors and aria labels. Distinguish app-defined **display labels** from canonical `PHYSICAL_CONNECTORS`, `PHYSICAL_ROLES`, signals and port references. Keep generated/default/editable port names untouched; no implicit port rename when the language changes.
4. Localize `DriveBaySetup`, Drive Bay slot-picker chrome in `RackWorkspace`, `DriveBaySlots` accessible instructions, `ServerStorageInspector` and directly owned settings: setup/wiring mode, slot count, empty/status/locked/connection text, assignment/removal and read-only help. Preserve Drive title and ID, slot number, slot order, backplane port identifiers, cable terminations, capacity values and hardware lock rules.
5. For data-layer validation/messages (`physicalPorts/model.ts`, faceplate/drive-bay/storage helpers), preserve existing English `message` and return/error contract. Add UI-only typed descriptors or pure display adapters if the source and all consumers can safely be classified; do not change port ordering, device ownership, physical numbering or `validatePhysicalPorts` decisions just to generate localized text.
6. Check standalone/embedded usage: physical port editor may appear for Atlas Tiles or Rack-local placement, and physical data may render in Handbook. The same locale should update shared **fixed** editor chrome in both contexts; specialized mobile-only behavior is not part of this task.

### M5b gate — repair, then automatically continue

- Fixtures include: 10-inch and 19-inch Racks; network switch, patch panel, generic server, Rack-local equipment, populated Drive Bay (direct and backplane), server slots, Atlas-linked devices, legacy shared-port conflicts, active PoE, physical faceplates, ABS panels and uploaded images.
- Check **canonical before/after equality** of port IDs, face, connector, role, signal categories, labels, peer IDs, socket mapping, paired terminations, Drive slot assignments, U positions and numbering sequences on language changes. A normal authorized edit must still create the same persisted delta/Undo history in either language.
- Exercise preset application/adoption confirmations, add/remove/reorder, physical face selection, port picker filtering, hardware orientation, Drive Bay setup/lock/removal, storage move/assign, image upload/fallback and ABS graphic operations. Verify keyboard/pointer targets remain reachable and no state resets occur solely on locale change.
- Run catalog/type/build plus `physical-ports`, `rear-port-spacing`, `rack-inspector-*`, `drive-bay-*`, `server-storage-*`, faceplate/port/PoE model/browser regressions selected from §10; add focused locale and preserved-ID assertions. **PASS → M5c without approval.**

## 8. M5c — Physical cables, interactions, Connect Table and tracing

### Implementation

1. Localize **live control chrome** in `cables/CableInteractions`, `CablePopover`, `CableConnectionInfo`, `CableLabelEditor`, `CableColorInput`, `CablePaletteSettings`, `RackConnectionStrip`, Rack connection HUD and related popovers: Connect, Find destination, Choose connection, Source/Destination, Attach/Disconnect, Loose end, Trace/End trace, Rename, color picker, menu actions, category/type instructions, read-only/partial states, errors and accessible descriptions.
2. Localize fixed app-owned descriptions and selector option **display** captions while preserving all `CableType`, signal, connector, source/target, PoE and location enum **values**. Custom cable descriptions/labels—including defaults if editable—and IDs, number/label prefixes, color values, `PhysicalConnection` objects and endpoint identities remain literal.
3. `cables/cableCreation.ts`, cable compatibility/validation/routing/trace/anchor modules and physical numbering must retain their existing semantics. On source errors, use typed display descriptors or stable reason codes **only for UI**; retain original English legacy messages and fallback. Avoid using translated string comparisons to resolve incompatible ports or delete targets.
4. Localize the **interactive** compact/expanded Connect Table chrome in `physicalDocumentation/ConnectTable.tsx`: headings, column labels, reveal/detail actions, blank states, menu/tooltip/aria messages, source/target sentence wrappers, trace guidance. Preserve circuit grouping, `data-circuit-key`, row identity/order, cable ID pills, PoE and signal facts, custom labels and port/Rack addresses. **Explicitly preserve `exportMode` text and rendering** where the same component is captured/printed.
5. Preserve cable-action popover DOM/focus/anchor behavior under live language changes and resizing. Do not lose an armed source, loose-end choice, multi-selected cable set, pending disconnect side, color edit, trace highlight or circuit identification due to a re-render. Confirm `Front`, `Rear` and `Both` Rack views, same-Rack and cross-Rack connections, physical pickers and planned/read-only mode.

### M5c gate — repair, then automatically continue

- Construct synthetic physical connections with custom Unicode/HTML-like labels (e.g. `Étage <rack> & CPU`), a loose cable, a rear Patch Panel pair, a backplane internal mate, PoE and a multi-hop path crossing Racks. Inspect and export the original Atlas fixture before operations.
- English ↔ Pseudo-English while a cable popover is open or a source port is armed keeps **exact** endpoint/cable identities, selected cable state, route/trace results, row order, active information/pointer targets, and open menu focus. Locale switching alone produces zero Atlas writes/history entries.
- Test attach/disconnect, ambiguous location prompt, unavailable endpoints, partial cable, rename, cable color palette and custom description, Trace/End Trace, Connect Table expand/collapse, connection-ID strip scrolling, circuit identification and planned/read-only restrictions. Same actions produce **equivalent** canonical mutation/history and trace results in both languages.
- Run catalog/type/build plus physical-cables, continuity, destination-search, pulse, loose-cables, Connect Table, circuit-identification and cable-* model/browser suites in §10. Keep both interaction and data/geometry assertions; do not accept a translated UI if it changes the physical connection graph. **PASS → M5d without approval.**

## 9. M5d — Physical documentation preview, Rack PNG dialog, responsive integration and final QA

### Implementation

1. Localize the **frontend live** `PhysicalDocumentation.tsx` preview: fixed navigation/heading/section labels, Rack inventory, physical port table, patch-panel schedule, cable schedule, source/endpoint summaries, no-data/unresolved/trace messages, disclosure controls, table columns, search placeholder, tooltips, accessible names and display-only lifecycle descriptions. Keep user/machine data, URLs, technical tokens and actual device/port/cable labels unchanged. Preserve matching/filtering and selection/scroll behavior.
2. Treat the shared `physicalDocumentation/model.ts` as canonical. If an English model field is also used by PDF/export, leave it untouched; use stable types/IDs or UI descriptors to render a localized label. Do not copy localized display text back into model, Atlas, physical records, backend payloads or export fixtures. Check both standalone physical documentation and its embedded Handbook view, without re-localizing previously completed Handbook chrome.
3. Localize **Rack-only PNG options dialog** in `components/PngExportOptionsDialog.tsx`, including the Rack heading, elevation and connection-table controls, tooltips/help and status copy. Reuse existing `exports` messages for semantics truly shared with Canvas; otherwise add Rack-owned keys. **Do not change** the Rack PNG scene's captured title block, Rack elevation rendering, Connect Table `exportMode`, filename, dimensions, included table flags or bytes. Verify the Canvas and Flow branches of the shared options/title-block components are unaffected.
4. Audit every source inventoried at preflight, including hidden context menus, legacy/empty/warning states, SVG aria labels, tooltip-only text, keyboard labels and error notices, and identify intentional exclusions/deferrals individually. Verify that any M5-fixed UI display strings embedded in Rack SVG are localized only where presentation-safe; exported/print outputs remain unchanged.
5. **Responsive test matrix:** Classic and ZIMA; English, Pseudo-English, synthetic long-English phrase and 72-character unbroken compound; widths **1440, 1280, 1024, 920, 680 and 390 CSS pixels** where the surface is reachable. Test 1920px compact English as a stability baseline if relevant. Cover Rack sidebar/palette/Inspector/settings, compact toolbar, Front/Rear/Both controls, hardware forms, port picker, cable popovers, Connect Table, physical documentation search/tables and Rack PNG dialog. Use DOM text-range bounds, hit-testing and scrolling, not simple `scrollWidth` checks alone. Multi-line UI labels may grow within surrounding chrome; **Rack geometry, component alignment, port hit targets and cable anchors must not move because of localization.**
6. Test live language switching with an **open** Rack create/edit dialog, active Inspector input, port picker, cable selection/menu, settings appearance field, physical document disclosure, and Rack PNG dialog; preserve exact state, DOM/caret/focus where appropriate, and zero network writes. If a control is intentionally destroyed by an unrelated actual user action, distinguish that from locale-only remounts.
7. Confirm the unchanged downstream artifacts: original English Rack PNG title block and byte/pixel/layout baseline, existing Connection Table export-mode output, Handbook-generated physical-document PDF through a disposable backend if available, and Atlas JSON/Save/Undo/Redo. **Do not implement export translation** to make a UI test appear complete.
8. Update `frontend/src/i18n/README.md` with Rack namespace conventions, the component-type display-vs-default-title distinction, physical IDs/port labels exclusion, shared Connect Table preview/export boundary and representative regression commands. Update `PROJECT_LOG.md` with M5a–M5d dates/scope/gates and actual testing results. Produce a standalone M5 scope/gate ledger in `dev/Localize/` if useful, consistent with M4's approach.

### M5d final gate — repair, then complete

- **Catalog and compatibility:** All registered English/Pseudo-English catalogs, context and placeholders/plurals pass `npm run i18n:check`; deterministic pseudo proposal/write/check passes. Preserve the **882 pre-M5 English and pseudo values**; report added keys by namespace, final counts, expansion ratio and protected/zero-letter strings.
- **Code and behavior:** `npm run typecheck`, `npm run build`, selected Vitest/Node suites and all applicable focused Playwright suites pass with exact per-test outcomes. Run a Docker frontend production build if available; distinguish production/browser/full-stack tests actually performed from those only proposed. Pseudo-English must be selectable offline in the production frontend.
- **Geometry and exports:** Screenshot/measure both themes across width matrix; no clipping/overlap preventing controls; no locale-only changes to Rack scene/ports/cable anchors/trace results. Rack PNG title-block and captured content remain their original English/technical form and match deterministic baseline where possible; Rack PDF/other generated contents remain M7-owned.
- **Data safety:** Compare serialized fixture Atlas, creation defaults, port/numbering/faceplate/backplane/slot and cable/circuit identities before/after locale switch; no unintended Atlas PUT/refetch, history writes or backend settings writes. Authorized edits in both languages remain identical in data behavior and are Undo/Redo-safe.
- **Coverage:** Run a read-only post-M5 literal/surface inventory and explain every remaining M5-owned English literal (explicitly excluded, dev-only, raw diagnostic, or later owner). Record residual risks honestly; no blanket “all strings covered” assertion without evidence.
- **PASS → M5 complete. Stop task and provide one consolidated report; do not start M6.**

## 10. Test commands, selected owners and evidence standard

Run commands from `frontend/` unless stated otherwise. Check exact paths at execution. **Install dependencies once**, not at every gate. Use focused test groups per phase and one consolidated, relevant final regression run, rather than spending time repeatedly running unrelated suites.

```bash
npm ci --no-audit --no-fund
npm run i18n:check
npm run --silent i18n:pseudo                  # inspect proposal; never silently discard differences
npm run i18n:pseudo -- --write                 # only after reviewed source-catalog changes
npm run i18n:check
node --test scripts/catalogs.test.mjs
npm run typecheck
npm run build
# Optional production frontend packaging smoke, when available:
docker build --target frontend-build ..
```

**Existing frontend unit-test owners: inspect and select relevant files (names verified at the inspected HEAD).**

- Rack fundamentals: `src/features/rack/{rackModel,rackView,rackGeometry,rackIdentity,rackPresentation,rackPresentationPreference,rackAdaptiveFit,rackPaletteDrag,rackDeletion,rackHardware,rackMaterials,rackBranding,rackPngExport}.test.ts` (only paths that exist on actual HEAD).
- Faceplates and ports: `src/features/rack/faceplates/{faceplateGeometry,faceplateMatching,portLayout,frontPortSpacing,rearPortSpacing,socketAssignments,patchPanelMarkers}.test.ts`; `src/features/physicalPorts/{model,portManagement,numberingContract,physicalLabels,patchPanelPower,poe,signalCategories}.test.ts`.
- Drive Bay/storage/ABS: `src/features/rack/{driveBayIntegration,driveBayBackplane,driveBayPorts,serverStorageModel,absPanelModel,absPanelGraphicsModel,absPanelInteractionModel}.test.ts`.
- Cable/Connect Table/docs: `src/features/rack/cables/{cableCreation,cableAnchors,cableRouting,cableCurvature,cableDestinations,cablePulse,cableTrace,circuitIdentification,looseCables}.test.ts`; `src/features/physicalPorts/cableModel.test.ts`; `src/features/physicalDocumentation/{connectTable,model}.test.ts`.
- Shared export guardrails: `src/features/rack/rackPngExport.test.ts`, `src/lib/pngExport.test.ts`, `src/features/handbookPdf/model.test.ts`.

**Existing Playwright owners (verified at inspected HEAD; choose relevant combinations and extend):**

- **M5a:** `tests/rack.spec.ts`, `tests/rack-settings.spec.ts`, `tests/rack-view-toggles.spec.ts`, `tests/rack-palette-collapse.spec.ts`, `tests/rack-inspector-layout.spec.ts`, `tests/rack-inspector-face.spec.ts`, `tests/rack-presentation.spec.ts`, `tests/rack-appearance-stage2.spec.ts`, `tests/rack-branding-stage2.spec.ts`, `tests/rack-deletion.spec.ts`.
- **M5b:** `tests/physical-ports.spec.ts`, `tests/rack-hardware.spec.ts`, `tests/rear-port-spacing.spec.ts`, `tests/rack-port-picker.spec.ts`, `tests/rack-port-order.spec.ts`, `tests/drive-bay-integration.spec.ts`, `tests/drive-bay-backplane.spec.ts`, `tests/server-storage.spec.ts`, `tests/server-storage-integration.spec.ts`, `tests/rack-local-deletion.spec.ts`.
- **M5c:** `tests/physical-cables.spec.ts`, `tests/physical-cables-final.spec.ts`, `tests/physical-cables-continuity.spec.ts`, `tests/physical-cables-render.spec.ts`, `tests/loose-cables.spec.ts`, `tests/cable-destination-search.spec.ts`, `tests/physical-cable-pulse.spec.ts`, `tests/physical-connect-table.spec.ts`, `tests/rack-circuit-identification.spec.ts`.
- **M5d and shared regression:** `tests/physical-documentation.spec.ts`, `tests/physical-documentation-integration.spec.ts`, `tests/rack-png-export.spec.ts`, `tests/handbook-pdf-export.spec.ts`, `tests/handbook-localization.spec.ts`, `tests/localization.spec.ts`, `tests/workspace-switcher-height.spec.ts`, plus targeted Rack suite members above. Existing `tests/mobile-rack.spec.ts` may be run **only as an unchanged-regression guardrail**, not as authorization to localize mobile-owned text.

**Sample browser syntax:**

```bash
npm run test:browser -- tests/rack.spec.ts tests/rack-settings.spec.ts tests/rack-view-toggles.spec.ts --output <UNIQUE-TEMP-PATH-OUTSIDE-REPO>
npm run test:browser -- tests/physical-ports.spec.ts tests/drive-bay-integration.spec.ts tests/server-storage.spec.ts --output <UNIQUE-TEMP-PATH-OUTSIDE-REPO>
npm run test:browser -- tests/physical-cables.spec.ts tests/physical-connect-table.spec.ts tests/rack-circuit-identification.spec.ts --output <UNIQUE-TEMP-PATH-OUTSIDE-REPO>
npm run test:browser -- tests/physical-documentation.spec.ts tests/rack-png-export.spec.ts tests/localization.spec.ts --output <UNIQUE-TEMP-PATH-OUTSIDE-REPO>
```

**Evidence rules:**

- Use fixture Atlases with known port/connection identities and an isolated backend only if necessary; never perform destructive actions on real user data or the developer's live Atlas. Keep screenshots, recordings, downloaded PNG/PDF, network logs and reports **outside the repo**, under a unique disposable temp directory.
- For **each test run**, record command, git HEAD/worktree context, suite, distinct passed/failed/skipped cases, which exact tests failed, diagnosis, fix, and rerun result. Do not aggregate only “152 cases passed” from separate runs while concealing a test's final status. When multiple runs are used, provide a **per-test final outcome** table for any previously failing or suspected regression. Disable retries for decisive targeted reruns when useful.
- If an apparent browser failure derives from test simulation/microtask timing, trace which assertion failed, distinguish focus/selection from scroll and amend the harness only while **retaining the original behavior contract**. Do not waive failed safety checks or claim that a test passed because an adjacent test passed.
- Build/catalog/typecheck and focused tests are mandatory gate checks for changed behavior. If a relevant backend/full-stack/PNG fixture is unavailable, report it; lack of optional infrastructure alone is not a blocker **provided** the central data/interaction safety requirements can be verified through equivalent fixture coverage.
- Do not claim real 125% browser zoom from `deviceScaleFactor`; state exactly whether CSS viewport, DPR or actual browser zoom was exercised.
- Preserve the default English styling and geometry where text fits; translated controls may wrap/scroll within their own chrome. Test pointer hit targets and the Rack scene anchors explicitly.

## 11. Gate ledger, automatic progression and stopping criteria

Maintain a concise ledger during work. A phase gate is **internal**, not a permission checkpoint.

| Gate | Coverage | Key preservation risks | Mandatory verification | Status |
|---|---|---|---|---|
| **Preflight** | Source/consumer inventory; current head | Working-tree conflicts, existing locales, export ownership | Baseline, source ledger | CONTINUE/BLOCKED |
| **M5a** | Rack shell, controls, palette, settings, creation | Canonical component labels and generated names, view modes, selection | Catalog/build + Rack model/interaction browser | CONTINUE/BLOCKED |
| **M5b** | Faceplates, ports, Drive Bays, storage | Port IDs/labels, backplanes, slot assignments, hardware locks | Catalog/build + port/storage/faceplate tests | CONTINUE/BLOCKED |
| **M5c** | Cable editing, popovers, Connect Table, trace | Cable IDs/endpoints, circuit grouping, physical graph, numbering | Catalog/build + cable/trace/table tests | CONTINUE/BLOCKED |
| **M5d** | Physical documentation, PNG dialog, responsive/final | Source model, exports and pixel parity, no-save locale changes | Broad regression, layout, unit, Docker if available | COMPLETE/BLOCKED |

**Final consolidated report must include:**

1. Exact branch, **start and end SHA**, initial/final staged/unstaged/untracked changes and any existing concurrent work preserved.
2. M5a–M5d source ownership, changed files and exact translation key counts by namespace; all previous source messages unchanged, pseudo ratio, protected/no-letter outliers.
3. The classification ledger for translatable UI, editable/stock defaults, machine values, exported/printed text and any deferred/dev-only copy. Include exact source paths for unresolved strings.
4. Proof that `RACK_COMPONENT_LABELS` and model-generated titles, port/cable IDs, physical numbering and `PhysicalDocumentation`/Connect Table underlying records remain canonical; explain typed display-only adapters and raw error compatibility.
5. Live language-switch behavior for open Rack/port/cable/dialog UI, including focus/selection, zero language-only writes/refetch/history and representative exact before/after Atlas fixture comparisons.
6. English parity, Classic/ZIMA and width-matrix observations, screenshot locations and any remaining overflow/hit-target or font/animation limitations.
7. Rack PNG and physical-document export parity (bytes/pixels/structure where deterministic), and explicit confirmation that actual generated export text was **not** localized or modified.
8. **Exact executed tests and actual counts** per gate, fixes, reruns, unresolved/waived cases (none allowed for applicable safety gates), and distinctly identified not-run tests. Do not hide an individually failed regression under aggregate totals.
9. Readiness recommendation for M5 and the remaining later-milestone owners without prematurely implementing them.

**Stop and report ONLY when a genuine blocker exists:**

1. A required localization change would inevitably mutate user-editable/persisted values, port/cable identities, model defaults/numbering, Rack geometry or export/API contracts, with no safe display-only alternative in reasonable scope.
2. A critical build/typecheck, data integrity, save/history, physical wiring, destructive-dialog, cable-routing or export regression remains unresolved after focused repairs, making continued work unsafe.
3. Concurrent/unrelated checkout changes prevent safe non-destructive editing or a necessary merge cannot be reconciled without overwriting work.
4. An essential test for changed physical connection, deletion, persistence or export behavior cannot be run or reasonably substituted, leaving material data-loss risk unverified.
5. An unavoidable product-policy conflict demands overturning the agreed exclusion or scope rules; do not invent authorization.

**Not blockers:** correctable test failures, updated locale-aware selectors, safely excluded ambiguous literals with clear documentation, correctable text overflow, optional unavailable Docker/backend infrastructure when critical fixture tests pass, and dev-only or later-owner UI intentionally excluded. **Diagnose and rerun failures; never quietly skip them.**

**Source-control boundary:** You are authorized to implement and test **M5a–M5d only**. Do **not** commit, push, merge, tag, release, deploy, modify the public repository, rewrite history, reset the checkout, or start M6 without separate authorization. Preserve unrelated changes. After M5d passes, stop and return the consolidated report.

---

**Success condition:** M5a, M5b, M5c and M5d all pass; the Rack/physical frontend interface is localized and language-neutral; generated/exported contents and every persisted physical/data identity are unaffected; an auditable final report identifies exactly what passed and what remains outside M5.
