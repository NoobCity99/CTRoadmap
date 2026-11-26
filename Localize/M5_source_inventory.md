# M5 source inventory

Original line numbers refer to `faac2370afd626498f77145b25c3d2f1199396a5`. Each table identifies the original UI owner, literal or expression and its display or data boundary. Repeated identical literals in one file share the first location. The [English catalog](../../frontend/src/i18n/locales/en/rack.json) preserves the complete message wording and the [context catalog](../../frontend/src/i18n/context.json) describes each surface and interpolation.

## M5a

Test owners cover Rack model, workspace, settings, presentation, appearance, branding, Inspector, save/history and deletion. See the [verification ledger](M5_verification.md) for individual browser outcomes.

### RackPalette

[frontend/src/features/rack/RackPalette.tsx](../../frontend/src/features/rack/RackPalette.tsx)

Display groups in this consumer include `rack:component`, `rack:palette`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 15 | <code>ctroadmap.rack.generalItemsCollapsed</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPalette`. The source link identifies the producer and its consumer. |
| 17 | <code>onPaletteDragStart</code> | Canonical display input, geometry or diagnostic fragment retained by `beginDrag`. The source link identifies the producer and its consumer. |
| 49 | <code>`${tile.title} ${tile.type}${tile.type === "equipment" ? ` ${getTileDisplay(tile).label}` : ""}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPalette`. The source link identifies the producer and its consumer. |
| 49 | <code>` ${getTileDisplay(tile).label}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPalette`. The source link identifies the producer and its consumer. |
| 55 | <code>Racks</code> | Included at presentation. `rack:palette.racks`. |
| 57 | <code>Active rack</code> | Included at presentation. `rack:palette.activeRack`. |
| 61 | <code>New</code> | Included at presentation. `rack:palette.new`. |
| 62 | <code>Edit</code> | Included at presentation. `rack:palette.edit`. |
| 63 | <code>Delete</code> | Included at presentation. `rack:palette.delete`. |
| 66 | <code>sidebar-section sidebar-section--collapsed sidebar-section--spaced</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPalette`. The source link identifies the producer and its consumer. |
| 66 | <code>sidebar-section sidebar-section--spaced</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPalette`. The source link identifies the producer and its consumer. |
| 68 | <code>General Rack Items</code> | Included at presentation. `rack:palette.generalRackItems`. |
| 75 | <code>Add from Atlas</code> | Included at presentation. `rack:palette.addFromAtlas`. |
| 76 | <code>Search Atlas tiles</code> | Included at presentation. `rack:palette.searchAtlasTiles`. |
| 76 | <code>Search tiles...</code> | Included at presentation. `rack:palette.searchTiles`. |
| 80 | <code>`Already used in ${uses.map(rackUseLabel).join("; ")}`</code> | Included as a whole message or incorporated into a named template in `RackPalette`. See the display groups for this owner. |
| 83 | <code>`Add ${tile.title}`</code> | Included as a whole message or incorporated into a named template in `RackPalette`. See the display groups for this owner. |
| 86 | <code>RELATED</code> | Included at presentation. `rack:palette.related`. |
| 89 | <code>No matching Atlas tiles.</code> | Included at presentation. `rack:palette.noMatchingAtlasTiles`. |
| 91 | <code>Rack Warnings</code> | Included at presentation. `rack:palette.rackWarnings`. |
| 93 | <code>No rack warnings</code> | Included at presentation. `rack:palette.noRackWarnings`. |
| 95 | <code>Create a rack to start an elevation.</code> | Included at presentation. `rack:palette.createARackToStartAnElevation`. |

### RackToolbar

[frontend/src/features/rack/RackToolbar.tsx](../../frontend/src/features/rack/RackToolbar.tsx)

Display groups in this consumer include `rack:toolbar`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 24 | <code>`${rack.name} controls`</code> | Included as a whole message or incorporated into a named template in `RackToolbar`. See the display groups for this owner. |
| 26 | <code>Zoom out</code> | Included at presentation. `rack:toolbar.zoomOut`. |
| 27 | <code>Fit Rack</code> | Included at presentation. `rack:toolbar.fitRack`. |
| 28 | <code>Zoom in</code> | Included at presentation. `rack:toolbar.zoomIn`. |
| 31 | <code>Connect Table</code> | Included at presentation. `rack:toolbar.connectTable`. |
| 31 | <code>TABLE ↵ HIDDEN</code> | Included at presentation. `rack:toolbar.tableHidden`. |
| 31 | <code>TABLE ↵ SHOWN</code> | Included at presentation. `rack:toolbar.tableShown`. |
| 31 | <code>Show or hide the connection table</code> | Included at presentation. `rack:toolbar.showOrHideTheConnectionTable`. |
| 32 | <code>Show Connections</code> | Included at presentation. `rack:toolbar.showConnections`. |
| 33 | <code>CABLES ↵ HIDDEN</code> | Included at presentation. `rack:toolbar.cablesHidden`. |
| 33 | <code>CABLES ↵ OUT</code> | Included at presentation. `rack:toolbar.cablesOut`. |
| 33 | <code>Show or hide Rack connections</code> | Included at presentation. `rack:toolbar.showOrHideRackConnections`. |
| 36 | <code>Rack elevation</code> | Included at presentation. `rack:toolbar.rackElevation`. |

### RackWorkspace

[frontend/src/features/rack/RackWorkspace.tsx](../../frontend/src/features/rack/RackWorkspace.tsx)

Display groups in this consumer include `rack:workspace`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 47 | <code>ctroadmap.rack.activeRackId</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 49 | <code>ctroadmap.rack.viewMode</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 92 | <code>ctroadmap.rack.connectTable</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 140 | <code>Escape</code> | Canonical keyboard event. |
| 144 | <code>[role="dialog"]:not([hidden]), dialog[open]</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 176 | <code>`${activeRack?.id}:${presentationMode}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 271 | <code>The Rack is no longer available.</code> | Legacy diagnostic mapped by `rack:errors.theRackIsNoLongerAvailable`. |
| 285 | <code>That placement is not legal.</code> | Legacy diagnostic mapped by `rack:errors.thatPlacementIsNotLegal`. |
| 288 | <code>`Placed at ${adaptivePlacementLabel(fit.placement)} (auto-fit).`</code> | Included as a whole message or incorporated into a named template in `addAutomatically`. See the display groups for this owner. |
| 299 | <code>`Already used in ${uses.map(rackUseLabel).join("; ")}. Remove the original placement first.`</code> | Included as a whole message or incorporated into a named template in `addAtlas`. See the display groups for this owner. |
| 378 | <code>`NO FIT · ${slot} · ${check.reason}`</code> | Canonical display input, geometry or diagnostic fragment retained by `resolvePaletteAt`. The source link identifies the producer and its consumer. |
| 453 | <code>This equipment cannot hold server Drives. Drop onto a Node, Generic Server or configured Drive Bay.</code> | Legacy diagnostic mapped by `rack:errors.thisEquipmentCannotHoldServerDrivesDrop`. |
| 458 | <code>Unable to locate the Rack target. Try the drag again.</code> | Legacy diagnostic mapped by `rack:errors.unableToLocateTheRackTargetTry`. |
| 512 | <code>Invalid drop; the previous position was restored.</code> | Legacy diagnostic mapped by `rack:errors.invalidDropThePreviousPositionWasRestored`. |
| 532 | <code>No rack selected.</code> | Legacy diagnostic mapped by `rack:errors.noRackSelected`. |
| 536 | <code>Schematic appearance is read-only in this mode.</code> | Legacy diagnostic mapped by `rack:errors.schematicAppearanceIsReadOnlyInThis`. |
| 538 | <code>That equipment change is not legal.</code> | Legacy diagnostic mapped by `rack:errors.thatEquipmentChangeIsNotLegal`. |
| 643 | <code>`Delete ALL physical connections for rack "${target.name}"?\n\nThis will remove all records of cable and port connections associated with this rack from your documentation, including cables connecting to other racks. Equipment, ports and internal patch-panel pairings will remain.\n\nThe rack will remain so you can review it before trying Delete again.`</code> | Included as a whole message or incorporated into a named template in `confirmRackDeletion`. See the display groups for this owner. |
| 650 | <code>`All physical connections for rack "${target.name}" have been removed and saved. Review the rack, then click Delete again to delete it.`</code> | Included as a whole message or incorporated into a named template in `confirmRackDeletion`. See the display groups for this owner. |
| 651 | <code>`Rack "${target.name}" deleted.`</code> | Included as a whole message or incorporated into a named template in `confirmRackDeletion`. See the display groups for this owner. |
| 654 | <code>The rack action could not be completed. Check Save status and review the rack before trying again.</code> | Legacy diagnostic mapped by `rack:errors.theRackActionCouldNotBeCompleted`. |
| 666 | <code>`${activeRack.id}:${face}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 680 | <code>Rack workspace</code> | Included at presentation. `rack:workspace.rackWorkspace`. |
| 681 | <code>`auto ${table &amp;&amp; viewMode === "both" ? "auto " : ""}minmax(0, 1fr)`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 681 | <code>auto</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 682 | <code>Dismiss</code> | Included at presentation. `rack:workspace.dismiss`. |
| 688 | <code>Rack viewport</code> | Included at presentation. `rack:workspace.rackViewport`. |
| 688 | <code>rack-viewport rack-viewport--zoomed</code> | DOM, SVG, React, event or serialized identity. See `RackWorkspace`. |
| 690 | <code>`translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${displayScale})`</code> | DOM, SVG, React, event or serialized identity. See `RackWorkspace`. |
| 691 | <code>rack-drop-readout is-invalid</code> | DOM, SVG, React, event or serialized identity. See `RackWorkspace`. |
| 691 | <code>Target</code> | Included as a whole message or incorporated into a named template in `RackWorkspace`. See the display groups for this owner. |
| 691 | <code>`${adaptivePlacementLabel(preview)} · ${preview.u_height}U`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 691 | <code>`${preview.position}U · ${horizontalPosition(preview.width_fraction, preview.column)} (from Front) · ${preview.u_height}U ${preview.width_fraction}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 691 | <code>` · ${checkPlacement(activeRack!, preview, preview.id, atlas).reason}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 692 | <code>`rack-drop-readout${dropPreview.status === "invalid" ? " is-invalid" : ""}`</code> | DOM, SVG, React, event or serialized identity. See `RackWorkspace`. |
| 692 | <code>is-invalid</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 696 | <code>No racks yet</code> | Included at presentation. `rack:workspace.noRacksYet`. |
| 696 | <code>Create a 10-inch or 19-inch rack to start an elevation.</code> | Included at presentation. `rack:workspace.createA10InchOr19Inch`. |
| 696 | <code>Create Rack</code> | Included at presentation. `rack:workspace.createRack`. |
| 698 | <code>`${activeRack?.id}:${selectedPlacement?.id}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackWorkspace`. The source link identifies the producer and its consumer. |
| 702 | <code>Select a server.</code> | Legacy diagnostic mapped by `rack:errors.selectAServer`. |
| 709 | <code>Select a Drive Bay.</code> | Legacy diagnostic mapped by `rack:errors.selectADriveBay`. |
| 719 | <code>Choose Drive Bay slot</code> | Included at presentation. `rack:workspace.chooseDriveBaySlot`. |
| 720 | <code>Choose slot</code> | Included at presentation. `rack:workspace.chooseSlot`. |
| 720 | <code>Select the physical position for this Drive.</code> | Included at presentation. `rack:workspace.selectThePhysicalPositionForThisDrive`. |
| 723 | <code>Slot</code> | Included at presentation. `rack:inspector.slot`. |
| 724 | <code>Cancel</code> | Included at presentation. `rack:workspace.cancel`. |

### RackInspector

[frontend/src/features/rack/RackInspector.tsx](../../frontend/src/features/rack/RackInspector.tsx)

Display groups in this consumer include `rack:component`, `rack:elevation`, `rack:settings`, `rack:equipment`, `rack:inspector`, `rack:tabs`, `rack:documentation`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 39 | <code>This early version of the RACK BUILDER is intentionally bare bones. Hoping to get YOUR feedback on what's important to you. Visual accuracy? Specific drive bay layouts? Or is your focus on depicting connections and port assignments? Would love to hear your ideas to make this feature work best for you.</code> | Included at presentation. `rack:inspector.feedbackPrompt`. |
| 42 | <code>RACK FEEDBACK</code> | Included at presentation. `rack:inspector.feedbackLink`. |
| 43 | <code>https://forms.gle/jGAHfDYsHZgiRerp9</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 51 | <code>Drive-owned port</code> | Included at presentation. `rack:inspector.driveOwnedPort`. |
| 105 | <code>`${detailsId}-${tab}-tab`</code> | Canonical display input, geometry or diagnostic fragment retained by `selectTab`. The source link identifies the producer and its consumer. |
| 118 | <code>`${detailsId}-drives-tab`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 141 | <code>No rack selected</code> | Included at presentation. `rack:inspector.noRackSelected`. |
| 144 | <code>Rack Settings</code> | Included at presentation. `rack:inspector.rackSettings`. |
| 146 | <code>Width</code> | Included at presentation. `rack:inspector.width`. |
| 146 | <code>-inch</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 146 | <code>Height</code> | Included at presentation. `rack:inspector.height`. |
| 146 | <code>U</code> | Technical notation or product/keyboard identifier. |
| 148 | <code>Edit Rack Settings</code> | Included at presentation. `rack:inspector.editRackSettings`. |
| 153 | <code>Select equipment to edit its identity, size, position, and physical ports.</code> | Included at presentation. `rack:inspector.selectEquipmentToEditItsIdentitySize`. |
| 184 | <code>`${rack.id}:${placement.id}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 186 | <code>Remove Drive</code> | Included at presentation. `rack:inspector.removeDrive`. |
| 191 | <code>INSIDE DRIVE BAY</code> | Included at presentation. `rack:inspector.insideDriveBay`. |
| 193 | <code>Backplane</code> | Included at presentation. `rack:inspector.backplane`. |
| 193 | <code>Direct</code> | Included at presentation. `rack:inspector.direct`. |
| 193 | <code>fixed slots</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 197 | <code>Slot</code> | Included at presentation. `rack:inspector.slot`. |
| 197 | <code>Empty</code> | Included at presentation. `rack:inspector.empty`. |
| 197 | <code>` · ${port.label}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 197 | <code>` · ${drivePort.label}${port ? " (internal mate; no cable)" : ""}`</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 197 | <code>(internal mate; no cable)</code> | Included at presentation. `rack:documentation.internalMateSuffix`. |
| 203 | <code>rack-inspector__drive is-warning</code> | DOM, SVG, React, event or serialized identity. See `RackInspector`. |
| 205 | <code>Missing Atlas Drive</code> | Included at presentation. `rack:inspector.missingAtlasDrive`. |
| 205 | <code>No longer a Drive tile</code> | Included at presentation. `rack:inspector.noLongerADriveTile`. |
| 206 | <code>Remove</code> | Included at presentation. `rack:inspector.remove`. |
| 212 | <code>Drag Atlas Drives into this Drive Bay.</code> | Included at presentation. `rack:inspector.dragAtlasDrivesIntoThisDriveBay`. |
| 220 | <code>Equipment</code> | Included at presentation. `rack:inspector.equipment`. |
| 221 | <code>Remove equipment</code> | Included at presentation. `rack:inspector.removeEquipment`, `rack:inspector.removeEquipmentCaption`. |
| 221 | <code>equipment</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 224 | <code>No drives configured</code> | Included at presentation. `rack:inspector.noDrivesConfigured`. |
| 226 | <code>`${detailsId}-${activeTab}-tab`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 232 | <code>Atlas reference is missing. The cached title is preserved.</code> | Included at presentation. `rack:inspector.atlasReferenceIsMissingTheCachedTitle`. |
| 233 | <code>Also placed in</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 235 | <code>Title</code> | Included at presentation. `rack:inspector.title`. |
| 238 | <code>Component type</code> | Included at presentation. `rack:inspector.componentType`. |
| 242 | <code>Equipment Icon</code> | Included at presentation. `rack:inspector.equipmentIcon`. |
| 245 | <code>Default</code> | Included at presentation. `rack:inspector.default`. |
| 246 | <code>Unavailable icon ·</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 250 | <code>Remove all contained Drives before changing the component type.</code> | Included at presentation. `rack:inspector.removeAllContainedDrivesBeforeChangingThe`. |
| 253 | <code>Location</code> | Included at presentation. `rack:inspector.location`. |
| 253 | <code>Lowest U</code> | Included at presentation. `rack:inspector.lowestU`. |
| 256 | <code>Top-mounted ·</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 256 | <code>· fixed 1U / full depth</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 258 | <code>Width (cells)</code> | Included at presentation. `rack:inspector.widthCells`. |
| 259 | <code>Start cell (from Front)</code> | Included at presentation. `rack:inspector.startCellFromFront`. |
| 266 | <code>Full</code> | Included at presentation. `rack:inspector.full`. |
| 266 | <code>Half</code> | Included at presentation. `rack:inspector.half`. |
| 266 | <code>Third</code> | Included at presentation. `rack:inspector.third`. |
| 267 | <code>Position (from Front)</code> | Included at presentation. `rack:inspector.positionFromFront`. |
| 269 | <code>Depth</code> | Included at presentation. `rack:inspector.depth`. |
| 272 | <code>Full Depth</code> | Included at presentation. `rack:inspector.fullDepth`. |
| 272 | <code>Half Depth</code> | Included at presentation. `rack:inspector.halfDepth`. |
| 273 | <code>Half Depth occupies the selected Front/Rear depth region. Width and depth are visual Rack footprints.</code> | Included at presentation. `rack:inspector.halfDepthOccupiesTheSelectedFrontRear`. |
| 275 | <code>Hide in</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 275 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 275 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 275 | <code>elevation</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 277 | <code>Ports</code> | Included at presentation. `rack:inspector.ports`. |
| 279 | <code>Mounting orientation</code> | Included at presentation. `rack:inspector.mountingOrientation`. |
| 284 | <code>Equipment details</code> | Included at presentation. `rack:inspector.equipmentDetails`. |
| 286 | <code>`${detailsId}-${tab}-panel`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 287 | <code>ArrowLeft</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 287 | <code>ArrowRight</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 287 | <code>Home</code> | Canonical keyboard event. |
| 287 | <code>End</code> | Canonical keyboard event. |
| 296 | <code>`${detailsId}-ports-panel`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 296 | <code>`${detailsId}-ports-tab`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 299 | <code>`${detailsId}-faceplate-panel`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 299 | <code>`${detailsId}-faceplate-tab`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 302 | <code>Front asset</code> | Included at presentation. `rack:inspector.frontAsset`. |
| 302 | <code>Rear asset</code> | Included at presentation. `rack:inspector.rearAsset`. |
| 304 | <code>`${detailsId}-inside-panel`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 304 | <code>`${detailsId}-inside-tab`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 305 | <code>`${detailsId}-drives-panel`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackInspector`. The source link identifies the producer and its consumer. |
| 311 | <code>Schematic Appearance</code> | Included at presentation. `rack:inspector.schematicAppearance`. |
| 315 | <code>Applies to schematic equipment only; does not alter uploaded or automatic images.</code> | Included at presentation. `rack:inspector.appliesToSchematicEquipmentOnlyDoesNot`. |
| 318 | <code>Reset Schematic Appearance</code> | Included at presentation. `rack:inspector.resetSchematicAppearance`. |
| 321 | <code>Convert to Rack-local</code> | Included at presentation. `rack:inspector.convertToRackLocal`. |
| 323 | <code>View On Canvas</code> | Included at presentation. `rack:inspector.viewOnCanvas`. |
| 324 | <code>View In Handbook</code> | Included at presentation. `rack:inspector.viewInHandbook`. |
| 326 | <code>Rack-local equipment</code> | Included at presentation. `rack:inspector.rackLocalEquipment`. |
| 332 | <code>Add to Atlas</code> | Included at presentation. `rack:inspector.addToAtlas`. |
| 333 | <code>Atlas linked ·</code> | Included as a whole message or incorporated into a named template in `RackInspector`. See the display groups for this owner. |
| 333 | <code>Planned</code> | Included at presentation. `rack:inspector.planned`. |
| 333 | <code>Live</code> | Included at presentation. `rack:inspector.live`. |
| 334 | <code>Promotion is unsaved. Use Save to retry.</code> | Included at presentation. `rack:inspector.promotionIsUnsavedUseSaveToRetry`. |

### RackCreateDialog

[frontend/src/features/rack/RackCreateDialog.tsx](../../frontend/src/features/rack/RackCreateDialog.tsx)

Display groups in this consumer include `rack:formFactor`, `rack:dialog`, `rack:settings`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 22 | <code>New Rack</code> | Editable default present in the name input. |
| 34 | <code>Close</code> | Included at presentation. `rack:dialog.close`. |
| 35 | <code>Edit Rack</code> | Included at presentation. `rack:dialog.editRack`. |
| 35 | <code>Create Rack</code> | Included at presentation. `rack:dialog.createRack`. |
| 36 | <code>Name</code> | Included at presentation. `rack:dialog.name`. |
| 37 | <code>Width</code> | Included at presentation. `rack:dialog.width`. |
| 37 | <code>19-inch</code> | Included as a whole message or incorporated into a named template in `RackCreateDialog`. See the display groups for this owner. |
| 37 | <code>10-inch</code> | Included as a whole message or incorporated into a named template in `RackCreateDialog`. See the display groups for this owner. |
| 38 | <code>Height</code> | Included at presentation. `rack:dialog.height`. |
| 41 | <code>U</code> | Technical notation or product/keyboard identifier. |
| 41 | <code>Custom</code> | Included at presentation. `rack:dialog.custom`. |
| 42 | <code>Custom height (</code> | Included as a whole message or incorporated into a named template in `RackCreateDialog`. See the display groups for this owner. |
| 42 | <code>U)</code> | Included as a whole message or incorporated into a named template in `RackCreateDialog`. See the display groups for this owner. |
| 43 | <code>Form factor</code> | Included at presentation. `rack:dialog.formFactor`. |
| 44 | <code>Numbering</code> | Included at presentation. `rack:dialog.numbering`. |
| 44 | <code>Bottom to top</code> | Included at presentation. `rack:dialog.bottomToTop`. |
| 44 | <code>Top to bottom</code> | Included at presentation. `rack:dialog.topToBottom`. |
| 45 | <code>Cancel</code> | Included at presentation. `rack:dialog.cancel`. |
| 45 | <code>Save changes</code> | Included at presentation. `rack:dialog.saveChanges`. |

### RackSettingsPanel

[frontend/src/features/rack/RackSettingsPanel.tsx](../../frontend/src/features/rack/RackSettingsPanel.tsx)

Display groups in this consumer include `rack:formFactor`, `rack:handles`, `rack:pattern`, `rack:casters`, `rack:settings`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 65 | <code>`Enter a whole number from ${MIN_RACK_U_HEIGHT} to ${MAX_RACK_U_HEIGHT}U.`</code> | Canonical display input, geometry or diagnostic fragment retained by `commitHeight`. The source link identifies the producer and its consumer. |
| 74 | <code>Enter</code> | Canonical keyboard event. |
| 75 | <code>Escape</code> | Canonical keyboard event. |
| 79 | <code>`rack-setting-${field}-error`</code> | DOM, SVG, React, event or serialized identity. See `RackSettingsPanel`. |
| 82 | <code>Edit Rack Settings</code> | Included at presentation. `rack:settings.editRackSettings`. |
| 84 | <code>Name</code> | Included at presentation. `rack:settings.name`. |
| 91 | <code>Height (U)</code> | Included at presentation. `rack:settings.heightU`. |
| 95 | <code>Height presets</code> | Included at presentation. `rack:settings.heightPresets`. |
| 97 | <code>U</code> | Technical notation or product/keyboard identifier. |
| 102 | <code>Width</code> | Included at presentation. `rack:settings.width`. |
| 105 | <code>-inch</code> | Included as a whole message or incorporated into a named template in `RackSettingsPanel`. See the display groups for this owner. |
| 110 | <code>Form factor</code> | Included at presentation. `rack:settings.formFactor`. |
| 118 | <code>Numbering</code> | Included at presentation. `rack:settings.numbering`. |
| 120 | <code>Bottom to top</code> | Included at presentation. `rack:settings.bottomToTop`. |
| 121 | <code>Top to bottom</code> | Included at presentation. `rack:settings.topToBottom`. |
| 129 | <code>Mirror Rear Layout</code> | Included at presentation. `rack:settings.mirrorRearLayout`. |
| 131 | <code>Mirror equipment positions in the Rear elevation and reverse schematic rear patch-panel ports. Other ports retain their alignment within the device; calibrated and uploaded images keep their socket positions.</code> | Included at presentation. `rack:settings.mirrorEquipmentPositionsInTheRearElevation`. |
| 135 | <code>Appearance</code> | Included at presentation. `rack:settings.appearance`. |
| 136 | <code>Frame</code> | Included at presentation. `rack:settings.frame`. |
| 137 | <code>Background color</code> | Included at presentation. `rack:settings.backgroundColor`. |
| 138 | <code>Automatically coordinates the workspace and Front/Rear elevation backgrounds.</code> | Included at presentation. `rack:settings.automaticallyCoordinatesTheWorkspaceAndFrontRear`. |
| 139 | <code>Top Panel Pattern</code> | Included at presentation. `rack:settings.topPanelPattern`. |
| 142 | <code>Handles</code> | Included at presentation. `rack:settings.handles`. |
| 146 | <code>Handle color</code> | Included at presentation. `rack:settings.handleColor`. |
| 147 | <code>Uses the frame color until customized.</code> | Included at presentation. `rack:settings.usesTheFrameColorUntilCustomized`. |
| 148 | <code>Handles keep the frame finish.</code> | Included at presentation. `rack:settings.handlesKeepTheFrameFinish`. |
| 150 | <code>Caster Wheels</code> | Included at presentation. `rack:settings.casterWheels`. |
| 154 | <code>Reset removes all Rack appearance customizations, including branding and accessories. Uploaded library files are kept.</code> | Included at presentation. `rack:settings.resetRemovesAllRackAppearanceCustomizationsIncluding`. |
| 155 | <code>Reset Rack Appearance</code> | Included at presentation. `rack:settings.resetRackAppearance`. |

### RackEquipmentMenu

[frontend/src/features/rack/RackEquipmentMenu.tsx](../../frontend/src/features/rack/RackEquipmentMenu.tsx)

Display groups in this consumer include `rack:elevation`, `rack:equipment`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 13 | <code>Escape</code> | Canonical keyboard event. |
| 20 | <code>Equipment visibility</code> | Included at presentation. `rack:equipment.equipmentVisibility`. |
| 23 | <code>Hide in</code> | Included as a whole message or incorporated into a named template in `RackEquipmentMenu`. See the display groups for this owner. |
| 23 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 23 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 23 | <code>elevation</code> | Included as a whole message or incorporated into a named template in `RackEquipmentMenu`. See the display groups for this owner. |
| 25 | <code>Temporary inspection · does not change occupancy</code> | Included at presentation. `rack:equipment.temporaryInspectionDoesNotChangeOccupancy`. |

### RackDeleteDialog

[frontend/src/features/rack/RackDeleteDialog.tsx](../../frontend/src/features/rack/RackDeleteDialog.tsx)

Display groups in this consumer include `rack:deletion`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 26 | <code>Disconnect before deleting rack</code> | Included at presentation. `rack:deletion.disconnectBeforeDeletingRack`. |
| 26 | <code>Delete rack</code> | Included at presentation. `rack:deletion.deleteRack`. |
| 29 | <code>Disconnect all recorded physical connections before deleting rack “</code> | Included as a whole message or incorporated into a named template in `RackDeleteDialog`. See the display groups for this owner. |
| 30 | <code>cable connection</code> | Included as a whole message or incorporated into a named template in `RackDeleteDialog`. See the display groups for this owner. |
| 30 | <code>associated with this rack will be removed from your documentation, including cables connecting to other racks. Equipment, ports and internal patch-panel pairings will remain.</code> | Included as a whole message or incorporated into a named template in `RackDeleteDialog`. See the display groups for this owner. |
| 31 | <code>Some connections on shared equipment have no assigned rack location. Assign their locations or disconnect them individually first.</code> | Included at presentation. `rack:deletion.someConnectionsOnSharedEquipmentHaveNo`. |
| 32 | <code>After removing the connections, review the rack and click Delete again to delete it.</code> | Included at presentation. `rack:deletion.afterRemovingTheConnectionsReviewTheRack`. |
| 33 | <code>Delete rack “</code> | Included as a whole message or incorporated into a named template in `RackDeleteDialog`. See the display groups for this owner. |
| 33 | <code>” and all of its placements? Atlas tiles will remain.</code> | Included as a whole message or incorporated into a named template in `RackDeleteDialog`. See the display groups for this owner. |
| 36 | <code>Cancel</code> | Included at presentation. `rack:deletion.cancel`. |
| 38 | <code>Saving…</code> | Included at presentation. `rack:deletion.saving`. |
| 38 | <code>Delete all physical connections for this rack</code> | Included at presentation. `rack:deletion.deleteAllPhysicalConnectionsForThisRack`. |

### RackLogoSettings

[frontend/src/features/rack/RackLogoSettings.tsx](../../frontend/src/features/rack/RackLogoSettings.tsx)

Display groups in this consumer include `rack:branding`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 13 | <code>Rack branding:</code> | Included as a whole message or incorporated into a named template in `RackLogoSettings`. See the display groups for this owner. |
| 13 | <code>Unavailable logo</code> | Included at presentation. `rack:branding.unavailableLogo`. |
| 13 | <code>None</code> | Included at presentation. `rack:branding.none`. |
| 14 | <code>Selected Rack logo</code> | Included at presentation. `rack:branding.selectedRackLogo`. |
| 15 | <code>The saved logo is unavailable on this installation. Choose or re-upload it; the saved reference has not changed.</code> | Included at presentation. `rack:branding.theSavedLogoIsUnavailableOnThis`. |
| 16 | <code>Choose Rack Logo</code> | Included at presentation. `rack:branding.chooseRackLogo`. |
| 17 | <code>Clear Logo</code> | Included at presentation. `rack:branding.clearLogo`. |

### RackLogoPickerModal

[frontend/src/features/rack/RackLogoPickerModal.tsx](../../frontend/src/features/rack/RackLogoPickerModal.tsx)

Display groups in this consumer include `rack:branding`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 20 | <code>`rack-logo-${useId().replace(/:/g, "")}`</code> | DOM, SVG, React, event or serialized identity. See `RackLogoPickerModal`. |
| 35 | <code>Unable to load My Logos.</code> | Legacy diagnostic mapped by `rack:errors.unableToLoadMyLogos`. |
| 60 | <code>`Select ${item.name}`</code> | Included as a whole message or incorporated into a named template in `RackLogoPickerModal`. See the display groups for this owner. |
| 62 | <code>`rack-logo-picker__thumbnail rack-logo-picker__thumbnail--${item.background}`</code> | DOM, SVG, React, event or serialized identity. See `RackLogoPickerModal`. |
| 66 | <code>Choose a PNG, JPEG or WebP no larger than 2 MiB. SVG uploads are not supported.</code> | Legacy diagnostic mapped by `rack:errors.chooseAPngJpegOrWebpNo`. |
| 67 | <code>Uploading logo…</code> | Legacy diagnostic mapped by `rack:errors.uploadingLogo`. |
| 72 | <code>Logo added to My Logos. Apply to use it on this Rack.</code> | Legacy diagnostic mapped by `rack:errors.logoAddedToMyLogosApplyTo`. |
| 73 | <code>Logo upload failed.</code> | Legacy diagnostic mapped by `rack:errors.logoUploadFailed`. |
| 78 | <code>`${id}-title`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackLogoPickerModal`. The source link identifies the producer and its consumer. |
| 79 | <code>Choose Rack Logo</code> | Included at presentation. `rack:branding.chooseRackLogo`. |
| 79 | <code>Branding for</code> | Included as a whole message or incorporated into a named template in `RackLogoPickerModal`. See the display groups for this owner. |
| 79 | <code>Close logo picker</code> | Included at presentation. `rack:branding.closeLogoPicker`. |
| 81 | <code>`${geometry.panel.x - 8} ${previewY} ${geometry.panel.width + 16} ${geometry.panel.height + geometry.handleRise + 16}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackLogoPickerModal`. The source link identifies the producer and its consumer. |
| 81 | <code>`${rack.width}-inch Rack top-panel preview`</code> | Included as a whole message or incorporated into a named template in `RackLogoPickerModal`. See the display groups for this owner. |
| 84 | <code>Branding mode</code> | Included at presentation. `rack:branding.brandingMode`. |
| 85 | <code>None / Remove From Rack</code> | Included at presentation. `rack:branding.noneRemoveFromRack`. |
| 86 | <code>Text Only</code> | Included at presentation. `rack:branding.textOnly`. |
| 87 | <code>Add Logo</code> | Included at presentation. `rack:branding.addLogo`. |
| 88 | <code>Upload Rack logo</code> | Included at presentation. `rack:branding.uploadRackLogo`. |
| 90 | <code>Brand text</code> | Included at presentation. `rack:branding.brandText`. |
| 90 | <code>1–48 characters. The Rack name stays separate.</code> | Included at presentation. `rack:branding.textLength`. |
| 91 | <code>Search logos</code> | Included at presentation. `rack:branding.searchLogos`. |
| 92 | <code>Built-in</code> | Included at presentation. `rack:branding.builtIn`. |
| 93 | <code>My Logos</code> | Included at presentation. `rack:branding.myLogos`. |
| 93 | <code>Loading My Logos…</code> | Included at presentation. `rack:branding.loadingMyLogos`. |
| 93 | <code>No uploaded logos yet.</code> | Included at presentation. `rack:branding.noUploadedLogosYet`. |
| 94 | <code>Transparent PNG or WebP is best. Use about 1200 × 300 px (4:1) for a wordmark, 512 × 512 px for a square symbol, or 800–1600 px wide for other wordmarks. Keep the natural proportions and minimal transparent padding. Maximum 2 MiB, 4096 px per side, 8 megapixels; single-frame only. JPEG is accepted but lacks transparency. SVG uploads are not supported.</code> | Included at presentation. `rack:branding.imageRequirements`. |
| 95 | <code>Uploaded logos stay in My Logos for reuse, including after Cancel or Reset. Atlas JSON exports contain logo references, not the image files; copy the logo assets separately when moving installations.</code> | Included at presentation. `rack:branding.libraryHelp`. |
| 96 | <code>This saved logo is unavailable. Its reference is preserved until you choose a replacement.</code> | Included at presentation. `rack:branding.thisSavedLogoIsUnavailableItsReference`. |
| 99 | <code>Cancel</code> | Included at presentation. `rack:branding.cancel`. |
| 99 | <code>Apply</code> | Included at presentation. `rack:branding.apply`. |

### RackAppearanceControls

[frontend/src/features/rack/RackAppearanceControls.tsx](../../frontend/src/features/rack/RackAppearanceControls.tsx)

Display groups in this consumer include `rack:finish`, `rack:appearance`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 7 | <code>Legacy appearance until a color or finish is selected.</code> | Included at presentation. `rack:appearance.unsetHint`. |
| 27 | <code>Enter # followed by six hexadecimal digits.</code> | Legacy diagnostic mapped by `rack:errors.enterFollowedBySixHexadecimalDigits`. |
| 34 | <code>`${label} picker`</code> | Included as a whole message or incorporated into a named template in `RackColorControl`. See the display groups for this owner. |
| 37 | <code>`${id}-error`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackColorControl`. The source link identifies the producer and its consumer. |
| 41 | <code>Enter</code> | Canonical keyboard event. |
| 42 | <code>Escape</code> | Canonical keyboard event. |
| 45 | <code>`${label} presets`</code> | Included as a whole message or incorporated into a named template in `RackColorControl`. See the display groups for this owner. |
| 46 | <code>`${label} ${color}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackColorControl`. The source link identifies the producer and its consumer. |
| 55 | <code>Frame</code> | Included at presentation. `rack:settings.frame`. |
| 55 | <code>Equipment</code> | Included at presentation. `rack:inspector.equipment`, `rack:promotion.equipment`. |
| 59 | <code>`${label} color`</code> | Included as a whole message or incorporated into a named template in `RackMaterialControl`. See the display groups for this owner. |
| 60 | <code>finish</code> | Included as a whole message or incorporated into a named template in `RackMaterialControl`. See the display groups for this owner. |

### RackElevationControl

[frontend/src/features/rack/RackElevationControl.tsx](../../frontend/src/features/rack/RackElevationControl.tsx)

Display groups in this consumer include `rack:elevation`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 6 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 6 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 6 | <code>Both</code> | Included at presentation. `rack:elevation.both`. |
| 16 | <code>`Rack elevation: ${LABELS[mode]}`</code> | Included as a whole message or incorporated into a named template in `RackElevationControl`. See the display groups for this owner. |
| 17 | <code>`Show ${LABELS[next]}. Cycles ${allowBoth ? "Front, Rear, Both" : "Front, Rear"}.`</code> | Included as a whole message or incorporated into a named template in `RackElevationControl`. See the display groups for this owner. |
| 17 | <code>Front, Rear, Both</code> | Replaced at the display boundary in `RackElevationControl`. Stable option, schema, selection and geometry values are retained. |
| 17 | <code>Front, Rear</code> | Replaced at the display boundary in `RackElevationControl`. Stable option, schema, selection and geometry values are retained. |
| 17 | <code>`${LABELS[mode]} Rack view`</code> | Included as a whole message or incorporated into a named template in `RackElevationControl`. See the display groups for this owner. |
| 26 | <code>Front-facing</code> | Included at presentation. `rack:elevation.frontFacing`. |
| 26 | <code>Rear-facing</code> | Included at presentation. `rack:elevation.rearFacing`. |
| 28 | <code>`Mounting orientation: ${labels[mode]}`</code> | Included as a whole message or incorporated into a named template in `RackMountingControl`. See the display groups for this owner. |
| 29 | <code>`Mount ${labels[next].toLowerCase()}. Cycles Front-facing, Rear-facing.`</code> | Included as a whole message or incorporated into a named template in `RackMountingControl`. See the display groups for this owner. |
| 30 | <code>`${labels[mode]} mounting`</code> | Included as a whole message or incorporated into a named template in `RackMountingControl`. See the display groups for this owner. |
| 49 | <code>`rack-elevation-control ${className}`</code> | DOM, SVG, React, event or serialized identity. See `RotatingRackControl`. |
| 51 | <code>`rack-elevation-control__faces${rotation.turn ? " is-rotating" : ""}`</code> | DOM, SVG, React, event or serialized identity. See `RotatingRackControl`. |
| 51 | <code>is-rotating</code> | Canonical display input, geometry or diagnostic fragment retained by `RotatingRackControl`. The source link identifies the producer and its consumer. |

### RackPresentationControl

[frontend/src/features/rack/RackPresentationControl.tsx](../../frontend/src/features/rack/RackPresentationControl.tsx)

Display groups in this consumer include `rack:toolbar`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 7 | <code>Rack presentation</code> | Included at presentation. `rack:toolbar.rackPresentation`. |
| 8 | <code>Image rendering</code> | Included at presentation. `rack:toolbar.imageRendering`. |
| 10 | <code>Schematic</code> | Included at presentation. `rack:toolbar.schematic`. |
| 10 | <code>Images</code> | Included at presentation. `rack:toolbar.images`. |
| 11 | <code>`Presentation: ${mode === "images" ? "Images. Switch to Schematic." : "Schematic. Switch to Images."}`</code> | Included as a whole message or incorporated into a named template in `RackPresentationControl`. See the display groups for this owner. |
| 11 | <code>Images. Switch to Schematic.</code> | Replaced at the display boundary in `RackPresentationControl`. Stable option, schema, selection and geometry values are retained. |
| 11 | <code>Schematic. Switch to Images.</code> | Replaced at the display boundary in `RackPresentationControl`. Stable option, schema, selection and geometry values are retained. |

## M5b

Test owners cover Rack hardware, physical ports, faceplates, storage, Drive Bay and ABS models and browser interactions. See the [verification ledger](M5_verification.md) for individual browser outcomes.

### AbsBlankPanelInspector

[frontend/src/features/rack/AbsBlankPanelInspector.tsx](../../frontend/src/features/rack/AbsBlankPanelInspector.tsx)

Display groups in this consumer include `rack:elevation`, `rack:designer`, `rack:graphic`, `rack:surface`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 24 | <code>Enter</code> | Canonical keyboard event. |
| 25 | <code>Escape</code> | Canonical keyboard event. |
| 31 | <code>`abs-editor-${useId().replace(/:/g, "")}`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelInspector`. The source link identifies the producer and its consumer. |
| 81 | <code>The ABS panel changed. Select it again.</code> | Legacy diagnostic mapped by `rack:errors.theAbsPanelChangedSelectItAgain`. |
| 83 | <code>The saved design is invalid. Correct the imported design before editing.</code> | Legacy diagnostic mapped by `rack:errors.theSavedDesignIsInvalidCorrectThe`. |
| 95 | <code>This graphic is no longer available. Select another graphic.</code> | Legacy diagnostic mapped by `rack:errors.thisGraphicIsNoLongerAvailableSelect`. |
| 120 | <code>`graphic-${createUuid()}`</code> | Canonical display input, geometry or diagnostic fragment retained by `add`. The source link identifies the producer and its consumer. |
| 146 | <code>Invalid ABS panel span or design. Review the Rack warning before editing.</code> | Included at presentation. `rack:designer.invalidAbsPanelSpanOrDesignReview`. |
| 147 | <code>ABS Faceplate Designer</code> | Included at presentation. `rack:designer.absFaceplateDesigner`. |
| 149 | <code>Graphics are decorative. Use Ports for real connectors. Grid rows start at the top; cells start at the Front left edge.</code> | Included at presentation. `rack:designer.graphicsAreDecorativeUsePortsForReal`. |
| 152 | <code>`-2 -2 ${rect.width + 4} ${rect.height + 4}`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelInspector`. The source link identifies the producer and its consumer. |
| 152 | <code>Faceplate design preview, from Front</code> | Included at presentation. `rack:designer.faceplateDesignPreviewFromFront`. |
| 152 | <code>`${rect.width + 4} / ${rect.height + 4}`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelInspector`. The source link identifies the producer and its consumer. |
| 157 | <code>`c${i}`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelInspector`. The source link identifies the producer and its consumer. |
| 158 | <code>`r${i}`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelInspector`. The source link identifies the producer and its consumer. |
| 162 | <code>`Select ${absGraphicLabel(g)} ${i + 1}`</code> | Included as a whole message or incorporated into a named template in `AbsBlankPanelInspector`. See the display groups for this owner. |
| 163 | <code>`${namespace}-move-tip`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelInspector`. The source link identifies the producer and its consumer. |
| 175 | <code>Drag to move</code> | Included at presentation. `rack:designer.dragToMove`. |
| 177 | <code>Keep the whole graphic inside the panel. Release to restore its position.</code> | Included at presentation. `rack:designer.keepTheWholeGraphicInsideThePanel`. |
| 178 | <code>Graphic size</code> | Included at presentation. `rack:designer.graphicSize`. |
| 180 | <code>`Fit ${absGraphicLabel(selected)} to available space`</code> | Included as a whole message or incorporated into a named template in `AbsBlankPanelInspector`. See the display groups for this owner. |
| 180 | <code>`Make ${absGraphicLabel(selected)} ${direction}`</code> | Included as a whole message or incorporated into a named template in `AbsBlankPanelInspector`. See the display groups for this owner. |
| 181 | <code>− Smaller</code> | Included at presentation. `rack:designer.smaller`. |
| 181 | <code>+ Larger</code> | Included at presentation. `rack:designer.larger`. |
| 181 | <code>Fit Available</code> | Included at presentation. `rack:designer.fitAvailable`. |
| 184 | <code>Base Surface</code> | Included at presentation. `rack:designer.baseSurface`. |
| 189 | <code>Add Graphic ·</code> | Included as a whole message or incorporated into a named template in `AbsBlankPanelInspector`. See the display groups for this owner. |
| 190 | <code>`${entry.kind}-${entry.variant}`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelInspector`. The source link identifies the producer and its consumer. |
| 190 | <code>`Add ${entry.label}`</code> | Included as a whole message or incorporated into a named template in `AbsBlankPanelInspector`. See the display groups for this owner. |
| 194 | <code>Placed Graphics</code> | Included at presentation. `rack:designer.placedGraphics`. |
| 195 | <code>Placed graphics</code> | Included at presentation. `rack:designer.placedGraphicList`. |
| 198 | <code>`Remove ${absGraphicLabel(g)} ${i + 1}`</code> | Included as a whole message or incorporated into a named template in `AbsBlankPanelInspector`. See the display groups for this owner. |
| 200 | <code>Blank until you add a surface pattern or graphic.</code> | Included at presentation. `rack:designer.blankUntilYouAddASurfacePattern`. |
| 201 | <code>Move / Resize Graphic</code> | Included at presentation. `rack:designer.moveResizeGraphic`. |
| 202 | <code>Advanced Positioning</code> | Included at presentation. `rack:designer.advancedPositioning`. |
| 203 | <code>Graphic start cell</code> | Included at presentation. `rack:designer.graphicStartCell`. |
| 204 | <code>Graphic width (cells)</code> | Included at presentation. `rack:designer.graphicWidthCells`. |
| 205 | <code>Graphic start row (from top)</code> | Included at presentation. `rack:designer.graphicStartRowFromTop`. |
| 206 | <code>Graphic height (U)</code> | Included at presentation. `rack:designer.graphicHeightU`. |
| 208 | <code>Graphic variant</code> | Included at presentation. `rack:designer.graphicVariant`. |
| 211 | <code>Graphic color</code> | Included at presentation. `rack:designer.graphicColor`. |
| 212 | <code>Graphic frame color</code> | Included at presentation. `rack:designer.graphicFrameColor`. |
| 214 | <code>Move Back</code> | Included at presentation. `rack:designer.moveBack`. |
| 215 | <code>Move Forward</code> | Included at presentation. `rack:designer.moveForward`. |
| 216 | <code>Remove Graphic</code> | Included at presentation. `rack:designer.removeGraphic`. |
| 219 | <code>Mounted Face Custom Image</code> | Included at presentation. `rack:designer.mountedFaceCustomImage`. |
| 227 | <code>Image upload failed.</code> | Legacy diagnostic mapped by `rack:errors.imageUploadFailed`. |
| 230 | <code>PNG/JPEG/WebP · 5 MB maximum. In Images mode, the</code> | Included as a whole message or incorporated into a named template in `AbsBlankPanelInspector`. See the display groups for this owner. |
| 230 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 230 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 230 | <code>mounting face uses this image; its opposite face keeps the vector design. Keep uploaded files with Atlas backups.</code> | Included as a whole message or incorporated into a named template in `AbsBlankPanelInspector`. See the display groups for this owner. |
| 231 | <code>Mounted image assigned. Physical ports remain above the image.</code> | Included at presentation. `rack:designer.mountedImageAssignedPhysicalPortsRemainAbove`. |
| 231 | <code>Unavailable image reference retained; vector fallback.</code> | Included at presentation. `rack:designer.unavailableImageReferenceRetainedVectorFallback`. |
| 232 | <code>Remove Mounted Image</code> | Included at presentation. `rack:designer.removeMountedImage`. |

### DriveBaySetup

[frontend/src/features/rack/DriveBaySetup.tsx](../../frontend/src/features/rack/DriveBaySetup.tsx)

Display groups in this consumer include `rack:bay`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 10 | <code>Drive Bay setup</code> | Included at presentation. `rack:bay.driveBaySetup`. |
| 11 | <code>Configure Drive Bay</code> | Included at presentation. `rack:bay.configureDriveBay`. |
| 12 | <code>Legacy wiring — replace/configure after disconnecting or safely decommissioning old connections.</code> | Included at presentation. `rack:bay.legacyWiringReplaceConfigureAfterDisconnectingOr`. |
| 13 | <code>Choose permanent hardware before editing or inserting Drives. To change these choices later, remove this Bay and create another.</code> | Included at presentation. `rack:bay.choosePermanentHardwareBeforeEditingOrInserting`. |
| 14 | <code>Open setup</code> | Included at presentation. `rack:bay.openSetup`. |
| 15 | <code>Wiring mode</code> | Included at presentation. `rack:bay.wiringMode`. |
| 16 | <code>Direct wiring</code> | Included at presentation. `rack:bay.directWiring`. |
| 17 | <code>Backplane</code> | Included at presentation. `rack:bay.backplane`. |
| 19 | <code>Fixed slot count</code> | Included at presentation. `rack:bay.fixedSlotCount`. |
| 21 | <code>Slots (1–12)</code> | Included at presentation. `rack:bay.slots112`. |
| 23 | <code>Choose 1–12 slots</code> | Included at presentation. `rack:bay.choose112Slots`. |
| 24 | <code>`${count} permanent rear SATA BP ports; Drives mate internally without cables.`</code> | Included as a whole message or incorporated into a named template in `DriveBaySetup`. See the display groups for this owner. |
| 24 | <code>Each installed Drive exposes its own rear storage port.</code> | Included at presentation. `rack:bay.eachInstalledDriveExposesItsOwnRear`. |
| 25 | <code>Confirm configuration</code> | Included at presentation. `rack:bay.confirmConfiguration`. |
| 26 | <code>Cancel setup</code> | Included at presentation. `rack:bay.cancelSetup`. |
| 30 | <code>Remove</code> | Included at presentation. `rack:inspector.remove`, `rack:storage.remove`. |
| 30 | <code>Bay</code> | Included at presentation. `rack:endpoint.bay`. |

### DriveBaySlots

[frontend/src/features/rack/DriveBaySlots.tsx](../../frontend/src/features/rack/DriveBaySlots.tsx)

Display groups in this consumer include `rack:inspector`, `rack:bay`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 30 | <code>`${placement.contained_drives.length}/${slots.length} slots`</code> | Canonical display input, geometry or diagnostic fragment retained by `DriveBaySlots`. The source link identifies the producer and its consumer. |
| 38 | <code>`${placement.contained_drives.length} installed Drives / ${slots.length} slots`</code> | Included as a whole message or incorporated into a named template in `DriveBaySlots`. See the display groups for this owner. |
| 39 | <code>`Slot ${String(s.slot.number).padStart(2, "0")} · ${s.drive?.title ?? s.membership?.title ?? "Empty"}`</code> | Canonical display input, geometry or diagnostic fragment retained by `DriveBaySlots`. The source link identifies the producer and its consumer. |
| 39 | <code>Empty</code> | Retained source spelling with a display catalog entry. `rack:inspector.empty`. |
| 47 | <code>`${slotDescription}. Select equipment for numbered slot details.`</code> | Included as a whole message or incorporated into a named template in `DriveBaySlots`. See the display groups for this owner. |
| 49 | <code>Enter</code> | Canonical keyboard event. |
| 50 | <code>`Slot ${s.slot.number}: ${s.drive?.title ?? s.membership?.title ?? "Empty"}`</code> | Included as a whole message or incorporated into a named template in `DriveBaySlots`. See the display groups for this owner. |
| 56 | <code>`Slot ${String(slot.number).padStart(2, "0")} · ${drive?.title ?? membership?.title ?? "Empty"}${port ? ` · ${port.label}` : ""}`</code> | Included as a whole message or incorporated into a named template in `DriveBaySlots`. See the display groups for this owner. |
| 56 | <code>` · ${port.label}`</code> | Canonical display input, geometry or diagnostic fragment retained by `DriveBaySlots`. The source link identifies the producer and its consumer. |
| 63 | <code>· Missing or type-changed Drive</code> | Included at presentation. `rack:bay.missingDrive`. |

### ServerStorageInspector

[frontend/src/features/rack/ServerStorageInspector.tsx](../../frontend/src/features/rack/ServerStorageInspector.tsx)

Display groups in this consumer include `rack:workspace`, `rack:storage`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 34 | <code>Drag an Atlas Drive onto a server slot.</code> | Legacy diagnostic mapped by `rack:errors.dragAnAtlasDriveOntoAServer`. |
| 35 | <code>The dragged Atlas Drive could not be read.</code> | Legacy diagnostic mapped by `rack:errors.theDraggedAtlasDriveCouldNotBe`. |
| 37 | <code>Server Drive Slots</code> | Included at presentation. `rack:storage.serverDriveSlots`. |
| 40 | <code>Server Drive Slots (optional)</code> | Included at presentation. `rack:storage.serverDriveSlotsOptional`. |
| 41 | <code>Dismiss server drive setup</code> | Included at presentation. `rack:storage.dismissServerDriveSetup`. |
| 43 | <code>Installed</code> | Included as a whole message or incorporated into a named template in `ServerStorageInspector`. See the display groups for this owner. |
| 43 | <code>` · ${warnings} unresolved ${warnings === 1 ? "reference" : "references"}`</code> | Included as a whole message or incorporated into a named template in `ServerStorageInspector`. See the display groups for this owner. |
| 46 | <code>Inventory changes are unsaved. Use Save to retry.</code> | Included at presentation. `rack:storage.inventoryChangesAreUnsavedUseSaveTo`. |
| 47 | <code>The server reference is missing. Remove assignments or relink it to a server.</code> | Included at presentation. `rack:storage.theServerReferenceIsMissingRemoveAssignments`. |
| 49 | <code>Slot preset</code> | Included at presentation. `rack:storage.slotPreset`. |
| 49 | <code>Server slot preset</code> | Included at presentation. `rack:storage.serverSlotPreset`. |
| 51 | <code>Custom</code> | Included at presentation. `rack:storage.custom`. |
| 51 | <code>Choose a capacity…</code> | Included at presentation. `rack:storage.chooseACapacity`. |
| 52 | <code>slots</code> | Included as a whole message or incorporated into a named template in `ServerStorageInspector`. See the display groups for this owner. |
| 55 | <code>Custom slots (1–24)</code> | Included at presentation. `rack:storage.customSlots124`. |
| 56 | <code>Set capacity</code> | Included at presentation. `rack:storage.setCapacity`. |
| 56 | <code>Configure slots</code> | Included at presentation. `rack:storage.configureSlots`. |
| 58 | <code>Drive Indicator Color</code> | Included at presentation. `rack:storage.driveIndicatorColor`. |
| 61 | <code>Drag an Atlas Drive onto an empty slot or onto the server to use its first empty slot.</code> | Included at presentation. `rack:storage.dragAnAtlasDriveOntoAnEmpty`. |
| 67 | <code>Slot</code> | Included at presentation. `rack:inspector.slot`. |
| 70 | <code>Move to</code> | Included at presentation. `rack:storage.moveTo`. |
| 70 | <code>`Move Drive from slot ${String(slot.slot).padStart(2, "0")}`</code> | Included as a whole message or incorporated into a named template in `ServerStorageInspector`. See the display groups for this owner. |
| 71 | <code>Empty slot…</code> | Included at presentation. `rack:storage.emptySlot`. |
| 73 | <code>`Remove Drive from slot ${String(slot.slot).padStart(2, "0")}`</code> | Included as a whole message or incorporated into a named template in `ServerStorageInspector`. See the display groups for this owner. |
| 73 | <code>Remove</code> | Included at presentation. `rack:storage.remove`. |
| 78 | <code>Remove slot configuration</code> | Included at presentation. `rack:storage.removeSlotConfiguration`. |
| 79 | <code>Remove all assigned Drives before removing the configuration.</code> | Included at presentation. `rack:storage.removeAllAssignedDrivesBeforeRemovingThe`. |

### ServerStorageIndicators

[frontend/src/features/rack/ServerStorageIndicators.tsx](../../frontend/src/features/rack/ServerStorageIndicators.tsx)

Display groups in this consumer include `rack:storage`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 16 | <code>`${installed} installed Drives / ${slots.length} server slots${warnings ? `; ${warnings} unresolved references` : ""}`</code> | Included as a whole message or incorporated into a named template in `ServerStorageIndicators`. See the display groups for this owner. |
| 16 | <code>`; ${warnings} unresolved references`</code> | Included as a whole message or incorporated into a named template in `ServerStorageIndicators`. See the display groups for this owner. |
| 28 | <code>`${label}. ${slots.map((slot) =&gt; slot.description).join("; ")}`</code> | Included as a whole message or incorporated into a named template in `ServerStorageIndicators`. See the display groups for this owner. |

### RackHardwareSettings

[frontend/src/features/rack/RackHardwareSettings.tsx](../../frontend/src/features/rack/RackHardwareSettings.tsx)

Display groups in this consumer include `rack:hardware`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 32 | <code>Mounting orientation</code> | Included at presentation. `rack:hardware.mountingOrientation`. |
| 33 | <code>Physical rear · Power</code> | Included at presentation. `rack:hardware.physicalRearPower`. |
| 34 | <code>Power inlet</code> | Included at presentation. `rack:hardware.powerInlet`. |
| 35 | <code>On</code> | Included at presentation. `rack:hardware.on`. |
| 35 | <code>Off</code> | Included at presentation. `rack:hardware.off`. |
| 38 | <code>Power outlets (0–12)</code> | Included at presentation. `rack:hardware.powerOutlets012`. |
| 40 | <code>Inlet receives power; outlets supply power. Connector artwork only.</code> | Included at presentation. `rack:hardware.inletReceivesPowerOutletsSupplyPowerConnector`. |
| 42 | <code>Physical rear · Data connectors</code> | Included at presentation. `rack:hardware.physicalRearDataConnectors`. |
| 43 | <code>Patch panel port count (0–48)</code> | Included at presentation. `rack:hardware.patchPanelPortCount048`. |
| 43 | <code>Rear data port count (0–48)</code> | Included at presentation. `rack:hardware.rearDataPortCount048`. |
| 45 | <code>One count for both physical faces. Front jacks and rear terminations always match.</code> | Included at presentation. `rack:hardware.oneCountForBothPhysicalFacesFront`. |
| 47 | <code>`Port ${index + 1} label`</code> | Included as a whole message or incorporated into a named template in `RackHardwareSettings`. See the display groups for this owner. |
| 48 | <code>`${orientationId}-connector-${port.id}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackHardwareSettings`. The source link identifies the producer and its consumer. |
| 48 | <code>Port</code> | Included at presentation. `rack:documentation.port`. |
| 48 | <code>connector</code> | Included as a whole message or incorporated into a named template in `RackHardwareSettings`. See the display groups for this owner. |
| 72 | <code>Enter</code> | Canonical keyboard event. |
| 73 | <code>Escape</code> | Canonical keyboard event. |

### FaceplateSettings

[frontend/src/features/rack/faceplates/FaceplateSettings.tsx](../../frontend/src/features/rack/faceplates/FaceplateSettings.tsx)

Display groups in this consumer include `rack:elevation`, `rack:faceplate`, `rack:physicalFace`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 20 | <code>Faceplate presentation</code> | Included at presentation. `rack:faceplate.faceplatePresentation`. |
| 21 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 21 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 21 | <code>Custom image (uncalibrated).</code> | Included at presentation. `rack:faceplate.customImageUncalibrated`. |
| 22 | <code>Images match the device's ports and mounting requirements automatically. This control never changes physical ports.</code> | Included at presentation. `rack:faceplate.imagesMatchTheDevicesPortsAndMounting`. |
| 23 | <code>bundled image sockets mapped ·</code> | Included as a whole message or incorporated into a named template in `FaceplateSettings`. See the display groups for this owner. |
| 23 | <code>ports unmapped on pictured faces</code> | Included as a whole message or incorporated into a named template in `FaceplateSettings`. See the display groups for this owner. |
| 24 | <code>Advanced / Custom Image</code> | Included at presentation. `rack:faceplate.advancedCustomImage`. |
| 25 | <code>Saved profile reference retained:</code> | Included as a whole message or incorporated into a named template in `FaceplateSettings`. See the display groups for this owner. |
| 28 | <code>custom image</code> | Included as a whole message or incorporated into a named template in `FaceplateSettings`. See the display groups for this owner. |
| 35 | <code>Unable to upload faceplate image.</code> | Legacy diagnostic mapped by `rack:errors.unableToUploadFaceplateImage`. |
| 37 | <code>Custom image overrides this face. Uncalibrated: use the port picker.</code> | Included at presentation. `rack:faceplate.customImageOverridesThisFaceUncalibratedUse`. |
| 37 | <code>Legacy asset reference retained; schematic fallback.</code> | Included at presentation. `rack:faceplate.legacyAssetReferenceRetainedSchematicFallback`. |
| 37 | <code>Remove</code> | Included at presentation. `rack:inspector.remove`, `rack:storage.remove`. |
| 37 | <code>image</code> | Included as a whole message or incorporated into a named template in `FaceplateSettings`. See the display groups for this owner. |
| 39 | <code>PNG/JPEG/WebP · 5 MB maximum. Custom images override automatic artwork on that face in Images mode. Uploads remain assigned while Schematic is selected. They have no calibrated socket map or verified mounting dimensions. Retain uploaded files alongside Atlas backups.</code> | Included at presentation. `rack:faceplate.pngJpegWebp5MbMaximumCustom`. |

### PhysicalPortPicker

[frontend/src/features/physicalPorts/PhysicalPortPicker.tsx](../../frontend/src/features/physicalPorts/PhysicalPortPicker.tsx)

Display groups in this consumer include `rack:elevation`, `rack:picker`, `rack:portRole`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 40 | <code>`${port.label} ${portDescriptions?.get(port) ?? ""} ${associatedDriveTitle(atlas, portOwners?.get(port) ?? owner, port) ?? ""} ${port.role} ${PHYSICAL_CONNECTORS[port.connector_type][0]}`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortPicker`. See the display groups for this owner. |
| 41 | <code>physical-port-picker physical-port-picker--compact</code> | DOM, SVG, React, event or serialized identity. See `PhysicalPortPicker`. |
| 46 | <code>Escape</code> | Canonical keyboard event. |
| 47 | <code>Tab</code> | Canonical keyboard event. |
| 53 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 53 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 53 | <code>physical ports (</code> | Included as a whole message or incorporated into a named template in `PhysicalPortPicker`. See the display groups for this owner. |
| 53 | <code>Close port picker</code> | Included at presentation. `rack:picker.closePortPicker`. |
| 54 | <code>Find a port</code> | Included at presentation. `rack:picker.findAPort`. |
| 58 | <code>`${PHYSICAL_CONNECTORS[port.connector_type][0]} · ${port.role} · ${signalLabel(port)}`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortPicker`. See the display groups for this owner. |
| 61 | <code>Mapped</code> | Included at presentation. `rack:picker.mapped`. |
| 61 | <code>Unmapped / schematic</code> | Included at presentation. `rack:picker.unmappedSchematic`. |
| 62 | <code>`${connectionStatus} · ${mapping}`</code> | Canonical display input, geometry or diagnostic fragment retained by `PhysicalPortPicker`. The source link identifies the producer and its consumer. |
| 63 | <code>`Cable actions for ${port.label}`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortPicker`. See the display groups for this owner. |
| 68 | <code>ContextMenu</code> | Canonical keyboard event. |
| 68 | <code>F10</code> | Canonical keyboard event. |
| 75 | <code>Cable actions</code> | Included at presentation. `rack:picker.cableActions`. |
| 76 | <code>No matching ports.</code> | Included at presentation. `rack:picker.noMatchingPorts`. |

### PhysicalPortsEditor

[frontend/src/features/physicalPorts/PhysicalPortsEditor.tsx](../../frontend/src/features/physicalPorts/PhysicalPortsEditor.tsx)

Display groups in this consumer include `rack:ports`, `rack:physicalFace`, `rack:portRole`, `rack:origin`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 64 | <code>Physical ports are read-only in this mode.</code> | Legacy diagnostic mapped by `rack:errors.physicalPortsAreReadOnlyInThis`. |
| 71 | <code>`${port.label} ${associatedDriveTitle(atlas, owner, port) ?? ""} ${PHYSICAL_CONNECTORS[port.connector_type][0]} ${port.role}`</code> | Canonical display input, geometry or diagnostic fragment retained by `PhysicalPortsEditor`. The source link identifies the producer and its consumer. |
| 86 | <code>Apply this port preset? Surviving IDs are preserved, extra bank ports are removed, and bank connector types use the preset. Other roles remain. Undo restores the previous configuration.</code> | Included at presentation. `rack:ports.applyThisPortPresetSurvivingIdsAre`. |
| 90 | <code>Physical Ports</code> | Included at presentation. `rack:ports.physicalPorts`. |
| 92 | <code>Linked Atlas device · one rack placement</code> | Included at presentation. `rack:ports.linkedAtlasDeviceOneRackPlacement`. |
| 92 | <code>Rack-local equipment</code> | Included at presentation. `rack:ports.rackLocalEquipment`. |
| 93 | <code>Legacy defaults · saved only when you edit ports.</code> | Included at presentation. `rack:ports.legacyDefaultsSavedOnlyWhenYouEdit`. |
| 95 | <code>Legacy Rack settings disagree</code> | Included at presentation. `rack:ports.legacyRackSettingsDisagree`. |
| 95 | <code>Review the sources below. Choose the configuration to adopt for the shared Atlas device. All original Rack settings remain archived as read-only compatibility data.</code> | Included at presentation. `rack:ports.reviewTheSourcesBelowChooseTheConfiguration`. |
| 96 | <code>`${rack.id}/${placement.id}`</code> | Canonical display input, geometry or diagnostic fragment retained by `PhysicalPortsEditor`. The source link identifies the producer and its consumer. |
| 98 | <code>`Adopt ${rack.name}'s port configuration for this shared device? Other legacy configurations remain archived.`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 98 | <code>Adopt</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 98 | <code>settings</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 103 | <code>Patch panel presets</code> | Included at presentation. `rack:ports.patchPanelPresets`. |
| 103 | <code>Switch access port presets</code> | Included at presentation. `rack:ports.switchAccessPortPresets`. |
| 106 | <code>Paired positions (0–256)</code> | Included at presentation. `rack:ports.pairedPositions0256`. |
| 106 | <code>Access ports (0–512)</code> | Included at presentation. `rack:ports.accessPorts0512`. |
| 108 | <code>`${pairs} front + ${pairs} rear terminations`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 108 | <code>`${access} access · ${ports.filter((port) =&gt; port.role === "uplink").length} uplinks`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 108 | <code>total ports including power</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 109 | <code>Connector presets</code> | Included at presentation. `rack:ports.connectorPresets`. |
| 110 | <code>LC duplex pairs</code> | Included at presentation. `rack:ports.lcDuplexPairs`. |
| 110 | <code>Copper pairs</code> | Included at presentation. `rack:ports.copperPairs`. |
| 113 | <code>Power inlet</code> | Included at presentation. `rack:ports.powerInlet`. |
| 113 | <code>On</code> | Included at presentation. `rack:ports.on`. |
| 113 | <code>Off</code> | Included at presentation. `rack:ports.off`. |
| 114 | <code>Power outlets (0–12)</code> | Included at presentation. `rack:ports.powerOutlets012`. |
| 116 | <code>Advanced / custom physical ports</code> | Included at presentation. `rack:ports.advancedCustomPhysicalPorts`. |
| 118 | <code>Physical device face</code> | Included at presentation. `rack:ports.physicalDeviceFace`. |
| 118 | <code>Front</code> | Included at presentation. `rack:ports.front`. |
| 118 | <code>Rear</code> | Included at presentation. `rack:ports.rear`. |
| 119 | <code>Find physical port</code> | Included at presentation. `rack:ports.findPhysicalPort`. |
| 120 | <code>`${face} physical ports`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 123 | <code>ContextMenu</code> | Canonical keyboard event. |
| 123 | <code>F10</code> | Canonical keyboard event. |
| 123 | <code>· Image-mapped</code> | Replaced at the display boundary in `PhysicalPortsEditor`. Stable option, schema, selection and geometry values are retained. |
| 124 | <code>No matching ports on this physical face.</code> | Included at presentation. `rack:ports.noMatchingPortsOnThisPhysicalFace`. |
| 126 | <code>New</code> | Included at presentation. `rack:palette.new`. |
| 126 | <code>connector</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 126 | <code>New port connector</code> | Included at presentation. `rack:ports.newPortConnector`. |
| 127 | <code>Copper pair (RJ45 / IDC)</code> | Included at presentation. `rack:ports.copperPairRj45Idc`. |
| 129 | <code>Add paired position</code> | Included at presentation. `rack:ports.addPairedPosition`. |
| 129 | <code>Add port</code> | Included at presentation. `rack:ports.addPort`. |
| 133 | <code>Fixed backplane hardware · slot, reference, connector and order are locked.</code> | Included at presentation. `rack:ports.fixedBackplaneHardwareSlotReferenceConnectorAnd`. |
| 135 | <code>Associated Drive:</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 136 | <code>Name follows the Drive</code> | Included at presentation. `rack:ports.nameFollowsTheDrive`. |
| 136 | <code>Custom port name</code> | Included at presentation. `rack:ports.customPortName`. |
| 137 | <code>Use Drive name</code> | Included at presentation. `rack:ports.useDriveName`. |
| 140 | <code>Preset layout · fixed socket positions</code> | Included at presentation. `rack:ports.presetLayoutFixedSocketPositions`. |
| 140 | <code>Custom layout · reorder ports within this face and group</code> | Included at presentation. `rack:ports.customLayoutReorderPortsWithinThisFace`. |
| 141 | <code>Port order</code> | Included at presentation. `rack:ports.portOrder`. |
| 142 | <code>Move Earlier</code> | Included at presentation. `rack:ports.moveEarlier`. |
| 143 | <code>Move Later</code> | Included at presentation. `rack:ports.moveLater`. |
| 145 | <code>Clear search to reorder.</code> | Included at presentation. `rack:ports.clearSearchToReorder`. |
| 147 | <code>Port name</code> | Included at presentation. `rack:ports.portName`. |
| 148 | <code>Connector</code> | Included at presentation. `rack:ports.connector`. |
| 151 | <code>Role</code> | Included at presentation. `rack:ports.role`. |
| 156 | <code>Signal categories</code> | Included at presentation. `rack:ports.signalCategories`. |
| 158 | <code>`Supports ${category.toUpperCase()}`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 162 | <code>Updates both paired terminations.</code> | Included at presentation. `rack:ports.updatesBothPairedTerminations`. |
| 164 | <code>Power direction</code> | Included at presentation. `rack:ports.powerDirection`. |
| 165 | <code>Choose direction</code> | Included at presentation. `rack:ports.chooseDirection`. |
| 165 | <code>Input</code> | Included at presentation. `rack:ports.input`. |
| 165 | <code>Output</code> | Included at presentation. `rack:ports.output`. |
| 167 | <code>Physical face</code> | Included at presentation. `rack:ports.physicalFace`. |
| 170 | <code>Mapped image socket</code> | Included at presentation. `rack:ports.mappedImageSocket`. |
| 171 | <code>Automatic</code> | Included at presentation. `rack:ports.automatic`. |
| 172 | <code>Unavailable in this profile ·</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 175 | <code>`${assignment.explicit ? "Explicit" : "Automatic"} image socket: ${assignment.socket.label}`</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 175 | <code>Explicit</code> | Included at presentation. `rack:ports.explicit`. |
| 175 | <code>No compatible image socket. This port remains available in the port picker.</code> | Included at presentation. `rack:ports.noCompatibleImageSocketThisPortRemains`. |
| 176 | <code>Internally paired with</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 176 | <code>on the opposite physical face.</code> | Included as a whole message or incorporated into a named template in `PhysicalPortsEditor`. See the display groups for this owner. |
| 177 | <code>Remove paired position</code> | Included at presentation. `rack:ports.removePairedPosition`. |
| 177 | <code>Remove port</code> | Included at presentation. `rack:ports.removePort`. |
| 178 | <code>Remove the Drive from its bay to remove this port. Disconnect any cable first.</code> | Included at presentation. `rack:ports.removeTheDriveFromItsBayTo`. |
| 181 | <code>Inspect connection</code> | Included at presentation. `rack:ports.inspectConnection`. |
| 181 | <code>Choose a physical port</code> | Included at presentation. `rack:ports.chooseAPhysicalPort`. |

### PoeControl

[frontend/src/features/physicalPorts/PoeControl.tsx](../../frontend/src/features/physicalPorts/PoeControl.tsx)

Display groups in this consumer include `rack:poe`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 13 | <code>Power over Ethernet</code> | Included at presentation. `rack:poe.powerOverEthernet`. |
| 15 | <code>PoE</code> | Canonical display input, geometry or diagnostic fragment retained by `PoeControl`. The source link identifies the producer and its consumer. |
| 15 | <code>Power over Ethernet:</code> | Included as a whole message or incorporated into a named template in `PoeControl`. See the display groups for this owner. |
| 15 | <code>Off</code> | Included at presentation. `rack:poe.off`. |
| 15 | <code>On</code> | Included at presentation. `rack:poe.on`. |
| 16 | <code>This port supplies PoE along its DATA cable when this device has a POWER input.</code> | Included at presentation. `rack:poe.thisPortSuppliesPoeAlongItsData`. |

### RackPromotionDialog

[frontend/src/features/rack/RackPromotionDialog.tsx](../../frontend/src/features/rack/RackPromotionDialog.tsx)

Display groups in this consumer include `rack:promotion`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 24 | <code>Add Generic Server to Atlas</code> | Included at presentation. `rack:promotion.addGenericServerToAtlas`. |
| 25 | <code>Create “</code> | Included as a whole message or incorporated into a named template in `RackPromotionDialog`. See the display groups for this owner. |
| 25 | <code>” as a Node or Equipment classified Generic Server.</code> | Included as a whole message or incorporated into a named template in `RackPromotionDialog`. See the display groups for this owner. |
| 27 | <code>Node</code> | Included at presentation. `rack:promotion.node`. |
| 28 | <code>Equipment</code> | Included at presentation. `rack:promotion.equipment`. |
| 29 | <code>Cancel</code> | Included at presentation. `rack:promotion.cancel`. |

### RackRearHardware

[frontend/src/features/rack/RackRearHardware.tsx](../../frontend/src/features/rack/RackRearHardware.tsx)

Display groups in this consumer include `rack:hardware`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 37 | <code>`${ports.length} rear data ports: ${ports.map((item) =&gt; `${item.label} (${REAR_CONNECTORS[item.connector_type].label})`).join(", ")}`</code> | Canonical display input, geometry or diagnostic fragment retained by `rearHardwareLayout`. The source link identifies the producer and its consumer. |
| 37 | <code>`${item.label} (${REAR_CONNECTORS[item.connector_type].label})`</code> | Canonical display input, geometry or diagnostic fragment retained by `rearHardwareLayout`. The source link identifies the producer and its consumer. |
| 38 | <code>`${port.label} — ${REAR_CONNECTORS[port.connector_type].label}`</code> | Included as a whole message or incorporated into a named template in `rearHardwareLayout`. See the display groups for this owner. |
| 41 | <code>`outlet-${i}`</code> | Canonical display input, geometry or diagnostic fragment retained by `rearHardwareLayout`. The source link identifies the producer and its consumer. |
| 41 | <code>`${hardware.power_outlet_count} power outlets`</code> | Canonical display input, geometry or diagnostic fragment retained by `rearHardwareLayout`. The source link identifies the producer and its consumer. |
| 41 | <code>`Power outlet ${i + 1}`</code> | Canonical display input, geometry or diagnostic fragment retained by `rearHardwareLayout`. The source link identifies the producer and its consumer. |
| 45 | <code>Power inlet</code> | Retained source spelling with a display catalog entry. `rack:hardware.powerInlet`. |
| 67 | <code>`${ports.length}D ${hardware.power_outlet_count}O ${hardware.power_inlet_enabled ? 1 : 0}I`</code> | Canonical display input, geometry or diagnostic fragment retained by `rearHardwareLayout`. The source link identifies the producer and its consumer. |
| 68 | <code>`${ports.length} decorative data ports, ${hardware.power_outlet_count} power outlets, ${hardware.power_inlet_enabled ? 1 : 0} power inlets`</code> | Canonical display input, geometry or diagnostic fragment retained by `rearHardwareLayout`. The source link identifies the producer and its consumer. |
| 71 | <code>`${driveCount} Drives inside Drive Bay`</code> | Canonical display input, geometry or diagnostic fragment retained by `rearHardwareLayout`. The source link identifies the producer and its consumer. |
| 77 | <code>`rack-hardware${layout.compact ? " rack-hardware--compact" : ""}`</code> | DOM, SVG, React, event or serialized identity. See `RackRearHardware`. |
| 77 | <code>rack-hardware--compact</code> | DOM, SVG, React, event or serialized identity. See `RackRearHardware`. |
| 81 | <code>`${item.kind}-${item.id}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackRearHardware`. The source link identifies the producer and its consumer. |
| 85 | <code>`translate(${item.x} ${item.y}) scale(${item.size / 24})`</code> | DOM, SVG, React, event or serialized identity. See `RackRearHardware`. |

### RackElevation

[frontend/src/features/rack/RackElevation.tsx](../../frontend/src/features/rack/RackElevation.tsx)

Display groups in this consumer include `rack:elevation`, `rack:scene`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 60 | <code>`rack-rear-${useId().replace(/:/g, "")}`</code> | DOM, SVG, React, event or serialized identity. See `RackElevation`. |
| 74 | <code>`${rack.name} · ${face === "front" ? "Front" : "Rear"}`</code> | Included as a whole message or incorporated into a named template in `RackElevation`. See the display groups for this owner. |
| 74 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 74 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 88 | <code>rack-elevation rack-elevation--export</code> | DOM, SVG, React, event or serialized identity. See `RackElevation`. |
| 88 | <code>`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackElevation`. The source link identifies the producer and its consumer. |
| 88 | <code>`${rack.name} ${face} elevation`</code> | Included as a whole message or incorporated into a named template in `RackElevation`. See the display groups for this owner. |
| 90 | <code>`url(#${gradientId}-frame)`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackElevation`. The source link identifies the producer and its consumer. |
| 90 | <code>`url(#${gradientId}-device)`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackElevation`. The source link identifies the producer and its consumer. |
| 97 | <code>`${gradientId}-frame`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackElevation`. The source link identifies the producer and its consumer. |
| 100 | <code>`${gradientId}-device`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackElevation`. The source link identifies the producer and its consumer. |
| 120 | <code>`Top mounting position ${id}`</code> | Included as a whole message or incorporated into a named template in `RackElevation`. See the display groups for this owner. |
| 133 | <code>`rack-fit-preview is-${previewInvalid ? "invalid" : "valid"}`</code> | DOM, SVG, React, event or serialized identity. See `RackElevation`. |
| 139 | <code>`M ${label.x} ${label.targetY} H ${callout.edge} V ${label.y} H ${callout.lineEnd}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackElevation`. The source link identifies the producer and its consumer. |
| 147 | <code>U</code> | Technical notation or product/keyboard identifier. |
| 150 | <code>Rack warning</code> | Included as a whole message or incorporated into a named template in `RackElevation`. See the display groups for this owner. |

### RackPlacement

[frontend/src/features/rack/RackPlacement.tsx](../../frontend/src/features/rack/RackPlacement.tsx)

Display groups in this consumer include `rack:physicalFace`, `rack:scene`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 60 | <code>`rack-placement-title-${useId().replace(/:/g, "")}`</code> | DOM, SVG, React, event or serialized identity. See `RackPlacement`. |
| 113 | <code>MServ</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPlacement`. The source link identifies the producer and its consumer. |
| 115 | <code>NT Switch</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPlacement`. The source link identifies the producer and its consumer. |
| 141 | <code>Enter</code> | Canonical keyboard event. |
| 142 | <code>ContextMenu</code> | Canonical keyboard event. |
| 142 | <code>F10</code> | Canonical keyboard event. |
| 147 | <code>`${resolved.title}, hidden in ${face} elevation`</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 150 | <code>· Hidden in</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 150 | <code>elevation. Restore in the Inspector or equipment menu.</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 161 | <code>visiblePainted</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPlacement`. The source link identifies the producer and its consumer. |
| 162 | <code>`url(#${titleClipId}-exposed)`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPlacement`. The source link identifies the producer and its consumer. |
| 164 | <code>`${resolved.title}, ${placement.top_slot ? `${placement.top_slot}, fixed 1U / full depth` : `${placement.u_height}U ${absPanel ? `${placement.abs_panel_span?.width_cells ?? 0} cells` : placement.width_fraction}`}${resolved.broken ? ", missing Atlas reference" : ""}`</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 164 | <code>`${placement.top_slot}, fixed 1U / full depth`</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 164 | <code>`${placement.u_height}U ${absPanel ? `${placement.abs_panel_span?.width_cells ?? 0} cells` : placement.width_fraction}`</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 164 | <code>`${placement.abs_panel_span?.width_cells ?? 0} cells`</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 164 | <code>, missing Atlas reference</code> | Replaced at the display boundary in `RackPlacement`. Stable option, schema, selection and geometry values are retained. |
| 172 | <code>`${titleClipId}-exposed`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPlacement`. The source link identifies the producer and its consumer. |
| 177 | <code>`${profile.id}:${profile.images[deviceFace]?.url}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPlacement`. The source link identifies the producer and its consumer. |
| 187 | <code>`${frontPortCount} front data ports`</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 188 | <code>front data ports</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 197 | <code>`${containedDrives.length} Drives inside Drive Bay`</code> | Included as a whole message or incorporated into a named template in `RackPlacement`. See the display groups for this owner. |
| 204 | <code>`translate(${rect.x + 10} ${rect.y + 8})`</code> | DOM, SVG, React, event or serialized identity. See `RackPlacement`. |
| 211 | <code>`url(#${titleClipId})`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackPlacement`. The source link identifies the producer and its consumer. |
| 223 | <code>`${resolved.title} — missing Atlas Drive`</code> | Canonical display input, geometry or diagnostic fragment retained by `driveDescription`. The source link identifies the producer and its consumer. |
| 223 | <code>`${resolved.title} — no longer an Atlas Drive`</code> | Canonical display input, geometry or diagnostic fragment retained by `driveDescription`. The source link identifies the producer and its consumer. |
| 228 | <code>rack-placement__contained-drive is-warning</code> | DOM, SVG, React, event or serialized identity. See `ContainedDriveGlyph`. |
| 235 | <code>`${drives.length} Drives: ${resolved.map(driveDescription).join("; ")}`</code> | Included as a whole message or incorporated into a named template in `ContainedDriveSummary`. See the display groups for this owner. |
| 236 | <code>`rack-placement__contained-drive-summary${resolved.some((drive) =&gt; drive.broken &#124;&#124; drive.typeMismatch) ? " is-warning" : ""}`</code> | DOM, SVG, React, event or serialized identity. See `ContainedDriveSummary`. |
| 236 | <code>is-warning</code> | Canonical display input, geometry or diagnostic fragment retained by `ContainedDriveSummary`. The source link identifies the producer and its consumer. |

### RackDriveSlot

[frontend/src/features/rack/RackDriveSlot.tsx](../../frontend/src/features/rack/RackDriveSlot.tsx)

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 26 | <code>`translate(${x + (width - height) / 2} ${y}) rotate(90 ${height / 2} ${height / 2})`</code> | DOM, SVG, React, event or serialized identity. See `RackDriveSlot`. |

### PortOverlay

[frontend/src/features/rack/faceplates/PortOverlay.tsx](../../frontend/src/features/rack/faceplates/PortOverlay.tsx)

Display groups in this consumer include `rack:overlay`, `rack:portRole`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 17 | <code>`translate(${x} ${y})`</code> | DOM, SVG, React, event or serialized identity. See `PortGroupSymbol`. |
| 42 | <code>`${port.label} · ${PHYSICAL_CONNECTORS[port.connector_type][0]} · ${port.role} · ${signalLabel(port)}${poeText ? ` · ${poeText}` : ""}${drive ? ` · Associated Drive: ${drive}` : ""}${marker ? ` · ${marker.label} paired-port marker · Cable connected on ${connectedIds?.has(port.id) ? "this" : "opposite"} face` : ""}`</code> | Included as a whole message or incorporated into a named template in `PortOverlay`. See the display groups for this owner. |
| 42 | <code>` · ${poeText}`</code> | Canonical display input, geometry or diagnostic fragment retained by `PortOverlay`. The source link identifies the producer and its consumer. |
| 42 | <code>` · Associated Drive: ${drive}`</code> | Included as a whole message or incorporated into a named template in `PortOverlay`. See the display groups for this owner. |
| 42 | <code>` · ${marker.label} paired-port marker · Cable connected on ${connectedIds?.has(port.id) ? "this" : "opposite"} face`</code> | Included as a whole message or incorporated into a named template in `PortOverlay`. See the display groups for this owner. |
| 53 | <code>Escape</code> | Canonical keyboard event. |
| 53 | <code>Enter</code> | Canonical keyboard event. |
| 53 | <code>ContextMenu</code> | Canonical keyboard event. |
| 53 | <code>F10</code> | Canonical keyboard event. |
| 58 | <code>`translate(${anchor.x - anchor.size / 2} ${anchor.y - anchor.size / 2}) scale(${anchor.size / 24})`</code> | DOM, SVG, React, event or serialized identity. See `PortOverlay`. |
| 69 | <code>`${interactive ? "Open" : ""} ${ports[0].face} physical ports — ${ports.length} ports`</code> | Included as a whole message or incorporated into a named template in `PortOverlay`. See the display groups for this owner. |
| 69 | <code>Open</code> | Included at presentation. `rack:overlay.open`. |
| 75 | <code>`${ports.length} ${ports[0].face} physical ports · ${connectedCount ?? ports.filter((port) =&gt; connectedIds?.has(port.id)).length} connected`</code> | Included as a whole message or incorporated into a named template in `PortOverlay`. See the display groups for this owner. |

### FaceplateRenderer

[frontend/src/features/rack/faceplates/FaceplateRenderer.tsx](../../frontend/src/features/rack/faceplates/FaceplateRenderer.tsx)

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 9 | <code>`faceplate-${useId().replace(/:/g, "")}`</code> | Canonical display input, geometry or diagnostic fragment retained by `FaceplateRenderer`. The source link identifies the producer and its consumer. |
| 9 | <code>`${clip}-outer`</code> | Canonical display input, geometry or diagnostic fragment retained by `FaceplateRenderer`. The source link identifies the producer and its consumer. |
| 17 | <code>`url(#${outer})`</code> | Canonical display input, geometry or diagnostic fragment retained by `FaceplateRenderer`. The source link identifies the producer and its consumer. |
| 19 | <code>`url(#${clip})`</code> | Canonical display input, geometry or diagnostic fragment retained by `FaceplateRenderer`. The source link identifies the producer and its consumer. |

### AbsBlankPanelFaceplate

[frontend/src/features/rack/AbsBlankPanelFaceplate.tsx](../../frontend/src/features/rack/AbsBlankPanelFaceplate.tsx)

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 12 | <code>`abs-face-${useId().replace(/:/g, "")}`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelFaceplate`. The source link identifies the producer and its consumer. |
| 16 | <code>`url(#${id})`</code> | Canonical display input, geometry or diagnostic fragment retained by `AbsBlankPanelFaceplate`. The source link identifies the producer and its consumer. |

## M5c

Test owners cover Cable creation, loose ends, continuity, destination search, pulse, circuit identification and Connect Table. See the [verification ledger](M5_verification.md) for individual browser outcomes.

### CableInteractions

[frontend/src/features/rack/cables/CableInteractions.tsx](../../frontend/src/features/rack/cables/CableInteractions.tsx)

Display groups in this consumer include `rack:physicalFace`, `rack:cables`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 75 | <code>`${contextKey}/${mode}/${readOnly}`</code> | Canonical display input, geometry or diagnostic fragment retained by `CableInteractionProvider`. The source link identifies the producer and its consumer. |
| 98 | <code>Tracing physical cable. Escape returns to overview.</code> | Legacy diagnostic mapped by `rack:errors.tracingPhysicalCableEscapeReturnsToOverview`. |
| 117 | <code>Escape</code> | Canonical keyboard event. |
| 121 | <code>Cable editing is unavailable.</code> | Legacy diagnostic mapped by `rack:errors.cableEditingIsUnavailable`. |
| 129 | <code>`cable-${createUuid()}`</code> | DOM, SVG, React, event or serialized identity. See `CableInteractionProvider`. |
| 133 | <code>Cable connected.</code> | Legacy diagnostic mapped by `rack:errors.cableConnected`. |
| 156 | <code>`Tracing cable on the paired ${paired.peer.face} port, ${paired.peer.label}.${result.kind === "arm" ? " Select a destination to connect the empty port. Escape cancels." : " Escape returns to overview."}`</code> | Included as a whole message or incorporated into a named template in `CableInteractionProvider`. See the display groups for this owner. |
| 156 | <code>Select a destination to connect the empty port. Escape cancels.</code> | Replaced at the display boundary in `CableInteractionProvider`. Stable option, schema, selection and geometry values are retained. |
| 156 | <code>Escape returns to overview.</code> | Replaced at the display boundary in `CableInteractionProvider`. Stable option, schema, selection and geometry values are retained. |
| 159 | <code>`${describeCableEndpoint(atlas, result.source.endpoint, result.source.location)} — select a destination port. Escape cancels.`</code> | Included as a whole message or incorporated into a named template in `CableInteractionProvider`. See the display groups for this owner. |
| 178 | <code>Cable attached; its ID and label are unchanged.</code> | Legacy diagnostic mapped by `rack:errors.cableAttachedItsIdAndLabelAre`. |
| 191 | <code>`${cable.label ?? "Cable"} loose end — select a destination port. Escape cancels.`</code> | Included as a whole message or incorporated into a named template in `CableInteractionProvider`. See the display groups for this owner. |
| 191 | <code>Cable</code> | Included at presentation. `rack:cables.fallback`. |
| 205 | <code>`M ${start.x} ${start.y} L ${event.clientX} ${event.clientY}`</code> | Canonical display input, geometry or diagnostic fragment retained by `CableInteractionProvider`. The source link identifies the producer and its consumer. |
| 224 | <code>`${source.kind === "loose" ? `${atlas.physical_connections?.find((c) =&gt; c.id === source.cableId)?.label ?? "Cable"} · Loose end` : describeCableEndpoint(atlas, source.endpoint, source.location)} — select a destination port.`</code> | Included as a whole message or incorporated into a named template in `CableInteractionProvider`. See the display groups for this owner. |
| 224 | <code>`${atlas.physical_connections?.find((c) =&gt; c.id === source.cableId)?.label ?? "Cable"} · Loose end`</code> | Included as a whole message or incorporated into a named template in `CableInteractionProvider`. See the display groups for this owner. |
| 225 | <code>`${traceId ? "Tracing: " : ""}${describeCableEndpoint(atlas, selectedConnection.a, selectedConnection.a_location)} → ${describeCableEndpoint(atlas, selectedConnection.b, selectedConnection.b_location)}`</code> | Included as a whole message or incorporated into a named template in `CableInteractionProvider`. See the display groups for this owner. |
| 225 | <code>Tracing:</code> | Replaced at the display boundary in `CableInteractionProvider`. Stable option, schema, selection and geometry values are retained. |
| 236 | <code>Find destination port</code> | Included at presentation. `rack:cables.findDestinationPort`. |
| 237 | <code>Search devices and ports</code> | Included at presentation. `rack:cables.searchDevicesAndPorts`. |
| 239 | <code>No compatible available ports found in your Racks.</code> | Included at presentation. `rack:cables.noCompatibleAvailablePortsFoundInYour`. |
| 241 | <code>Cable actions</code> | Included at presentation. `rack:cables.cableActions`. |
| 241 | <code>Port actions</code> | Included at presentation. `rack:cables.portActions`. |
| 248 | <code>Rename cable</code> | Included at presentation. `rack:cables.renameCable`. |
| 250 | <code>Cable color</code> | Included at presentation. `rack:cables.cableColor`. |
| 252 | <code>`${side}_location`</code> | DOM, SVG, React, event or serialized identity. See `CableInteractionProvider`. |
| 253 | <code>Trace</code> | Included at presentation. `rack:cables.trace`. |
| 254 | <code>Partially connected · Attach the loose end before disconnecting the remaining end.</code> | Included at presentation. `rack:cables.partiallyConnectedAttachTheLooseEndBefore`. |
| 255 | <code>Disconnect end</code> | Included at presentation. `rack:cables.disconnectEnd`. |
| 255 | <code>Choose attached end</code> | Included at presentation. `rack:cables.chooseAttachedEnd`. |
| 256 | <code>Cable end unplugged. The cable remains partially connected.</code> | Legacy diagnostic mapped by `rack:errors.cableEndUnpluggedTheCableRemainsPartially`. |
| 256 | <code>Disconnect</code> | Included at presentation. `rack:cables.disconnect`. |
| 260 | <code>`Remove Cable ${occupied.label ?? occupied.id}? This deletes its documentation record and retires its cable number.`</code> | Included as a whole message or incorporated into a named template in `CableInteractionProvider`. See the display groups for this owner. |
| 263 | <code>Remove Cable</code> | Included at presentation. `rack:cables.removeCable`. |
| 267 | <code>`${endpointKey(choice.a.endpoint)}/${endpointKey(choice.b.endpoint)}`</code> | Canonical display input, geometry or diagnostic fragment retained by `CableInteractionProvider`. The source link identifies the producer and its consumer. |
| 268 | <code>`M ${wire.x} ${wire.y} L ${wire.x} ${wire.y}`</code> | Canonical display input, geometry or diagnostic fragment retained by `CableInteractionProvider`. The source link identifies the producer and its consumer. |
| 280 | <code>Choose connection</code> | Included at presentation. `rack:cables.chooseConnection`. |
| 281 | <code>Source</code> | Replaced at the display boundary in `CableChoice`. Stable option, schema, selection and geometry values are retained. |
| 281 | <code>Destination</code> | Replaced at the display boundary in `CableChoice`. Stable option, schema, selection and geometry values are retained. |
| 281 | <code>placement</code> | Included as a whole message or incorporated into a named template in `CableChoice`. See the display groups for this owner. |
| 281 | <code>`${side === "a" ? "Source" : "Destination"} placement`</code> | Included as a whole message or incorporated into a named template in `CableChoice`. See the display groups for this owner. |
| 282 | <code>Choose rack placement</code> | Included at presentation. `rack:cables.chooseRackPlacement`. |
| 282 | <code>`${item.rack.id}/${item.placement.id}`</code> | Canonical display input, geometry or diagnostic fragment retained by `CableChoice`. The source link identifies the producer and its consumer. |
| 284 | <code>Signal category</code> | Included at presentation. `rack:cables.signalCategory`. |
| 286 | <code>Signal category:</code> | Included as a whole message or incorporated into a named template in `CableChoice`. See the display groups for this owner. |
| 287 | <code>Cable type</code> | Included at presentation. `rack:cables.cableType`. |
| 290 | <code>Custom cable type description</code> | Included at presentation. `rack:cables.customCableTypeDescription`. |
| 292 | <code>Connect</code> | Included at presentation. `rack:cables.connect`. |
| 307 | <code>Cable interaction</code> | Included at presentation. `rack:cables.cableInteraction`. |
| 313 | <code>Find destination</code> | Included at presentation. `rack:cables.findDestination`. |
| 313 | <code>Cancel wiring</code> | Included at presentation. `rack:cables.cancelWiring`. |
| 315 | <code>End trace</code> | Included at presentation. `rack:cables.endTrace`. |

### CablePopover

[frontend/src/features/rack/cables/CablePopover.tsx](../../frontend/src/features/rack/cables/CablePopover.tsx)

Display groups in this consumer include `rack:cables`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 21 | <code>Escape</code> | Canonical keyboard event. |
| 22 | <code>`Close ${title}`</code> | Included as a whole message or incorporated into a named template in `CablePopover`. See the display groups for this owner. |

### CableConnectionInfo

[frontend/src/features/rack/cables/CableConnectionInfo.tsx](../../frontend/src/features/rack/cables/CableConnectionInfo.tsx)

Display groups in this consumer include `rack:cableInfo`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 18 | <code>`${side}_location`</code> | DOM, SVG, React, event or serialized identity. See `CableConnectionInfo`. |
| 21 | <code>Loose end</code> | Included at presentation. `rack:cableInfo.looseEnd`. |
| 27 | <code>Change physical location</code> | Included at presentation. `rack:cableInfo.changePhysicalLocation`. |
| 29 | <code>Source</code> | Replaced at the display boundary in `CableConnectionInfo`. Stable option, schema, selection and geometry values are retained. |
| 29 | <code>Destination</code> | Replaced at the display boundary in `CableConnectionInfo`. Stable option, schema, selection and geometry values are retained. |
| 29 | <code>Rack placement</code> | Included as a whole message or incorporated into a named template in `CableConnectionInfo`. See the display groups for this owner. |
| 32 | <code>Ambiguous location — choose placement</code> | Included at presentation. `rack:cableInfo.ambiguousLocationChoosePlacement`. |
| 37 | <code>Trace path</code> | Included at presentation. `rack:cableInfo.tracePath`. |
| 38 | <code>Trace hops</code> | Included at presentation. `rack:cableInfo.traceHops`. |
| 39 | <code>`Slot ${hop.slot_number} internal mate (no cable)`</code> | Included as a whole message or incorporated into a named template in `CableConnectionInfo`. See the display groups for this owner. |
| 39 | <code>Internal Patch Panel pair</code> | Included at presentation. `rack:cableInfo.internalPatchPanelPair`. |
| 39 | <code>External cable</code> | Included at presentation. `rack:cableInfo.externalCable`. |

### CableLabelEditor

[frontend/src/features/rack/cables/CableLabelEditor.tsx](../../frontend/src/features/rack/cables/CableLabelEditor.tsx)

Display groups in this consumer include `rack:cables`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 11 | <code>Rename cable</code> | Included at presentation. `rack:cables.renameCable`. |
| 16 | <code>Escape</code> | Canonical keyboard event. |
| 17 | <code>Cable label</code> | Included at presentation. `rack:cables.cableLabel`. |
| 18 | <code>Custom cable type</code> | Included at presentation. `rack:cables.customCableType`. |
| 19 | <code>Save cable label</code> | Included at presentation. `rack:cables.saveCableLabel`. |

### CableColorInput

[frontend/src/features/rack/cables/CableColorInput.tsx](../../frontend/src/features/rack/cables/CableColorInput.tsx)

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 17 | <code>Enter</code> | Canonical keyboard event. |
| 17 | <code>Escape</code> | Canonical keyboard event. |

### CablePaletteSettings

[frontend/src/features/rack/cables/CablePaletteSettings.tsx](../../frontend/src/features/rack/cables/CablePaletteSettings.tsx)

Display groups in this consumer include `rack:cablePalette`, `rack:category`, `rack:categoryValue`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 11 | <code>Cable Colors</code> | Included at presentation. `rack:cablePalette.cableColors`. |
| 12 | <code>Cable colors apply to this Atlas across all Racks.</code> | Included at presentation. `rack:cablePalette.cableColorsApplyToThisAtlasAcross`. |
| 15 | <code>DAC</code> | Technical notation or product/keyboard identifier. |
| 15 | <code>`${category} default cable color`</code> | Included as a whole message or incorporated into a named template in `CablePaletteSettings`. See the display groups for this owner. |
| 15 | <code>`palette:${category}`</code> | Canonical display input, geometry or diagnostic fragment retained by `CablePaletteSettings`. The source link identifies the producer and its consumer. |
| 15 | <code>`Reset ${category}`</code> | Included as a whole message or incorporated into a named template in `CablePaletteSettings`. See the display groups for this owner. |

### RackConnectionStrip

[frontend/src/features/rack/cables/RackConnectionStrip.tsx](../../frontend/src/features/rack/cables/RackConnectionStrip.tsx)

Display groups in this consumer include `rack:strip`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 18 | <code>(prefers-reduced-motion: reduce)</code> | Canonical display input, geometry or diagnostic fragment retained by `RackConnectionStrip`. The source link identifies the producer and its consumer. |
| 40 | <code>Rack connection IDs</code> | Included at presentation. `rack:strip.rackConnectionIds`. |
| 41 | <code>Scroll connection IDs left</code> | Included at presentation. `rack:strip.scrollConnectionIdsLeft`. |
| 43 | <code>Scroll connection IDs</code> | Included at presentation. `rack:strip.scrollConnectionIds`. |
| 46 | <code>ArrowLeft</code> | Canonical display input, geometry or diagnostic fragment retained by `RackConnectionStrip`. The source link identifies the producer and its consumer. |
| 46 | <code>ArrowRight</code> | Canonical display input, geometry or diagnostic fragment retained by `RackConnectionStrip`. The source link identifies the producer and its consumer. |
| 46 | <code>Home</code> | Canonical keyboard event. |
| 46 | <code>End</code> | Canonical keyboard event. |
| 54 | <code>Scroll connection IDs right</code> | Included at presentation. `rack:strip.scrollConnectionIdsRight`. |

### RackCableLayer

[frontend/src/features/rack/cables/RackCableLayer.tsx](../../frontend/src/features/rack/cables/RackCableLayer.tsx)

Display groups in this consumer include `rack:cables`, `rack:cableLayer`, `rack:table`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 21 | <code>`cable-hit-${useId().replace(/:/g, "")}`</code> | DOM, SVG, React, event or serialized identity. See `RackCableLayer`. |
| 34 | <code>`palette:${cableCategory(connection.cable_type)}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackCableLayer`. The source link identifies the producer and its consumer. |
| 39 | <code>`M ${x} ${y} h ${width} v ${height} h ${-width} Z`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackCableLayer`. The source link identifies the producer and its consumer. |
| 46 | <code>physical cable legs on this face</code> | Included as a whole message or incorporated into a named template in `RackCableLayer`. See the display groups for this owner. |
| 55 | <code>` · ${POE_LABEL}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackCableLayer`. The source link identifies the producer and its consumer. |
| 58 | <code>`url(#${clipId})`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackCableLayer`. The source link identifies the producer and its consumer. |
| 58 | <code>`Select ${route.description}`</code> | Included as a whole message or incorporated into a named template in `RackCableLayer`. See the display groups for this owner. |
| 62 | <code>ContextMenu</code> | Canonical keyboard event. |
| 62 | <code>F10</code> | Canonical keyboard event. |
| 62 | <code>Escape</code> | Canonical keyboard event. |
| 62 | <code>Enter</code> | Canonical keyboard event. |
| 64 | <code>`${route.stub.label} — ${exportMode &#124;&#124; cables?.readOnly ? "Partially connected" : "select destination port"}`</code> | Included as a whole message or incorporated into a named template in `RackCableLayer`. See the display groups for this owner. |
| 64 | <code>Partially connected</code> | Included at presentation. `rack:cableLayer.partiallyConnected`. |
| 64 | <code>select destination port</code> | Included at presentation. `rack:cableLayer.selectDestinationPort`. |
| 70 | <code>· Partially connected</code> | Included as a whole message or incorporated into a named template in `RackCableLayer`. See the display groups for this owner. |
| 76 | <code>`${looseLabel.slice(0, 14)}…`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackCableLayer`. The source link identifies the producer and its consumer. |
| 77 | <code>Loose end</code> | Included at presentation. `rack:cableLayer.looseEnd`. |
| 79 | <code>`${line.slice(0, 18)}…`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackCableLayer`. The source link identifies the producer and its consumer. |
| 80 | <code>· virtual breakout</code> | Included as a whole message or incorporated into a named template in `RackCableLayer`. See the display groups for this owner. |
| 84 | <code>`${pulse.runId}:${pulse.leg}`</code> | Canonical display input, geometry or diagnostic fragment retained by `RackCableLayer`. The source link identifies the producer and its consumer. |

### ConnectTable

[frontend/src/features/physicalDocumentation/ConnectTable.tsx](../../frontend/src/features/physicalDocumentation/ConnectTable.tsx)

Display groups in this consumer include `rack:table`, `rack:lifecycle`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 15 | <code>`${side}_location`</code> | DOM, SVG, React, event or serialized identity. See `rackCircuitRows`. |
| 24 | <code>`linear-gradient(180deg, ${POE_BLUE} 50%, ${POE_RED} 50%)`</code> | Canonical display input, geometry or diagnostic fragment retained by `cablePillStyle`. The source link identifies the producer and its consumer. |
| 30 | <code>`${cable.label &#124;&#124; "Unlabeled cable"}${cable.poe ? ` · ${POE_LABEL}` : ""}`</code> | Included as a whole message or incorporated into a named template in `CableLabelPill`. See the display groups for this owner. |
| 30 | <code>Unlabeled cable</code> | Included at presentation. `rack:table.unlabeledCable`. |
| 30 | <code>` · ${POE_LABEL}`</code> | Canonical display input, geometry or diagnostic fragment retained by `CableLabelPill`. The source link identifies the producer and its consumer. |
| 33 | <code>`${actionLabel ?? text} · Right-click or Shift+F10 for cable actions`</code> | Included as a whole message or incorporated into a named template in `CableLabelPill`. See the display groups for this owner. |
| 35 | <code>ContextMenu</code> | Canonical keyboard event. |
| 35 | <code>F10</code> | Canonical keyboard event. |
| 46 | <code>Loose end</code> | Included at presentation. `rack:table.looseEnd`. |
| 46 | <code>Missing device</code> | Included at presentation. `rack:table.missingDevice`. |
| 48 | <code>`Trace circuit containing ${cable.label &#124;&#124; "unlabeled cable"}`</code> | Included as a whole message or incorporated into a named template in `ConnectTable`. See the display groups for this owner. |
| 48 | <code>unlabeled cable</code> | Included at presentation. `rack:table.unlabeledLower`. |
| 54 | <code>`connect-table${compact ? " connect-table--compact" : ""}${exportMode ? " connect-table--export" : ""}`</code> | Canonical display input, geometry or diagnostic fragment retained by `ConnectTable`. The source link identifies the producer and its consumer. |
| 54 | <code>connect-table--compact</code> | Canonical display input, geometry or diagnostic fragment retained by `ConnectTable`. The source link identifies the producer and its consumer. |
| 54 | <code>connect-table--export</code> | Canonical display input, geometry or diagnostic fragment retained by `ConnectTable`. The source link identifies the producer and its consumer. |
| 54 | <code>Connection table</code> | Included at presentation. `rack:table.connectionTable`. |
| 55 | <code>Connections</code> | Included at presentation. `rack:table.connections`. |
| 55 | <code>Connect Table</code> | Included at presentation. `rack:table.connectTable`. |
| 56 | <code>No physical circuits on this view.</code> | Included at presentation. `rack:table.noPhysicalCircuitsOnThisView`. |
| 56 | <code>`${name(row.from)} · ${row.from.label} → ${name(row.to)} · ${row.to.label}${row.warnings.length ? ` · ${row.warnings.join(" ")}` : ""}`</code> | Included as a whole message or incorporated into a named template in `ConnectTable`. See the display groups for this owner. |
| 56 | <code>` · ${row.warnings.join(" ")}`</code> | Included as a whole message or incorporated into a named template in `ConnectTable`. See the display groups for this owner. |
| 57 | <code>ID</code> | Technical notation or product/keyboard identifier. |
| 57 | <code>From</code> | Included at presentation. `rack:table.from`. |
| 57 | <code>To</code> | Included at presentation. `rack:table.to`. |
| 57 | <code>Cable Type</code> | Included at presentation. `rack:table.cableType`. |
| 57 | <code>Path</code> | Included at presentation. `rack:table.path`. |
| 59 | <code>Hide</code> | Replaced at the display boundary in `ConnectTable`. Stable option, schema, selection and geometry values are retained. |
| 59 | <code>Show</code> | Replaced at the display boundary in `ConnectTable`. Stable option, schema, selection and geometry values are retained. |
| 59 | <code>`${row.cable_ids.length} cables`</code> | Included as a whole message or incorporated into a named template in `ConnectTable`. See the display groups for this owner. |
| 60 | <code>` · ${POE_LABEL}${row.poe_partial ? " (DATA segments only)" : ""}`</code> | Included as a whole message or incorporated into a named template in `ConnectTable`. See the display groups for this owner. |
| 60 | <code>(DATA segments only)</code> | Included at presentation. `rack:table.dataOnly`. |
| 62 | <code>`mate-${i}`</code> | Canonical display input, geometry or diagnostic fragment retained by `ConnectTable`. The source link identifies the producer and its consumer. |
| 62 | <code>No cable</code> | Included at presentation. `rack:table.noCable`. |
| 62 | <code>Slot</code> | Included at presentation. `rack:inspector.slot`. |
| 62 | <code>· Internal mate</code> | Included as a whole message or incorporated into a named template in `ConnectTable`. See the display groups for this owner. |
| 63 | <code>Not recorded</code> | Included at presentation. `rack:table.notRecorded`. |
| 63 | <code>Physical cable ·</code> | Included as a whole message or incorporated into a named template in `ConnectTable`. See the display groups for this owner. |

## M5d

Test owners cover Physical documentation, Handbook, PNG/PDF, locale switching and responsive browser checks. See the [verification ledger](M5_verification.md) for individual browser outcomes.

### PhysicalDocumentation

[frontend/src/features/physicalDocumentation/PhysicalDocumentation.tsx](../../frontend/src/features/physicalDocumentation/PhysicalDocumentation.tsx)

Display groups in this consumer include `rack:elevation`, `rack:inspector`, `rack:documentation`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 27 | <code>Not recorded</code> | Included at presentation. `rack:documentation.notRecorded`. |
| 29 | <code>Connect Table</code> | Retained source spelling with a display catalog entry. `rack:toolbar.connectTable`, `rack:table.connectTable`. |
| 30 | <code>Rack equipment inventory</code> | Retained source spelling with a display catalog entry. `rack:documentation.rackEquipmentInventory`. |
| 31 | <code>Patch-panel schedules</code> | Retained source spelling with a display catalog entry. `rack:documentation.patchPanelSchedules`. |
| 32 | <code>Cable schedule</code> | Retained source spelling with a display catalog entry. `rack:documentation.cableSchedule`. |
| 37 | <code>Missing device</code> | Included at presentation. `rack:documentation.missingDevice`. |
| 43 | <code>Loose end</code> | Included at presentation. `rack:documentation.looseEnd`. |
| 43 | <code>Partially connected · Unplugged</code> | Included at presentation. `rack:documentation.partiallyConnectedUnplugged`. |
| 46 | <code>Module:</code> | Included as a whole message or incorporated into a named template in `Endpoint`. See the display groups for this owner. |
| 49 | <code>` · ${POE_LABEL}`</code> | Canonical display input, geometry or diagnostic fragment retained by `CableMetadata`. The source link identifies the producer and its consumer. |
| 49 | <code>Label:</code> | Included as a whole message or incorporated into a named template in `CableMetadata`. See the display groups for this owner. |
| 49 | <code>· Length:</code> | Included as a whole message or incorporated into a named template in `CableMetadata`. See the display groups for this owner. |
| 51 | <code>Custom type:</code> | Included as a whole message or incorporated into a named template in `CableMetadata`. See the display groups for this owner. |
| 65 | <code>Missing cable</code> | Included as a whole message or incorporated into a named template in `Destinations`. See the display groups for this owner. |
| 67 | <code>PLANNED</code> | Included at presentation. `rack:documentation.planned`. |
| 68 | <code>Unconnected</code> | Included at presentation. `rack:documentation.unconnected`. |
| 73 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 73 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 73 | <code>ports</code> | Included as a whole message or incorporated into a named template in `PortTable`. See the display groups for this owner. |
| 74 | <code>`${face} physical ports`</code> | Included as a whole message or incorporated into a named template in `PortTable`. See the display groups for this owner. |
| 74 | <code>Port</code> | Included at presentation. `rack:documentation.port`. |
| 74 | <code>Connector / Role</code> | Included at presentation. `rack:documentation.connectorRole`. |
| 74 | <code>Direct destination</code> | Included at presentation. `rack:documentation.directDestination`. |
| 76 | <code>Internal pair:</code> | Included as a whole message or incorporated into a named template in `PortTable`. See the display groups for this owner. |
| 83 | <code>`Physical Connections · ${device.connection_ids.length}`</code> | Included as a whole message or incorporated into a named template in `Connections`. See the display groups for this owner. |
| 84 | <code>Direct physical connections</code> | Included at presentation. `rack:documentation.directPhysicalConnections`. |
| 85 | <code>Local port</code> | Included at presentation. `rack:documentation.localPort`. |
| 85 | <code>Remote device / port</code> | Included at presentation. `rack:documentation.remoteDevicePort`. |
| 85 | <code>Cable</code> | Included at presentation. `rack:documentation.cable`. |
| 91 | <code>`card-connections:${device.key}`</code> | DOM, SVG, React, event or serialized identity. See `Connections`. |
| 97 | <code>Recorded path</code> | Included at presentation. `rack:documentation.recordedPath`. |
| 98 | <code>`Slot ${hop.slot_number} internal mate (no cable)`</code> | Included as a whole message or incorporated into a named template in `Trace`. See the display groups for this owner. |
| 98 | <code>Internal pair</code> | Included at presentation. `rack:documentation.internalPair`. |
| 98 | <code>External cable</code> | Included at presentation. `rack:documentation.externalCable`. |
| 104 | <code>`${device.name} patch-panel schedule`</code> | Included as a whole message or incorporated into a named template in `PanelTable`. See the display groups for this owner. |
| 104 | <code>Position</code> | Included at presentation. `rack:documentation.position`. |
| 104 | <code>Front port / external cable</code> | Included at presentation. `rack:documentation.frontPortExternalCable`. |
| 104 | <code>Paired rear / external cable</code> | Included at presentation. `rack:documentation.pairedRearExternalCable`. |
| 104 | <code>Internal pair / path</code> | Included at presentation. `rack:documentation.internalPairPath`. |
| 108 | <code>Missing rear termination</code> | Included at presentation. `rack:documentation.missingRearTermination`. |
| 109 | <code>Internal pair (not a cable)</code> | Included at presentation. `rack:documentation.internalPairNotACable`. |
| 109 | <code>Unresolved pair</code> | Included at presentation. `rack:documentation.unresolvedPair`. |
| 110 | <code>No external path recorded</code> | Included at presentation. `rack:documentation.noExternalPathRecorded`. |
| 118 | <code>`card-ports:${device.key}`</code> | DOM, SVG, React, event or serialized identity. See `DeviceDocumentation`. |
| 118 | <code>`Physical Ports · ${device.ports.length}`</code> | Included as a whole message or incorporated into a named template in `DeviceDocumentation`. See the display groups for this owner. |
| 119 | <code>Physical Ports ·</code> | Included as a whole message or incorporated into a named template in `DeviceDocumentation`. See the display groups for this owner. |
| 120 | <code>`ports:${device.key}`</code> | DOM, SVG, React, event or serialized identity. See `DeviceDocumentation`. |
| 120 | <code>`Show all ${device.ports.length} physical ports`</code> | Included as a whole message or incorporated into a named template in `DeviceDocumentation`. See the display groups for this owner. |
| 122 | <code>`legacy:${device.key}:${legacy.name}`</code> | DOM, SVG, React, event or serialized identity. See `DeviceDocumentation`. |
| 122 | <code>`Conflicting legacy source: ${legacy.name}`</code> | Included as a whole message or incorporated into a named template in `DeviceDocumentation`. See the display groups for this owner. |
| 124 | <code>Patch-panel schedule</code> | Included at presentation. `rack:documentation.patchPanelSchedule`. |
| 124 | <code>`panel:${device.key}`</code> | DOM, SVG, React, event or serialized identity. See `DeviceDocumentation`. |
| 124 | <code>`${device.pairs.length} internal pairs`</code> | Included as a whole message or incorporated into a named template in `DeviceDocumentation`. See the display groups for this owner. |
| 131 | <code>Physical Wiring</code> | Included at presentation. `rack:documentation.physicalWiring`. |
| 131 | <code>Reference</code> | Included at presentation. `rack:documentation.reference`. |
| 142 | <code>Recorded equipment, physical ports and cables across all Racks and Atlas devices.</code> | Included at presentation. `rack:documentation.recordedEquipmentPhysicalPortsAndCablesAcross`. |
| 143 | <code>Find physical wiring</code> | Included at presentation. `rack:documentation.findPhysicalWiring`. |
| 143 | <code>Device, Rack, port or cable</code> | Included at presentation. `rack:documentation.deviceRackPortOrCable`. |
| 145 | <code>No physical cables documented.</code> | Included at presentation. `rack:documentation.noPhysicalCablesDocumented`. |
| 146 | <code>No matching physical wiring records.</code> | Included at presentation. `rack:documentation.noMatchingPhysicalWiringRecords`. |
| 147 | <code>No Rack equipment to display.</code> | Included at presentation. `rack:documentation.noRackEquipmentToDisplay`. |
| 152 | <code>Atlas linked</code> | Included at presentation. `rack:documentation.atlasLinked`. |
| 152 | <code>Rack-local equipment</code> | Included at presentation. `rack:documentation.rackLocalEquipment`. |
| 152 | <code>· PLANNED</code> | Replaced at the display boundary in `PhysicalWiring`. Stable option, schema, selection and geometry values are retained. |
| 153 | <code>documented ports ·</code> | Included as a whole message or incorporated into a named template in `PhysicalWiring`. See the display groups for this owner. |
| 153 | <code>direct cables</code> | Included as a whole message or incorporated into a named template in `PhysicalWiring`. See the display groups for this owner. |
| 154 | <code>Server Drive Slots:</code> | Included as a whole message or incorporated into a named template in `PhysicalWiring`. See the display groups for this owner. |
| 154 | <code>installed</code> | Included as a whole message or incorporated into a named template in `PhysicalWiring`. See the display groups for this owner. |
| 155 | <code>Slot</code> | Included at presentation. `rack:inspector.slot`. |
| 156 | <code>(Drive tile)</code> | Included at presentation. `rack:documentation.driveTile`. |
| 159 | <code>Backplane</code> | Included at presentation. `rack:documentation.backplane`. |
| 159 | <code>Direct wiring</code> | Included at presentation. `rack:documentation.directWiring`. |
| 159 | <code>fixed slots</code> | Included as a whole message or incorporated into a named template in `PhysicalWiring`. See the display groups for this owner. |
| 160 | <code>` / ${s.drive_port}`</code> | Canonical display input, geometry or diagnostic fragment retained by `PhysicalWiring`. The source link identifies the producer and its consumer. |
| 160 | <code>` ⇄ ${s.backplane_port}${s.drive_port ? " (internal mate; no cable)" : ""}`</code> | Included as a whole message or incorporated into a named template in `PhysicalWiring`. See the display groups for this owner. |
| 160 | <code>(internal mate; no cable)</code> | Included at presentation. `rack:documentation.internalMateSuffix`. |
| 165 | <code>No documented patch-panel schedules to display.</code> | Included at presentation. `rack:documentation.noDocumentedPatchPanelSchedulesToDisplay`. |
| 170 | <code>Cable schedule ·</code> | Included as a whole message or incorporated into a named template in `PhysicalWiring`. See the display groups for this owner. |
| 170 | <code>Cable ID</code> | Included at presentation. `rack:documentation.cableId`. |
| 170 | <code>Endpoint A</code> | Included at presentation. `rack:documentation.endpointA`. |
| 170 | <code>Endpoint B</code> | Included at presentation. `rack:documentation.endpointB`. |
| 170 | <code>Recorded cable details</code> | Included at presentation. `rack:documentation.recordedCableDetails`. |
| 172 | <code>No cables to display.</code> | Included at presentation. `rack:documentation.noCablesToDisplay`. |

### PngExportOptionsDialog

[frontend/src/components/PngExportOptionsDialog.tsx](../../frontend/src/components/PngExportOptionsDialog.tsx)

Display groups in this consumer include `rack:elevation`, `rack:png`.

| Line | Original English or source expression | Classification and consumer |
|---:|---|---|
| 42 | <code>button:not(:disabled), input:not(:disabled)</code> | DOM, SVG, React, event or serialized identity. See `PngExportOptionsDialog`. |
| 45 | <code>Tab</code> | Canonical keyboard event. |
| 59 | <code>Escape</code> | Canonical keyboard event. |
| 86 | <code>Rack PNG Export Options</code> | Included at presentation. `rack:png.heading`. |
| 91 | <code>Elevation</code> | Included at presentation. `rack:png.elevation`. |
| 94 | <code>Front</code> | Included at presentation. `rack:elevation.front`. |
| 94 | <code>Rear</code> | Included at presentation. `rack:elevation.rear`. |
| 94 | <code>Both</code> | Included at presentation. `rack:elevation.both`. |
| 98 | <code>Include Connection Table</code> | Included at presentation. `rack:png.includeConnectionTable`. |
| 98 | <code>Yes</code> | Included at presentation. `rack:png.yes`. |
| 98 | <code>No</code> | Included at presentation. `rack:png.no`. |
| 107 | <code>png.includeHint</code> | Canonical display input, geometry or diagnostic fragment retained by `PngExportOptionsDialog`. The source link identifies the producer and its consumer. |
| 178 | <code>`png-export-dialog__theme-option png-export-dialog__theme-option--${theme}${selected ? " active" : ""}`</code> | Canonical display input, geometry or diagnostic fragment retained by `ThemeButton`. The source link identifies the producer and its consumer. |
| 178 | <code>active</code> | Canonical display input, geometry or diagnostic fragment retained by `ThemeButton`. The source link identifies the producer and its consumer. |

## Structured data and downstream consumers

| Owner | Retained data and display boundary |
|---|---|
| Rack presentation, model and identity | Stored component types and generated editable titles use the original registries. Palette and selector captions use the same IDs to look up display messages. |
| Hardware and physical port models | Preserve generated port labels, numbers, bank/face/role/connector identifiers, PoE flags, technical acronyms and socket assignments. UI adapters supply display-only captions. |
| Server storage model and serverStorageDisplay | The presence of a slot assignment distinguishes an empty slot from a Drive with an authored title of Empty. Descriptive warnings render separately from the stored Drive ID and title. |
| Cable creation, destination search, routing and trace | Canonical endpoint descriptions feed matching. Editable cable labels, IDs, route points, paths, color values and owner signatures stay intact. Fixed-width painted stub addresses retain the geometry producer’s composite text. |
| Physical documentation model and presentation | Mixed location/candidate addresses can contain Rack names and placement IDs. Composite addresses, legacy source names and unresolved detail remain verbatim where constituent facts are unavailable. Generated bay-slot text without an assignment field has the same boundary. |
| Rack faceplate renderer and equipment placement | Retain asset/profile names, filenames, calibration coordinates, technical port numbers and the existing on-face abbreviation of equipment titles. The calibration workbench is development-only. |
| Desktop Handbook and mobile shell | Physical section names follow stable outline IDs in desktop Handbook. Shared primitives use fixed English resources when the mobile reader owns them. |
| PNG scene, title block, Connect Table export and backend documents | The Rack PNG dialog is live desktop UI. Captured equipment, title-block captions, export-mode rows and generated server-side contents retain their original locale. |
