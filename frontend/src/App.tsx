import {
  applyNodeChanges,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type FitViewOptions,
  type Node,
  type NodeChange
} from "@xyflow/react";
import { Loader2 } from "lucide-react";
import {
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { CanvasFrame, type StackContextMenuView } from "./components/CanvasFrame";
import { Inspector } from "./components/Inspector";
import { LeftSidebar, type CollapsedPaletteEntry, type PaletteEntry, type SidebarSectionId, type SidebarState } from "./components/LeftSidebar";
import { SettingsPanel } from "./components/SettingsPanel";
import { TopBar } from "./components/TopBar";
import { useAppearancePreferences, type AppearanceDebugEvent } from "./appearance";
import {
  clearBackendDebugLog,
  downloadAtlasJson,
  downloadExport,
  generateExport,
  loadAppVersion,
  loadAtlas,
  loadBackendDebugLog,
  loadDemoAtlas,
  loadHealth,
  previewAtlasImport,
  readAtlasFile,
  saveAtlas
} from "./lib/api";
import { DEFAULT_FIELDS, LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "./lib/constants";
import { atlasSummary, createFrontendDebugEvent, downloadDebugLog } from "./lib/debug";
import {
  buildEffectiveStackState,
  buildStackState,
  canConnectTiles,
  canStackMountChildren,
  canStackSiblingTiles,
  closestTileToParent,
  emptyStackState,
  getActiveView,
  getChildrenByParent,
  getFamilyTreeClosure,
  getLifecycleCounts,
  getSearchResults,
  getStackEligibleTileIds,
  getVisibleLinks,
  getVisibleTiles,
  isLifecycleEditable,
  resolveLifecycle,
  toggleViewSelection,
  type SearchResult
} from "./lib/atlasSelectors";
import {
  cloneFields,
  createId,
  defaultMountStackName,
  defaultStackName,
  nextGeneratedTileTitle,
  sanitizeAtlas,
  withAtlasDefaults
} from "./lib/atlasMutations";
import { buildConnectorObstacles, type ConnectorRoutingMode } from "./lib/edgeRouting";
import { isEditableNodeChange, mapAtlasToEdges, mapAtlasToNodes } from "./lib/graphMapping";
import { validateAtlasWarnings } from "./lib/validation";
import type {
  Atlas,
  AppVersion,
  DebugEvent,
  Family,
  ExportFormat,
  ExportResult,
  AppMode,
  Lifecycle,
  Link,
  LinkSourcePort,
  LinkTargetPort,
  LinkType,
  Selection,
  Tile,
  TileStack,
  TileType,
  View
} from "./types/atlas";

const TILE_DRAG_MIME = "application/ctroadmap-tile-type";
const FAMILY_DRAG_MIME = "application/ctroadmap-family";
const FAMILY_PALETTE_COLOR = "#38a3ff";
const FIT_VIEW_OPTIONS: FitViewOptions = { padding: 0.28, duration: 450 };
const SIDEBAR_STORAGE_KEY = "ctroadmap.sidebarSections";
const CONNECTOR_ROUTING_STORAGE_KEY = "ctroadmap.connectorRoutingMode";
const AUTOSAVE_DEBOUNCE_MS = 1000;

type SaveReason = "autosave" | "manual" | "export";

const PALETTE_ENTRIES: PaletteEntry[] = [...TILE_TYPES.map((type) => ({ kind: "tile" as const, type })), { kind: "family" }];

function App() {
  return (
    <ReactFlowProvider>
      <AtlasEditor />
    </ReactFlowProvider>
  );
}

function AtlasEditor() {
  const { fitView, fitBounds, screenToFlowPosition, setCenter } = useReactFlow();
  const canvasRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isNodeDragging = useRef(false);
  const lastPaletteDragAt = useRef(0);
  const collapsedPaletteTouchY = useRef<number | null>(null);
  const lastVisibleTileCount = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastWarningCount = useRef<number | null>(null);
  const latestAtlasRef = useRef<Atlas | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const resetMenuRef = useRef<HTMLDivElement | null>(null);
  const autosaveTimerRef = useRef<number | null>(null);
  const dirtyVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const inFlightSaveVersionRef = useRef<number | null>(null);
  const isSavingRef = useRef(false);
  const queuedSaveRef = useRef(false);
  const currentSavePromiseRef = useRef<Promise<Atlas | null> | null>(null);
  const saveCurrentAtlasRef = useRef<(reason: SaveReason) => Promise<Atlas | null>>(() => Promise.resolve(null));
  const [atlas, setAtlas] = useState<Atlas | null>(null);
  const [activeViewId, setActiveViewId] = useState("everything");
  const [backendHealth, setBackendHealth] = useState("unknown");
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([]);
  const [appVersion, setAppVersion] = useState<AppVersion | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [resetMenuOpen, setResetMenuOpen] = useState(false);
  const [viewBarOpen, setViewBarOpen] = useState(true);
  const [appMode, setAppMode] = useState<AppMode>("live");
  const [sidebarState, setSidebarState] = useState<SidebarState>(() => getStoredSidebarState());
  const [stackContextMenu, setStackContextMenu] = useState<StackContextMenuView | null>(null);
  const [status, setStatus] = useState("Loading atlas...");
  const [connectorRoutingMode, setConnectorRoutingMode] = useState<ConnectorRoutingMode>(() => getStoredConnectorRoutingMode());
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [exportResults, setExportResults] = useState<Partial<Record<ExportFormat, ExportResult>>>({});
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [isInteractive, setIsInteractive] = useState(true);
  const [nodeDragInProgress, setNodeDragInProgress] = useState(false);

  const appendDebugEvent = useCallback((action: string, message: string, severity: DebugEvent["severity"] = "info", context: Record<string, unknown> = {}) => {
    setDebugEvents((current) => [...current.slice(-299), createFrontendDebugEvent(action, message, severity, context)]);
  }, []);

  const handleAppearanceDebugEvent = useCallback(
    (event: AppearanceDebugEvent) => appendDebugEvent(event.action, event.message, "info", event.context),
    [appendDebugEvent]
  );
  const { resetCanvasAppearance } = useAppearancePreferences({ onDebugEvent: handleAppearanceDebugEvent });

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    window.requestAnimationFrame(() => settingsButtonRef.current?.focus());
  }, []);

  const clearAutosaveTimer = useCallback(() => {
    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }, []);

  const saveCurrentAtlas = useCallback(
    async (reason: SaveReason = "autosave"): Promise<Atlas | null> => {
      const snapshot = latestAtlasRef.current;
      if (!snapshot) return null;
      if (reason === "autosave" && dirtyVersionRef.current <= savedVersionRef.current) return snapshot;

      clearAutosaveTimer();

      if (isSavingRef.current) {
        queuedSaveRef.current = true;
        if (reason === "manual" || reason === "export") {
          await currentSavePromiseRef.current;
          return saveCurrentAtlasRef.current(reason);
        }
        return null;
      }

      const saveVersion = dirtyVersionRef.current;
      isSavingRef.current = true;
      inFlightSaveVersionRef.current = saveVersion;
      setIsSaving(true);
      setLastSaveError(null);

      const savePromise = (async () => {
        let succeeded = false;
        try {
          const saved = await saveAtlas(snapshot);
          succeeded = true;
          const savedAt = new Date();
          const hasNewerLocalChanges = dirtyVersionRef.current !== saveVersion;

          if (!hasNewerLocalChanges) {
            latestAtlasRef.current = saved;
            savedVersionRef.current = saveVersion;
            setAtlas(saved);
            setIsDirty(false);
            setLastSavedAt(savedAt);
          } else {
            queuedSaveRef.current = true;
          }

          const action = reason === "autosave" ? "atlas.autosave" : reason === "export" ? "atlas.export_presave" : "atlas.save";
          const message = reason === "autosave" ? "Atlas autosaved" : reason === "export" ? "Atlas saved before export" : "Atlas saved";
          appendDebugEvent(action, message, "info", atlasSummary(saved));
          if (reason === "manual" && !hasNewerLocalChanges) setStatus("Atlas saved");
          return saved;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(error);
          queuedSaveRef.current = false;
          clearAutosaveTimer();
          setIsDirty(true);
          setLastSaveError(message);
          if (reason === "manual") setStatus("Save failed");
          appendDebugEvent(reason === "autosave" ? "atlas.autosave" : "atlas.save", "Atlas save failed", "error", { reason, error: message });
          return null;
        } finally {
          isSavingRef.current = false;
          inFlightSaveVersionRef.current = null;
          currentSavePromiseRef.current = null;
          setIsSaving(false);

          if (succeeded && (queuedSaveRef.current || dirtyVersionRef.current > savedVersionRef.current)) {
            queuedSaveRef.current = false;
            void saveCurrentAtlasRef.current("autosave");
          }
        }
      })();

      currentSavePromiseRef.current = savePromise;
      return savePromise;
    },
    [appendDebugEvent, clearAutosaveTimer]
  );

  useEffect(() => {
    saveCurrentAtlasRef.current = saveCurrentAtlas;
  }, [saveCurrentAtlas]);

  const scheduleAutosave = useCallback(() => {
    clearAutosaveTimer();
    autosaveTimerRef.current = window.setTimeout(() => {
      autosaveTimerRef.current = null;
      void saveCurrentAtlasRef.current("autosave");
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [clearAutosaveTimer]);

  const commitDirtyAtlas = useCallback(
    (nextAtlas: Atlas) => {
      latestAtlasRef.current = nextAtlas;
      dirtyVersionRef.current += 1;
      setAtlas(nextAtlas);
      setIsDirty(true);
      setLastSaveError(null);
      if (isSavingRef.current) queuedSaveRef.current = true;
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const setCleanAtlas = useCallback(
    (nextAtlas: Atlas, savedAt: Date | null = null) => {
      clearAutosaveTimer();
      latestAtlasRef.current = nextAtlas;
      dirtyVersionRef.current += 1;
      savedVersionRef.current = dirtyVersionRef.current;
      queuedSaveRef.current = false;
      setAtlas(nextAtlas);
      setIsDirty(false);
      setLastSaveError(null);
      setLastSavedAt(savedAt);
    },
    [clearAutosaveTimer]
  );

  useEffect(() => {
    return () => clearAutosaveTimer();
  }, [clearAutosaveTimer]);

  useEffect(() => {
    function handleWindowError(event: ErrorEvent) {
      appendDebugEvent("runtime.error", "Unhandled frontend error", "error", {
        error: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    }
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      appendDebugEvent("runtime.unhandled_rejection", "Unhandled frontend promise rejection", "error", {
        error: errorToMessage(event.reason)
      });
    }
    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [appendDebugEvent]);

  useEffect(() => {
    loadAtlas()
      .then((nextAtlas) => {
        setCleanAtlas(nextAtlas);
        const defaultView = nextAtlas.views.find((view) => view.id === "everything") ?? nextAtlas.views[0];
        if (defaultView) setActiveViewId(defaultView.id);
        setStatus("Atlas loaded");
        appendDebugEvent("atlas.load", "Atlas loaded", "info", atlasSummary(nextAtlas));
      })
      .catch((error) => {
        console.error(error);
        setStatus("Unable to load atlas");
        appendDebugEvent("atlas.load", "Atlas load failed", "error", { error: errorToMessage(error) });
      });
  }, [appendDebugEvent, setCleanAtlas]);

  useEffect(() => {
    storeConnectorRoutingMode(connectorRoutingMode);
  }, [connectorRoutingMode]);

  useEffect(() => {
    storeSidebarState(sidebarState);
  }, [sidebarState]);


  useEffect(() => {
    loadAppVersion()
      .then((version) => {
        setAppVersion(version);
        appendDebugEvent("app.version", "App version loaded", "info", { version: version.current_version, channel: version.channel });
      })
      .catch((error) => {
        appendDebugEvent("app.version", "App version load failed", "error", { error: error instanceof Error ? error.message : String(error) });
      })
      ;
  }, [appendDebugEvent]);



  const activeView = useMemo(() => getActiveView(atlas, activeViewId), [atlas, activeViewId]);

  const collapsedPaletteEntries = useMemo<CollapsedPaletteEntry[]>(() => {
    const activeIndex = normalizePaletteIndex(sidebarState.paletteIndex);
    return [
      { slot: "previous", entry: PALETTE_ENTRIES[normalizePaletteIndex(activeIndex - 1)], interactive: false },
      { slot: "active", entry: PALETTE_ENTRIES[activeIndex], interactive: true },
      { slot: "next", entry: PALETTE_ENTRIES[normalizePaletteIndex(activeIndex + 1)], interactive: false }
    ];
  }, [sidebarState.paletteIndex]);

  const lifecycleCounts = useMemo(() => getLifecycleCounts(atlas), [atlas]);

  const childrenByParent = useMemo(() => getChildrenByParent(atlas), [atlas]);

  const fullStackState = useMemo(() => (atlas ? buildStackState(atlas) : emptyStackState()), [atlas]);

  const stackEligibleTileIds = useMemo(() => getStackEligibleTileIds(atlas, activeView, searchTerm), [activeView, atlas, searchTerm]);

  const stackState = useMemo(() => buildEffectiveStackState(fullStackState, stackEligibleTileIds), [fullStackState, stackEligibleTileIds]);

  const handleFocusFamily = useCallback(
    (family: Family) => {
      setSelection({ kind: "family", id: family.id });
      fitBounds(
        {
          x: family.position.x,
          y: family.position.y,
          width: family.size.width,
          height: family.size.height
        },
        { padding: 0.2, duration: 450 }
      );
      setStatus(`Family: ${family.title}`);
      appendDebugEvent("family.focus", "Family focused", "info", { family_id: family.id });
    },
    [appendDebugEvent, fitBounds]
  );

  const handleResizeFamily = useCallback(
    (familyId: string, size: { width: number; height: number }) => {
      const current = latestAtlasRef.current;
      if (!current) return;
      commitDirtyAtlas({
        ...current,
        families: (current.families ?? []).map((family) =>
          family.id === familyId
            ? {
              ...family,
              size: {
                width: Math.max(240, size.width),
                height: Math.max(42, size.height)
              }
            }
            : family
        )
      });
      appendDebugEvent("family.resize", "Family resized", "info", { family_id: familyId, width: size.width, height: size.height });
    },
    [appendDebugEvent, commitDirtyAtlas]
  );

  const searchResults = useMemo<SearchResult[]>(() => getSearchResults(atlas, activeView, searchTerm), [activeView, atlas, searchTerm]);

  const visibleTiles = useMemo(() => getVisibleTiles(atlas, activeView, searchTerm, stackState, stackEligibleTileIds), [activeView, atlas, searchTerm, stackEligibleTileIds, stackState]);

  const visibleTileIds = useMemo(() => new Set(visibleTiles.map((tile) => tile.id)), [visibleTiles]);

  const visibleLinks = useMemo(() => getVisibleLinks(atlas, activeView, searchTerm, visibleTileIds, stackState), [activeView, atlas, searchTerm, stackState, visibleTileIds]);

  useEffect(() => {
    if (selection?.kind !== "stack") return;
    if (!stackState.stacks.some((stack) => stack.id === selection.id)) {
      setSelection(null);
    }
  }, [selection, stackState.stacks]);

  const derivedNodes: Node[] = useMemo(
    () =>
      mapAtlasToNodes({
        appMode,
        atlas,
        childrenByParent,
        isInteractive,
        selection,
        stackState,
        visibleTiles,
        visibleLinks,
        onFocusFamily: handleFocusFamily,
        onResizeFamily: handleResizeFamily
      }),
    [appMode, atlas, childrenByParent, handleFocusFamily, handleResizeFamily, isInteractive, selection, stackState, visibleLinks, visibleTiles]
  );

  useEffect(() => {
    if (isNodeDragging.current) return;
    setFlowNodes(derivedNodes);
  }, [derivedNodes]);

  const effectiveConnectorRoutingMode: ConnectorRoutingMode = connectorRoutingMode === "avoid_tiles" && !nodeDragInProgress ? "avoid_tiles" : "curved";

  const routingObstacles = useMemo(
    () => (effectiveConnectorRoutingMode === "avoid_tiles" ? buildConnectorObstacles(flowNodes) : []),
    [effectiveConnectorRoutingMode, flowNodes]
  );

  const edges: Edge[] = useMemo(
    () =>
      mapAtlasToEdges(appMode, visibleLinks, stackState, {
        connectorRoutingMode: effectiveConnectorRoutingMode,
        routingObstacles
      }),
    [appMode, effectiveConnectorRoutingMode, routingObstacles, stackState, visibleLinks]
  );

  const updateAtlas = useCallback((updater: (current: Atlas) => Atlas) => {
    const current = latestAtlasRef.current;
    if (!current) return;
    commitDirtyAtlas(sanitizeAtlas(updater(withAtlasDefaults(current))));
  }, [commitDirtyAtlas]);

  const getCanvasDebugContext = useCallback(
    (extra: Record<string, unknown> = {}) => ({
      active_view_id: activeView?.id ?? null,
      active_view_title: activeView?.title ?? "None", visible_tiles: visibleTiles.length,
      visible_links: visibleLinks.length,
      total_tiles: atlas?.tiles.length ?? 0,
      total_links: atlas?.links.length ?? 0,
      search_active: Boolean(searchTerm.trim()),
      app_mode: appMode,
      live_tiles: lifecycleCounts.liveTiles,
      planned_tiles: lifecycleCounts.plannedTiles,
      live_links: lifecycleCounts.liveLinks,
      planned_links: lifecycleCounts.plannedLinks,
      visible_type_filters: activeView?.visible_types.length ?? 0,
      visible_link_filters: activeView?.visible_links.length ?? 0,
      ...extra
    }),
    [activeView, appMode, atlas, lifecycleCounts, searchTerm, visibleLinks.length, visibleTiles.length]
  );

  const selectTileAndFocus = useCallback(
    (tileId: string) => {
      if (!atlas) return;
      const renderedTileId = stackState.memberToRepresentative.get(tileId) ?? tileId;
      const stack = stackState.stackByRepresentative.get(renderedTileId);
      const tile = atlas.tiles.find((candidate) => candidate.id === renderedTileId);
      if (!tile) return;
      const renderedNode = flowNodes.find((node) => node.id === renderedTileId);
      const position = renderedNode?.position ?? tile.position;
      const width = renderedNode?.width ?? tile.size?.width ?? 248;
      const height = renderedNode?.height ?? tile.size?.height ?? 128;
      setSelection(stack ? { kind: "stack", id: stack.id } : { kind: "tile", id: renderedTileId });
      setCenter(position.x + width / 2, position.y + height / 2, { zoom: 1, duration: 500 });
    },
    [atlas, flowNodes, setCenter, stackState.memberToRepresentative, stackState.stackByRepresentative]
  );

  const selectSearchResult = useCallback(
    (result: SearchResult) => {
      if (result.kind === "tile") {
        selectTileAndFocus(result.id);
        return;
      }
      setSelection({ kind: "link", id: result.id });
    },
    [selectTileAndFocus]
  );


  const handleConnectorRoutingModeToggle = useCallback(() => {
    setConnectorRoutingMode((current) => {
      const next: ConnectorRoutingMode = current === "avoid_tiles" ? "curved" : "avoid_tiles";
      appendDebugEvent("settings.connector_routing", "Connector routing mode changed", "info", { mode: next });
      return next;
    });
  }, [appendDebugEvent]);

  const toggleSidebarSection = useCallback((section: SidebarSectionId) => {
    setSidebarState((current) => ({
      ...current,
      collapsed: {
        ...current.collapsed,
        [section]: !current.collapsed[section]
      }
    }));
  }, []);

  const cycleCollapsedPalette = useCallback((delta: number) => {
    setSidebarState((current) => ({
      ...current,
      paletteIndex: normalizePaletteIndex(current.paletteIndex + delta)
    }));
  }, []);

  const handleCollapsedPaletteWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      cycleCollapsedPalette(event.deltaY >= 0 ? 1 : -1);
    },
    [cycleCollapsedPalette]
  );

  const handleCollapsedPaletteTouchStart = useCallback((event: ReactTouchEvent<HTMLDivElement>) => {
    collapsedPaletteTouchY.current = event.touches[0]?.clientY ?? null;
  }, []);

  const handleCollapsedPaletteTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const startY = collapsedPaletteTouchY.current;
      collapsedPaletteTouchY.current = null;
      const endY = event.changedTouches[0]?.clientY;
      if (startY === null || endY === undefined) return;
      const delta = startY - endY;
      if (Math.abs(delta) < 18) return;
      cycleCollapsedPalette(delta > 0 ? 1 : -1);
    },
    [cycleCollapsedPalette]
  );

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
    appendDebugEvent("settings.open", "Settings opened");
    loadHealth()
      .then((health) => {
        setBackendHealth(`${health.app}: ${health.status}`);
        appendDebugEvent("api.health", "Backend health checked", "info", { status: health.status, app: health.app });
      })
      .catch((error) => {
        setBackendHealth("unreachable");
        appendDebugEvent("api.health", "Backend health check failed", "error", { error: error instanceof Error ? error.message : String(error) });
      });
  }, [appendDebugEvent]);

  const handleToggleSettings = useCallback(() => {
    if (settingsOpen) {
      closeSettings();
      appendDebugEvent("settings.close", "Settings closed");
      return;
    }
    handleOpenSettings();
  }, [appendDebugEvent, closeSettings, handleOpenSettings, settingsOpen]);

  const handleExportDebugLog = useCallback(async () => {
    try {
      const backendEvents = await loadBackendDebugLog();
      const events = [...debugEvents, ...backendEvents].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
      downloadDebugLog(events, {
        app: "CTRoadmap",
        active_view: activeView?.title ?? "None", backend_health: backendHealth,
        frontend_events: debugEvents.length,
        backend_events: backendEvents.length
      });
      appendDebugEvent("debug.export", "Debug log exported", "info", { frontend_events: debugEvents.length, backend_events: backendEvents.length });
    } catch (error) {
      appendDebugEvent("debug.export", "Debug log export failed", "error", { error: error instanceof Error ? error.message : String(error) });
      window.alert(error instanceof Error ? error.message : "Debug log export failed");
    }
  }, [activeView, appendDebugEvent, backendHealth, debugEvents]);

  const handleClearDebugLog = useCallback(() => {
    setDebugEvents([]);
    void clearBackendDebugLog().catch((error) => {
      appendDebugEvent("debug.clear", "Backend debug clear failed", "error", { error: error instanceof Error ? error.message : String(error) });
    });
  }, [appendDebugEvent]);







  const handleSave = useCallback(async () => {
    if (!latestAtlasRef.current) return;
    setStatus("Saving atlas...");
    await saveCurrentAtlas("manual");
  }, [saveCurrentAtlas]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!latestAtlasRef.current) return;
      setIsExporting(format);
      setStatus(`Saving atlas before ${format} export...`);
      try {
        let saved = await saveCurrentAtlas("export");
        while (saved && (isSavingRef.current || dirtyVersionRef.current > savedVersionRef.current)) {
          saved = await saveCurrentAtlas("export");
        }
        if (!saved) throw new Error("Unable to save atlas before export.");
        setStatus(`Exporting ${format}...`);
        const result = await generateExport(format);
        setExportResults((current) => ({ ...current, [format]: result }));
        downloadExport(format);
        setStatus(`Exported ${result.filename}`);
        appendDebugEvent("export.generate", "Export generated", "info", { format, filename: result.filename });
      } catch (error) {
        console.error(error);
        setStatus(`Export ${format} failed`);
        appendDebugEvent("export.generate", "Export failed", "error", { format, error: error instanceof Error ? error.message : String(error) });
      } finally {
        setIsExporting(null);
      }
    },
    [appendDebugEvent, saveCurrentAtlas]
  );

  const handleToolbarExport = useCallback(
    async (format: ExportFormat) => {
      setExportMenuOpen(false);
      await handleExport(format);
    },
    [handleExport]
  );

  const handleImportAtlas = useCallback(
    async (file: File) => {
      setStatus("Validating import...");
      try {
        const parsed = await readAtlasFile(file);
        const preview = await previewAtlasImport(parsed);
        if (!preview.valid) {
          const details = preview.errors.length ? `\n\n${preview.errors.slice(0, 8).join("\n")}` : "";
          setStatus("Import validation failed");
          appendDebugEvent("atlas.import.preview", "Atlas import preview failed", "warning", { filename: file.name, errors: preview.errors.length });
          window.alert(`This atlas file is not valid and was not imported.${details}`);
          return;
        }

        const warningText = preview.warnings.length ? `\n\nWarnings:\n${preview.warnings.join("\n")}` : "";
        const confirmed = window.confirm(
          `Replace the current atlas with this validated JSON file?\n\nTiles: ${preview.tiles}\nRelationships: ${preview.links}\nLayers: ${preview.views}\nFamilies: ${preview.families}${warningText}`
        );
        if (!confirmed) {
          setStatus("Import canceled");
          appendDebugEvent("atlas.import.cancel", "Atlas import canceled after preview", "info", { filename: file.name, ...preview });
          return;
        }

        setStatus("Importing atlas...");
        clearAutosaveTimer();
        queuedSaveRef.current = false;
        while (currentSavePromiseRef.current) {
          await currentSavePromiseRef.current;
        }
        const imported = await saveAtlas(parsed);
        setCleanAtlas(imported, new Date());
        const nextView = imported.views.find((view) => view.id === "everything") ?? imported.views[0];
        if (nextView) {
          setActiveViewId(nextView.id);
        }
        setSelection(null);
        setStatus("Atlas imported");
        appendDebugEvent("atlas.import", "Atlas imported", "info", { filename: file.name, ...atlasSummary(imported), warnings: preview.warnings.length });
      } catch (error) {
        console.error(error);
        setStatus("Import failed");
        appendDebugEvent("atlas.import", "Atlas import failed", "error", { filename: file.name, error: error instanceof Error ? error.message : String(error) });
        window.alert(error instanceof Error ? error.message : "Import failed");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [appendDebugEvent, clearAutosaveTimer, setCleanAtlas]
  );

  const handleDownloadAtlasJson = useCallback(() => {
    if (!atlas) return;
    downloadAtlasJson(atlas);
    setStatus("atlas.json downloaded");
    appendDebugEvent("atlas.download", "atlas.json downloaded", "info", atlasSummary(atlas));
  }, [appendDebugEvent, atlas]);

  const handleCreateTile = useCallback(
    (type: TileType, position?: { x: number; y: number }, parentId?: string) => {
      if (!atlas) return;
      const title = nextGeneratedTileTitle(type, atlas.tiles);
      const tileId = createId(type, title, atlas.tiles.map((tile) => tile.id));
      const parentTile = parentId ? atlas.tiles.find((tile) => tile.id === parentId) : null;
      const tile: Tile = {
        id: tileId,
        type,
        title,
        parent: parentId ?? null,
        position: parentTile
          ? { x: parentTile.position.x + 280, y: parentTile.position.y + 120 }
          : position ?? { x: 180 + atlas.tiles.length * 24, y: 160 + atlas.tiles.length * 18 },
        size: { width: 240, height: 132 },
        fields: { ...DEFAULT_FIELDS[type] },
        lifecycle: appMode === "planning" ? "planned" : "live",
        notes: "",
        tags: []
      };
      const containsLink: Link | null = parentId
        ? {
          id: createId("link_contains", `${parentId}_${tileId}`, atlas.links.map((link) => link.id)),
          from: parentId,
          to: tileId,
          type: "contains",
          from_port: "child",
          to_port: "parent",
          lifecycle: appMode === "planning" ? "planned" : "live",
          label: "contains",
          notes: "",
          directional: true
        }
        : null;
      updateAtlas((current) => ({
        ...current,
        tiles: [...current.tiles, tile],
        links: containsLink ? [...current.links, containsLink] : current.links
      }));
      setSelection({ kind: "tile", id: tileId });
      setStatus(parentId ? "Subtile created" : "Tile created");
      appendDebugEvent(parentId ? "tile.create_subtile" : "tile.create", parentId ? "Subtile created" : "Tile created", "info", { type, parent: parentId ?? null, lifecycle: tile.lifecycle });
    },
    [appendDebugEvent, appMode, atlas, updateAtlas]
  );

  const getViewportCenterPosition = useCallback(() => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return undefined;
    return screenToFlowPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2
    });
  }, [screenToFlowPosition]);

  const handleCreateFamily = useCallback((positionOverride?: { x: number; y: number }) => {
    if (!atlas) return;
    const title = window.prompt("Family title", "New Family");
    if (!title) return;
    const position = positionOverride ?? getViewportCenterPosition() ?? { x: 160 + (atlas.families ?? []).length * 28, y: 140 + (atlas.families ?? []).length * 28 };
    const family: Family = {
      id: createId("family", title, (atlas.families ?? []).map((candidate) => candidate.id)),
      title,
      description: "",
      member_tile_ids: [],
      position: {
        x: Math.round(position.x - 180),
        y: Math.round(position.y - 120)
      },
      size: { width: 360, height: 240 },
      order: ((atlas.families ?? []).reduce((maxOrder, candidate) => Math.max(maxOrder, candidate.order), -1) ?? -1) + 1,
      color: "#2a94f2",
      tag: ""
    };
    updateAtlas((current) => ({
      ...current,
      families: [...(current.families ?? []), family]
    }));
    setSelection({ kind: "family", id: family.id });
    setStatus("Family created");
    appendDebugEvent("family.create", "Family created", "info", { family_id: family.id });
  }, [appendDebugEvent, atlas, getViewportCenterPosition, updateAtlas]);

  const handleFamilyPaletteClick = useCallback(() => {
    if (Date.now() - lastPaletteDragAt.current < 250) return;
    handleCreateFamily();
  }, [handleCreateFamily]);

  const handlePaletteClick = useCallback(
    (type: TileType) => {
      if (Date.now() - lastPaletteDragAt.current < 250) return;
      handleCreateTile(type, getViewportCenterPosition());
    },
    [getViewportCenterPosition, handleCreateTile]
  );

  const handlePaletteDragStart = useCallback((event: DragEvent<HTMLButtonElement>, type: TileType) => {
    if (!isInteractive) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(TILE_DRAG_MIME, type);
    event.dataTransfer.effectAllowed = "copy";
  }, [isInteractive]);

  const handleFamilyPaletteDragStart = useCallback((event: DragEvent<HTMLButtonElement>) => {
    if (!isInteractive) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(FAMILY_DRAG_MIME, "family");
    event.dataTransfer.effectAllowed = "copy";
  }, [isInteractive]);

  const handlePaletteDragEnd = useCallback(() => {
    lastPaletteDragAt.current = Date.now();
  }, []);

  const handleCanvasDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isInteractive) return;
    const dragTypes = Array.from(event.dataTransfer.types);
    if (!dragTypes.includes(TILE_DRAG_MIME) && !dragTypes.includes(FAMILY_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, [isInteractive]);

  const handleCanvasDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      const dragTypes = Array.from(event.dataTransfer.types);
      if (dragTypes.includes(FAMILY_DRAG_MIME)) {
        event.preventDefault();
        if (!isInteractive) {
          setStatus("Interactivity locked");
          appendDebugEvent("canvas.locked_drop", "Family drop blocked while interactivity is locked", "warning", getCanvasDebugContext({ type: "family" }));
          return;
        }
        handleCreateFamily(
          screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
          })
        );
        return;
      }
      const type = event.dataTransfer.getData(TILE_DRAG_MIME) as TileType;
      if (!TILE_TYPES.includes(type)) return;
      event.preventDefault();
      if (!isInteractive) {
        setStatus("Interactivity locked");
        appendDebugEvent("canvas.locked_drop", "Tile drop blocked while interactivity is locked", "warning", getCanvasDebugContext({ type }));
        return;
      }
      handleCreateTile(
        type,
        screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        })
      );
    },
    [appendDebugEvent, getCanvasDebugContext, handleCreateFamily, handleCreateTile, isInteractive, screenToFlowPosition]
  );

  const handleAddSubtile = useCallback(
    (parentId: string) => {
      const type = chooseTileType("service");
      if (!type) return;
      handleCreateTile(type, undefined, parentId);
    },
    [handleCreateTile]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!isInteractive) {
        setStatus("Interactivity locked");
        appendDebugEvent("canvas.locked_connect", "Relationship creation blocked while interactivity is locked", "warning", getCanvasDebugContext());
        return;
      }
      if (!atlas || !connection.source || !connection.target) return;
      const sourceTile = atlas.tiles.find((tile) => tile.id === connection.source);
      const targetTile = atlas.tiles.find((tile) => tile.id === connection.target);
      if (!sourceTile || !targetTile) return;
      if (!canConnectTiles(sourceTile, targetTile, appMode)) {
        setStatus(appMode === "planning" ? "Connect from planned work only" : "Planned items are locked in Live View");
        appendDebugEvent("canvas.blocked_connect", "Relationship creation blocked by lifecycle mode", "warning", getCanvasDebugContext({ source: sourceTile.id, target: targetTile.id, mode: appMode }));
        return;
      }
      const fromPort = asSourcePort(connection.sourceHandle);
      const toPort = asTargetPort(connection.targetHandle);
      const type = chooseLinkType(defaultLinkType(sourceTile, targetTile, fromPort, toPort));
      if (!type) return;
      if (type === "contains" && (fromPort !== "child" || toPort !== "parent")) {
        window.alert("Use the bottom parent/child handle path for contains relationships.");
        return;
      }
      const label = window.prompt("Relationship label", type.replace(/_/g, " ")) ?? type;
      const link: Link = {
        id: createId("link", `${connection.source}_${connection.target}_${type}`, atlas.links.map((candidate) => candidate.id)),
        from: connection.source,
        to: connection.target,
        type,
        from_port: fromPort,
        to_port: toPort,
        lifecycle: appMode === "planning" ? "planned" : "live",
        label,
        notes: "",
        directional: true
      };
      updateAtlas((current) => ({ ...current, links: [...current.links, link] }));
      setSelection({ kind: "link", id: link.id });
      setStatus("Relationship created");
      appendDebugEvent("link.create", "Relationship created", "info", { type, from: connection.source, to: connection.target, from_port: fromPort, to_port: toPort, lifecycle: link.lifecycle });
    },
    [appendDebugEvent, appMode, atlas, getCanvasDebugContext, isInteractive, updateAtlas]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!isInteractive) return;
      setFlowNodes((current) => applyNodeChanges(changes.filter((change) => isEditableNodeChange(change, current, appMode)), current));
    },
    [appMode, isInteractive]
  );

  const handleNodeDragStart = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node, draggedNodes: Node[]) => {
      if (!isInteractive) return;
      if (!draggedNodes.some((draggedNode) => draggedNode.type === "familyNode" || isLifecycleEditable(resolveLifecycle(draggedNode.data?.tile as Tile | undefined), appMode))) return;
      isNodeDragging.current = true;
      setNodeDragInProgress(true);
      appendDebugEvent("canvas.node_drag_start", "Canvas node drag started", "info", getCanvasDebugContext({ node_id: node.id, node_type: node.type, dragged_count: draggedNodes.length }));
    },
    [appendDebugEvent, appMode, getCanvasDebugContext, isInteractive]
  );

  const handleNodeDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node, draggedNodes: Node[]) => {
      if (!isInteractive) {
        isNodeDragging.current = false;
        setNodeDragInProgress(false);
        setFlowNodes(derivedNodes);
        return;
      }
      isNodeDragging.current = false;
      setNodeDragInProgress(false);
      const tilePositionsById = new Map(
        draggedNodes
          .filter((draggedNode) => draggedNode.type !== "familyNode" && isLifecycleEditable(resolveLifecycle(draggedNode.data?.tile as Tile | undefined), appMode))
          .map((draggedNode) => [draggedNode.id, draggedNode.position])
      );
      const familyPositionsById = new Map(
        draggedNodes
          .filter((draggedNode) => draggedNode.type === "familyNode")
          .map((draggedNode) => [(draggedNode.data?.family as Family | undefined)?.id, draggedNode.position])
          .filter((entry): entry is [string, { x: number; y: number }] => Boolean(entry[0]))
      );
      if (!tilePositionsById.size && !familyPositionsById.size) {
        setFlowNodes(derivedNodes);
        return;
      }
      updateAtlas((current) => ({
        ...current,
        tiles: current.tiles.map((tile) => {
          const position = tilePositionsById.get(tile.id);
          return position ? { ...tile, position } : tile;
        }),
        families: (current.families ?? []).map((family) => {
          const position = familyPositionsById.get(family.id);
          return position ? { ...family, position } : family;
        })
      }));
      appendDebugEvent(
        "canvas.node_drag_stop",
        "Canvas node drag stopped",
        "info",
        getCanvasDebugContext({
          node_id: node.id,
          node_type: node.type,
          dragged_count: draggedNodes.length,
          position_x: Math.round(node.position.x),
          position_y: Math.round(node.position.y)
        })
      );
    },
    [appendDebugEvent, appMode, derivedNodes, getCanvasDebugContext, isInteractive, updateAtlas]
  );

  const handleCanvasDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest(".react-flow__pane, .react-flow__renderer")) return;
      if (target.closest(".react-flow__node, .react-flow__edge, .react-flow__controls, .react-flow__minimap, button, input, textarea, select")) return;
      void fitView(FIT_VIEW_OPTIONS);
      appendDebugEvent("canvas.fit_view", "Blank canvas double-click fit view", "info", getCanvasDebugContext({ trigger: "double_click" }));
    },
    [appendDebugEvent, fitView, getCanvasDebugContext]
  );

  const handleInteractiveChange = useCallback(
    (interactiveStatus: boolean) => {
      setIsInteractive(interactiveStatus);
      isNodeDragging.current = false;
      if (!interactiveStatus) {
        setFlowNodes(derivedNodes);
      }
      appendDebugEvent("canvas.interactivity", interactiveStatus ? "Canvas interactivity unlocked" : "Canvas interactivity locked", "info", getCanvasDebugContext({ interactive: interactiveStatus }));
    },
    [appendDebugEvent, derivedNodes, getCanvasDebugContext]
  );

  const handleReactFlowError = useCallback(
    (id: string, message: string) => {
      appendDebugEvent("reactflow.error", "React Flow error", "error", getCanvasDebugContext({ error_id: id, error: message }));
    },
    [appendDebugEvent, getCanvasDebugContext]
  );

  const handleNodeContextMenu = useCallback(
    (event: ReactMouseEvent, node: Node) => {
      if (!atlas) return;
      event.preventDefault();
      const tile = atlas.tiles.find((candidate) => candidate.id === node.id);
      if (!tile) return;
      const stack = stackState.stackByRepresentative.get(tile.id);
      setSelection(stack ? { kind: "stack", id: stack.id } : { kind: "tile", id: tile.id });
      setStackContextMenu({
        x: event.clientX,
        y: event.clientY,
        tileId: tile.id,
        stackId: stack?.id,
        canStack: canStackSiblingTiles(tile, atlas.tiles),
        canStackMountChildren: canStackMountChildren(tile, atlas.tiles),
        tileType: tile.type
      });
    },
    [atlas, stackState.stackByRepresentative]
  );


  const handleUpdateTile = useCallback(
    (tile: Tile) => {
      if (!isLifecycleEditable(resolveLifecycle(tile), appMode)) {
        setStatus("Selection is read-only in this mode");
        return;
      }
      updateAtlas((current) => {
        const previous = current.tiles.find((candidate) => candidate.id === tile.id);
        let links = current.links;
        if (previous && previous.parent !== tile.parent) {
          links = links.filter((link) => !(link.type === "contains" && link.to === tile.id));
          if (tile.parent) {
            links = [
              ...links,
              {
                id: createId("link_contains", `${tile.parent}_${tile.id}`, links.map((link) => link.id)),
                from: tile.parent,
                to: tile.id,
                type: "contains",
                from_port: "child",
                to_port: "parent",
                lifecycle: resolveLifecycle(tile),
                label: "contains",
                notes: "",
                directional: true
              }
            ];
          }
        }
        return {
          ...current,
          tiles: current.tiles.map((candidate) => (candidate.id === tile.id ? tile : candidate)),
          links
        };
      });
      setStatus("Tile updated");
      appendDebugEvent("tile.update", "Tile updated", "info", { id: tile.id, type: tile.type });
    },
    [appendDebugEvent, appMode, updateAtlas]
  );

  const handleUpdateFamily = useCallback(
    (family: Family) => {
      updateAtlas((current) => ({
        ...current,
        families: (current.families ?? []).map((candidate) => (candidate.id === family.id ? family : candidate))
      }));
      setStatus("Family updated");
      appendDebugEvent("family.update", "Family updated", "info", { family_id: family.id });
    },
    [appendDebugEvent, updateAtlas]
  );

  const handleDeleteFamily = useCallback(
    (familyId: string) => {
      if (!window.confirm("Delete this Family? Member tiles will not be deleted.")) return;
      updateAtlas((current) => ({
        ...current,
        families: (current.families ?? []).filter((family) => family.id !== familyId)
      }));
      setSelection(null);
      setStatus("Family deleted");
      appendDebugEvent("family.delete", "Family deleted", "warning", { family_id: familyId });
    },
    [appendDebugEvent, updateAtlas]
  );


  const handleToggleTileFamily = useCallback(
    (tileId: string, familyId: string, included: boolean) => {
      updateAtlas((current) => ({
        ...current,
        families: (current.families ?? []).map((family) => {
          const currentMembers = family.member_tile_ids.filter((memberId, index, allIds) => allIds.indexOf(memberId) === index);
          const memberSet = new Set(currentMembers);
          const closure = getFamilyTreeClosure(tileId, current.tiles);
          if (family.id === familyId && included) {
            for (const memberId of closure) memberSet.add(memberId);
          } else if (family.id === familyId && !included) {
            for (const memberId of closure) memberSet.delete(memberId);
          } else if (included) {
            for (const memberId of closure) memberSet.delete(memberId);
          }
          return { ...family, member_tile_ids: Array.from(memberSet) };
        })
      }));
      setStatus(included ? "Tile added to Family" : "Tile removed from Family");
      appendDebugEvent("family.membership", included ? "Tile added to Family" : "Tile removed from Family", "info", { family_id: familyId, tile_id: tileId });
    },
    [appendDebugEvent, updateAtlas]
  );

  const handleDeleteTile = useCallback(
    (tileId: string) => {
      const tile = atlas?.tiles.find((candidate) => candidate.id === tileId);
      if (tile && !isLifecycleEditable(resolveLifecycle(tile), appMode)) {
        setStatus("Selection is read-only in this mode");
        return;
      }
      if (!window.confirm("Delete this tile and its relationships?")) return;
      updateAtlas((current) => ({
        ...current,
        tiles: current.tiles.filter((tile) => tile.id !== tileId).map((tile) => (tile.parent === tileId ? { ...tile, parent: null } : tile)),
        links: current.links.filter((link) => link.from !== tileId && link.to !== tileId),
        families: (current.families ?? []).map((family) => ({
          ...family,
          member_tile_ids: family.member_tile_ids.filter((memberId) => memberId !== tileId)
        }))
      }));
      setSelection(null);
      setStatus("Tile deleted");
      appendDebugEvent("tile.delete", "Tile deleted", "warning", { id: tileId });
    },
    [appendDebugEvent, appMode, atlas, updateAtlas]
  );

  const handleDuplicateTile = useCallback(
    (tileId: string) => {
      if (!atlas) return;
      const source = atlas.tiles.find((tile) => tile.id === tileId);
      if (!source) return;
      if (!isLifecycleEditable(resolveLifecycle(source), appMode)) {
        setStatus("Selection is read-only in this mode");
        return;
      }
      const title = `${source.title} Copy`;
      const duplicateId = createId(source.type, title, atlas.tiles.map((tile) => tile.id));
      const duplicate: Tile = {
        ...source,
        id: duplicateId,
        title,
        position: {
          x: source.position.x + 36,
          y: source.position.y + 36
        },
        fields: cloneFields(source.fields),
        lifecycle: appMode === "planning" ? "planned" : resolveLifecycle(source),
        tags: [...(source.tags ?? [])],
        notes: source.notes ?? ""
      };
      updateAtlas((current) => ({
        ...current,
        tiles: [...current.tiles, duplicate]
      }));
      setSelection({ kind: "tile", id: duplicateId });
      setStatus("Tile duplicated");
      appendDebugEvent("tile.duplicate", "Tile duplicated", "info", { source: tileId, duplicate: duplicateId, type: source.type });
    },
    [appendDebugEvent, appMode, atlas, updateAtlas]
  );

  const handleUpdateLink = useCallback(
    (link: Link) => {
      if (!isLifecycleEditable(resolveLifecycle(link), appMode)) {
        setStatus("Selection is read-only in this mode");
        return;
      }
      updateAtlas((current) => ({
        ...current,
        links: current.links.map((candidate) => (candidate.id === link.id ? link : candidate))
      }));
      setStatus("Relationship updated");
      appendDebugEvent("link.update", "Relationship updated", "info", { id: link.id, type: link.type });
    },
    [appendDebugEvent, appMode, updateAtlas]
  );

  const handleDeleteLink = useCallback(
    (linkId: string) => {
      const link = atlas?.links.find((candidate) => candidate.id === linkId);
      if (link && !isLifecycleEditable(resolveLifecycle(link), appMode)) {
        setStatus("Selection is read-only in this mode");
        return;
      }
      updateAtlas((current) => ({ ...current, links: current.links.filter((link) => link.id !== linkId) }));
      setSelection(null);
      setStatus("Relationship deleted");
      appendDebugEvent("link.delete", "Relationship deleted", "warning", { id: linkId });
    },
    [appendDebugEvent, appMode, atlas, updateAtlas]
  );

  const handleStackSiblings = useCallback(
    (tileId: string) => {
      if (!atlas) return;
      const source = atlas.tiles.find((tile) => tile.id === tileId);
      if (!source?.parent) return;
      const members = atlas.tiles.filter((tile) => tile.parent === source.parent && tile.type === source.type);
      if (members.length < 2) return;
      const parent = atlas.tiles.find((tile) => tile.id === source.parent);
      const representative = parent ? closestTileToParent(members, parent) : source;
      const stack: TileStack = {
        id: createId("stack", `${source.parent}_${source.type}`, (atlas.stacks ?? []).map((candidate) => candidate.id)),
        parent_id: source.parent,
        tile_type: source.type,
        member_ids: members.map((member) => member.id),
        representative_id: representative.id,
        name: defaultStackName(members.length, source.type),
        name_is_custom: false
      };
      updateAtlas((current) => {
        const existing = (current.stacks ?? []).filter((candidate) => !(candidate.parent_id === stack.parent_id && candidate.tile_type === stack.tile_type));
        return { ...current, stacks: [...existing, stack] };
      });
      setSelection({ kind: "stack", id: stack.id });
      setStatus(`Stacked ${members.length} ${TILE_TYPE_CONFIG[source.type].label} tiles`);
      setStackContextMenu(null);
      appendDebugEvent("stack.create", "Sibling tiles stacked", "info", { stack_id: stack.id, parent_id: stack.parent_id, tile_type: stack.tile_type, members: stack.member_ids.length });
    },
    [appendDebugEvent, atlas, updateAtlas]
  );

  const handleStackMountChildren = useCallback(
    (mountTileId: string) => {
      if (!atlas) return;
      const mountTile = atlas.tiles.find((tile) => tile.id === mountTileId);
      if (!mountTile || mountTile.type !== "mount") return;
      const members = atlas.tiles.filter((tile) => tile.parent === mountTile.id);
      if (members.length < 2) return;
      const stack: TileStack = {
        id: createId("stack_mount", mountTile.title, (atlas.stacks ?? []).map((candidate) => candidate.id)),
        stack_kind: "mount_children",
        parent_id: mountTile.id,
        tile_type: "mount",
        member_ids: members.map((member) => member.id),
        representative_id: mountTile.id,
        name: defaultMountStackName(members.length),
        name_is_custom: false
      };
      updateAtlas((current) => {
        const existing = (current.stacks ?? []).filter((candidate) => !(candidate.stack_kind === "mount_children" && candidate.parent_id === mountTile.id));
        return { ...current, stacks: [...existing, stack] };
      });
      setSelection({ kind: "stack", id: stack.id });
      setStatus(`Stacked ${members.length} mounted items`);
      setStackContextMenu(null);
      appendDebugEvent("stack.mount_children.create", "Mounted child tiles stacked", "info", { stack_id: stack.id, mount_id: mountTile.id, members: stack.member_ids.length });
    },
    [appendDebugEvent, atlas, updateAtlas]
  );

  const handleUpdateStack = useCallback(
    (stack: TileStack) => {
      updateAtlas((current) => ({
        ...current,
        stacks: (current.stacks ?? []).map((candidate) => (candidate.id === stack.id ? stack : candidate))
      }));
      setStatus("Stack updated");
      appendDebugEvent("stack.update", "Stack updated", "info", { stack_id: stack.id });
    },
    [appendDebugEvent, updateAtlas]
  );

  const handleUnstack = useCallback(
    (stackId: string) => {
      updateAtlas((current) => ({
        ...current,
        stacks: (current.stacks ?? []).filter((stack) => stack.id !== stackId)
      }));
      setSelection(null);
      setStackContextMenu(null);
      setStatus("Stack removed");
      appendDebugEvent("stack.delete", "Stack removed", "info", { stack_id: stackId });
    },
    [appendDebugEvent, updateAtlas]
  );

  const handlePromoteTile = useCallback(
    (tileId: string) => {
      updateAtlas((current) => {
        const liveAfterPromotion = new Set(current.tiles.filter((tile) => resolveLifecycle(tile) === "live" || tile.id === tileId).map((tile) => tile.id));
        return {
          ...current,
          tiles: current.tiles.map((tile) => (tile.id === tileId ? { ...tile, lifecycle: "live" as Lifecycle } : tile)),
          links: current.links.map((link) =>
            resolveLifecycle(link) === "planned" && (link.from === tileId || link.to === tileId) && liveAfterPromotion.has(link.from) && liveAfterPromotion.has(link.to)
              ? { ...link, lifecycle: "live" as Lifecycle }
              : link
          )
        };
      });
      setStatus("Planned tile promoted to live");
      appendDebugEvent("planning.promote_tile", "Planned tile promoted to live", "info", { tile_id: tileId });
    },
    [appendDebugEvent, updateAtlas]
  );

  const handlePromoteLink = useCallback(
    (linkId: string) => {
      if (!atlas) return;
      const link = atlas.links.find((candidate) => candidate.id === linkId);
      if (!link) return;
      const source = atlas.tiles.find((tile) => tile.id === link.from);
      const target = atlas.tiles.find((tile) => tile.id === link.to);
      if (resolveLifecycle(source) !== "live" || resolveLifecycle(target) !== "live") {
        setStatus("Promote endpoint tiles before promoting this relationship");
        return;
      }
      updateAtlas((current) => ({
        ...current,
        links: current.links.map((candidate) => (candidate.id === linkId ? { ...candidate, lifecycle: "live" as Lifecycle } : candidate))
      }));
      setStatus("Planned relationship promoted to live");
      appendDebugEvent("planning.promote_link", "Planned relationship promoted to live", "info", { link_id: linkId });
    },
    [appendDebugEvent, atlas, updateAtlas]
  );

  const handleSelectView = useCallback(
    (view: View) => {
      setActiveViewId(view.id);
      setSelection(null);
      setStatus(`Layer: ${view.title}`);
      appendDebugEvent("view.select", "Layer selected", "info", { id: view.id, title: view.title });
    },
    [appendDebugEvent]
  );




  const handleCreateView = useCallback(() => {
    if (!atlas) return;
    const title = window.prompt("Layer title");
    if (!title) return;
    const sourceView = activeView;
    const view: View = {
      id: createId("view", title, atlas.views.map((candidate) => candidate.id)),
      title,
      description: "",
      visible_types: sourceView ? [...sourceView.visible_types] : [],
      visible_links: sourceView ? [...sourceView.visible_links] : [],
      camera: { x: 0, y: 0, zoom: 1 }
    };
    updateAtlas((current) => ({ ...current, views: [...current.views, view] }));
    setActiveViewId(view.id);
    setStatus(`Created layer: ${view.title}`);
    appendDebugEvent("view.create", "Layer created", "info", { id: view.id, title: view.title });
  }, [activeView, appendDebugEvent, atlas, updateAtlas]);

  const handleEditView = useCallback(() => {
    if (!activeView) return;
    const title = window.prompt("Layer title", activeView.title);
    if (!title) return;
    const description = window.prompt("Layer description", activeView.description) ?? activeView.description;
    updateAtlas((current) => ({
      ...current,
      views: current.views.map((view) => (view.id === activeView.id ? { ...view, title, description } : view))
    }));
    setStatus(`Updated layer: ${title}`);
    appendDebugEvent("view.update", "Layer updated", "info", { id: activeView.id, title });
  }, [activeView, appendDebugEvent, updateAtlas]);

  const handleDeleteView = useCallback(() => {
    if (!atlas || !activeView) return;
    if (atlas.views.length <= 1) {
      window.alert("At least one layer is required.");
      return;
    }
    if (!window.confirm(`Delete layer "${activeView.title}"?`)) return;
    const remainingViews = atlas.views.filter((view) => view.id !== activeView.id);
    const nextView = remainingViews.find((view) => view.id === "everything") ?? remainingViews[0];
    updateAtlas((current) => ({ ...current, views: current.views.filter((view) => view.id !== activeView.id) }));
    setActiveViewId(nextView.id);
    setSelection(null);
    setStatus(`Deleted layer: ${activeView.title}`);
    appendDebugEvent("view.delete", "Layer deleted", "warning", { id: activeView.id, title: activeView.title });
  }, [activeView, appendDebugEvent, atlas, updateAtlas]);

  const handleToggleViewTileType = useCallback(
    (type: TileType) => {
      if (!activeView) return;
      updateAtlas((current) => ({
        ...current,
        views: current.views.map((view) =>
          view.id === activeView.id
            ? {
              ...view,
              visible_types: toggleViewSelection(view.visible_types, TILE_TYPES, type)
            }
            : view
        )
      }));
    },
    [activeView, updateAtlas]
  );

  const handleToggleViewLinkType = useCallback(
    (type: LinkType) => {
      if (!activeView) return;
      updateAtlas((current) => ({
        ...current,
        views: current.views.map((view) =>
          view.id === activeView.id
            ? {
              ...view,
              visible_links: toggleViewSelection(view.visible_links, LINK_TYPES, type)
            }
            : view
        )
      }));
    },
    [activeView, updateAtlas]
  );

  const handleLoadDemo = useCallback(async () => {
    if (!window.confirm("Replace the current atlas with the owner-supplied runtime demo? Download your current atlas JSON first if you may want to restore it.")) return;
    setResetMenuOpen(false);
    setStatus("Loading demo...");
    try {
      const demo = withAtlasDefaults(await loadDemoAtlas());
      commitDirtyAtlas(sanitizeAtlas(demo));
      const nextView = demo.views.find((view) => view.id === "everything") ?? demo.views[0];
      if (nextView) setActiveViewId(nextView.id);
      setSelection(null);
      setStackContextMenu(null);
      setStatus("Demo loaded");
      appendDebugEvent("demo.load", "Runtime demo loaded", "info", atlasSummary(demo));
    } catch (error) {
      const message = errorToMessage(error);
      setStatus(message);
      appendDebugEvent("demo.load", "Runtime demo load failed", "warning", { error: message });
      window.alert(message);
    }
  }, [appendDebugEvent, commitDirtyAtlas]);

  const handleWipeCanvas = useCallback(() => {
    const snapshot = latestAtlasRef.current;
    if (!snapshot) return;
    const tileCount = snapshot.tiles.length;
    const linkCount = snapshot.links.length;
    const familyCount = snapshot.families?.length ?? 0;
    const confirmed = window.confirm(
      `Wipe the current canvas?\n\nThis will delete ${tileCount} tiles, ${linkCount} connections, and ${familyCount} Families. This cannot be undone unless you have downloaded a backup atlas JSON.`
    );
    if (!confirmed) return;

    const nextAtlas: Atlas = {
      ...snapshot,
      tiles: [],
      links: [],
      families: [],
      stacks: []
    };
    commitDirtyAtlas(nextAtlas);
    setResetMenuOpen(false);
    setSelection(null);
    setStackContextMenu(null);
    setStatus("Canvas wiped");
    appendDebugEvent("canvas.wipe", "Canvas wiped", "warning", { tiles: tileCount, links: linkCount, families: familyCount });
  }, [appendDebugEvent, commitDirtyAtlas]);

  useEffect(() => {
    if (!exportMenuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof globalThis.Node && exportMenuRef.current?.contains(event.target)) return;
      setExportMenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [exportMenuOpen]);

  useEffect(() => {
    if (!resetMenuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof globalThis.Node && resetMenuRef.current?.contains(event.target)) return;
      setResetMenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [resetMenuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        if (selection?.kind === "tile") {
          event.preventDefault();
          handleDuplicateTile(selection.id);
        }
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selection?.kind === "tile") {
          event.preventDefault();
          handleDeleteTile(selection.id);
        } else if (selection?.kind === "link") {
          event.preventDefault();
          handleDeleteLink(selection.id);
        }
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (event.key === "Escape") {
        setExportMenuOpen(false);
        setSelection(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteLink, handleDeleteTile, handleDuplicateTile, handleSave, selection]);

  const brokenLinkCount = atlas
    ? atlas.links.filter((link) => !atlas.tiles.some((tile) => tile.id === link.from) || !atlas.tiles.some((tile) => tile.id === link.to)).length
    : 0;
  const warnings = useMemo(() => (atlas ? validateAtlasWarnings(atlas) : []), [atlas]);

  useEffect(() => {
    if (!atlas) return;
    if (lastWarningCount.current === warnings.length) return;
    lastWarningCount.current = warnings.length;
    appendDebugEvent("validation.warnings", "Validation warning count changed", warnings.length ? "warning" : "info", { warnings: warnings.length });
  }, [appendDebugEvent, atlas, warnings.length]);

  useEffect(() => {
    if (!atlas) return;
    const previousCount = lastVisibleTileCount.current;
    lastVisibleTileCount.current = visibleTiles.length;
    if (previousCount !== null && previousCount > 0 && visibleTiles.length === 0) {
      appendDebugEvent("canvas.visible_tiles_zero", "Visible tile count dropped to zero", "warning", {
        ...getCanvasDebugContext(),
        ...atlasSummary(atlas)
      });
    }
  }, [appendDebugEvent, atlas, getCanvasDebugContext, visibleTiles.length]);

  const saveStatusText = useMemo(() => {
    if (lastSaveError) return "Save failed";
    if (isSaving) return "Autosaving...";
    if (isDirty) return "Unsaved changes";
    if (lastSavedAt) return `Saved at ${formatSaveTime(lastSavedAt)}`;
    return "Saved";
  }, [isDirty, isSaving, lastSaveError, lastSavedAt]);

  const saveStatusClass = lastSaveError ? "save-status save-status--error" : isDirty ? "save-status save-status--dirty" : "save-status";

  if (!atlas) {
    return (
      <div className="boot-screen">
        <Loader2 className="spin" size={36} />
        <span>{status}</span>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar
        appMode={appMode}
        exportMenuOpen={exportMenuOpen}
        exportMenuRef={exportMenuRef}
        fileInputRef={fileInputRef}
        isExporting={isExporting}
        isSaving={isSaving}
        resetMenuOpen={resetMenuOpen}
        resetMenuRef={resetMenuRef}
        saveStatusClass={saveStatusClass}
        saveStatusText={saveStatusText}
        searchInputRef={searchInputRef}
        settingsButtonRef={settingsButtonRef}
        searchTerm={searchTerm}
        settingsOpen={settingsOpen}
        onExportMenuToggle={() => setExportMenuOpen((open) => !open)}
        onFileSelected={(file) => void handleImportAtlas(file)}
        onLoadDemo={() => void handleLoadDemo()}
        onDownloadAtlasJson={handleDownloadAtlasJson}
        onResetMenuToggle={() => setResetMenuOpen((open) => !open)}
        onSave={() => void handleSave()}
        onSearchChange={setSearchTerm}
        onToggleAppMode={() => {
          const nextMode: AppMode = appMode === "planning" ? "live" : "planning";
          setAppMode(nextMode);
          setSelection(null);
          setStatus(nextMode === "planning" ? "Planning Mode" : "Live View");
          appendDebugEvent("planning.mode", nextMode === "planning" ? "Planning Mode enabled" : "Live View enabled", "info", { mode: nextMode });
        }}
        onToggleSettings={handleToggleSettings}
        onToolbarExport={(format) => void handleToolbarExport(format)}
        onWipeCanvas={handleWipeCanvas}
      />

      <main className="workspace">
        <LeftSidebar
          activeView={activeView}
          activeViewId={activeViewId}
          atlas={atlas}
          collapsedPaletteEntries={collapsedPaletteEntries}
          familyPaletteColor={FAMILY_PALETTE_COLOR}
          searchResults={searchResults}
          searchTerm={searchTerm}
          selection={selection}
          sidebarState={sidebarState}
          warnings={warnings}
          onCollapsedPaletteTouchEnd={handleCollapsedPaletteTouchEnd}
          onCollapsedPaletteTouchStart={handleCollapsedPaletteTouchStart}
          onCollapsedPaletteWheel={handleCollapsedPaletteWheel}
          onCreateView={handleCreateView}
          onCycleCollapsedPalette={cycleCollapsedPalette}
          onDeleteView={handleDeleteView}
          onEditView={handleEditView}
          onFamilyPaletteClick={handleFamilyPaletteClick}
          onFamilyPaletteDragStart={handleFamilyPaletteDragStart}
          onPaletteClick={handlePaletteClick}
          onPaletteDragEnd={handlePaletteDragEnd}
          onPaletteDragStart={handlePaletteDragStart}
          onSelectSearchResult={selectSearchResult}
          onSelectView={handleSelectView}
          onSelectWarningLink={(linkId) => setSelection({ kind: "link", id: linkId })}
          onSelectWarningTile={selectTileAndFocus}
          onToggleSidebarSection={toggleSidebarSection}
          onToggleViewLinkType={handleToggleViewLinkType}
          onToggleViewTileType={handleToggleViewTileType}
        />

        <CanvasFrame
          activeViewId={activeViewId}
          appMode={appMode}
          brokenLinkCount={brokenLinkCount}
          canvasRef={canvasRef}
          connectorRoutingMode={connectorRoutingMode}
          edges={edges}
          exportResults={exportResults}
          fitViewOptions={FIT_VIEW_OPTIONS}
          flowNodes={flowNodes}
          isInteractive={isInteractive}
          lifecycleCounts={lifecycleCounts}
          searchResultsCount={searchResults.length}
          searchTerm={searchTerm}
          stackContextMenu={stackContextMenu}
          status={status}
          viewBarOpen={viewBarOpen}
          views={atlas.views}
          visibleLinks={visibleLinks}
          visibleTiles={visibleTiles}
          warningsCount={warnings.length}
          onCanvasDoubleClick={handleCanvasDoubleClick}
          onCanvasDragOver={handleCanvasDragOver}
          onCanvasDrop={handleCanvasDrop}
          onConnect={handleConnect}
          onConnectorRoutingModeToggle={handleConnectorRoutingModeToggle}
          onEdgeClick={(edge) => setSelection({ kind: "link", id: edge.id })}
          onInteractiveChange={handleInteractiveChange}
          onNodeClick={(node) => {
            if (node.type === "familyNode") {
              const family = node.data?.family as Family | undefined;
              if (family) setSelection({ kind: "family", id: family.id });
              return;
            }
            selectTileAndFocus(node.id);
          }}
          onNodeContextMenu={handleNodeContextMenu}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={handleNodeDragStop}
          onNodesChange={handleNodesChange}
          onPaneClick={() => {
            setSelection(null);
            setStackContextMenu(null);
          }}
          onReactFlowError={handleReactFlowError}
          onSelectView={handleSelectView}
          onStackMountChildren={handleStackMountChildren}
          onStackSiblings={handleStackSiblings}
          onToggleViewBar={() => setViewBarOpen((open) => !open)}
          onUnstack={handleUnstack}
        />

        <Inspector
          atlas={atlas}
          mode={appMode}
          selection={selection}
          onUpdateTile={handleUpdateTile}
          onUpdateFamily={handleUpdateFamily}
          onUpdateStack={handleUpdateStack}
          onUnstack={handleUnstack}
          onDeleteTile={handleDeleteTile}
          onDeleteFamily={handleDeleteFamily}
          onDuplicateTile={handleDuplicateTile}
          onAddSubtile={handleAddSubtile}
          onToggleTileFamily={handleToggleTileFamily}
          onUpdateLink={handleUpdateLink}
          onDeleteLink={handleDeleteLink}
          onPromoteTile={handlePromoteTile}
          onPromoteLink={handlePromoteLink}
        />
      </main>

      {settingsOpen ? (
        <SettingsPanel
          atlas={atlas}
          activeView={activeView}
          appVersion={appVersion}
          backendHealth={backendHealth}
          debugEvents={debugEvents}
          onClearDebugLog={handleClearDebugLog}
          onClose={closeSettings}
          onExportDebugLog={handleExportDebugLog}
          onResetCanvasAppearance={() => {
            resetCanvasAppearance();
            setStatus("Canvas appearance reset to CYBER · HEX");
          }}
        />
      ) : null}
    </div>
  );
}

function chooseTileType(fallback: TileType): TileType | null {
  const value = window.prompt(`Tile type (${TILE_TYPES.join(", ")})`, fallback);
  if (!value) return null;
  return TILE_TYPES.includes(value as TileType) ? (value as TileType) : fallback;
}

function defaultSidebarState(): SidebarState {
  return {
    collapsed: {
      tilePalette: true,
      views: true,
      filters: true,
      relationships: true
    },
    paletteIndex: 0
  };
}

function getStoredSidebarState(): SidebarState {
  const fallback = defaultSidebarState();
  try {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<SidebarState>;
    return {
      collapsed: {
        ...fallback.collapsed,
        ...(parsed.collapsed ?? {})
      },
      paletteIndex: normalizePaletteIndex(Number(parsed.paletteIndex ?? fallback.paletteIndex))
    };
  } catch {
    return fallback;
  }
}

function storeSidebarState(state: SidebarState): void {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Local UI state is optional; storage failures should not block atlas editing.
  }
}


function getStoredConnectorRoutingMode(): ConnectorRoutingMode {
  try {
    const stored = window.localStorage.getItem(CONNECTOR_ROUTING_STORAGE_KEY);
    return stored === "avoid_tiles" ? "avoid_tiles" : "curved";
  } catch {
    return "curved";
  }
}

function storeConnectorRoutingMode(mode: ConnectorRoutingMode): void {
  try {
    window.localStorage.setItem(CONNECTOR_ROUTING_STORAGE_KEY, mode);
  } catch {
    // Local UI state is optional; storage failures should not block atlas editing.
  }
}

function normalizePaletteIndex(index: number): number {
  const count = PALETTE_ENTRIES.length;
  if (!Number.isFinite(index) || count === 0) return 0;
  return ((Math.trunc(index) % count) + count) % count;
}

function chooseLinkType(fallback: LinkType): LinkType | null {
  const value = window.prompt(`Relationship type (${LINK_TYPES.join(", ")})`, fallback);
  if (!value) return null;
  return LINK_TYPES.includes(value as LinkType) ? (value as LinkType) : fallback;
}

function defaultLinkType(
  sourceTile: Tile | undefined,
  targetTile: Tile | undefined,
  fromPort: LinkSourcePort | null,
  toPort: LinkTargetPort | null
): LinkType {
  if (fromPort === "child" && toPort === "parent") return "contains";
  if (sourceTile?.type === "check" || targetTile?.type === "check") return "validates_with";
  if (sourceTile?.type === "flow" && targetTile && ["check", "config", "secret_ref", "note"].includes(targetTile.type)) return "fails_if";
  if (sourceTile?.type === "flow" || targetTile?.type === "flow") return "calls";
  if (fromPort === "out" && toPort === "in") return "calls";
  return "depends_on";
}

function asSourcePort(value: string | null | undefined): LinkSourcePort {
  return value === "child" ? "child" : "out";
}

function asTargetPort(value: string | null | undefined): LinkTargetPort {
  return value === "parent" ? "parent" : "in";
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
}

function errorToMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function formatSaveTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default App;





