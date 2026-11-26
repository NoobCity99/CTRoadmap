# M4 localization scope and verification

M4a through M4d passed on 2026-11-20. The final gate covered 627 Vitest cases, seven Node catalog tests and 152 distinct Chromium cases across the broad suites and focused reruns. TypeScript, catalog validation, the local production build and the Docker frontend build passed. Production Chromium switched the mounted PDF dialog between both bundled languages while offline with zero requests. The change is ready for review.

English master catalog entries and their namespaced context rows are the per-message inventory. Each row identifies the UI owner and the named data inputs. These messages are frontend display values. The following source boundaries apply even when editable text happens to match an English message.

| Owner | Included chrome | Literal values and algorithm consumers | Verification |
|---|---|---|---|
| HandbookView, HandbookToc, Handbook collection headers | Masthead, prompts, volume/outline/TOC navigation, directional relationship groups, copy guidance | Family/Tile/Tag names, metadata input, equipment classifications, field keys, paths, endpoints, anchor IDs, Link labels and ordering | TOC defaults/persistence, visibility, gradient, copy and live-switch fixtures |
| lib/handbook, handbookPdf/model | Preview adapters use section ID, unassigned flag and directional link identity | All existing document and PDF outputs, ordering and warning diagnostics | Handbook model and PDF fixtures |
| PhysicalDocumentation, HandbookSwimlaneCollection | Desktop Handbook section titles | Port, wiring and diagram sub-UI belongs to Rack/Swimlane owners. Mobile reader owns its chrome. | Swimlane outline and TOC tests |
| HandbookAddressBook | Search, sort, grouping, manual/derived editing, empty and error states | Index query and sort use canonical data. Entry names, field keys, URLs, family IDs and addresses are literal. | Address model and CRUD fixtures |
| HandbookLogoControl | Picker, menu, removal, crop, busy and validation states | File names, crop coordinates, generated assets and URLs | Logo model/browser |
| NotePages, MarkdownNote, TileReferencePicker | Tabs, format, prompts, actions, insertion steps and live announcements | Editable default titles, source content, Markdown, IDs, shortcuts, literal field names/values and reference syntax | Notes, model, atAt, reference and persistence suites |
| NoteExportMenu | Actions, proposed filename guidance and export status | Extension, proposed filename, detection and downloaded bytes | Note export and orchestration suites |
| CodeNoteEditor, CodeNoteReader, CodeMinimap, FullscreenShell | Editor controls, read-only, accessibility, detection/validation summaries and minimap | EditorState, code, selections, grammar names, raw diagnostics, parser data and source comparisons | Code Notes, languages, detection, toggle and live-switch fixtures |
| CodeDraftHost, DraftTabs, DraftPrompt, SaveCodeNote, ComparisonPicker | Recovery, tab actions, confirmation, destination, comparison, failure and retry | Draft titles/cache, IDs, destinations, ordering, comparison source and save lifecycle | Draft order, sessions, assignment and browser suites |
| HandbookPdfExportDialog, App PDF flow | Options, progress, errors and actions | Booleans, selected IDs, model, backend, printable PDF, filenames and service diagnostics | PDF model and export browser |

## Display and data verification

The English master contains the exact display strings keyed by component group. The companion context rows identify where each string appears, its purpose and its interpolation values. Existing English wording, including case, punctuation, the reserved word `NOTES` in validation and the print settings, was retained. [English master](../../frontend/src/i18n/locales/en/handbook.json) · [Translator context](../../frontend/src/i18n/context.json)

| Phase | Keys added | Total | Verified behavior |
|---|---:|---:|---|
| Preflight | — | 460 | Baseline catalog, 46 Vitest cases, a TOC browser case, TypeScript and production build passed. |
| M4a | 69 | 529 | 44 model cases and 10 browser cases passed across the gate and repairs. The fixture backend generated a printable PDF and persisted TOC changes. |
| M4b | 128 | 657 | 329 unit cases, 46 existing browser cases and two new live editing cases passed across the gate and repairs. Covered address CRUD, logo crop/removal, note edits, insertions, copy and download. |
| M4c | 161 | 818 | 238 unit cases and 59 distinct Chromium cases passed across the seven editor suites and repairs. The live-switch case uses the actual EditorView and tests dirty text, selections, undo/redo, cache, focus, comparison and assignment. |
| M4d | 64 | 882 | Added PDF option, status and error messages, plus fixed diagnostics and completion labels. Rechecked the original catalog and canonical document, PDF, reference and language sources against the starting revision. |

The original four namespaces and their 460 context rows compare equal to the starting revision in both locales. The new `handbook` namespace has 422 keys. Its groups cover section names, directional relationships, TOC, preview, manual copy, Address Book, logo, notes, reference picker, Markdown fallbacks, note export, code problems, editor, drafts, assignment, comparison, editor preferences, PDF options and shared notices. The final deterministic catalog measures 28,084 / 19,980 translatable letters (1.406×). The three pre-existing zero-letter entries are `canvas:palette.url`, `canvas:search.linkDetail` and `canvas:tile.swimlaneSummary`. Placeholders, code identifiers, addresses, keyboard shortcuts and protected format tokens are excluded from expansion.

**Preview identity.** A special section's ID selects its heading. The generated volume uses its `unassigned` flag. Family names, even when identical to a stock heading, pass through as data. Relationship groups keep their canonical Map keys, order and link IDs. Once grouped, the original link type and direction select the caption. Existing model relationships derive those captions from type and direction. The original link record, including any custom label, is preserved. Fields and endpoints render their original values. The before/after fixture compares Atlas JSON and anchor identities and checks opposite-direction headings.

**Live editing.** The language choice is a browser preference. Open controls render typed messages against the current locale. The working CodeMirror view reconfigures its display-label compartment, including an already-open diagnostics panel. The comparison pane updates its accessible name in place. The tests inspect the editor object, DOM selection, focus, view state, session storage, raw mixed line endings, undo/redo, reference search and insertion. They compare Atlas and history snapshots and count unsolicited Atlas and settings requests. Note exports check UTF-8 bytes and filenames. PDF tests compare retry payloads, selected volume IDs and file attachments, and check the original service detail under both localized error wrappers.

**Residual literals and later owners.**

| Source | Retained literals or deferred owner |
|---|---|
| `HandbookView`, `HandbookToc`, `lib/handbook` | Editable `CTRoadmap`, chapter/Family/Tile titles, classifications, tag names, field keys, descriptions, endpoint labels and paths. The two closed model warnings have view-only translations. Anchor construction, group keys, ordering, warning diagnostics and model output stay canonical. |
| `HandbookAddressBook`, `HandbookLogoControl`, `lib/handbookLogo` | Origin and sort values, user names, source fields, address strings/hrefs, filenames, MIME identifiers, output bytes and crop coordinates. |
| `NotePages`, `MarkdownNote`, `TileReferencePicker`, `handbookNotes/model`, `referenceContext`, `atAt`, `tileReference` | Editable `Manual Note N`, reserved canonical title, format IDs, raw Markdown, authored alt/link titles, search/index disambiguation, exact stored field values, reference tokens and keyboard keys. Fixed note captions render by fixed-tab identity. |
| `NoteExportMenu`, `exportNote`, `filename`, `noteExportSource`, `lib/api` | `PDF (.pdf)` consists of format tokens. Original extensions, proposed filenames, filenames starting with a dot, the `Notes` export stem and the source snapshot remain literal. Server-supplied failures retain their detail. |
| `CodeNoteEditor`, `CodeNoteReader`, `CodeMinimap`, `FullscreenShell`, `comparisonView`, `atAtAdapter` | Source bytes, selections, pane identities, code-language names, comparison context, shortcuts, DOM/ARIA identifiers and user-configured code wrapping. Low-level CodeMirror folding commands, generated gutter hints and parser diagnostics belong to the libraries. |
| `CodeDraftHost`, `DraftTabs`, `DraftPrompt`, `ComparisonPicker`, `SaveCodeNote`, `context` | Saved/temporary draft identities and titles, assignment targets, canonical search strings including the original `NOTES` source, match order and readonly snapshots. |
| `languageCatalog`, `detection`, `validation`, `validatorClient`, `mismatchLabels` | Detected languages, grammar/worker selection, parser errors and validation diagnostics are machine results. The UI resolves its own paused, passed and failure summaries on display. |
| `LeftSidebar`, `Inspector`, `EditorExtensionsSettings`, `ManualCopyPanel`, `App` | Only shared Handbook/editor controls and their transient feedback changed. Other Settings subsections, general system/Atlas statuses, debug messages and unrelated workspace navigation belong to their owners. |
| `HandbookPdfExportDialog`, `handbookPdf/model`, `captureSwimlanes`, backend | Printable titles, option flags, excluded volume IDs, multipart payloads, attachments, filenames and generated document content. M7 owns rendered documents and backend localization. |
| `PhysicalDocumentation`, `HandbookSwimlaneCollection`, mobile consumers | Only outer Handbook-owned headings are keyed. Connect Table, Rack inventory, patch panels and cable schedules belong to M5. Specialized Swimlane controls, mobile-only readers and shell, INGEST and remaining Settings belong to M6. Shared NotePages captions also update when used by a read-only consumer. |

A read-only TypeScript syntax-tree pass over the component owners checked JSX text, accessible labels, titles, placeholders and templates. Related producer/status modules and shared callers were inspected separately. Retained reference context such as `ID: <id>`, title/field disambiguators and parser output participates in lookup or identifies original objects. It is displayed verbatim.

## Layout evidence

The fixture runs Classic and ZIMA at 1440, 1280, 1024, 920, 680 and 390 CSS pixels with English, Pseudo-English and separately injected English. The stress catalog contains a sentence and a 72-character unbroken compound. Each combination measures painted text with DOM Ranges, checks content width and checks the PDF close control's hit target. The run covers the TOC, volume, fixed note tab, add action, Address Book, expanded editor and PDF dialog.

The volume outline gives the document more space at intermediate widths. At the existing stacked breakpoint the sidebar TOC provides navigation. The fixed note tab and add action grow vertically around the scrollable authored-tab rail. Address rows stack when their own container is narrow. The code-language selector keeps native keyboard and popup behavior and wraps its displayed label. The PDF footer remains reachable by scrolling its dialog. Long user text inside a single-line input and authored tabs keeps its normal editor/rail behavior. Measurements use CSS viewport sizes. No browser-zoom claim is made.

Temporary logs, traces, generated PDF and screenshots are under `%TEMP%/ctroadmap-m4-1795240991109`. The `d-theme-browser/handbook-layout-*` directories contain 40 English, pseudo and synthetic-English screenshots at the two ends of the width range. The other four widths have measured range/containment assertions. `fixture-handbook.pdf` and `fixture-payload.json` are the controlled five-page backend export and its input. Text extraction verified the English system heading, authored title, hostname and literal `{{raw}}` note. Examples include `volume-english-1440.png`, `code-long-390.png` and `pdf-pseudo-390.png`. The narrow screenshots were also reviewed together in `layout-review.jpg`. The editor preference captions now inherit the Handbook foreground in both workspace appearances.

## Gate repairs

- M4a fixed a mismatched namespace on the Handbook masthead. Visibility fixture writes needed an Atlas revision, and the last visible TOC position in a five-entry fixture is 4. The full-stack rerun used an isolated service.
- M4b kept mismatch detection's compatibility shape, supplied i18next in the Markdown/reference rendering test, added the logo fixture revision and used the search control's combobox role.
- M4c removed a collision with i18next's reserved `context` option and corrected a TypeScript descriptor union. The Python catalog cross-check uses the Windows interpreter name. Reorder and save mocks supply Atlas revisions, and Windows Chromium uses CodeMirror's supported redo binding. A retry lost its shared Vite process while another test command exited. A dedicated fixture server completed the rerun.
- M4d's original PDF download test caught an unstable progress callback that repeatedly triggered Swimlane capture. The callback now has stable identity. The retry, disabled options, binary download and Swimlane capture cases pass. Layout fixtures resolve the running Vite module URL, including its cache stamp. One older M3 assertion now expects the localized PDF dialog name. The interaction fixtures return revisions, verify the existing `@@` toolbar's tab stop and run their simulated focus event after the asynchronous navigation guard and before the animation frame.

### Handbook field selection follow-up, 2026-11-21

In `d-fields-0` and `d-fields-focus-0`, the test clicked the Service 3 TOC entry and focused the Service 4 Notes field in the same JavaScript call stack. The TOC navigation guard resumed after the focus handler and selected Service 3. Both runs failed when checking that Service 4 was selected. In `d-fields-focus-0`, the assertion immediately before that failure confirmed that the Service 4 field had focus.

The repaired test yields one microtask after the TOC click, then focuses the field before the next animation frame. It checks the focused field, the selected Tile and Inspector, and the absence of an anchor scroll. It also checks that deliberate heading, outline and TOC clicks still navigate. This test passed in `d-final-repairs-0`.

To repeat the standalone check, run `npm.cmd run test:browser -- tests/interaction-regressions.spec.ts --grep "Handbook fields select their owner without scrolling and explicit navigation remains active" --project chromium --repeat-each=3 --retries=0 --workers=1 --reporter=list` from `frontend`. All three repetitions passed on `2827d67` in 37.3 seconds. The per-test output is in `%TEMP%/ctroadmap-handbook-field-owner-1795282812407/chromium.log`.

## Review inventory

Branch `v0.10.1` started and ended at `af004c3d822708ed18e59a3c9e7abe8d95544192`. The Workspace Switcher hover repair was already in that commit. The supplied untracked M4 buildspec was present at preflight. Implementation remained in the worktree. Final status has 62 modified tracked files, 11 new implementation, test and report files, and that original untracked buildspec.

| Directory | Changed files |
|---|---|
| `(repository root)` | `PROJECT_LOG.md` |
| `dev/Localize` | **new** `M4_scope_and_gates.md` |
| `frontend/scripts` | `pseudo.mjs` |
| `frontend/src` | `App.tsx` |
| `frontend/src/components` | `HandbookAddressBook.tsx`, `HandbookLogoControl.tsx`, `HandbookPdfExportDialog.tsx`, `HandbookToc.tsx`, `HandbookView.tsx`, `Inspector.tsx`, `LeftSidebar.tsx`, `ManualCopyPanel.tsx` |
| `frontend/src/features/codeNotes` | `CodeDraftHost.tsx`, `CodeMinimap.tsx`, `CodeNoteEditor.tsx`, `CodeNoteReader.tsx`, `ComparisonPicker.tsx`, `DraftPrompt.tsx`, `DraftTabs.tsx`, `EditorExtensionsSettings.tsx`, `FullscreenShell.tsx`, `SaveCodeNote.tsx`, `atAtAdapter.ts`, `codeNotes.css`, `comparisonView.ts`, `context.tsx`, `languageCatalog.test.ts`, `validation.ts`, `validatorClient.test.ts`, `validatorClient.ts`, **new** `mismatchLabels.ts` |
| `frontend/src/features/handbook` | `handbook.css` |
| `frontend/src/features/handbookNotes` | `MarkdownNote.test.ts`, `MarkdownNote.tsx`, `NotePages.tsx`, `TileReferencePicker.tsx`, `model.ts`, `notePages.css`, `tileReference.test.ts` |
| `frontend/src/features/handbookNotes/export` | `NoteExportMenu.tsx`, `exportNote.ts`, `filename.ts`, `noteExportSource.ts` |
| `frontend/src/features/physicalDocumentation` | `PhysicalDocumentation.tsx` |
| `frontend/src/features/swimlane` | `HandbookSwimlaneCollection.tsx` |
| `frontend/src/i18n` | `README.md`, `context.json`, `manifest.json`, **new** `codeProblem.ts`, **new** `handbookLabels.ts`, **new** `handbookNotice.ts`, **new** `handbookUiError.ts` |
| `frontend/src/i18n/locales/en` | **new** `handbook.json` |
| `frontend/src/i18n/locales/en-XA` | **new** `handbook.json` |
| `frontend/src/lib` | `api.ts`, `handbookLogo.ts` |
| `frontend/src/styles` | `exports.css` |
| `frontend/tests` | `code-draft-reorder.spec.ts`, `code-draft-sessions.spec.ts`, `code-languages.spec.ts`, `code-notes.spec.ts`, `handbook-logo.spec.ts`, `handbook-pdf-export.spec.ts`, `handbook-toc-persistence.spec.ts`, `handbook-visibility.spec.ts`, `interaction-regressions.spec.ts`, `localization.spec.ts`, `note-export.spec.ts`, **new** `handbook-layout.spec.ts`, **new** `handbook-localization.spec.ts` |
| `frontend/tests/fixtures` | `handbook-pdf-dialog.tsx`, `localization-layout.ts`, **new** `handbook-language.ts` |

## Executed commands and outcomes

Commands ran from `frontend/` in PowerShell. Each browser invocation used its own subdirectory named `<run>-browser` under `$evidence`. The corresponding stdout/stderr files are `<run>-<index>.log`. A repeated command below lists each execution and its observed result. Counts on reruns include previously passing cases.

```powershell
$evidence = Join-Path $env:TEMP 'ctroadmap-m4-1795240991109'
# Set $run to the execution name (for example 'd-handbook').
$out = Join-Path $evidence "$run-browser"
```

`npm.cmd ci --no-audit --no-fund` passed once at preflight. The `npm.cmd run --silent i18n:pseudo` proposal, `npm.cmd run i18n:pseudo -- --write` and `npm.cmd run i18n:check` sequence ran after catalog edits. The retained proposals are `a-proposal.json`, `b-proposal.json`, `c-proposal.json`, `c-repair-proposal.json`, `d-proposal.json` and `d-complete-proposal.json`. The phase ratios were 1.405×, 1.406×, 1.407× and 1.406×. The production build includes its own typecheck.

| Command | Execution and observed result |
|---|---|
| `npm.cmd run i18n:check` | `baseline-0` (460 keys passed), `d-offline-1` (882 keys passed) |
| `npm.cmd run build` | `baseline-1` (production build passed), `a-0` (type error), `a-repair-0` (production build passed), `b-0` (type error), `b-repair-0` (production build passed), `c-0` (type error), `c-repair-0` (production build passed), `d-build-0` (production build passed), `d-review-1` (production build passed), `d-theme-1` (production build passed) |
| `npm.cmd test -- src/i18n/runtime.test.ts src/lib/handbookAddressBook.test.ts src/lib/handbookVisibility.test.ts src/lib/notePagesPersistence.test.ts` | `baseline-2` (46 passed) |
| `npm.cmd run test:browser -- tests/handbook-toc-defaults.spec.ts --output "$out"` | `baseline-3` (1 passed) |
| `npm.cmd test -- src/lib/handbookVisibility.test.ts src/features/swimlane/handbookCollection.test.ts src/features/handbookPdf/model.test.ts` | `a-1` (44 passed) |
| `npm.cmd run test:browser -- tests/handbook-localization.spec.ts tests/handbook-toc-defaults.spec.ts tests/handbook-toc-persistence.spec.ts tests/handbook-visibility.spec.ts tests/handbook-swimlane-outline.spec.ts tests/handbook-gradient.spec.ts --output "$out"` | `a-2` (1 failed, 2 skipped, 7 passed) |
| `npm.cmd run test:browser -- tests/handbook-visibility.spec.ts --output "$out"` | `a-visibility-0` (1 skipped, 2 passed) |
| `$env:CTR_HANDBOOK_TEST_API_URL = 'http://127.0.0.1:49404'; npm.cmd run test:browser -- tests/handbook-toc-persistence.spec.ts tests/handbook-visibility.spec.ts --output "$out"` | `a-backend-0` (1 failed, 3 passed) |
| `$env:CTR_HANDBOOK_TEST_API_URL = 'http://127.0.0.1:49404'; npm.cmd run test:browser -- tests/handbook-toc-persistence.spec.ts --output "$out"` | `a-persistence-0` (1 passed) |
| `npm.cmd test -- src/lib/handbookAddressBook.test.ts src/lib/handbookLogo.test.ts src/lib/notePagesPersistence.test.ts src/features/handbookNotes` | `b-1` (1 failed , 328 passed) |
| `npm.cmd run test:browser -- tests/handbook-notes.spec.ts tests/handbook-logo.spec.ts tests/handbook-copy.spec.ts tests/note-export.spec.ts tests/auto-links.spec.ts --output "$out"` | `b-2` (1 failed, 45 passed) |
| `npm.cmd test -- src/features/handbookNotes/tileReference.test.ts` | `b-repair-1` (54 passed) |
| `npm.cmd run test:browser -- tests/handbook-localization.spec.ts tests/handbook-logo.spec.ts --output "$out"` | `b-switch-0` (1 failed, 3 passed) |
| `npm.cmd run test:browser -- tests/handbook-localization.spec.ts -g 'rename, open' --output "$out"` | `b-picker-0` (1 passed) |
| `npm.cmd run test:browser -- tests/handbook-logo.spec.ts --output "$out"` | `b-logo-0` (1 passed) |
| `npm.cmd test -- src/features/codeNotes` | `c-1` (1 failed , 237 passed), `c-owned-1` (238 passed) |
| `npm.cmd run test:browser -- tests/code-notes.spec.ts tests/code-languages.spec.ts tests/code-editor-toggle.spec.ts tests/code-detection.spec.ts tests/code-drafts.spec.ts tests/code-draft-reorder.spec.ts tests/code-draft-sessions.spec.ts --output "$out"` | `c-2` (10 failed, 48 passed), `d-editor-0` (59 passed) |
| `npm.cmd run test:browser -- tests/code-draft-sessions.spec.ts -g 'live language switch' --output "$out"` | `c-live-0` (1 failed), `c-live2-0` (1 passed) |
| `npm.cmd test -- src/features/codeNotes/languageCatalog.test.ts` | `c-live-1` (11 passed) |
| `npm.cmd run test:browser -- tests/code-draft-sessions.spec.ts tests/code-draft-reorder.spec.ts tests/code-notes.spec.ts --output "$out"` | `c-repair-1` (33 passed) |
| `npm.cmd run test:browser -- tests/code-languages.spec.ts --output "$out"` | `c-languages-0` (6 failed, 3 passed), `c-owned-0` (9 passed) |
| `npm.cmd run typecheck` | `d-first-0` (typecheck passed), `d-offline-2` (typecheck passed) |
| `node --test scripts/catalogs.test.mjs` | `d-first-1` (7 passed), `d-build-3` (7 passed) |
| `npm.cmd run test:browser -- tests/handbook-pdf-export.spec.ts --output "$out"` | `d-first-2` (2 failed, 7 passed), `d-pdf-0` (9 passed) |
| `npm.cmd run test:browser -- tests/handbook-layout.spec.ts --output "$out"` | `d-layout-0` (2 failed), `d-measure-0` (2 passed), `d-theme-0` (2 passed) |
| `npm.cmd run test:browser -- tests/handbook-localization.spec.ts tests/note-export.spec.ts tests/code-notes.spec.ts -g 'rename, open\|all Handbook tabs\|explicit session recovery' --output "$out"` | `d-safety-0` (3 passed) |
| `npm.cmd test -- src/i18n/runtime.test.ts src/lib/handbookAddressBook.test.ts src/lib/handbookVisibility.test.ts src/lib/handbookLogo.test.ts src/lib/notePagesPersistence.test.ts src/features/handbookNotes src/features/codeNotes src/features/handbookPdf/model.test.ts` | `d-safety-1` (614 passed) |
| `npm.cmd run test:browser -- tests/handbook-pdf-export.spec.ts -g 'Physical Wiring and volume' --output "$out"` | `d-pdf-retry-0` (1 passed) |
| `npm.cmd run test:browser -- tests/handbook-layout.spec.ts tests/localization.spec.ts --output "$out"` | `d-presentation-0` (2 failed, 19 passed) |
| `$env:CTR_HANDBOOK_TEST_API_URL = 'http://127.0.0.1:49404'; npm.cmd run test:browser -- tests/handbook-toc-defaults.spec.ts tests/handbook-toc-persistence.spec.ts tests/handbook-visibility.spec.ts tests/handbook-swimlane-outline.spec.ts tests/handbook-gradient.spec.ts tests/handbook-copy.spec.ts tests/handbook-notes.spec.ts tests/handbook-logo.spec.ts tests/note-export.spec.ts tests/handbook-pdf-export.spec.ts tests/handbook-localization.spec.ts tests/physical-documentation.spec.ts --output "$out"` | `d-handbook-0` (67 passed) |
| `docker build --target frontend-build ..` | `d-build-1` (production build passed), `d-review-2` (production build passed), `d-theme-2` (Docker build passed) |
| `npm.cmd test -- src/i18n/runtime.test.ts src/lib/handbookAddressBook.test.ts src/lib/handbookVisibility.test.ts src/lib/handbookLogo.test.ts src/lib/notePagesPersistence.test.ts src/features/handbookNotes src/features/codeNotes src/features/handbookPdf src/features/physicalDocumentation/model.test.ts src/features/swimlane/handbookCollection.test.ts` | `d-build-2` (627 passed) |
| `npm.cmd run test:browser -- tests/auto-links.spec.ts tests/interaction-regressions.spec.ts -g 'Address Book\|Handbook Notes preserve\|Handbook fields select' --output "$out"` | `d-address-0` (2 failed, 3 passed) |
| `npm.cmd run test:browser -- tests/localization.spec.ts -g 'open menus translate' --output "$out"` | `d-action-0` (1 passed) |
| `$env:NODE_PATH = "$PWD/node_modules"; node "$evidence/offline-probe.cjs"` | `d-offline-0` (offline switch passed), `d-final-proof-0` (offline switch passed) |
| `npm.cmd run test:browser -- tests/interaction-regressions.spec.ts -g 'Handbook Notes preserve\|Handbook fields select' --output "$out"` | `d-interaction-0` (1 failed, 1 passed) |
| `node "$evidence/verify-baseline.cjs"` | `d-boundary-0` (baseline comparison passed), `d-final-proof-1` (baseline comparison passed) |
| `npm.cmd run test:browser -- tests/interaction-regressions.spec.ts -g 'Handbook fields select' --output "$out"` | `d-fields-0` (1 failed), `d-fields-focus-0` (1 failed) |
| `npm.cmd run test:browser -- tests/interaction-regressions.spec.ts tests/localization.spec.ts -g 'Handbook fields select\|preserves a focused field draft\|open menus translate' --output "$out"` | `d-final-repairs-0` (2 passed — Handbook field selection and open-menu translation. 1 failed — language switch with a focused draft, rerun below.) |
| `npm.cmd run test:browser -- tests/localization.spec.ts -g 'preserves a focused field draft' --output "$out"` | `d-field-locale-0` (1 passed) |
| `npm.cmd run test:browser -- tests/handbook-layout.spec.ts tests/handbook-localization.spec.ts tests/handbook-swimlane-outline.spec.ts tests/code-draft-reorder.spec.ts tests/code-draft-sessions.spec.ts --output "$out"` | `d-review-0` (22 passed) |
| `$env:CTR_HANDBOOK_TEST_API_URL = 'http://127.0.0.1:49404'; $env:NODE_PATH = "$PWD/node_modules"; node "$evidence/pdf-probe.cjs"` | `d-doc-0` (791,122-byte PDF) |
| `python -m pip install --disable-pip-version-check --no-deps --target "$evidence/pdf-test-tools" pypdf==6.19.0` | `d-reader-0` (installed in temp) |
| `$env:PYTHONPATH = "$evidence/pdf-test-tools"; python "$evidence/read-fixture.py"` | `d-doc-text-0` (5 pages passed) |
| `npm.cmd run test:browser -- tests/localization.spec.ts --output "$out"` | `d-shell-0` (19 passed) |

The disposable API bound only to loopback. Its data, imports and exports used temporary filesystems, and its current backend source was mounted read-only. `docker stop ctroadmap-m4-fixture-1795240991109` removed that `--rm` fixture after the PDF and persistence checks. The dedicated Vite fixture was also stopped. `git diff --check` passed. Vite reported its existing chunk-size and featuredrop module-externalization warnings. The frontend package defines no separate lint script.
