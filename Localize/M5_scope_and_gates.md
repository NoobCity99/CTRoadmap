# M5 Rack and physical localization

## Checkout and baseline

Branch `v0.10.1` started at `faac2370afd626498f77145b25c3d2f1199396a5`. The supplied M5 buildspec was the only untracked file. The index and tracked worktree were clean. Existing dependencies were installed. The baseline build (including typecheck), catalog check (882 keys, 1.406×), four focused unit suites (42 cases) and the Connect Table, Rack PNG and Rack view toggle browser suites (seven cases) passed. Front and Rear PNG captures accompany the baseline log.

## Source and data ownership

| Phase | Consumers | Display ownership and canonical inputs |
|---|---|---|
| M5a | RackWorkspace, RackPalette, RackToolbar, RackInspector, RackCreateDialog, RackDeleteDialog, RackEquipmentMenu, RackSettingsPanel, RackAppearanceControls, RackLogoSettings, RackLogoPickerModal, RackElevationControl, RackPresentationControl | Translate fixed UI and transient notices. Keep drag payloads, modes, placement titles, creation defaults, search inputs, feedback URL, logo assets and stored material choices canonical. The shared rotating control renders caller-owned captions. |
| M5b | RackHardwareSettings, RackRearHardware, RackPromotionDialog, RackPlacement, RackElevation, AbsBlankPanelInspector, FaceplateSettings, PortOverlay, DriveBaySetup, DriveBaySlots, ServerStorageInspector, ServerStorageIndicators, PhysicalPortsEditor, PhysicalPortPicker, PoeControl | Translate editor and accessibility labels. IDs, socket assignment, technical connector and signal notation, port names, graphic positions and Drive membership belong to the model. |
| M5c | CableInteractions, CablePopover, CableConnectionInfo, CableLabelEditor, CableColorInput, CablePaletteSettings, RackConnectionStrip, RackCableLayer, ConnectTable | Translate interactive labels. Cable descriptions, numbers, endpoint signatures, graph paths, ordering, colors and circuit keys retain their original identities. |
| M5d | PhysicalDocumentation, HandbookView, PngExportOptionsDialog | Translate live preview and options. The documentation builder, rendered PDF, captured Rack title block and export scene use their original content. |

The development calibration tool is reachable only behind `import.meta.env.DEV` and `?rackCalibration=1` in `frontend/src/main.tsx`. Mobile Rack and Handbook share desktop primitives and retain English through the reader's language provider. Dictionaries, model validation, physical numbering, routing, image rendering, SVG assets and backend templates are separate owners.

## M5a gate

The English master gained 325 Rack keys. Catalog check, production build and 192 unit cases passed. All 67 selected existing browser cases and the creation-draft localization case passed across the initial run and focused reruns. A translated two-line caption restored the compact removal button in both themes. The Rack save fixture now supplies a revision on load, save and history transitions. The simulated HTTP 500 is reported by the existing save coordinator as an unconfirmed save. Its regression checks that status before retrying. An independently managed Vite server removed interference between simultaneous Playwright runs. The backend branding case verified real upload, reuse, cancellation, save, history, import and PNG pixels.

## M5b gate

Hardware, ABS and faceplate editors, physical ports, PoE, Drive Bays and server storage added 346 Rack messages. Localized connector and role captions retain canonical option values and keyboard commands. The Drive Bay picker keeps separate display and search descriptions. A switch while filtering a dense port picker preserved the focused input, the exact result DOM node, the physical target bounds and the complete fixture Atlas. An edit to the same port in English and Pseudo-English produced identical port records through Undo and Redo.

The gate passed with 1,553 catalog keys, a production build, 924 unit cases across the Rack and physical feature directories, and all 67 existing browser cases. The backend server-storage case exercised save, history, import and PDF. Static markup checks now mount translated components with initialized English resources.

## M5c gate

Cable actions, destinations, trace controls, color and label tools, the connection strip and the live Connect Table added 139 messages, bringing the catalog to 1,692 keys. Route calculation and canonical destination matching use the existing endpoint descriptions. Display callers can supply translated face and status captions. A language change kept the cross-Rack destination search focused and its source armed. Completing the connection in Pseudo-English saved the expected owner, port and Rack placement. The cable rename test preserved the open popover, caret, selected items, expanded circuit and row keys before saving the Unicode label.

All 113 cable and documentation unit cases and all 48 selected existing browser cases passed. Separate original-commit runs confirmed the extra eligible Fiber port and the read-only mobile picker's role in the older fixtures.

## M5d gate

The final pass added 112 Rack messages covering physical documentation, PNG options and remaining presentation adapters. The English master now has 1,804 keys, including 922 in `rack`. All 882 original values in each language matched the baseline. The pseudo catalog has 59,623 expanded letters for 42,473 translatable letters (1.404×). The zero-letter messages are `canvas:palette.url`, `canvas:search.linkDetail`, `canvas:tile.swimlaneSummary`, `rack:component.ups`, `rack:cables.selected` and `rack:cableLayer.description`. These consist of protected technical notation or placeholders and punctuation.

The catalog and context checks, seven catalog-tool tests, TypeScript, Vite production build, 974 focused unit cases and the frontend Docker build passed. The final consolidated 56-case documentation, shared shell, PDF, PNG and mobile run passed 55 together. The remaining Classic long-English case passed on its own. Its trace showed the pointer moving onto a workspace switcher while the neighboring focused control was expanding. The test now waits for that transition before checking the hovered and focused titles. Classic and ZIMA then passed together. Six new live and history cases cover a Rack creation dialog, a port picker, cable editing, the Inspector and settings, physical documentation, and equivalent port edits. Four additional layout cases exercise both themes. The production browser smoke selected Pseudo-English through Settings while offline and updated the mounted Rack toolbar with zero network requests.

### Screen measurements

Chromium exercised Classic and ZIMA at 1440, 1280, 1024, 920, 680 and 390 CSS pixels. Each layout fixture used English, Pseudo-English, a long English phrase and a 72-character unbroken compound. The Rack test also captured the compact English view at 1920px. Measurements included painted text ranges, scroll-to-control access, pointer hit testing, SVG view boxes, rendered equipment and port bounds relative to the Rack viewport, and cable paths. The popover tests covered settings, the port editor and picker, cable actions, and the Connect Table. At narrow desktop widths, action groups scroll within the toolbar. At 1024px the Rack header uses spare brand width before wrapping the actions. The earlier layout shifted the centered drawing by 16.5px. The final checks retain the same drawing and port coordinates across language changes. These measurements used CSS viewports and the default desktop Chromium device scale. Actual browser zoom and physical touch hardware were outside this run.

### Export and persistence evidence

The three 742×694 Front, Rear and repeated Front PNGs matched the original captures byte for byte. The second and third exports started under Pseudo-English. The full and compact connection-table PNG cases also checked the captured English title-block captions and column names.

| Capture | SHA-256 |
|---|---|
| Front and repeated Front | `16f3cf55e2f7f0ae64eccb0c60262269b6dc455704ef752bd65e4fa3d1e48901` |
| Rear | `954a8dbef6dc9974401a63122fd90fc099b5586a14d630ac87b7b24f940cc3be` |
| 32-page Handbook PDF in English and Pseudo-English | `768c8182f5f96dc3b1b0b70997805b08e162c5abe97786fee1ae6d4228c11b2b` |

The two real PDF exports sent identical physical-document payloads. Every page's extracted text matched, including the Physical Wiring section and the renamed port. The PDFs also matched byte for byte in this run. The PDF test covered save/reload, Undo/Redo and JSON replacement through an isolated backend. The editable fixtures preserved their Unicode text, stock component titles, physical numbers, endpoint identities, slot assignments and history during language-only switches. The shared Canvas pixel comparison passed with localized captions and unchanged authored fields. The Swimlane PNG case passed its complete drawing, title-block and zero-write checks.

### Checkout and handoff

All four M5 gates passed. Across the gates and shared export checks, all 250 distinct selected Chromium cases passed in their final applicable run. Mobile-owned UI, the calibration tool and generated export translation remain with their respective later owners.

The developer committed the in-progress checkout during verification. Branch `v0.10.1` advanced to `c67e6f67ee6d17ea607f8966cede5a3976b6bf50` (`M5 localize pass1`). That commit contains the work present at the time and the supplied buildspec. The implementation session preserved it. The final index is empty. The remaining checkout differences and the source-file list are recorded in the [verification ledger](M5_verification.md).

The [source inventory](M5_source_inventory.md) identifies presentation consumers, transient diagnostics, editable values, code and export boundaries. Composite placement addresses and legacy details that embed authored strings retain their source spelling where constituent fields are unavailable. Mobile-owned copy, calibration tools, backend-generated documents and later localization milestones retain their existing owners.

## 2026-11-23 follow-up

**Five display corrections passed.** Branch `v0.10.1` started and ended at `51e615e8a678eefc2424fc11c5b8d35a7540e318`. The checkout started clean. The changes below are unstaged.

| Surface | Verified behavior |
|---|---|
| Add from Atlas | Built-in types use the existing Canvas Tile adapter. The original search input, matching, ordering, 40-result cap and disabled rows still apply. Custom Equipment classifications and editable titles retain their spelling. |
| RELATED Drive tooltip | Direct and nested ancestry use structured parent-link counts and bounded ancestor titles. The accessible description, badge and row share the localized tooltip. The model still supplies its original English tooltip. |
| Placement readout | Valid, adapted and invalid native drags update in place in Classic and ZIMA. The target DOM element, hit test, bounds, fit record and cache key agree. The formatter also covers manual moves, top slots, ABS cell spans and click-to-add feedback. |
| Server-slot accessibility | The placement and indicator use the same slot formatter. Assigned Drive names and slot numbering retain their original values. The entire captured elevation SVG stayed identical when the desktop language changed. |
| Duplicate placement warning | The palette, physical port editor and cable announcements use structured Rack locations. The English warning agrees with the canonical validator. A blocked cable operation stayed blocked across a switch and became available after the conflicting placement was removed. |

The focused live-switch fixtures produced zero Atlas requests, including writes, refetches and history operations. Unknown validator details pass through verbatim. No requested string was deferred.

### Catalog and file inventory

Both catalogs now contain 1,835 keys. All 1,804 pre-cleanup values in each language matched the starting revision. The deterministic proposal matched the shipped pseudo catalog, with 60,663 expanded letters for 43,206 source letters (1.404×). All 31 additions belong to `rack`.

| Key prefix | New keys under that prefix |
|---|---|
| `relatedDrive` | `directParent`, `ancestor`, `via`, `assign`, `configure`, `type.secret_ref`, `type.iot_device`, `type.url` |
| `placement` | `inside`, `conflictItem`, `conflicts` |
| `fit` | `column.left`, `column.center`, `column.right`, `column.invalid`, `abs`, `fullWidth`, `partialWidth`, `halfDepth`, `fullDepth`, `move.full`, `move.half`, `move.third`, `adapted`, `noFit`, `overlap`, `occupiedTop` |
| `errors` | `noAdaptiveFit`, `noSupportedFootprint`, `outsideRackRange`, `absTopSlot` |

| Directory | Changed files |
|---|---|
| Repository root and `dev/Localize/` | `PROJECT_LOG.md`, `M5_scope_and_gates.md` |
| `frontend/scripts/` | `pseudo.mjs` |
| `frontend/src/i18n/` | `context.json`, `locales/en/rack.json`, `locales/en-XA/rack.json`, `rackDiagnostic.ts` |
| `frontend/src/features/rack/` | `RackPalette.tsx`, `RackPlacement.tsx`, `RackWorkspace.tsx`, `cables/CableInteractions.tsx`, `rackPlacementDisplay.ts`, `rackPlacementDisplay.test.ts`, `serverStorageDisplay.ts`, `serverStorageModel.ts` |
| `frontend/src/features/physicalPorts/` | `PhysicalPortsEditor.tsx` |
| `frontend/tests/` | `physical-cables-continuity.spec.ts`, `rack-adaptive-fit.spec.ts`, `server-storage.spec.ts` |

### Commands and results

Commands ran from `frontend/`. Every browser invocation used its own `--output` directory under `%TEMP%/ctroadmap-m5-cleanup-00e31563-539a-4b7c-8c9d-a57bfe535fc5`. The initial two PNG cases supplied the export baseline. The 80 distinct Chromium cases below all passed in their final applicable run.

| Checks | Result |
|---|---|
| `npm run --silent i18n:pseudo`, `npm run i18n:pseudo -- --write`, `npm run i18n:check`, `node --test scripts/catalogs.test.mjs` | Proposal inspected, key/placeholder/context validation passed, seven tool tests passed. |
| `npm run typecheck`, `npm run build` | Both passed after correcting two translation-local variable types and replacing three test-only uses of ES2022 `Array.at` with indexing supported by the project's ES2020 target. |
| `npm test --` with `rackPlacementDisplay`, `serverStorageModel`, `rackAdaptiveFit`, `rackPlacementIndex`, `rackFitPreview`, `rackPaletteDrag`, `rackGeometry`, `rackModel`, `rackPngExport`, `cableCreation` and `connectTable` test files | 187 of 187 passed in 11 suites, including all four new model/display boundary tests. |
| `npm run test:browser -- tests/rack-localization.spec.ts tests/rack-localization-layout.spec.ts tests/rack.spec.ts tests/rack-png-export.spec.ts tests/physical-connect-table.spec.ts --workers 3` | 31 of 31 passed. |
| `npm run test:browser -- tests/server-storage.spec.ts tests/rack-adaptive-fit.spec.ts --workers 2` | 45 of 46 passed together. The new Classic case **live Rack palette, duplicate warning and server accessibility preserve inventory in classic** used a 26-character custom classification. The model enforces a 25-character limit. A shorter fixture kept the Unicode, HTML-like text and braces. Rerunning `tests/server-storage.spec.ts --grep "live Rack palette"` passed Classic and ZIMA, 2 of 2. |
| `npm run test:browser -- tests/physical-cables-continuity.spec.ts tests/physical-ports.spec.ts --grep "search selects the shared Tile&#124;duplicate Rack locations"` | Both duplicate-location cases passed. |
| `npm run test:browser -- tests/physical-documentation-integration.spec.ts` with `CTR_HANDBOOK_TEST_API_URL` pointing at a disposable loopback backend | Passed the save/reload, history, import and Handbook PDF case. Both locales sent identical export payloads and produced identical PDF bytes. |

Front, Rear and repeated Front Rack PNGs matched the pre-edit captures. The occupied-server PNG also matched byte for byte, SHA-256 `0d98a04c962d0db74ece1ca248529b7e12a9b555d58a2e1bc79be263ebcad2f0`. Both Handbook PDFs had SHA-256 `cf6981c29e72440924351513416190867808c20ca0d7952f081510951bca3bf2`.
