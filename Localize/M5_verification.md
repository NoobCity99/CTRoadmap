# M5 verification

Commands ran from the frontend directory on branch <code>v0.10.1</code> starting at <code>faac2370afd626498f77145b25c3d2f1199396a5</code>. The developer committed the in-progress checkout at 11:07:56 -0800 during verification. Subsequent runs used <code>c67e6f67ee6d17ea607f8966cede5a3976b6bf50</code> plus the remaining working-tree edits. The baseline and original-checkout comparison runs used the starting revision. Other runs used the working tree at the indicated gate. Chromium used zero retries. The container API environment variables pointed at a disposable loopback backend. Raw receipts, proposals, screenshots and exports are under <code>%TEMP%/ctroadmap-m5-1a8d578c-0488-485e-bd00-f02401821a2c</code>.

All 250 distinct selected Chromium cases passed in their final applicable runs. Results below retain earlier failures and the dedicated backend rerun for the initial skip.

## Browser receipts

The output directory is represented by <code>&lt;receipt-directory&gt;</code>. Selectors following a grep flag were passed as one argument. Counts belong to each invocation and include reruns. The revision column records HEAD when the receipt began. Baseline comparisons used an isolated checkout. The full-stack checks set the relevant <code>CTR_STAGE2_TEST_API_URL</code>, <code>CTR_SERVER_STORAGE_TEST_API_URL</code> or <code>CTR_HANDBOOK_TEST_API_URL</code> to the temporary backend.

| Receipt | HEAD | Invocation | Passed | Failed | Skipped |
|---|---|---|---:|---:|---:|
| <code>baseline-browser</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-png-export.spec.ts tests/physical-connect-table.spec.ts tests/rack-view-toggles.spec.ts --output &lt;receipt-directory&gt;</code> | 7 | 0 | 0 |
| <code>a-browser</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack.spec.ts tests/rack-settings.spec.ts tests/rack-view-toggles.spec.ts tests/rack-palette-collapse.spec.ts tests/rack-inspector-layout.spec.ts tests/rack-inspector-face.spec.ts tests/rack-presentation.spec.ts tests/rack-appearance-stage2.spec.ts tests/rack-branding-stage2.spec.ts tests/rack-deletion.spec.ts --workers 3 --output &lt;receipt-directory&gt;</code> | 49 | 17 | 1 |
| <code>a-live</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>a-repair</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-inspector-layout.spec.ts --output &lt;receipt-directory&gt;</code> | 2 | 0 | 0 |
| <code>a-save-repair</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack.spec.ts tests/rack-settings.spec.ts --workers 3 --output &lt;receipt-directory&gt;</code> | 18 | 6 | 0 |
| <code>a-final</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack.spec.ts tests/rack-settings.spec.ts --grep switches Rack as&#124;attaches Atlas Drives&#124;preserves custom Rack&#124;Rack selection and pointer&#124;Rack drag preserves&#124;failed save retains --workers 2 --output &lt;receipt-directory&gt;</code> | 6 | 0 | 0 |
| <code>a-backend</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-branding-stage2.spec.ts --grep real upload --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>a-presentation</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-presentation.spec.ts --grep keeps custom upload --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>b-browser</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-ports.spec.ts tests/rack-hardware.spec.ts tests/rear-port-spacing.spec.ts tests/rack-port-picker.spec.ts tests/rack-port-order.spec.ts tests/drive-bay-integration.spec.ts tests/drive-bay-backplane.spec.ts tests/server-storage.spec.ts tests/server-storage-integration.spec.ts tests/rack-local-deletion.spec.ts --workers 3 --output &lt;receipt-directory&gt;</code> | 67 | 0 | 0 |
| <code>b-live</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts --grep dense port picker --output &lt;receipt-directory&gt;</code> | 0 | 1 | 0 |
| <code>b-live2</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts -g dense port --workers 1 --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>b-final-browser</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts tests/rack-hardware.spec.ts tests/rack-port-picker.spec.ts --workers 2 --output &lt;receipt-directory&gt;</code> | 8 | 1 | 0 |
| <code>b-creation-confirm</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts -g focused creation --workers 1 --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>c-browser</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-cables.spec.ts tests/physical-cables-final.spec.ts tests/physical-cables-continuity.spec.ts tests/physical-cables-render.spec.ts tests/loose-cables.spec.ts tests/cable-destination-search.spec.ts tests/physical-cable-pulse.spec.ts tests/physical-connect-table.spec.ts tests/rack-circuit-identification.spec.ts --workers 3 --output &lt;receipt-directory&gt;</code> | 43 | 5 | 0 |
| <code>c-live</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts -g open cable rename --output &lt;receipt-directory&gt;</code> | 0 | 1 | 0 |
| <code>c-live2</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts -g open cable rename --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>c-original</code> | <code>faac237</code> | <code>npm run test:browser -- tests/cable-destination-search.spec.ts tests/physical-cables-continuity.spec.ts -g filters to eligible&#124;rear to front wiring --workers 2 --output &lt;receipt-directory&gt;</code> | 1 | 1 | 0 |
| <code>c-continuity-confirm</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-cables-continuity.spec.ts -g rear to front wiring --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>c-mobile-original</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-cables-render.spec.ts tests/physical-cable-pulse.spec.ts -g 320px dismisses&#124;mobile read-only tap --workers 2 --output &lt;receipt-directory&gt;</code> | 0 | 2 | 0 |
| <code>c-repairs</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-cables-render.spec.ts tests/physical-cable-pulse.spec.ts tests/cable-destination-search.spec.ts -g dismisses cable info&#124;mobile read-only tap&#124;filters to eligible --workers 3 --output &lt;receipt-directory&gt;</code> | 2 | 2 | 0 |
| <code>c-mobile2</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-cables-render.spec.ts -g dismisses cable info --workers 1 --output &lt;receipt-directory&gt;</code> | 0 | 2 | 0 |
| <code>c-mobile3</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-cables-render.spec.ts -g dismisses cable info --workers 1 --output &lt;receipt-directory&gt;</code> | 2 | 0 | 0 |
| <code>d-browser</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-documentation.spec.ts tests/physical-documentation-integration.spec.ts tests/rack-png-export.spec.ts tests/handbook-pdf-export.spec.ts tests/handbook-localization.spec.ts tests/localization.spec.ts tests/workspace-switcher-height.spec.ts tests/mobile-rack.spec.ts --workers 3 --output &lt;receipt-directory&gt;</code> | 50 | 6 | 0 |
| <code>d-matrix</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization-layout.spec.ts --workers 2 --output &lt;receipt-directory&gt;</code> | 2 | 0 | 0 |
| <code>d-live</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts --workers 1 --output &lt;receipt-directory&gt;</code> | 5 | 0 | 0 |
| <code>d-pdf-detail</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-documentation-integration.spec.ts --output &lt;receipt-directory&gt;</code> | 0 | 1 | 0 |
| <code>d-pdf-stages</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-documentation-integration.spec.ts --output &lt;receipt-directory&gt;</code> | 0 | 1 | 0 |
| <code>d-pdf-import</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-documentation-integration.spec.ts --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>d-repairs</code> | <code>faac237</code> | <code>npm run test:browser -- tests/workspace-switcher-height.spec.ts tests/localization.spec.ts tests/handbook-pdf-export.spec.ts -g stable switcher height.*Pseudo-English&#124;English toolbar, menus and workspace labels fit in ZIMA&#124;default options and save flushing --workers 2 --output &lt;receipt-directory&gt;</code> | 6 | 0 | 0 |
| <code>d-final-rack</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-png-export.spec.ts tests/physical-connect-table.spec.ts tests/rack-view-toggles.spec.ts tests/rack-inspector-layout.spec.ts tests/rack-localization.spec.ts tests/rack-localization-layout.spec.ts tests/rack-hardware.spec.ts --workers 2 --output &lt;receipt-directory&gt;</code> | 19 | 2 | 0 |
| <code>d-physical-history</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization.spec.ts -g editing the same physical port --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>d-code-confirm</code> | <code>faac237</code> | <code>npm run test:browser -- tests/localization.spec.ts -g unsaved CodeMirror --output &lt;receipt-directory&gt;</code> | 0 | 1 | 0 |
| <code>d-toolbar</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-view-toggles.spec.ts tests/rack-localization-layout.spec.ts --workers 2 --output &lt;receipt-directory&gt;</code> | 3 | 2 | 0 |
| <code>d-code-fixed</code> | <code>faac237</code> | <code>npm run test:browser -- tests/localization.spec.ts -g unsaved CodeMirror --output &lt;receipt-directory&gt;</code> | 0 | 1 | 0 |
| <code>d-code-clean</code> | <code>faac237</code> | <code>npm run test:browser -- tests/localization.spec.ts -g unsaved CodeMirror --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>d-toggle-final</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-view-toggles.spec.ts --output &lt;receipt-directory&gt;</code> | 3 | 0 | 0 |
| <code>final-matrix</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization-layout.spec.ts --workers 2 --output &lt;receipt-directory&gt;</code> | 3 | 1 | 0 |
| <code>final-regression</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-cables-continuity.spec.ts tests/physical-cables-render.spec.ts tests/loose-cables.spec.ts tests/rack-localization.spec.ts tests/physical-connect-table.spec.ts tests/rack-png-export.spec.ts tests/rack-view-toggles.spec.ts --workers 3 --output &lt;receipt-directory&gt;</code> | 27 | 0 | 0 |
| <code>final-pdf</code> | <code>faac237</code> | <code>npm run test:browser -- tests/physical-documentation-integration.spec.ts --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>matrix-clean</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization-layout.spec.ts -g Rack controls and physical records remain reachable in classic --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>final-armed</code> | <code>faac237</code> | <code>npm run test:browser -- tests/cable-destination-search.spec.ts --output &lt;receipt-directory&gt;</code> | 2 | 0 | 0 |
| <code>matrix-geometry</code> | <code>faac237</code> | <code>npm run test:browser -- tests/rack-localization-layout.spec.ts --output &lt;receipt-directory&gt;</code> | 2 | 2 | 0 |
| <code>matrix-metrics</code> | <code>c67e6f6</code> | <code>npm run test:browser -- tests/rack-localization-layout.spec.ts -g remain reachable in classic --output &lt;receipt-directory&gt;</code> | 0 | 1 | 0 |
| <code>matrix-header</code> | <code>c67e6f6</code> | <code>npm run test:browser -- tests/rack-localization-layout.spec.ts -g Rack controls and physical records --workers 2 --output &lt;receipt-directory&gt;</code> | 2 | 0 | 0 |
| <code>release-geometry</code> | <code>c67e6f6</code> | <code>npm run test:browser -- tests/rack-localization-layout.spec.ts tests/rack-view-toggles.spec.ts --workers 2 --output &lt;receipt-directory&gt;</code> | 7 | 0 | 0 |
| <code>release-browser</code> | <code>c67e6f6</code> | <code>npm run test:browser -- tests/physical-documentation.spec.ts tests/physical-documentation-integration.spec.ts tests/rack-png-export.spec.ts tests/handbook-pdf-export.spec.ts tests/handbook-localization.spec.ts tests/localization.spec.ts tests/workspace-switcher-height.spec.ts tests/mobile-rack.spec.ts --workers 3 --output &lt;receipt-directory&gt;</code> | 55 | 1 | 0 |
| <code>release-shared-png</code> | <code>c67e6f6</code> | <code>npm run test:browser -- tests/png-export.spec.ts tests/swimlane-png-export.spec.ts --grep downloaded Canvas PNG pixels&#124;exports a complete Handbook Swimlane --workers 1 --output &lt;receipt-directory&gt;</code> | 1 | 1 | 0 |
| <code>release-shared-png-confirm</code> | <code>c67e6f6</code> | <code>npm run test:browser -- tests/png-export.spec.ts tests/swimlane-png-export.spec.ts --grep downloaded Canvas PNG pixels&#124;exports a complete Handbook Swimlane --workers 1 --output &lt;receipt-directory&gt;</code> | 2 | 0 | 0 |
| <code>release-long-shell</code> | <code>c67e6f6</code> | <code>npm run test:browser -- tests/localization.spec.ts --grep long English toolbar, menus and workspace labels fit in Classic --workers 1 --output &lt;receipt-directory&gt;</code> | 1 | 0 | 0 |
| <code>release-hover-final</code> | <code>c67e6f6</code> | <code>npm run test:browser -- tests/localization.spec.ts --grep long English toolbar, menus and workspace labels fit --workers 1 --output &lt;receipt-directory&gt;</code> | 2 | 0 | 0 |

## Initial failures and repairs

| Run or case | Diagnosis and change |
|---|---|
| Rack Inspector compact controls in Classic and ZIMA | Restored the two-line removal caption and reran both themes. |
| Rack save, drag and history cases | The fixture needed valid revision headers on Atlas reads, writes and history operations. The failure notification now checks the existing unconfirmed-save diagnostic. Connection-refused and Vite-overlay interruptions were rerun on a separately managed dev server. |
| Rack upload integration | The initial browser invocation omitted its isolated backend. The dedicated backend run covered upload and reuse, cancellation, save, import, history and PNG. |
| Hardware typecheck and static render tests | Used the supported ES target for property checks. Server-rendered tests for translated components now provide initialized English resources. |
| Dense port picker live test | The normalized fixture had a generated physical number. The test now supplies a known custom Unicode port name and selects the same canonical port ID. |
| Cable destination search | The original commit also offered the data-compatible Fiber B port. The test now verifies all five destinations and the selected cross-Rack endpoint. |
| Cable rename live test | Opening cable actions intentionally changes the active selection. The test records the active state immediately before switching language, separately verifies trace activation, and checks the unchanged row order and draft. |
| Optional slot numbers | Typed interpolation requires a printable slot. The display adapters preserve the former template-string conversion. |
| Mobile pulse and 320px/390px cable info | Existing fixtures assumed an individual SVG target. The actual read-only renderer also offers a compact port picker. The tests use either entry point, establish equipment selection before measuring the overlay, and verify the populated Bay name with its Drive count. Production mobile behavior is unchanged. Original-commit comparison reproduced the stale target assumption. |
| Physical-document PDF integration | Normal edits correctly rejected preconfigured hardware and retired port numbers during fixture seeding. Seed the complete disposable Atlas through its snapshot-import contract, then test ordinary edits, history and PDF generation. |
| Workspace switcher and shared Handbook PDF / shell | The switcher fixture now targets the module URL loaded by Vite. Transient development overlays and navigation during recompilation were rerun with stable assets. |
| CodeMirror localization | Comparison builds sharing a development dependency cache caused duplicate CodeMirror state instances. A clean Vite optimizer run restored the single-instance editor. An attempted resource lookup failed when browser resource timing had evicted the entry. The original editor assertion and module lookup passed on the clean server. |
| Toolbar layout | A single scrolling toolbar broke English wrapping at 1050px. Keep the original grouping and constrain scrolling to the caption group. Group-specific flex rules retain the original alignment and divider. |
| Compact desktop Rack header | At 1024px the toolbar moved the Rack and port screen coordinates by 16.5px during a language change. The Rack header now lets its brand yield width before the action row wraps. The same matrix passed in Classic and ZIMA in <code>release-geometry</code>. |
| Shared-shell simultaneous hover and focus | The trace recorded the pointer at x=134.5px while keyboard focus was expanding the neighboring Handbook control. The Rack title remained at opacity 0. The test moves the pointer off the switcher, waits for focus disclosure and the measured animations, then hovers Rack. The original two visible-title assertions remain. |
| Canvas PNG comparison | The direct Vite module import instantiated an uninitialized i18next object. The test now uses the existing cross-tab language-switch fixture. The final Canvas pixel comparison and Swimlane PNG case passed together in <code>release-shared-png-confirm</code>. |
| Production offline smoke | The preview fixture initially left an onboarding overlay active. The final smoke used the existing preview route to suppress onboarding and exercised the language radio with all subsequent network requests blocked. |

## Browser cases

Each row gives the outcome in the last applicable completed run and the receipts for earlier failures or skips. Original-revision comparison failures remain visible.

| Suite | Case | Final completed receipt | Earlier failures / skips |
|---|---|---|---|
| <code>cable-destination-search.spec.ts</code> | Find Destination explains an empty eligible set without enabling invalid ports or saving | <code>final-armed</code> passed | — |
| <code>cable-destination-search.spec.ts</code> | Find Destination filters to eligible Rack placements and connects a selected cross-rack canonical port | <code>final-armed</code> passed | c-browser (failed), c-original (failed) |
| <code>drive-bay-backplane.spec.ts</code> | INSIDE gives Drive-owned port editors full width and preserves editing and history | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | Linked Bay backplane: setup, fixed slot, actual cable, removal and history | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | Linked Bay direct: setup, fixed slot, actual cable, removal and history | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | Local Bay backplane: setup, fixed slot, actual cable, removal and history | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | Local Bay direct: setup, fixed slot, actual cable, removal and history | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | dense Direct slot picker keeps qualified owners when imported Drive port IDs repeat | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | empty configured Bay keeps INSIDE available when its Atlas host is missing | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | linked decommission/recreate retires BP numbers; failed setup save retries the same identities | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | new local and linked Bay placements immediately require setup and preserve cancellation on reload | <code>b-browser</code> passed | — |
| <code>drive-bay-backplane.spec.ts</code> | twelve fixed slots and port references agree in PNG and mobile read-only | <code>b-browser</code> passed | — |
| <code>drive-bay-integration.spec.ts</code> | Equipment/Rack M2.1: linked bay rejects a cyclic insertion without dirtying Atlas | <code>b-browser</code> passed | — |
| <code>drive-bay-integration.spec.ts</code> | Equipment/Rack M2.1: populated promotion, orphan-only insertion, classification guard, removal and Undo/Redo | <code>b-browser</code> passed | — |
| <code>handbook-localization.spec.ts</code> | open address validation follows the language and preserves the focused draft | <code>release-browser</code> passed | — |
| <code>handbook-localization.spec.ts</code> | rename, open reference search and insertion retain the original note and field identities | <code>release-browser</code> passed | — |
| <code>handbook-localization.spec.ts</code> | switching the open volume preserves its outline, relationships and editable metadata | <code>release-browser</code> passed | — |
| <code>handbook-pdf-export.spec.ts</code> | Export → Handbook PDF omits empty Unassigned and uploads Families and Swimlanes despite a missing uploaded icon | <code>release-browser</code> passed | — |
| <code>handbook-pdf-export.spec.ts</code> | Export → Handbook PDF omits empty Unassigned and uploads Families and Swimlanes with default options and save flushing | <code>release-browser</code> passed | d-browser (failed) |
| <code>handbook-pdf-export.spec.ts</code> | PDF options exclude=false, full=false, classic: projection, retry and live Handbook preserved | <code>release-browser</code> passed | — |
| <code>handbook-pdf-export.spec.ts</code> | PDF options exclude=false, full=true, zima: projection, retry and live Handbook preserved | <code>release-browser</code> passed | — |
| <code>handbook-pdf-export.spec.ts</code> | PDF options exclude=true, full=false, zima: projection, retry and live Handbook preserved | <code>release-browser</code> passed | — |
| <code>handbook-pdf-export.spec.ts</code> | PDF options exclude=true, full=true, classic: projection, retry and live Handbook preserved | <code>release-browser</code> passed | — |
| <code>handbook-pdf-export.spec.ts</code> | Physical Wiring and volume selections control the PDF, survive retry, and reset on reopening | <code>release-browser</code> passed | — |
| <code>handbook-pdf-export.spec.ts</code> | Snapshot availability changes reset only exclusion within the same open modal | <code>release-browser</code> passed | — |
| <code>handbook-pdf-export.spec.ts</code> | a failed Atlas flush blocks the PDF request and leaves a clear modal error | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | Canvas editor and PNG options accommodate longer labels in Classic | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | Canvas editor and PNG options accommodate longer labels in ZIMA | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | a compact English header grows only when the labels require it, independently of the locale ID | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | a failed save keeps its diagnostic and rerenders locally generated guidance on language change | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | a language switch preserves a focused field draft, its canonical keys and Atlas history | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | an explicit selection survives reload and synchronizes with another tab, including removal | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | denied language preference reads and writes still allow in-memory switching | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | language-neutral shell layout › English toolbar, menus and workspace labels fit in Classic | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | language-neutral shell layout › English toolbar, menus and workspace labels fit in ZIMA | <code>release-browser</code> passed | d-browser (failed) |
| <code>localization.spec.ts</code> | language-neutral shell layout › Pseudo-English toolbar, menus and workspace labels fit in Classic | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | language-neutral shell layout › Pseudo-English toolbar, menus and workspace labels fit in ZIMA | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | language-neutral shell layout › long English toolbar, menus and workspace labels fit in Classic | <code>release-hover-final</code> passed | release-browser (failed) |
| <code>localization.spec.ts</code> | language-neutral shell layout › long English toolbar, menus and workspace labels fit in ZIMA | <code>release-hover-final</code> passed | — |
| <code>localization.spec.ts</code> | open menus follow their trigger on resize and language changes and scroll in a short viewport | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | open menus translate in place and retain focus, readiness and export actions | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | switching with an unsaved CodeMirror selection preserves editor, Atlas and history | <code>release-browser</code> passed | d-browser (failed), d-code-confirm (failed), d-code-fixed (failed) |
| <code>localization.spec.ts</code> | the ten sidebar targets switch in place and render authored search values as literal text | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | toolbar names, counts and empty search states follow the current locale through undo and redo | <code>release-browser</code> passed | — |
| <code>localization.spec.ts</code> | warnings, layer prompts and destructive confirmations preserve authored values in both locales | <code>release-browser</code> passed | — |
| <code>loose-cables.spec.ts</code> | a pending save cannot attach a loose end after its workspace gesture is canceled | <code>final-regression</code> passed | — |
| <code>loose-cables.spec.ts</code> | a: explicit cable action, keyboard/click/drag, cancellation, same identity and five-step history | <code>final-regression</code> passed | — |
| <code>loose-cables.spec.ts</code> | b: explicit cable action, keyboard/click/drag, cancellation, same identity and five-step history | <code>final-regression</code> passed | — |
| <code>loose-cables.spec.ts</code> | backplane: unplug, pull Drive, reload and reconnect without changing its cable | <code>final-regression</code> passed | — |
| <code>loose-cables.spec.ts</code> | direct: unplug, pull Drive, reload and reconnect without changing its cable | <code>final-regression</code> passed | — |
| <code>loose-cables.spec.ts</code> | loose ends render once in Handbook, PNG and read-only mobile; gestures and view changes write nothing | <code>final-regression</code> passed | — |
| <code>loose-cables.spec.ts</code> | multiple loose markers remain separated at 100% and 250%, and Find destination reuses the cable | <code>final-regression</code> passed | — |
| <code>mobile-rack.spec.ts</code> | M3.1 mobile shows reversed rear hardware on Rack Front without editing | <code>release-browser</code> passed | — |
| <code>mobile-rack.spec.ts</code> | M3.2 mobile omits callouts and keeps a reversed narrow twelve-Drive summary read-only | <code>release-browser</code> passed | — |
| <code>mobile-rack.spec.ts</code> | Mobile Rack is portrait-only, read-only, and preserves local viewing state through rotation | <code>release-browser</code> passed | — |
| <code>mobile-rack.spec.ts</code> | Mobile Rack name eligibility follows an image failure while equipment remains selected | <code>release-browser</code> passed | — |
| <code>mobile-rack.spec.ts</code> | Mobile Rack names and bottom dock fit 320px without changing equipment | <code>release-browser</code> passed | — |
| <code>mobile-rack.spec.ts</code> | Mobile Rack names and bottom dock fit 390px without changing equipment | <code>release-browser</code> passed | — |
| <code>mobile-rack.spec.ts</code> | Mobile Rack renders twelve Atlas-linked Drive Bay glyphs without enabling editing or writing | <code>release-browser</code> passed | — |
| <code>mobile-rack.spec.ts</code> | Mobile Rack renders twelve local Drive Bay glyphs without enabling editing or writing | <code>release-browser</code> passed | — |
| <code>mobile-rack.spec.ts</code> | Mobile Rack slider distinguishes touch drag, track tap, handle reset and canceled gestures | <code>release-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | 10-inch hidden managed/stub tracer leaves no wire, hit path, labels, Fit or history change | <code>c-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | 19-inch hidden managed/stub tracer leaves no wire, hit path, labels, Fit or history change | <code>c-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | StrictMode pulse is not replayed by rerender, preview or remount; invalidated routes retire | <code>c-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | active pulse transforms with pan and zoom without restarting or intercepting the gesture | <code>c-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | active tracer is absent from actual hidden-cable PNG export | <code>c-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | dense picker selects actual curved jumper, Both has one leg, and view navigation cancels | <code>c-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | mobile read-only tap pulses once and retains hidden preference without saves | <code>c-repairs</code> passed | c-browser (failed), c-mobile-original (failed) |
| <code>physical-cable-pulse.spec.ts</code> | one-shot power selection follows A/B, survives completion, and excludes context/stroke/hover actions | <code>c-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | reduced motion suppresses travel and hidden base while preserving port selection | <code>c-browser</code> passed | — |
| <code>physical-cable-pulse.spec.ts</code> | reversed mounting continues a dense-picker pulse onto the other face and navigation cancels | <code>c-browser</code> passed | — |
| <code>physical-cables-continuity.spec.ts</code> | Equipment/Rack M5 100 cables stay responsive and hide without retaining enlarged gutters or writes | <code>final-regression</code> passed | — |
| <code>physical-cables-continuity.spec.ts</code> | Equipment/Rack M5 rear to front wiring, occupied rejection, moving and reversal preserve cable IDs | <code>final-regression</code> passed | c-browser (failed) |
| <code>physical-cables-continuity.spec.ts</code> | Equipment/Rack M5 search selects the shared Tile's Rack placement; document history invalidates source | <code>final-regression</code> passed | — |
| <code>physical-cables-final.spec.ts</code> | Equipment/Rack M5 archived ambiguous locations can be assigned and reassigned without duplicating cables | <code>c-browser</code> passed | — |
| <code>physical-cables-final.spec.ts</code> | Equipment/Rack M5 pending preceding save cannot apply a cable after workspace change | <code>c-browser</code> passed | — |
| <code>physical-cables-final.spec.ts</code> | Equipment/Rack M5 planned endpoints and cable edits respect mode with direct undoable disconnect | <code>c-browser</code> passed | — |
| <code>physical-cables-final.spec.ts</code> | Equipment/Rack M5 trace path lists two external hops and the virtual Patch Panel pair without writes | <code>c-browser</code> passed | — |
| <code>physical-cables-render.spec.ts</code> | Equipment/Rack M5 10-inch live, trace and actual PNG use the same cables and captured visibility | <code>final-regression</code> passed | — |
| <code>physical-cables-render.spec.ts</code> | Equipment/Rack M5 19-inch live, trace and actual PNG use the same cables and captured visibility | <code>final-regression</code> passed | — |
| <code>physical-cables-render.spec.ts</code> | Equipment/Rack M5 mobile at 320px dismisses cable info without moving the rack and remains read-only | <code>final-regression</code> passed | c-browser (failed), c-mobile-original (failed), c-repairs (failed), c-mobile2 (failed) |
| <code>physical-cables-render.spec.ts</code> | Equipment/Rack M5 mobile at 390px dismisses cable info without moving the rack and remains read-only | <code>final-regression</code> passed | c-browser (failed), c-repairs (failed), c-mobile2 (failed) |
| <code>physical-cables.spec.ts</code> | Equipment/Rack M5 10-inch click-click creates once, cancels safely and supports undo/redo | <code>c-browser</code> passed | — |
| <code>physical-cables.spec.ts</code> | Equipment/Rack M5 19-inch click-click creates once, cancels safely and supports undo/redo | <code>c-browser</code> passed | — |
| <code>physical-cables.spec.ts</code> | Equipment/Rack M5 color sweep previews locally and commits once; default reset and palette preserve metadata | <code>c-browser</code> passed | — |
| <code>physical-cables.spec.ts</code> | Equipment/Rack M5 dense actual port 17 materializes the legacy panel in one operation | <code>c-browser</code> passed | — |
| <code>physical-cables.spec.ts</code> | Equipment/Rack M5 descriptive media chooser preserves cage intent and Other description | <code>c-browser</code> passed | — |
| <code>physical-cables.spec.ts</code> | Equipment/Rack M5 direct port drag works in Both mode and cancels Escape/outside/blur without equipment moves | <code>c-browser</code> passed | — |
| <code>physical-cables.spec.ts</code> | Equipment/Rack M5 source survives faces, presentation, visibility and racks, but not workspace changes | <code>c-browser</code> passed | — |
| <code>physical-connect-table.spec.ts</code> | Both connection strip scrolls to bounded stops with wheel and keyboard without changing Rack zoom or history | <code>final-regression</code> passed | — |
| <code>physical-connect-table.spec.ts</code> | Connect Table supports face layouts, tracing, atomic rename and read-only Handbook | <code>final-regression</code> passed | — |
| <code>physical-connect-table.spec.ts</code> | Rack PNG includes the requested full table or compact strip independently of live visibility | <code>final-regression</code> passed | — |
| <code>physical-documentation-integration.spec.ts</code> | M6 real save/reload, TOC Undo/Redo, canonical edits and PDF download | <code>release-browser</code> passed | d-browser (failed), d-pdf-detail (failed), d-pdf-stages (failed) |
| <code>physical-documentation.spec.ts</code> | Handbook card disclosures reset on workspace exit and existing edits regenerate documentation | <code>release-browser</code> passed | — |
| <code>physical-documentation.spec.ts</code> | M6 Handbook inventory, schedules and reference return: classic dark | <code>release-browser</code> passed | — |
| <code>physical-documentation.spec.ts</code> | M6 Handbook inventory, schedules and reference return: classic light | <code>release-browser</code> passed | — |
| <code>physical-documentation.spec.ts</code> | M6 Handbook inventory, schedules and reference return: zima dark | <code>release-browser</code> passed | — |
| <code>physical-documentation.spec.ts</code> | M6 Handbook inventory, schedules and reference return: zima light | <code>release-browser</code> passed | — |
| <code>physical-documentation.spec.ts</code> | M6 mobile navigation and physical documentation stay read-only | <code>release-browser</code> passed | — |
| <code>physical-documentation.spec.ts</code> | Rack-local reference reveals its target when a cable-only search hides it | <code>release-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 10-inch visible ports and right connector picker preserve identity, power, keyboard and orientation | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 19-inch visible ports and right connector picker preserve identity, power, keyboard and orientation | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 calibration shares geometry, supports keyboard and drag, and exports complete JSON without an Atlas write | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 dense picker and individual markers isolate input, synchronize selection, and preserve IDs when changing images | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 duplication preserves independent inventories, connected ports stay protected and duplicate Rack locations block deletion | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 faceplates render both physical sides and export without transient overlays | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 global images preserve archived mismatches and width limits without creating history | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 implicit/default legacy conflicts stay read-only until explicit adoption and survive reload | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 mobile faceplates, canonical connectors and twelve Drive slots remain read-only | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 numeric presets preserve customized connectors and uplinks; only Panel connector presets remain | <code>b-browser</code> passed | — |
| <code>physical-ports.spec.ts</code> | M4 shared Canvas/Rack ports retain IDs through edits, failure/retry, reload and Undo | <code>b-browser</code> passed | — |
| <code>png-export.spec.ts</code> | downloaded Canvas PNG pixels localize captions and preserve the title and authored fields | <code>release-shared-png-confirm</code> passed | release-shared-png (failed) |
| <code>rack-appearance-stage2.spec.ts</code> | decoration bounds at 10-inch 1U with long names and both numbering directions | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | decoration bounds at 10-inch 60U with long names and both numbering directions | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | decoration bounds at 19-inch 42U with long names and both numbering directions | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | decoration bounds at 19-inch 6U with long names and both numbering directions | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | handle color 10: conditional picker, independent paint, persistence and PNG | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | handle color 19: conditional picker, independent paint, persistence and PNG | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | hardware 10: none, shared bounds, geometry and PNG | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | hardware 10: paired, shared bounds, geometry and PNG | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | hardware 19: none, shared bounds, geometry and PNG | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | hardware 19: paired, shared bounds, geometry and PNG | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | mobile legacy handles use paired artwork and never write | <code>a-browser</code> passed | — |
| <code>rack-appearance-stage2.spec.ts</code> | retired handles display paired, preserve saved data and can be removed | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | 10-inch built-in SVG, readable Both faces, pixel export and mode invariance | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | 19-inch built-in SVG, readable Both faces, pixel export and mode invariance | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | Apple (White) gallery selection, transparency, reload and Both PNG | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | PNG waits for a delayed uploaded logo before serializing its pixels | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | Tecmojo (Black) gallery selection, transparency, reload and Both PNG | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | a late library response preserves a newly uploaded draft and Cancel leaves the Rack untouched | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | classic modal focus, staged cancel, text, clear and short viewport | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | missing uploaded logo and unknown built-in warn without changing the Atlas | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | mobile portrait branding uses the same asset and remains read-only | <code>a-browser</code> passed | — |
| <code>rack-branding-stage2.spec.ts</code> | real upload reuse, Cancel, Apply, history, reload, JSON import and export pixels | <code>a-backend</code> passed | a-browser (skipped) |
| <code>rack-branding-stage2.spec.ts</code> | zima modal focus, staged cancel, text, clear and short viewport | <code>a-browser</code> passed | — |
| <code>rack-circuit-identification.spec.ts</code> | Both: union with existing cable selection, multi-cable halos and unchanged trace/cancel/actions | <code>c-browser</code> passed | — |
| <code>rack-circuit-identification.spec.ts</code> | backplane: compact Bay picker and duplicate Drive port IDs stay qualified | <code>c-browser</code> passed | — |
| <code>rack-circuit-identification.spec.ts</code> | classic: PoE colors, ABS recorded affiliation and configured Rack appearance | <code>c-browser</code> passed | — |
| <code>rack-circuit-identification.spec.ts</code> | direct: compact Bay picker and duplicate Drive port IDs stay qualified | <code>c-browser</code> passed | — |
| <code>rack-circuit-identification.spec.ts</code> | front: hardware-only parent outlines, port precedence, inert rows and original cable tracing | <code>c-browser</code> passed | — |
| <code>rack-circuit-identification.spec.ts</code> | ordinary picker on reversed hardware identifies the qualified panel port without scrolling the strip | <code>c-browser</code> passed | — |
| <code>rack-circuit-identification.spec.ts</code> | rear: hardware-only parent outlines, port precedence, inert rows and original cable tracing | <code>c-browser</code> passed | — |
| <code>rack-circuit-identification.spec.ts</code> | zima: PoE colors, ABS recorded affiliation and configured Rack appearance | <code>c-browser</code> passed | — |
| <code>rack-deletion.spec.ts</code> | cancel, disconnect only this rack, review, then delete; both steps save, reload and undo independently | <code>a-browser</code> passed | — |
| <code>rack-deletion.spec.ts</code> | empty rack deletion exposes save failures even when there are no remaining racks | <code>a-browser</code> passed | — |
| <code>rack-deletion.spec.ts</code> | failed connection save retains the rack and blocks deletion until disconnection is saved | <code>a-browser</code> passed | — |
| <code>rack-deletion.spec.ts</code> | pending removal keeps confirmation modal locked and cannot trigger deletion or duplicate saves | <code>a-browser</code> passed | — |
| <code>rack-deletion.spec.ts</code> | shared equipment with ambiguous location cannot delete another rack's cable records | <code>a-browser</code> passed | — |
| <code>rack-hardware.spec.ts</code> | M3.1 dense 10-inch hardware stays inside its face and PNG uses the same rear palette | <code>d-final-rack</code> passed | — |
| <code>rack-hardware.spec.ts</code> | M3.1 physical faces move hardware without mirroring or changing the placement, and preserve callouts | <code>d-final-rack</code> passed | — |
| <code>rack-hardware.spec.ts</code> | M4 Patch Panels share canonical paired counts including zero, 48 and 96 | <code>d-final-rack</code> passed | — |
| <code>rack-hardware.spec.ts</code> | M4 UPS outlets and explicit empty settings survive failure/retry, draft selection and reload | <code>d-final-rack</code> passed | — |
| <code>rack-hardware.spec.ts</code> | M4 canonical connector edits validate drafts, preserve legacy IDs, and persist through reload and Undo/Redo | <code>d-final-rack</code> passed | — |
| <code>rack-inspector-face.spec.ts</code> | Inspector follows Rack view and clicked physical faces with rear mounting=false | <code>a-browser</code> passed | — |
| <code>rack-inspector-face.spec.ts</code> | Inspector follows Rack view and clicked physical faces with rear mounting=true | <code>a-browser</code> passed | — |
| <code>rack-inspector-layout.spec.ts</code> | Rack Inspector compact controls and folder tabs: classic | <code>d-final-rack</code> passed | a-browser (failed) |
| <code>rack-inspector-layout.spec.ts</code> | Rack Inspector compact controls and folder tabs: zima | <code>d-final-rack</code> passed | a-browser (failed) |
| <code>rack-local-deletion.spec.ts</code> | Backspace converts wired Rack equipment in one saved Undo/Redo step | <code>b-browser</code> passed | — |
| <code>rack-local-deletion.spec.ts</code> | Delete converts wired Rack equipment in one saved Undo/Redo step | <code>b-browser</code> passed | — |
| <code>rack-local-deletion.spec.ts</code> | button converts wired Rack equipment in one saved Undo/Redo step | <code>b-browser</code> passed | — |
| <code>rack-local-deletion.spec.ts</code> | confirmation remains visible with data badges hidden; Cancel preserves tile, equipment and wiring | <code>b-browser</code> passed | — |
| <code>rack-local-deletion.spec.ts</code> | failed conversion save retains the complete draft and retries without replacing port or cable identities | <code>b-browser</code> passed | — |
| <code>rack-local-deletion.spec.ts</code> | unplaced connected equipment still requires disconnection | <code>b-browser</code> passed | — |
| <code>rack-localization-layout.spec.ts</code> | Physical editors and popovers keep their controls accessible in classic | <code>release-geometry</code> passed | — |
| <code>rack-localization-layout.spec.ts</code> | Physical editors and popovers keep their controls accessible in zima | <code>release-geometry</code> passed | — |
| <code>rack-localization-layout.spec.ts</code> | Rack controls and physical records remain reachable in classic | <code>release-geometry</code> passed | final-matrix (failed), matrix-geometry (failed), matrix-metrics (failed) |
| <code>rack-localization-layout.spec.ts</code> | Rack controls and physical records remain reachable in zima | <code>release-geometry</code> passed | matrix-geometry (failed) |
| <code>rack-localization.spec.ts</code> | Rack Inspector selection and unfinished appearance edits survive a language change | <code>final-regression</code> passed | — |
| <code>rack-localization.spec.ts</code> | Rack language changes preserve the focused creation draft, physical inventory and generated equipment titles | <code>final-regression</code> passed | b-final-browser (failed) |
| <code>rack-localization.spec.ts</code> | an open cable rename retains its trace, expanded circuit, draft and endpoints | <code>final-regression</code> passed | c-live (failed) |
| <code>rack-localization.spec.ts</code> | editing the same physical port produces equivalent records and history in both languages | <code>final-regression</code> passed | — |
| <code>rack-localization.spec.ts</code> | physical wiring preserves expanded paths and filtered records across languages | <code>final-regression</code> passed | — |
| <code>rack-localization.spec.ts</code> | the dense port picker keeps its physical target, filtered result and focused query across languages | <code>final-regression</code> passed | b-live (failed) |
| <code>rack-palette-collapse.spec.ts</code> | General Rack Items collapses without changing tiles or Atlas: classic | <code>a-browser</code> passed | — |
| <code>rack-palette-collapse.spec.ts</code> | General Rack Items collapses without changing tiles or Atlas: zima | <code>a-browser</code> passed | — |
| <code>rack-palette-collapse.spec.ts</code> | General Rack Items remains usable when browser preference storage is blocked | <code>a-browser</code> passed | — |
| <code>rack-png-export.spec.ts</code> | Rack export isolates live styles and preserves Front/Rear PNG paint through serialization and repeated capture | <code>release-browser</code> passed | — |
| <code>rack-port-order.spec.ts</code> | preset upgrade, cancel/confirm, ordering, restored mapping and saved history | <code>b-browser</code> passed | — |
| <code>rack-port-order.spec.ts</code> | rear-mounted equipment keeps face and power groups independent | <code>b-browser</code> passed | — |
| <code>rack-port-order.spec.ts</code> | uploaded imagery survives additions and a dense picker follows saved custom order | <code>b-browser</code> passed | — |
| <code>rack-port-order.spec.ts</code> | video panel pairs allow mixed connectors, retain independent ordering, and protect occupied peers | <code>b-browser</code> passed | — |
| <code>rack-port-picker.spec.ts</code> | mobile Direct Bay picker keeps duplicate Drive port IDs qualified and read-only | <code>b-final-browser</code> passed | — |
| <code>rack-port-picker.spec.ts</code> | mobile picker preserves physical faces, mapped ordering and focus across presentation modes | <code>b-final-browser</code> passed | — |
| <code>rack-presentation.spec.ts</code> | Global 10-inch presentation preserves data, camera, keyboard, mappings and export snapshot | <code>a-browser</code> passed | — |
| <code>rack-presentation.spec.ts</code> | Global 19-inch presentation preserves data, camera, keyboard, mappings and export snapshot | <code>a-browser</code> passed | — |
| <code>rack-presentation.spec.ts</code> | Global mobile presentation remains read-only, fits portrait and survives reload | <code>a-browser</code> passed | — |
| <code>rack-presentation.spec.ts</code> | Global presentation keeps custom upload editing and Undo/Redo separate from viewing | <code>a-presentation</code> passed | a-browser (failed) |
| <code>rack-presentation.spec.ts</code> | Global presentation survives blocked storage and cancels an active equipment drag | <code>a-browser</code> passed | — |
| <code>rack-settings.spec.ts</code> | Rack settings: classic layout moves feedback down and scrolls without horizontal overflow | <code>a-save-repair</code> passed | — |
| <code>rack-settings.spec.ts</code> | Rack settings: existing fields apply immediately and survive reload without changing placements | <code>a-save-repair</code> passed | — |
| <code>rack-settings.spec.ts</code> | Rack settings: failed save retains the edit for existing Save retry and Undo/Redo | <code>a-final</code> passed | a-browser (failed), a-save-repair (failed) |
| <code>rack-settings.spec.ts</code> | Rack settings: inline disclosure, keyboard focus and expansion memory across selections | <code>a-save-repair</code> passed | — |
| <code>rack-settings.spec.ts</code> | Rack settings: invalid edits, Escape and unchanged presets preserve data and available Redo | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack-settings.spec.ts</code> | Rack settings: rapid blur/selection edits and equipment pointer selection retain the latest values | <code>a-save-repair</code> passed | — |
| <code>rack-settings.spec.ts</code> | Rack settings: zima layout moves feedback down and scrolls without horizontal overflow | <code>a-save-repair</code> passed | — |
| <code>rack-view-toggles.spec.ts</code> | Mobile Rack switches fit portrait, toggle by touch and persist without Atlas changes | <code>release-geometry</code> passed | — |
| <code>rack-view-toggles.spec.ts</code> | classic Rack switches preserve preferences, keyboard and grouped layout | <code>release-geometry</code> passed | d-final-rack (failed), d-toolbar (failed) |
| <code>rack-view-toggles.spec.ts</code> | zima Rack switches preserve preferences, keyboard and grouped layout | <code>release-geometry</code> passed | d-final-rack (failed), d-toolbar (failed) |
| <code>rack.spec.ts</code> | Rack canceled gestures and unrelated pointer releases cannot commit | <code>a-save-repair</code> passed | — |
| <code>rack.spec.ts</code> | Rack drag anchors half equipment with ascending numbering and zoom, mirror=false | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack.spec.ts</code> | Rack drag anchors half equipment with ascending numbering and zoom, mirror=true | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack.spec.ts</code> | Rack drag anchors half equipment with descending numbering and zoom, mirror=false | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack.spec.ts</code> | Rack drag anchors half equipment with descending numbering and zoom, mirror=true | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack.spec.ts</code> | Rack drag anchors third equipment with ascending numbering and zoom, mirror=false | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack.spec.ts</code> | Rack drag anchors third equipment with ascending numbering and zoom, mirror=true | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack.spec.ts</code> | Rack drag anchors third equipment with descending numbering and zoom, mirror=false | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack.spec.ts</code> | Rack drag anchors third equipment with descending numbering and zoom, mirror=true | <code>a-save-repair</code> passed | a-browser (failed) |
| <code>rack.spec.ts</code> | Rack drag preserves the grab offset, saves once, and selection preserves Redo | <code>a-final</code> passed | a-browser (failed), a-save-repair (failed) |
| <code>rack.spec.ts</code> | Rack invalid drops retain the original placement without saving | <code>a-save-repair</code> passed | — |
| <code>rack.spec.ts</code> | Rack movement within a slot, returning to origin, and unchanged Inspector values do not save | <code>a-save-repair</code> passed | — |
| <code>rack.spec.ts</code> | Rack selection and pointer jitter do not save or move tall equipment | <code>a-final</code> passed | a-save-repair (failed) |
| <code>rack.spec.ts</code> | attaches Atlas Drives inside a Drive Bay with capacity, persistence, removal, and warnings | <code>a-final</code> passed | a-browser (failed), a-save-repair (failed) |
| <code>rack.spec.ts</code> | fits the first rack immediately when created from an empty Rack workspace | <code>a-save-repair</code> passed | — |
| <code>rack.spec.ts</code> | preserves custom Rack height limits and equipment width-column choices | <code>a-final</code> passed | a-browser (failed), a-save-repair (failed) |
| <code>rack.spec.ts</code> | switches Rack as a peer workspace and persists canonical Rack changes | <code>a-final</code> passed | a-browser (failed), a-save-repair (failed) |
| <code>rear-port-spacing.spec.ts</code> | 12U 19-inch rear ports at 100% in 1440px REAR/BOTH | <code>b-browser</code> passed | — |
| <code>rear-port-spacing.spec.ts</code> | 12U 19-inch rear ports at 100% in 1920px REAR/BOTH | <code>b-browser</code> passed | — |
| <code>rear-port-spacing.spec.ts</code> | 24U 19-inch rear ports at 100% in 1440px REAR/BOTH | <code>b-browser</code> passed | — |
| <code>rear-port-spacing.spec.ts</code> | 24U 19-inch rear ports at 100% in 1920px REAR/BOTH | <code>b-browser</code> passed | — |
| <code>rear-port-spacing.spec.ts</code> | 6U 19-inch rear ports at 100% in 1440px REAR/BOTH | <code>b-browser</code> passed | — |
| <code>rear-port-spacing.spec.ts</code> | 6U 19-inch rear ports at 100% in 1920px REAR/BOTH | <code>b-browser</code> passed | — |
| <code>rear-port-spacing.spec.ts</code> | compact callouts retain long and Unicode names, loose-cable clearance and stable fit | <code>b-browser</code> passed | — |
| <code>rear-port-spacing.spec.ts</code> | failed uploaded rear imagery adds schematic callout space without a fit loop or save | <code>b-browser</code> passed | — |
| <code>rear-port-spacing.spec.ts</code> | rear spacing and callout bounds agree in the live Rack and PNG | <code>b-browser</code> passed | — |
| <code>server-storage-integration.spec.ts</code> | real backend saves server inventory, restores history, imports JSON and exports Handbook PDF | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | 10-inch server visuals coexist with images, multi-U ports and fallback | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | 19-inch server visuals coexist with images, multi-U ports and fallback | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | Equipment server supports slots; representation-only equipment rejects a Drive without a placement | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | Inspector slot drop, remove/configuration reset, reload and Undo/Redo preserve canonical assignments | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | Node placement has optional setup and discoverable RELATED badges beyond the first 40 results | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | Rack-scoped errors survive same-Rack edits and views but clear across identical placement IDs | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | creation and deletion fallback clear the previous Rack's storage and canvas errors | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | dense narrow faces use a visible inventory summary without obscuring port targets | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | failed save stays visible and retries the same server inventory | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | linked Inspector removes Relink while preserving tabs, navigation and broken-reference recovery | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | local server assignment and promotion to Equipment retain inventory | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | local server assignment and promotion to Node retain inventory | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | nested RELATED badges retain sort, search, accessible paths and standalone click-to-add | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | physical faces reverse on rear mounting; Handbook shows inventory and missing references remain removable | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | read-only Mobile Rack shares front slots and rear count without saving | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | shared SVG paints custom occupied color in exported Rack PNG | <code>b-browser</code> passed | — |
| <code>server-storage.spec.ts</code> | unconfigured drop selects setup; addressed/body drops, safe moves, color and shrink rejection are atomic | <code>b-browser</code> passed | — |
| <code>swimlane-png-export.spec.ts</code> | exports a complete Handbook Swimlane with compact Light/Dark title options and no backend save | <code>release-shared-png-confirm</code> passed | — |
| <code>workspace-switcher-height.spec.ts</code> | resting height adapts to a delayed font and resize with reduced motion | <code>release-browser</code> passed | — |
| <code>workspace-switcher-height.spec.ts</code> | stable switcher height in Classic with English | <code>release-browser</code> passed | — |
| <code>workspace-switcher-height.spec.ts</code> | stable switcher height in Classic with Pseudo-English | <code>release-browser</code> passed | d-browser (failed) |
| <code>workspace-switcher-height.spec.ts</code> | stable switcher height in Classic with long English | <code>release-browser</code> passed | — |
| <code>workspace-switcher-height.spec.ts</code> | stable switcher height in ZIMA with English | <code>release-browser</code> passed | — |
| <code>workspace-switcher-height.spec.ts</code> | stable switcher height in ZIMA with Pseudo-English | <code>release-browser</code> passed | d-browser (failed) |
| <code>workspace-switcher-height.spec.ts</code> | stable switcher height in ZIMA with long English | <code>release-browser</code> passed | — |

## Catalog, type, model and production receipts

| Receipt | HEAD | Command or check | Observed result |
|---|---|---|---|
| <code>baseline-unit</code> | <code>faac237</code> | <code>vitest run src/i18n/runtime.test.ts src/features/rack/rackModel.test.ts src/features/physicalPorts/model.test.ts src/features/physicalDocumentation/connectTable.test.ts</code> | 42 passed (42) |
| <code>baseline-build</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>baseline-catalog</code> | <code>faac237</code> | <code>npm run i18n:check</code> | Validated 882 English keys, translator context and 2 locale catalogs. |
| <code>a-build</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>a-units</code> | <code>faac237</code> | <code>vitest run src/features/rack/rackModel.test.ts src/features/rack/rackView.test.ts src/features/rack/rackGeometry.test.ts src/features/rack/rackIdentity.test.ts src/features/rack/rackPresentation src/features/rack/rackAdaptiveFit.test.ts src/features/rack/rackPaletteDrag.test.ts src/features/rack/rackDeletion.test.ts src/features/rack/rackMaterials.test.ts src/features/rack/rackBranding.test.ts</code> | 192 passed (192) |
| <code>b-check</code> | <code>faac237</code> | <code>npm run i18n:check</code> | Validated 1548 English keys, translator context and 2 locale catalogs. |
| <code>b-build</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | src/i18n/physicalLabels.ts(19,17): error TS2550: Property 'hasOwn' does not exist on type 'ObjectConstructor'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2022' or later. |
| <code>b-units</code> | <code>faac237</code> | <code>vitest run src/features/physicalPorts src/features/rack/faceplates src/features/rack/driveBay src/features/rack/serverStorage src/features/rack/absPanel src/features/rack/rackHardware.test.ts src/features/rack/rackMetalTextures.test.ts</code> | 3 failed &#124; 423 passed (426) |
| <code>b-ssr</code> | <code>faac237</code> | <code>vitest run src/features/physicalPorts/patchPanelPower.test.ts src/features/rack/driveBayLayout.test.ts src/features/rack/rackTopSlotsRendering.test.ts src/features/rack/rackFitPreview.test.ts src/features/rack/universalRendering.test.ts</code> | 35 passed (35) |
| <code>b-build2</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>brear-check</code> | <code>faac237</code> | <code>npm run i18n:check</code> | Validated 1553 English keys, translator context and 2 locale catalogs. |
| <code>b-final-build</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>b-final-units</code> | <code>faac237</code> | <code>npx vitest run src/features/rack src/features/physicalPorts src/features/physicalDocumentation</code> | 924 passed (924) |
| <code>c-check</code> | <code>faac237</code> | <code>npm run i18n:check</code> | Validated 1692 English keys, translator context and 2 locale catalogs. |
| <code>c-build</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | src/features/physicalDocumentation/ConnectTable.tsx(67,327): error TS2769: No overload matches this call. / src/features/rack/cables/CableConnectionInfo.tsx(41,52): error TS2769: No overload matches this call. |
| <code>c-units</code> | <code>faac237</code> | <code>npx vitest run src/features/rack/cables src/features/physicalPorts/cableModel.test.ts src/features/physicalDocumentation</code> | 113 passed (113) |
| <code>c-build2</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>d-check</code> | <code>faac237</code> | <code>npm run i18n:check</code> | Validated 1768 English keys, translator context and 2 locale catalogs. |
| <code>d-catalog-tests</code> | <code>faac237</code> | <code>node --test scripts/catalogs.test.mjs</code> | 7 passed |
| <code>d-build</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>d-units</code> | <code>faac237</code> | <code>npx vitest run src/features/rack src/features/physicalPorts src/features/physicalDocumentation src/features/handbookPdf/model.test.ts src/i18n src/lib/pngExport.test.ts</code> | 974 passed (974) |
| <code>d-docker</code> | <code>faac237</code> | <code>docker build --target frontend-build ..</code> | Passed |
| <code>dfinal-check</code> | <code>faac237</code> | <code>npm run i18n:check</code> | Validated 1790 English keys, translator context and 2 locale catalogs. |
| <code>d-final-docker</code> | <code>faac237</code> | <code>docker build --target frontend-build ..</code> | Passed |
| <code>d-final-units</code> | <code>faac237</code> | <code>npx vitest run src/features/rack src/features/physicalPorts src/features/physicalDocumentation src/features/handbookPdf/model.test.ts src/i18n src/lib/pngExport.test.ts</code> | 974 passed (974) |
| <code>d-final-build</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>d-offline</code> | <code>faac237</code> | <code>Playwright against Docker frontend-build, network disabled after initial load</code> | Onboarding overlay intercepted click |
| <code>d-offline2</code> | <code>faac237</code> | <code>Playwright against Docker frontend-build, network disabled after initial load</code> | Onboarding overlay intercepted click |
| <code>d-offline3</code> | <code>faac237</code> | <code>Playwright against Docker frontend-build, network disabled after initial load</code> | Passed |
| <code>review-check</code> | <code>faac237</code> | <code>npm run i18n:check</code> | Validated 1804 English keys, translator context and 2 locale catalogs. |
| <code>final-docker</code> | <code>faac237</code> | <code>docker build --target frontend-build ..</code> | Passed |
| <code>final-catalog</code> | <code>faac237</code> | <code>node --test scripts/catalogs.test.mjs</code> | 7 passed |
| <code>final-build</code> | <code>faac237</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>final-units</code> | <code>faac237</code> | <code>npx vitest run src/features/rack src/features/physicalPorts src/features/physicalDocumentation src/features/handbookPdf/model.test.ts src/i18n src/lib/pngExport.test.ts</code> | 974 passed (974) |
| <code>final-offline</code> | <code>faac237</code> | <code>Playwright against Docker frontend-build, network disabled after initial load</code> | Passed |
| <code>release-docker</code> | <code>c67e6f6</code> | <code>docker build --target frontend-build ..</code> | Passed |
| <code>release-build</code> | <code>c67e6f6</code> | <code>npm run build (includes npm run typecheck)</code> | Passed |
| <code>release-offline</code> | <code>c67e6f6</code> | <code>Playwright against Docker frontend-build, network disabled after initial load</code> | Passed |

The three formerly failing SSR tests in <code>patchPanelPower.test.ts</code> covered the following cases: <code>local identity excludes inlet controls and rejects creation without mutation</code>, <code>Atlas-linked identity excludes inlet controls and rejects creation without mutation</code>, and <code>keeps the inlet control and edits on powered hardware using Patch Panel artwork</code>. They passed with the English render fixture and again in the final 974-case unit run. The per-test assertion output remains in <code>b-units.log</code> and <code>b-ssr.log</code>.

Pseudo-English proposals were inspected before writing the catalogs. <code>npm run --silent i18n:pseudo</code>, <code>npm run i18n:pseudo -- --write</code> and <code>npm run i18n:check</code> ran at each catalog change. Build-time registry generation remained enabled. The final same-input regeneration was checked against file hashes.

The complete repository-wide browser suite, unrelated backend suites, real hardware, other browsers and actual browser zoom were outside this focused run. The additional mobile suites are read-only regression guardrails.

The standalone release typecheck ran <code>npm run typecheck</code> against <code>c67e6f6</code> and exited successfully. The local and Docker release builds also executed the project typecheck.

## Catalog totals by namespace

| Namespace | At checkout | At completion | Added |
|---|---:|---:|---:|
| <code>canvas</code> | 397 | 397 | 0 |
| <code>common</code> | 28 | 28 | 0 |
| <code>exports</code> | 30 | 30 | 0 |
| <code>handbook</code> | 422 | 422 | 0 |
| <code>ingest</code> | 5 | 5 | 0 |
| <code>rack</code> | 0 | 922 | 922 |
| **Total per language** | **882** | **1,804** | **922** |

## Evidence files and data comparisons

The raw evidence directory named above contains the following groups.

| Directory or receipt | Observation |
|---|---|
| <code>release-geometry/</code> | Per-theme screenshots, text bounds, pointer access and scroll assertions. The fixtures measure the Rack SVG, placements, port rectangles and cable paths through locale changes. |
| <code>baseline-browser/</code> and <code>release-browser/</code> | Rack Front, Rear and repeated Front image files. The baseline and final Rack PNGs have identical bytes at 742 × 694. The gate report lists SHA-256 values. |
| <code>final-pdf/</code> and <code>export-comparison.log</code> | Both 32-page backend PDFs. The payloads, PDF bytes and text on every page agree. The page texts joined with LF have SHA-256 <code>0d0053c069bc447f56674c8e77e54cd233974bb270f8fbcf9ab1657630911435</code>. |
| <code>final-proposal.json</code> and <code>review-proposal.json</code> | The same-input pseudo proposals match byte for byte, SHA-256 <code>c02ed46da380630f0c79f2ebdf4aa7822f9dc23324c6e2c401df877ea3d4a013</code>. |
| <code>post/</code> | Read-only post-change literal scan by phase. The [source inventory](M5_source_inventory.md) identifies consumers, protected values, raw diagnostics and later owners. |

The focused creation fixture kept its draft, the same input and selection [2, 7]. Adding a generic server under Pseudo-English stored component type <code>generic-server</code> and title <code>Generic Server</code>. The Rack model still uses <code>RACK_COMPONENT_LABELS</code> when allocating a title. The separate view adapter resolves translated choices using the component type.

In the dense port fixture, <code>front-rj45-48</code> retained its authored label <code>Étage &lt;48&gt; &amp; CPU</code>, filtered result, focus, target bounds and complete normalized Atlas. The switch generated zero API requests. In a separate fixture the same edit stored <code>Étage &lt;rack&gt; &amp; CPU</code> on the same port in both languages. Undo restored the complete original port array and Redo restored the complete edited array. Known model diagnostics render through the Rack display adapter. Unknown service diagnostics retain the original message.

## Checkout and changed files

The initial index and tracked checkout were clean. The supplied buildspec was the one untracked file. The developer's mid-session commit contains the buildspec and implementation present at that time. The final index is empty. The following list is relative to the starting SHA and includes the final report.

| Change | Path |
|---|---|
| M | <code>PROJECT_LOG.md</code> |
| A | <code>dev/Localize/CTRoadmap_M5_Rack_Physical_Localization_Execution_Buildspec.md</code> |
| A | <code>dev/Localize/M5_scope_and_gates.md</code> |
| A | <code>dev/Localize/M5_source_inventory.md</code> |
| A | <code>dev/Localize/M5_verification.md</code> |
| M | <code>frontend/scripts/pseudo.mjs</code> |
| M | <code>frontend/src/App.tsx</code> |
| M | <code>frontend/src/RootApp.tsx</code> |
| M | <code>frontend/src/components/HandbookView.tsx</code> |
| M | <code>frontend/src/components/PngExportOptionsDialog.tsx</code> |
| M | <code>frontend/src/features/physicalDocumentation/ConnectTable.tsx</code> |
| M | <code>frontend/src/features/physicalDocumentation/PhysicalDocumentation.tsx</code> |
| M | <code>frontend/src/features/physicalDocumentation/connectTable.test.ts</code> |
| A | <code>frontend/src/features/physicalDocumentation/presentation.ts</code> |
| M | <code>frontend/src/features/physicalPorts/PhysicalPortPicker.tsx</code> |
| M | <code>frontend/src/features/physicalPorts/PhysicalPortsEditor.tsx</code> |
| M | <code>frontend/src/features/physicalPorts/PoeControl.tsx</code> |
| M | <code>frontend/src/features/physicalPorts/patchPanelPower.test.ts</code> |
| M | <code>frontend/src/features/rack/AbsBlankPanelInspector.tsx</code> |
| M | <code>frontend/src/features/rack/DriveBaySetup.tsx</code> |
| M | <code>frontend/src/features/rack/DriveBaySlots.tsx</code> |
| M | <code>frontend/src/features/rack/RackAppearanceControls.tsx</code> |
| M | <code>frontend/src/features/rack/RackCreateDialog.tsx</code> |
| M | <code>frontend/src/features/rack/RackDeleteDialog.tsx</code> |
| M | <code>frontend/src/features/rack/RackElevation.tsx</code> |
| M | <code>frontend/src/features/rack/RackElevationControl.tsx</code> |
| M | <code>frontend/src/features/rack/RackEquipmentMenu.tsx</code> |
| M | <code>frontend/src/features/rack/RackHardwareSettings.tsx</code> |
| M | <code>frontend/src/features/rack/RackInspector.tsx</code> |
| M | <code>frontend/src/features/rack/RackLogoPickerModal.tsx</code> |
| M | <code>frontend/src/features/rack/RackLogoSettings.tsx</code> |
| M | <code>frontend/src/features/rack/RackPalette.tsx</code> |
| M | <code>frontend/src/features/rack/RackPlacement.tsx</code> |
| M | <code>frontend/src/features/rack/RackPngExportScene.tsx</code> |
| M | <code>frontend/src/features/rack/RackPresentationControl.tsx</code> |
| M | <code>frontend/src/features/rack/RackPromotionDialog.tsx</code> |
| M | <code>frontend/src/features/rack/RackRearHardware.tsx</code> |
| M | <code>frontend/src/features/rack/RackSettingsPanel.tsx</code> |
| M | <code>frontend/src/features/rack/RackToolbar.tsx</code> |
| M | <code>frontend/src/features/rack/RackViewToggle.tsx</code> |
| M | <code>frontend/src/features/rack/RackWorkspace.tsx</code> |
| M | <code>frontend/src/features/rack/ServerStorageIndicators.tsx</code> |
| M | <code>frontend/src/features/rack/ServerStorageInspector.tsx</code> |
| M | <code>frontend/src/features/rack/absPanelGraphicsModel.test.ts</code> |
| M | <code>frontend/src/features/rack/cables/CableConnectionInfo.tsx</code> |
| M | <code>frontend/src/features/rack/cables/CableInteractions.tsx</code> |
| M | <code>frontend/src/features/rack/cables/CableLabelEditor.tsx</code> |
| M | <code>frontend/src/features/rack/cables/CablePaletteSettings.tsx</code> |
| M | <code>frontend/src/features/rack/cables/CablePopover.tsx</code> |
| M | <code>frontend/src/features/rack/cables/RackCableLayer.tsx</code> |
| M | <code>frontend/src/features/rack/cables/RackConnectionStrip.tsx</code> |
| M | <code>frontend/src/features/rack/cables/cableRouting.test.ts</code> |
| M | <code>frontend/src/features/rack/cables/cableTrace.ts</code> |
| M | <code>frontend/src/features/rack/driveBayLayout.test.ts</code> |
| M | <code>frontend/src/features/rack/faceplates/FaceplateSettings.tsx</code> |
| M | <code>frontend/src/features/rack/faceplates/PortOverlay.tsx</code> |
| M | <code>frontend/src/features/rack/rack.css</code> |
| M | <code>frontend/src/features/rack/rackFitPreview.test.ts</code> |
| M | <code>frontend/src/features/rack/rackMetalTextures.test.ts</code> |
| M | <code>frontend/src/features/rack/rackTopSlotsRendering.test.ts</code> |
| M | <code>frontend/src/features/rack/rackViewToggle.css</code> |
| A | <code>frontend/src/features/rack/serverStorageDisplay.ts</code> |
| M | <code>frontend/src/features/rack/universalRendering.test.ts</code> |
| M | <code>frontend/src/i18n/README.md</code> |
| M | <code>frontend/src/i18n/context.json</code> |
| A | <code>frontend/src/i18n/locales/en-XA/rack.json</code> |
| A | <code>frontend/src/i18n/locales/en/rack.json</code> |
| M | <code>frontend/src/i18n/manifest.json</code> |
| A | <code>frontend/src/i18n/physicalLabels.ts</code> |
| A | <code>frontend/src/i18n/rackDiagnostic.ts</code> |
| A | <code>frontend/src/i18n/rackLocale.ts</code> |
| M | <code>frontend/src/styles/shell-responsive.css</code> |
| M | <code>frontend/tests/cable-destination-search.spec.ts</code> |
| A | <code>frontend/tests/fixtures/mobileCablePort.ts</code> |
| A | <code>frontend/tests/fixtures/renderRackMarkup.ts</code> |
| M | <code>frontend/tests/localization.spec.ts</code> |
| M | <code>frontend/tests/physical-cable-pulse.spec.ts</code> |
| M | <code>frontend/tests/physical-cables-render.spec.ts</code> |
| M | <code>frontend/tests/physical-connect-table.spec.ts</code> |
| M | <code>frontend/tests/physical-documentation-integration.spec.ts</code> |
| M | <code>frontend/tests/png-export.spec.ts</code> |
| A | <code>frontend/tests/rack-localization-layout.spec.ts</code> |
| A | <code>frontend/tests/rack-localization.spec.ts</code> |
| M | <code>frontend/tests/rack-png-export.spec.ts</code> |
| M | <code>frontend/tests/rack-settings.spec.ts</code> |
| M | <code>frontend/tests/rack.spec.ts</code> |
| M | <code>frontend/tests/workspace-switcher-height.spec.ts</code> |

Working tree relative to the final HEAD. Each of the tracked modifications below is unstaged.

- Modified <code>PROJECT_LOG.md</code>
- Modified <code>dev/Localize/M5_scope_and_gates.md</code>
- Modified <code>frontend/src/styles/shell-responsive.css</code>
- Modified <code>frontend/tests/localization.spec.ts</code>
- Modified <code>frontend/tests/png-export.spec.ts</code>
- Modified <code>frontend/tests/rack-localization-layout.spec.ts</code>
- Untracked <code>dev/Localize/M5_verification.md</code>
