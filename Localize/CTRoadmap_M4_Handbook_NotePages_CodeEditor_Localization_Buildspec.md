# CTRoadmap — M4 Execution Buildspec: Handbook, NotePages & Code Editor Localization

**Execution contract:** **ONE authorized Codex implementation task**, with sequential internal phases **M4a → M4b → M4c → M4d**. After each phase, run the specified gate, diagnose and repair ordinary failures, and **continue automatically when it passes**. **Stop only for a genuine unresolved blocker** under §11; do not request user sign-off between phases.

**Target branch:** `v0.10.1`  
**Planning authorities:** `dev/Localize/CTRoadmap_Localization_Roadmap_M2_Onward_Revised_2026-11-19.md` **M4**, `dev/Localize/CTRoadmap_Localization_Rollout_Plan_v0.10.1.md` **M4**, `dev/Localize/CTRoadmap_M3_Canvas_Localization_Execution_Buildspec.md` (working conventions/exclusions), and current source/`PROJECT_LOG.md` for delivered M1–M3 behavior.  
**Product decision:** **Translate the tools used to edit information, never the editable information itself.** This includes user-editable stock/default titles or field names, even when currently hard-coded English. Preserve all stored identifiers, generated canonical names, Markdown, code and addresses.

## 1. Objective and acceptance criteria

Localize the remaining **frontend Handbook/NotePages/Code Notes user-interface text** while preserving the data models and every editing workflow. The in-scope domains are `HandbookView`, Table of Contents/outline, **display-only** system section headings derived from `lib/handbook.ts`, Handbook Address Book and related logo/UI dialogs, NotePages/tabs/format/editor controls, Tile Reference Picker and note export **menus**, Code Editor UI/drafts/comparison/assignment/statuses, and Handbook PDF export **options dialog chrome** (not generated PDF output).

The entire M4 task must be delivered without translating or modifying user-authored content, canonical saved defaults, generated filenames, structural keys, export payloads, underlying PDF content or cross-workspace business logic.

**Definition of done:**

- All safely in-scope, app-owned, visible **and accessible** frontend strings are keyed; ambiguous/deferred strings are dispositioned in a source-owned ledger rather than silently bulk-translated.
- English display wording is preserved, and every new source key has matching **40%-expanded** deterministic Pseudo-English, `context.json` translator context, complete namespaces, typed interpolation and build-time validation. Retain the prior 460 keys unchanged unless an unavoidable, documented compatibility fix is required.
- Language switches update mounted Handbook/NotePages/Code Editor chrome without destroying DOM/editor identity, focus, selection/caret, scrolling, buffered drafts, temporary dialogs, validation status, open reference searches or underlying Atlas state.
- IDs, section order, relationships, TOC selection, note/field references, sorting/search, Code Notes behavior, copy/export output, history, save lifecycle and persisted/default names remain behaviorally equivalent in English.
- Frontend Handbook *preview* headings display the selected language. The **generated PDF/document contract remains unchanged** and is not a dependency of completing M4.
- Responsive handling is **language-neutral** and verified in Classic/ZIMA with long English labels independently of Pseudo-English.

**Explicitly outside M4:** full Rack/physical-wiring UI; Swimlane workspace UI; Snapshot/INGEST; mobile-specific readers and shell; unrelated Settings subsections; backend/Python rendering; generated Handbook PDF, Markdown, Mermaid, YAML and other document contents; additional real languages; runtime language packs; unrelated feature development. A Handbook page may contain a Rack/Swimlane/physical-document component: do **not** take ownership of that component's specialized sub-UI merely because it is embedded in the Handbook.

## 2. Permanent classification boundary — include vs exclude

| Source surface                             | **INCLUDE: app-owned UI text**                                                                                                                                                                     | **EXCLUDE: content or machine identity**                                                                                                                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handbook masthead, volume and outline      | Fixed label `Handbook`, system prompts/placeholders, `Outline`, `Volume {{number}}`, Back-to action, empty navigation text, app-generated heading fragments                                        | `atlas.metadata.name`, its initial editable value `CTRoadmap`, Family/Tile/Chapter titles, saved descriptions, user Tag names, anchor IDs, selection/order fields                                               |
| TOC and `lib/handbook.ts`-derived sections | Fixed TOC heading, move-up/down tooltips, generated *display* labels such as `Unassigned / No Family`, `All Addresses`, `Address Book`, `Swimlanes`, `Physical Wiring`, `Epilogue`, `No entries`   | Original model constants and model-built strings, saved special-section IDs/positions, volume IDs, exported/ordered model text, editable Family titles                                                          |
| Handbook Tile cards/relationships          | App-owned lifecycle badge `PLANNED`, relationship chrome, fixed type names where safe, “inside {{parent}}”/empty messages, warnings as **display templates**                                       | Actual Tile titles, user-customizable Equipment classifications, `tile.fields` keys **including defaults**, field values/paths/IPs, custom Link labels, endpoint names, tags and identities                     |
| Address Book                               | Search/sort/group/column labels, action buttons, tooltips, entry-editor chrome, local validation/confirmation templates, fixed origin-label display                                                | Derived/manual addresses, IPs/URLs/MAC/hostname, manual entry names, source field keys, row IDs, `href`, sort keys, entered values, persistence shape                                                           |
| Handbook logo and related dialogs          | Choose/replace/remove, crop/apply/cancel, tooltips, error guidance, confirmation language                                                                                                          | Uploaded filename, asset bytes/url, file type identifiers, crop rectangles and output, user image                                                                                                               |
| NotePages and reference insertion          | Fixed `NOTES` tab, Add/Rename/Delete, format radio labels, edit actions, instructions, empty/read-only states, tooltips, context menu, a11y and inline announcements, `@@` picker control captions | Note page titles **including defaults**, content, Markdown, code, tags, format `plain`/`markdown`/`code` IDs, note IDs, tile references, insertion token `@@`, copied or inserted literal field values/names    |
| Note export controls                       | Note action-menu labels, help, optional-extension instructions, UI-owned status/error messages                                                                                                     | The downloaded note/code content, extension choice/filename, file-format tokens (`PDF`, `TXT`, `MD`, `JSON`), detection result identifiers, filesystem paths                                                    |
| Code Notes/CodeMirror                      | Buttons, toolbars, dialogs, save/retry/recover/compare/assignment chrome, `Check Config`, warnings/instructions, a11y, empty/loading/error states, UI-owned validation summaries                   | **Actual code or comments**, diagnostics as machine data, code-language IDs and programming-language names, syntax grammar, diff/copy/export payload, user titles, snippets, paths, references and saved drafts |
| Handbook PDF options UI                    | Fixed frontend dialog labels, inclusion options, fixed help text, progress wrapper and close/cancel/export controls                                                                                | Boolean option keys, volume IDs/selected values, raw opaque backend errors, backend PDF text/layout, timestamps/filenames, user-derived volume titles                                                           |

**Every candidate must pass these questions before keying:**

1. Can this string **itself** be authored, renamed, edited, imported, saved or customized (even if initially populated by a stock default)? **Do not translate it.** The UI control's label/instruction can still be translated.
2. Does it participate in an enum, model key, reference/anchor ID, matching/sort/lookup, URL, code language name/ID, `@@` syntax, file extension, exported document or persisted default? **Do not translate the canonical value.** If it needs a localized display, introduce a **display-only adapter** keyed by stable identity.
3. Is it app-owned frontend explanatory/interactive text? Localize the **complete** message (with named placeholders for user data). Never localize an interpolated user value or concatenate translated fragments to infer a new sentence.
4. If it has mixed consumers (UI preview **and** model/export), keep the existing model/English text unchanged and localize **only at the preview/rendering boundary**. Do not mutate `lib/handbook.ts` outputs to force a screen translation.
5. If still ambiguous, leave it unchanged, record the source and rationale, proceed with other safe strings. Ambiguity alone is **not** a stop condition.

**Special traps identified in current source:**

- `lib/handbook.ts`: `HANDBOOK_ADDRESS_BOOK_TITLE`, `HANDBOOK_SWIMLANES_TITLE`, the special-section title `Physical Wiring`, `Unassigned / No Family`, `All Addresses`, `Unfiled`, `Epilogue` and warning text can be used by TOC/model/export consumers. **Retain all original model and persistence outputs.** Resolve a preview label from stable section ID, `volume.unassigned`, group identity or explicit display descriptors—not by parsing English text or rewriting data.
- `HandbookView.tsx`: masthead `<input value={mastheadTitle}>` is editable; translate its `aria-label`/placeholder only, **never the value**. `volume.title`, `item.title`, tile titles and `FieldList` `key` are data, not locale strings. Family `description` and tags are data. Translate app-owned text around them.
- `HandbookView.tsx` relationship grouping uses `relationship.label` in a grouping `Map`. Preserve grouping keys/count/order and custom labels; map only built-in type **display** labels after grouping when a stable type identifier is available. Avoid heuristic reverse-translation of arbitrary labels.
- `HandbookToc.tsx`: special-section ordering is saved by section ID. Translation must never re-key or reorder the TOC or change its source-derived anchors.
- `NotePages.tsx`: `page.title`, content, page IDs, formats and saved order are canonical. The `NOTES` fixed tab is translatable; default editable note titles are not. Preserve `Shift+F10`, Alt+Arrow drag/reorder, and other keyboard shortcut semantics.
- `TileReferencePicker.tsx`: selected Tile title and eligible field keys/values must be literal. Preserve the exact inserted `@@` reference/field text and HTML-like/Unicode characters; translate only picker steps/action labels and announcements.
- `CodeNoteEditor.tsx`: `features/codeNotes/languageCatalog.ts`, CodeMirror language IDs, `Auto Detect` *action* text versus a language *identifier*, validators/format parsers, docs and code comments require classification. Code language names are explicitly excluded by the product policy; the selector's `Language` UI label and `Auto Detect` control are eligible. Do **not** regenerate source, change import/detection heuristics, or interpret source text as UI copy.
- `HandbookPdfExportDialog.tsx`: localize **dialog UI** (checkbox captions/options/help/selection), not the PDF payload or contents. Keep option keys and volume IDs exactly unchanged. Raw service errors may stay literal inside a localized wrapper.

## 3. Preflight: source, collision and risk inventory

Before modifications:

1. Read `AGENTS.md`, CSS/style ownership guidance, `PROJECT_LOG.md`, the current milestone roadmap and M3 buildspec. Inspect the *actual* `v0.10.1` HEAD and `git status --short`. **Preserve and do not overwrite any concurrent work**, including the independently scoped Workspace Switcher animation repair if it has landed or is in progress. Do not reset or clean the checkout.
2. Verify M3 behavior (catalog/manifest scripts, runtime, language picker, Pseudo-English still enabled in all builds, latest committed responsive shell). Read `frontend/src/i18n/README.md`, `frontend/scripts/{catalogs,pseudo,locale-registry}.mjs` and source for existing language adapters (`canvasLabels`, `canvasMessage`, etc.). **Reuse the infrastructure; do not replace it.**
3. Inspect relevant owners, including at minimum:
   - `frontend/src/components/{HandbookView,HandbookToc,HandbookAddressBook,HandbookLogoControl,HandbookPdfExportDialog}.tsx`;
   - `frontend/src/lib/handbook.ts`, `frontend/src/features/handbookPdf/model.ts` (inspection only for data/export boundaries);
   - `frontend/src/features/handbookNotes/{NotePages,TileReferencePicker,MarkdownNote}.tsx`, `frontend/src/features/handbookNotes/export/NoteExportMenu.tsx`, relevant reference/export/model helpers;
   - `frontend/src/features/codeNotes/{CodeNoteEditor,CodeDraftHost,DraftTabs,DraftPrompt,SaveCodeNote,ComparisonPicker,CodeMinimap,FullscreenShell}.tsx`, plus context/session/save/validation/language modules as needed;
   - App/Inspector and shared callers/producers of these UIs where needed to ensure that newly passed display-only parameters do not change data behavior.
4. Build a **M4 scope ledger** for each owner: exact English UI string; current consumer(s); inclusion/exclusion/defer; proposed stable key/namespace; whether value is persisted, user-authored, export-facing or used in algorithms; and the relevant test. Review `title`, `aria-label`, `aria-live`, placeholders, visible JSX, tooltips, native prompts/confirmations, async error statuses and hidden/expanded menus, not just headings.
5. Record and run available baseline checks: current catalog validation, relevant unit/browser tests, typecheck and build. Distinguish pre-existing failures. Use isolated fixture Atlases and temporary browser test directories, not real installations.

**Preflight gate:** The exclusion map is defensible, no unsolved source conflict or critical data-safety issue exists, and a test strategy covers editor state and navigation. **Proceed directly to M4a.**

## 4. Shared implementation conventions (apply to M4a–M4d)

- English remains the master. Prefer a clear `handbook` namespace for Handbook/TOC/AddressBook/NotePages; use a distinct `codeNotes` namespace **only if it materially clarifies ownership**. Reuse `common`, `canvas` or `exports` only when semantics are truly shared. Register namespaces through the existing `manifest.json`, create matching complete `en` and `en-XA` catalogs, update `context.json` (surface/meaning/each named placeholder), and validate generated types/registry. All registered locales must match the English namespace and key set.
- **Don't change or duplicate the existing 460 M3 messages** as an expedient way to localize M4. Preserve English parity and dynamic plural/count interpolation. For named interpolations use `{{name}}` with original authored value unchanged. Protect placeholders/technical tokens in pseudo generation; use existing deterministic author/check logic and target ~1.4× alphabetic word length.
- For mounted components use `useTranslation`/existing i18next context. For pure model functions do not import the global runtime to mutate return values; pass typed **display-only** accessors or format descriptors at UI boundaries. For asynchronous status that must change while visible, store a stable message descriptor/key + typed parameters, then render under current locale; do not store a translated state string that stays stale.
- **English is authoritative for stored/model/build/export strings.** Do not pass `t(...)` into `buildHandbookDocument`, `getHandbookTocItems`, TOC identities, `HandbookPdfExportOptions`, `NotePage` serialization, draft session/cache, code-language registry or export source builders. Never derive identifiers from translated labels or use translated strings as React keys.
- Preserve DOM subtree/editor identity across language changes. Do not add locale to React `key`, force remount the application/CodeMirror, reset code sessions, reinitialize editor extensions, rerun navigation effects or trigger saves because a translator changed. Avoid reconfiguring CodeMirror syntax/lint/diff just to alter UI buttons.
- Keep user-authored values as React text or interpolation variables. Never use `dangerouslySetInnerHTML` to render translation strings. Preserve HTML-like `<tag>`, ampersands, Unicode, Markdown and escaped code as literal user data.
- Keep all menus, focus traps, scroll anchors, keyboard shortcuts, selection logic, sortable order, click handlers and disabled semantics. For long labels use **content-responsive** CSS scoped to affected UI; no `:lang(en-XA)` width/height overrides and no blanket aggressive wrapping of code or user-authored content.
- If a string is currently constructed by a helper that also controls business logic, refactor to a stable typed message key or a display-only lookup **without changing its raw English diagnostic/output**. Inspect every consumer of any modified helper; separate display from logic rather than comparing translated strings.
- Preserve cross-tab browser-local language synchronization (`ctroadmap.language.v1`), English fallback, offline local bundles, current language flags, and production visibility of Pseudo-English. No runtime network fetches for catalogs/badges, no new dependencies unless clearly necessary, and no backend/API/schema changes.
- Shared UI components appearing outside Handbook (Code Editor in Canvas, image/print menus, settings widgets) may receive *safe display-only* translations, but record where they appear and do not inadvertently translate later milestone's specialized screens.

## 5. M4a — Handbook View, TOC, system headings and preview relationships

### Implement

1. Localize **fixed Handbook screen chrome** in `HandbookView.tsx`: masthead `Handbook`, system-name input label/placeholder, `Back to {{title}}` action, volume index heading, outline/placeholder/empty states, `Epilogue` heading, additional-addresses heading, static relationship-section text, fixed no-relationship message, planned/live display badges, copy-path guidance, tooltips and accessible names. Preserve the system name, volume titles, actual paths, Tile fields and other user data.
2. Localize fixed TOC chrome in `HandbookToc.tsx`: `TABLE OF CONTENTS`, reorder accessibility/tooltips (`Move {{title}} up/down`), `No entries`; preserve volume/Tile ID, saved ordering and labels authored by users.
3. For derived *system-owned* display names in `lib/handbook.ts`, provide a safe preview-only projection keyed by **stable section identity** (`HANDBOOK_ADDRESS_BOOK_ID`, `HANDBOOK_SWIMLANES_ID`, `HANDBOOK_PHYSICAL_WIRING_ID`, `HandbookSpecialSectionId`, `volume.unassigned` or equivalent). Apply the same projection consistently to TOC, Outline and visible Handbook heading, but retain all model constants/`buildHandbookDocument()` returned titles, sort/group structure and export behavior unchanged. If a label is editable or becomes stored, **do not localize it**.
4. Preserve Handbook relationship grouping and source text. Use stable relationship **type** when available for fixed display labels; leave user `link.label` verbatim and keep group boundaries unchanged. For validation warnings produced by `lib/handbook.ts`, consider safe typed preview descriptors only if original warnings and all other consumers are preserved; otherwise document a precise deferral.
5. Check `HandbookView`'s selection/anchor/scroll effects and any context passed into notes: language switching must not navigate, select a different Tile, jump scroll position, alter a volume key or cancel in-progress editing.

### M4a gate — repair then continue

- English source wording still reads as before; exact original selected Tile/Volume, TOC order and IDs, outline anchors, scroll position, relationship groups and authored labels are identical before/after English ↔ Pseudo-English switching.
- Derived system section headings localize **in preview and navigation** while `lib/handbook.ts` model titles and export-related representations remain unchanged. No model or save modifications are caused by language selection.
- Verify a Handbook with named Families, the Unassigned volume, multiple special sections, parent/child and planned relationships, a custom Link label, field key `hostname`, user content `Étage <CPU> & A`, and an empty-volume state.
- Run catalog/pseudo/type/build checks and relevant `handbook-toc-defaults`, `handbook-toc-persistence`, `handbook-visibility`, `handbook-swimlane-outline`, and Handbook source-model unit tests; add Playwright covering live switching, TOC navigation and preview English parity.
- **PASS → proceed automatically to M4b.**

## 6. M4b — Handbook Address Book, logo controls, NotePages and Tile Reference Picker

### Implement

1. Localize `HandbookAddressBook.tsx` fixed headings, group/column captions, search and sorting controls, origin/source display labels, edit/create/delete/confirm controls, form labels, empty states and validation messages. Names/addresses/field keys/URLs, manual/derived row data, `organizeMode`, `sortDirection`, IDs and `href` remain unchanged. Adapt error notices so already-open errors re-render in the selected locale without erasing entered values.
2. Localize the Handbook logo **UI** in `HandbookLogoControl.tsx`: choose/replace/remove, crop controls, busy/error indications, confirmation text and keyboard/a11y. Uploaded filenames are interpolation data; crop result/asset URLs untouched.
3. Localize NotePages UI in `features/handbookNotes/NotePages.tsx`: fixed `NOTES` tab, Add Note, format radio labels, edit/rename/delete actions, empty/read-only copy, note-title **input label**, title/context tooltips, announcements, menus and native confirmations. Note title **values**, including generated/default values, IDs, format enum values and content remain canonical. Review any `model.ts` errors for display-only adaptation, preserving its original validation semantics.
4. Localize `TileReferencePicker.tsx` picker steps (choose Tile/action/field), back actions, result-limit/empty notices, tooltips, accessible list names and announcements. Keep actual Tile name, chosen field key/label, inserted source field value, lookup identity and `@@` syntax verbatim. Maintain portal/focus, search positioning, keyboard handling, escape and insertion behavior.
5. Localize `features/handbookNotes/export/NoteExportMenu.tsx` **menu chrome** (Export option/help/status/error and optional-extension UI). Preserve export source, file bytes/extension/filename computation, proposed suffix/path and actual note content. Do not localize actual Markdown/code/Plain Text or convert exported content.
6. Preserve note page drag/reorder, fixed-versus-custom tabs, right-click/Shift+F10, `Alt+Arrow` moves, focus return, UI selection, note-page save/autosave/history, hyperlink/Markdown/ref parsing and Escape behavior.

### M4b gate — repair then continue

- Fixtures containing manual and derived Address Book entries (IPv4/IPv6, URLs, user names, custom field keys), multiple note formats, long Unicode note titles, inline/toolbar `@@` references and empty/error states work identically across locale changes.
- Switching language while a Name/Address field, NotePages editor, rename form or Tile Reference Picker is open retains the **same DOM control, focus/caret, draft text, target IDs, order and pending work**; language change alone sends zero Atlas writes/refetches or backend settings writes.
- Verify Address Book create/edit/delete, sort/search/organize, logo upload/crop/delete UI, note tab reorder/context-menu/rename/delete, insert-field/reference and note exports. The downloaded bytes and actual inserted text must match English controls given identical input.
- Run catalog/type/build checks and focused `handbook-address-book`, `handbook-logo`, `handbook-notes`, `handbook-copy`, `note-export` browser tests; `handbookAddressBook`, `handbookLogo`, `handbookNotes/{model,atAt,tileReference,MarkdownNote}`, `handbookNotes/export/{export,orchestration}` and note-persistence unit tests. Add robust locale/focus/persistence tests.
- **PASS → proceed automatically to M4c.**

## 7. M4c — Code Notes / CodeMirror editor and draft workflows

### Implement

1. Localize **UI-only** messages in `features/codeNotes/{CodeNoteEditor,CodeDraftHost,DraftTabs,DraftPrompt,SaveCodeNote,ComparisonPicker,CodeMinimap,FullscreenShell}.tsx` and immediately owned editor actions: Copy Code, Compare With, Save/Save As, Assign to Tile, New/Delete/Restore/Discard draft, Check Config, Diagnostics, Return to Tab, expand/collapse, search, toolbar tips and confirmations. Preserve original action semantics.
2. Localize editor shell labels, loading/empty/error/read-only/recovery states, detectable **UI-owned** validation notices, visible comparison statuses, temporary save error messages and live lint/status copy. Distinguish these from raw CodeMirror/language-server diagnostics, programming language names and parser errors; avoid translating machine-generated code analysis or raw backend failures. For a UI-owned status held in component state, use a stable descriptor and display-time interpolation so it changes language while visible without repeating any action.
3. Preserve `features/codeNotes/languageCatalog.ts`, `CODE_LANGUAGE_IDS`, grammar/config selection values, detection/validation workers, code content and syntax, line/column position, command text, config filenames and exact copied/exported bytes. The **UI caption** `Language` is localizable; the programming language option names/IDs are excluded. Do not confuse the code-language selector with the natural-language picker.
4. Preserve CodeMirror EditorView instance, current document, selection/caret/anchor, undo history, scroll position, pending composition, diagnostics and loaded extensions during language changes. Preserve Code Notes tab identity, saved/unsaved draft cache, drag ordering, pending Save As destination, comparison source and readonly state. Do not put locale in a component key or rebuild the editor solely because `t` changed.
5. Inspect `CodeNoteEditor`'s embedded Note Export and `@@` picker reuse; keep translated presentation consistent without duplicate keys or new serialization paths. Any editor-related **Settings-panel** copy outside these editor components remains with its Settings owner unless the same shared chrome is safely owned in M4 and documented.
6. Preserve keyboard commands (`Ctrl/Cmd+S`, Escape, Tab handling, shortcuts for reordering, diff navigation), clipboard functionality, Code Notes assignment and note-title edits; never insert translated text into the code document, source mappings, diff output or `NotePage` content.

### M4c gate — repair then continue

- Open a Code Note with content containing code, a URL, `{{raw}}`, Unicode, `hostname`, comments and user-edited title. Change English ↔ Pseudo-English **with the editor focused and unsaved**; assert EditorView/DOM identity, full source and selection offsets unchanged, undo/redo functionality retained, no unintended saves, and visual UI strings updated.
- Exercise expanded/embedded editors, pending Save/Save As, draft tab reorder/recovery, comparison picker and diff, `@@` insertion, `Auto Detect` and explicit code-language choice, lint/Check Config output, copy/export and failure/retry states. Preserve actual code-language choices and validation results.
- Run catalog/type/build checks, existing `code-notes`, `code-languages`, `code-editor-toggle`, `code-detection`, `code-drafts`, `code-draft-reorder`, `code-draft-sessions` browser tests; selected `features/codeNotes/{assignment,rawText,session,savedDrafts,draftSessions,draftOrder,languageCatalog,detection,validation,validatorClient}` unit tests. Add locale regressions to the relevant owners.
- **PASS → proceed automatically to M4d.**

## 8. M4d — Handbook dialogs, responsive integration and final gates

### Implement

1. Complete any remaining **Handbook-owned dialog chrome**, including `components/HandbookPdfExportDialog.tsx`: fixed title, option descriptions, checkbox/group labels, explanatory copy, `No volumes`, `Cancel`/`Export PDF`, loading, accessible close label and localized **frontend wrapper** around any raw error. Preserve `HandbookPdfExportOptions` names/types/booleans, `excludedVolumeIds`, volume titles sourced from users, progress logic and generated PDF byte/content behavior. **The actual PDF is not localized by M4.**
2. Audit adjacent M4-owned UI presentation, including `HandbookView`/TOC, Address Book, logo, NotePages and Code Editor status, hidden context menus, disabled states and a11y text. Recheck the original source inventory for accidental omissions. Record all intentional deferrals with owners and reasons, not a blanket “done.”
3. Ensure English text/layout parity and Pseudo-English ~40% expansion on relevant Handbook/NotePages/Code Editor shell. Test **Classic and ZIMA** at **1440, 1280, 1024, 920, 680 and 390 CSS pixels** where those surfaces are reachable. Stress with a long **synthetic English phrase** and a long unbroken word; check wrapping, tooltips, headers, tabs, horizontal overflow, scroll containment, keyboard focus, dialog close-button reachability and document-preview legibility. Use language-neutral CSS scoped to UI-owned elements, not `:lang(en-XA)` layout branches or code-editor content wrapping changes.
4. Test live switching with Handbook TOC/outline, PDF options, Address Book editor, rename dialog, NotePages tab, inline picker, expanded Code Editor, comparison and draft recovery prompt already open. Assert no remount, no lost selection/current preview, no unintended navigation, no new Atlas writes/history, and preserved buffer/caret/ref tokens.
5. Regression-check the **unchanged downstream boundaries**: ordinary English Handbook model output/TOC identifiers/ordering; existing PDF export options and API payloads; successful English PDF generation if a fixture backend is available; note export downloads and exact user Markdown/code; unchanged Rack/Flow and specialized physical-document UI. Do **not** alter PDF internals to make a visual test pass.
6. Update `frontend/src/i18n/README.md` with Handbook preview-vs-model separation, Code Notes vs natural-language locale distinction, permanent editable/default exclusions, new namespace onboarding, and a minimal regression recipe. Add a dated M4 entry to `PROJECT_LOG.md` with per-phase evidence, source scope and deferred items.

### M4d final gate — repair then complete

- `npm run i18n:check` validates all English/Pseudo-English catalogs, translator context, placeholders/plurals and deterministic +40% pseudo; `npm run typecheck`, `npm run build`, relevant Node/Vitest suites and Playwright suites all pass. Run Docker frontend build if available; unavailability alone is not a blocker if fixture builds and critical safety suites pass. Confirm both locales are bundled offline in production.
- Capture screenshots in temporary paths outside the checkout and check **rendered text**. Confirm compact English presentation remains compact when possible, long translated labels fit without clipping/overlap, and user-authored Markdown/code/previews remain unchanged. Distinguish high-DPI `deviceScaleFactor` from actual browser zoom; if claiming real zoom, use a real browser-zoom probe.
- Compare original Atlas and after-language-switch JSON, note/draft content, link/field references, TOC and special-section identities, language settings network writes and history counters. **Language switching alone must cause zero Atlas PUTs/refetches, no history mutation and no backend settings calls.** Legitimate edits retain their original save/Undo behavior.
- Run a read-only post-M4 audit of source-owned visible literals. Provide a **coverage/exclusion/deferred** matrix by file and confirm no translatable M4 strings were silently left out.
- **PASS → M4 complete. Stop the task. Do not begin M5 or any other milestone.**

## 9. Commands and regression owners

Execute from `frontend/` unless indicated. Adjust command names if current repository scripts differ; **report exact commands and results**. Install dependencies **once** at preflight, not after every phase. Use targeted tests after each gate and a broader final suite at M4d.

```bash
npm ci --no-audit --no-fund
npm run i18n:check
npm run --silent i18n:pseudo                    # proposal: inspect before writing
npm run i18n:pseudo -- --write                   # only when English keys change
npm run i18n:check
node --test scripts/catalogs.test.mjs
npm run typecheck
npm test -- src/i18n/runtime.test.ts src/lib/handbookAddressBook.test.ts src/lib/handbookVisibility.test.ts src/lib/notePagesPersistence.test.ts
npm run build
```

**Existing frontend unit-test owners to select as needed (confirm paths first):**

- `src/lib/{handbookAddressBook,handbookVisibility,handbookLogo,notePagesPersistence}.test.ts`;
- `src/features/handbookNotes/{model,atAt,tileReference,MarkdownNote}.test.ts(x)` and `src/features/handbookNotes/export/{export,orchestration}.test.ts`;
- `src/features/codeNotes/{assignment,rawText,session,savedDrafts,draftSessions,draftOrder,languageCatalog,detection,detection.regression,validation,validatorClient}.test.ts`;
- `src/features/handbookPdf/model.test.ts` to guard PDF payload/model stability.

**Existing Playwright owners to select and extend (confirm present tests before running):**

```bash
npm run test:browser -- tests/handbook-toc-defaults.spec.ts tests/handbook-toc-persistence.spec.ts tests/handbook-visibility.spec.ts tests/handbook-swimlane-outline.spec.ts tests/handbook-gradient.spec.ts tests/handbook-copy.spec.ts --output <unique-temp-dir-outside-repo>

npm run test:browser -- tests/handbook-notes.spec.ts tests/handbook-logo.spec.ts tests/note-export.spec.ts tests/handbook-pdf-export.spec.ts --output <unique-temp-dir-outside-repo>

npm run test:browser -- tests/code-notes.spec.ts tests/code-languages.spec.ts tests/code-editor-toggle.spec.ts tests/code-detection.spec.ts tests/code-drafts.spec.ts tests/code-draft-reorder.spec.ts tests/code-draft-sessions.spec.ts tests/localization.spec.ts --output <unique-temp-dir-outside-repo>
```

For tests that download/export/crop images or write temporary files, use controlled fixtures and temp output directories. **Never run destructive tests on user Atlas data.** Tests may need label-selection updates after localization; replace English-only selectors with locale-aware or stable semantics while preserving assertions about accessible names, button behavior and payload values. Do not delete/skip tests to make a gate green.

## 10. Gate ledger and consolidated completion report

Maintain an execution ledger as you work. **Do not pause to obtain approval after a green gate.**

| Gate      | Surface / key coverage      | Excluded/persisted-content checks     | Tests executed and results         | Repairs | Status           |
| --------- | --------------------------- | ------------------------------------- | ---------------------------------- | ------- | ---------------- |
| Preflight | Source inventory            | Worktree conflicts, model/exports     | Baseline                           | —       | CONTINUE/BLOCKED |
| **M4a**   | Handbook/TOC/preview        | Model titles, IDs, order, field keys  | Catalog, Handbook navigation/model | …       | CONTINUE/BLOCKED |
| **M4b**   | Address Book/NotePages/refs | Addresses, notes, `@@`, export bytes  | CRUD, tab editing, notes/export    | …       | CONTINUE/BLOCKED |
| **M4c**   | Code Editor/drafts          | Code, language IDs, EditorView, state | Editor, save/recover/compare       | …       | CONTINUE/BLOCKED |
| **M4d**   | Dialogs/layout/final QA     | PDF contracts, all authored data      | Broad unit/browser/build/Docker    | …       | COMPLETE/BLOCKED |

Final report, in one response, must state:

1. Branch, **actual starting and ending SHA**, tracked/untracked worktree changes, and any pre-existing concurrent patch preserved.
2. All changed source/test/catalog files; namespaces and count of new keys; final total; pseudo expansion ratio and exclusions/zero-letter outliers.
3. M4a–M4d scope coverage by component and which exact English display messages changed (if any).
4. How preview-only special-section headings are resolved **without mutating `lib/handbook.ts` or exports**, plus relation grouping and user-field preservation evidence.
5. How NotePages/reference/CodeMirror live language switching preserves EditorView, unsaved drafts, reference syntax, saved values and navigation/TOC identity.
6. Each gate's **actually executed commands and actual pass/fail counts**; Docker/PDF/browser cases marked run or not run—never invented.
7. Classic/ZIMA and English/pseudo/long-English layout observations, screenshots/temp locations, any failing/repaired behavior, and whether there are remaining visual limitations.
8. Post-M4 remaining-literal inventory with specific intentional exclusions and later scope owners.
9. Readiness recommendation and anything that genuinely could not be completed.

## 11. Automatic progression and stopping rules

**The user has authorized the complete M4a–M4d implementation as one task.** Gates are internal engineering checkpoints, **not requests for permission**. On test failure: reproduce, diagnose, fix, rerun and continue. If one ambiguous literal is unsafe to translate, exclude and document it; do not block all other work. Stop after M4d passes.

**Stop and report ONLY for a genuine blocker**, such as:

1. A required change would necessarily alter user-authored/persisted names, fields, Markdown, code, canonical section IDs, TOC ordering, PDF/export payload contracts or Atlas save/history, with no safe display-only solution within reasonable scope.
2. A critical build/type, CodeMirror/editor-state, save/history, export/serialization, navigation or destructive-dialog regression remains unresolved after targeted repair.
3. Unrelated worktree changes/conflicts make safe non-destructive edits impossible, including concurrent Workspace Switcher work that cannot be preserved/rebased safely.
4. A safety-critical test of changed persistence, deletion, reference insertion or code-editor state cannot be run or reasonably substituted, leaving data integrity unverified.
5. A real product-policy contradiction requires overturning the agreed inclusion/exclusion rule or enabling a new locale/contract change rather than simply documenting a safely excluded string.

**Not blockers:** ordinary correctable test failures, expected new locale-aware test selectors, isolated cosmetic overflow with feasible fixes, safely excluded ambiguous copy, optional unavailable Docker/full-stack services, or explicitly deferred specialized UI. **Do not waive a failed applicable gate without investigating it.**

**Source-control boundary:** Authorize **implementation and tests only**. Do not commit, push, merge, tag, release, deploy, rewrite history, modify the public repository or begin a later milestone. Preserve unrelated changes and record the final state for review.

---

**Stop condition:** M4a + M4b + M4c + M4d gates pass, user-authored/canonical content and PDF output remain unaffected, frontend Handbook/Notes/Code UI is localized, and a complete evidence-based report is delivered.
