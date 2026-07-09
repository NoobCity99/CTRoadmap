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
import { HandbookView, type HandbookThemeMode } from "./components/HandbookView";
import { Inspector } from "./components/Inspector";
import { LeftSidebar, type CollapsedPaletteEntry, type PaletteEntry, type SidebarSectionId, type SidebarState } from "./components/LeftSidebar";
import { SettingsPanel } from "./components/SettingsPanel";
import { TopBar, type UpdateNoticeView } from "./components/TopBar";
import {
  clearBackendDebugLog,
  downloadAtlasJson,
  downloadExport,
  generateExport,
  loadAppVersion,
  loadAtlas,
  loadBackendDebugLog,
  loadHealth,
  loadUpdateAdvisory,
  previewAtlasImport,
  readAtlasFile,
  saveAtlas,
  saveUpdateSettings
} from "./lib/api";
import { DEFAULT_FIELDS, LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "./lib/constants";
import { atlasSummary, createFrontendDebugEvent, downloadDebugLog } from "./lib/debug";
import {
  activeTemplateForUi,
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
import { isEditableNodeChange, mapAtlasToEdges, mapAtlasToNodes } from "./lib/graphMapping";
import { createSeedAtlas } from "./lib/seed";
import {
  getAssociatedCanvasBackground,
  getStoredCanvasBackground,
  getStoredThemePalette,
  storeCanvasBackground,
  storeThemePalette
} from "./lib/theme";
import { validateAtlasWarnings } from "./lib/validation";
import { buildHandbookDocument, findHandbookVolumeForTile } from "./lib/handbook";
import type {
  Atlas,
  AppVersion,
  DebugEvent,
  Family,
  ExportFormat,
  ExportResult,
  AppMode,
  CanvasBackgroundId,
  LayoutTemplate,
  Lifecycle,
  Link,
  LinkSourcePort,
  LinkTargetPort,
  LinkType,
  Selection,
  ThemePaletteId,
  Tile,
  TileStack,
  TileType,
  UpdateAdvisory,
  UpdateSettings,
  View
} from "./types/atlas";

const TILE_DRAG_MIME = "application/ctroadmap-tile-type";
const FAMILY_DRAG_MIME = "application/ctroadmap-family";
const FAMILY_PALETTE_COLOR = "#38a3ff";
const FIT_VIEW_OPTIONS: FitViewOptions = { padding: 0.28, duration: 450 };
const UPDATE_NOTICE_PREFIX = "ctroadmap:update-notice:";
const UPDATE_NOTICE_SNOOZE_HOURS = 24;
const MANUAL_UPDATE_COMMAND = "cd ~/ctroadmap-beta && docker compose pull && docker compose up -d";
const SIDEBAR_STORAGE_KEY = "ctroadmap.sidebarSections";
const HANDBOOK_THEME_STORAGE_KEY = "ctroadmap.handbookThemeMode";
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
  const lastWarningCount = useRef<number | null>(null);
  const latestAtlasRef = useRef<Atlas | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
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
  const [updateAdvisory, setUpdateAdvisory] = useState<UpdateAdvisory | null>(null);
  const [updateNoticeRevision, setUpdateNoticeRevision] = useState(0);
  const [layoutTemplate, setLayoutTemplate] = useState<LayoutTemplate>("canvas_topology");
  const [selection, setSelection] = useState<Selection>(null);
  const [selectedHandbookVolumeId, setSelectedHandbookVolumeId] = useState<string | null>(null);
  const [handbookThemeMode, setHandbookThemeMode] = useState<HandbookThemeMode>(() => getStoredHandbookThemeMode());
  const [searchTerm, setSearchTerm] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [viewBarOpen, setViewBarOpen] = useState(true);
  const [appMode, setAppMode] = useState<AppMode>("live");
  const [sidebarState, setSidebarState] = useState<SidebarState>(() => getStoredSidebarState());
  const [stackContextMenu, setStackContextMenu] = useState<StackContextMenuView | null>(null);
  const [status, setStatus] = useState("Loading atlas...");
  const [themePaletteId, setThemePaletteId] = useState<ThemePaletteId>(() => getStoredThemePalette());
  const [canvasBackgroundId, setCanvasBackgroundId] = useState<CanvasBackgroundId>(() => getStoredCanvasBackground());
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [exportResults, setExportResults] = useState<Partial<Record<ExportFormat, ExportResult>>>({});
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [isInteractive, setIsInteractive] = useState(true);

  const appendDebugEvent = useCallback((action: string, message: string, severity: DebugEvent["severity"] = "info", context: Record<string, unknown> = {}) => {
    setDebugEvents((current) => [...current.slice(-299), createFrontendDebugEvent(action, message, severity, context)]);
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
        if (defaultView) {
          setActiveViewId(defaultView.id);
          setLayoutTemplate(activeTemplateForUi(defaultView.layout_template));
        }
        setStatus("Atlas loaded");
        appendDebugEvent("atlas.load", "Atlas loaded", "info", atlasSummary(nextAtlas));
      })
      .catch((error) => {
        console.error(error);
        setStatus("Unable to load atlas");
        appendDebugEvent("atlas.load", "Atlas load failed", "error", { error: error instanceof Error ? error.message : String(error) });
      });
  }, [appendDebugEvent, setCleanAtlas]);

  useEffect(() => {
    storeThemePalette(themePaletteId);
  }, [themePaletteId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(HANDBOOK_THEME_STORAGE_KEY, handbookThemeMode);
    } catch {
      // Local UI state is optional; storage failures should not block atlas editing.
    }
  }, [handbookThemeMode]);

  useEffect(() => {
    storeCanvasBackground(canvasBackgroundId);
  }, [canvasBackgroundId]);

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
      });

    loadUpdateAdvisory()
      .then((advisory) => {
        setUpdateAdvisory(advisory);
        appendDebugEvent("app.update", "Update advisory loaded", advisory.status === "failed" ? "warning" : "info", {
          status: advisory.status,
          latest_version: advisory.latest_version ?? null
        });
      })
      .catch((error) => {
        appendDebugEvent("app.update", "Update advisory load failed", "error", { error: error instanceof Error ? error.message : String(error) });
      });
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

  const stackState = useMemo(() => (atlas ? buildStackState(atlas) : emptyStackState()), [atlas]);

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

  const visibleTiles = useMemo(() => getVisibleTiles(atlas, activeView, searchTerm, stackState), [activeView, atlas, searchTerm, stackState]);

  const visibleTileIds = useMemo(() => new Set(visibleTiles.map((tile) => tile.id)), [visibleTiles]);

  const visibleLinks = useMemo(() => getVisibleLinks(atlas, activeView, searchTerm, visibleTileIds, stackState), [activeView, atlas, searchTerm, stackState, visibleTileIds]);

  const derivedNodes: Node[] = useMemo(
    () =>
      mapAtlasToNodes({
        appMode,
        atlas,
        childrenByParent,
        isInteractive,
        layoutTemplate,
        selection,
        stackState,
        themePaletteId,
        visibleTiles,
        visibleLinks,
        onFocusFamily: handleFocusFamily,
        onResizeFamily: handleResizeFamily
      }),
    [appMode, atlas, childrenByParent, handleFocusFamily, handleResizeFamily, isInteractive, layoutTemplate, selection, stackState, themePaletteId, visibleLinks, visibleTiles]
  );

  useEffect(() => {
    if (isNodeDragging.current) return;
    setFlowNodes(derivedNodes);
  }, [derivedNodes]);

  const edges: Edge[] = useMemo(() => mapAtlasToEdges(appMode, themePaletteId, visibleLinks, stackState), [appMode, stackState, themePaletteId, visibleLinks]);

  const updateAtlas = useCallback((updater: (current: Atlas) => Atlas) => {
    const current = latestAtlasRef.current;
    if (!current) return;
    commitDirtyAtlas(sanitizeAtlas(updater(withAtlasDefaults(current))));
  }, [commitDirtyAtlas]);

  const getCanvasDebugContext = useCallback(
    (extra: Record<string, unknown> = {}) => ({
      active_view_id: activeView?.id ?? null,
      active_view_title: activeView?.title ?? "None",
      layout_template: layoutTemplate,
      visible_tiles: visibleTiles.length,
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
    [activeView, appMode, atlas, layoutTemplate, lifecycleCounts, searchTerm, visibleLinks.length, visibleTiles.length]
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

  const handlePaletteChange = useCallback(
    (paletteId: ThemePaletteId) => {
      setThemePaletteId(paletteId);
      const associatedBackground = getAssociatedCanvasBackground(paletteId);
      if (associatedBackground) {
        setCanvasBackgroundId(associatedBackground);
      }
      appendDebugEvent("settings.palette", "Theme palette changed", "info", { palette: paletteId });
    },
    [appendDebugEvent]
  );

  const handleCanvasBackgroundChange = useCallback(
    (backgroundId: CanvasBackgroundId) => {
      setCanvasBackgroundId(backgroundId);
      appendDebugEvent("settings.canvas_background", "Canvas background changed", "info", { background: backgroundId });
    },
    [appendDebugEvent]
  );

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
      setSettingsOpen(false);
      appendDebugEvent("settings.close", "Settings closed");
      return;
    }
    handleOpenSettings();
  }, [appendDebugEvent, handleOpenSettings, settingsOpen]);

  const handleExportDebugLog = useCallback(async () => {
    try {
      const backendEvents = await loadBackendDebugLog();
      const events = [...debugEvents, ...backendEvents].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
      downloadDebugLog(events, {
        app: "CTRoadmap",
        active_view: activeView?.title ?? "None",
        layout_template: layoutTemplate,
        palette: themePaletteId,
        backend_health: backendHealth,
        frontend_events: debugEvents.length,
        backend_events: backendEvents.length
      });
      appendDebugEvent("debug.export", "Debug log exported", "info", { frontend_events: debugEvents.length, backend_events: backendEvents.length });
    } catch (error) {
      appendDebugEvent("debug.export", "Debug log export failed", "error", { error: error instanceof Error ? error.message : String(error) });
      window.alert(error instanceof Error ? error.message : "Debug log export failed");
    }
  }, [activeView, appendDebugEvent, backendHealth, debugEvents, layoutTemplate, themePaletteId]);

  const handleClearDebugLog = useCallback(() => {
    setDebugEvents([]);
    void clearBackendDebugLog().catch((error) => {
      appendDebugEvent("debug.clear", "Backend debug clear failed", "error", { error: error instanceof Error ? error.message : String(error) });
    });
  }, [appendDebugEvent]);

  const handleUpdateSettings = useCallback(
    async (settings: UpdateSettings) => {
      if (!updateAdvisory) return;
      try {
        const state = await saveUpdateSettings(settings);
        const nextAdvisory: UpdateAdvisory = {
          ...updateAdvisory,
          status: state.update_checks_enabled ? updateAdvisory.status : "disabled",
          state
        };
        setUpdateAdvisory(nextAdvisory);
        if (state.update_checks_enabled) {
          loadUpdateAdvisory()
            .then(setUpdateAdvisory)
            .catch((error) => {
              appendDebugEvent("app.update", "Update advisory refresh failed", "error", { error: error instanceof Error ? error.message : String(error) });
            });
        }
        appendDebugEvent("app.update.settings", "Update advisory settings saved", "info", {
          enabled: state.update_checks_enabled,
          interval: state.check_interval_hours
        });
      } catch (error) {
        appendDebugEvent("app.update.settings", "Update advisory settings failed", "error", { error: error instanceof Error ? error.message : String(error) });
        window.alert(error instanceof Error ? error.message : "Unable to save update settings");
      }
    },
    [appendDebugEvent, updateAdvisory]
  );

  const handleCopyUpdateCommand = useCallback(async () => {
    const command = updateAdvisory?.target?.update_command || MANUAL_UPDATE_COMMAND;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
        setStatus("Update command copied");
      } else {
        window.prompt("Copy update command", command);
        setStatus("Update command shown");
      }
      appendDebugEvent("app.update.copy_command", "Update command copied", "info", { deployment_type: updateAdvisory?.deployment_type ?? "docker" });
    } catch (error) {
      window.prompt("Copy update command", command);
      appendDebugEvent("app.update.copy_command", "Clipboard copy failed; command shown", "warning", { error: error instanceof Error ? error.message : String(error) });
    }
  }, [appendDebugEvent, updateAdvisory]);

  const handleViewReleaseNotes = useCallback(() => {
    const url = updateAdvisory?.target?.release_notes_url || updateAdvisory?.target?.download_url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    appendDebugEvent("app.update.release_notes", "Release notes opened", "info", { url });
  }, [appendDebugEvent, updateAdvisory]);

  const handleRemindUpdateLater = useCallback(() => {
    const key = updateNoticeKey(updateAdvisory);
    window.localStorage.setItem(key, new Date().toISOString());
    setUpdateNoticeRevision((revision) => revision + 1);
    setStatus("Update reminder snoozed");
    appendDebugEvent("app.update.remind_later", "Update advisory reminder snoozed", "info", {
      status: updateAdvisory?.status ?? "unknown",
      latest_version: updateAdvisory?.latest_version ?? null
    });
  }, [appendDebugEvent, updateAdvisory]);

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
          setLayoutTemplate(activeTemplateForUi(nextView.layout_template));
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
      if (layoutTemplate !== "canvas_topology") {
        setStatus("Tile topology changes are available in Canvas template");
        return;
      }
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
    [appendDebugEvent, appMode, atlas, layoutTemplate, updateAtlas]
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
    if (layoutTemplate !== "canvas_topology") {
      setStatus("Families are available in Canvas template");
      return;
    }
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
      color: "#38a3ff",
      tag: ""
    };
    updateAtlas((current) => ({
      ...current,
      families: [...(current.families ?? []), family]
    }));
    setSelection({ kind: "family", id: family.id });
    setStatus("Family created");
    appendDebugEvent("family.create", "Family created", "info", { family_id: family.id });
  }, [appendDebugEvent, atlas, getViewportCenterPosition, layoutTemplate, updateAtlas]);

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
    if (!isInteractive || layoutTemplate !== "canvas_topology") {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(TILE_DRAG_MIME, type);
    event.dataTransfer.effectAllowed = "copy";
  }, [isInteractive, layoutTemplate]);

  const handleFamilyPaletteDragStart = useCallback((event: DragEvent<HTMLButtonElement>) => {
    if (!isInteractive || layoutTemplate !== "canvas_topology") {
      event.preventDefault();
      if (layoutTemplate !== "canvas_topology") setStatus("Families are available in Canvas template");
      return;
    }
    event.dataTransfer.setData(FAMILY_DRAG_MIME, "family");
    event.dataTransfer.effectAllowed = "copy";
  }, [isInteractive, layoutTemplate]);

  const handlePaletteDragEnd = useCallback(() => {
    lastPaletteDragAt.current = Date.now();
  }, []);

  const handleCanvasDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isInteractive || layoutTemplate !== "canvas_topology") return;
    const dragTypes = Array.from(event.dataTransfer.types);
    if (!dragTypes.includes(TILE_DRAG_MIME) && !dragTypes.includes(FAMILY_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, [isInteractive, layoutTemplate]);

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
        if (layoutTemplate !== "canvas_topology") {
          setStatus("Families are available in Canvas template");
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
      if (layoutTemplate !== "canvas_topology") {
        setStatus("Tile topology changes are available in Canvas template");
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
    [appendDebugEvent, getCanvasDebugContext, handleCreateFamily, handleCreateTile, isInteractive, layoutTemplate, screenToFlowPosition]
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
      if (layoutTemplate !== "canvas_topology") {
        setStatus("Relationship changes are available in Canvas template");
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
    [appendDebugEvent, appMode, atlas, getCanvasDebugContext, isInteractive, layoutTemplate, updateAtlas]
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
      appendDebugEvent("canvas.node_drag_start", "Canvas node drag started", "info", getCanvasDebugContext({ node_id: node.id, node_type: node.type, dragged_count: draggedNodes.length }));
    },
    [appendDebugEvent, appMode, getCanvasDebugContext, isInteractive]
  );

  const handleNodeDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node, draggedNodes: Node[]) => {
      if (!isInteractive) {
        isNodeDragging.current = false;
        setFlowNodes(derivedNodes);
        return;
      }
      isNodeDragging.current = false;
      if (layoutTemplate !== "canvas_topology") {
        setFlowNodes(derivedNodes);
        return;
      }
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
    [appendDebugEvent, appMode, derivedNodes, getCanvasDebugContext, isInteractive, layoutTemplate, updateAtlas]
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
      const currentTile = latestAtlasRef.current?.tiles.find((candidate) => candidate.id === tile.id);
      if (layoutTemplate === "handbook" && currentTile && (currentTile.parent !== tile.parent || currentTile.type !== tile.type)) {
        setStatus("Placement changes are locked in Handbook");
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
    [appendDebugEvent, appMode, layoutTemplate, updateAtlas]
  );

  const handleUpdateFamily = useCallback(
    (family: Family) => {
      updateAtlas((current) => ({
        ...current,
        families: (current.families ?? []).map((candidate) => {
          if (candidate.id !== family.id) return candidate;
          if (layoutTemplate !== "handbook") return family;
          return {
            ...family,
            member_tile_ids: candidate.member_tile_ids,
            position: candidate.position,
            size: candidate.size,
            order: candidate.order
          };
        })
      }));
      setStatus("Family updated");
      appendDebugEvent("family.update", "Family updated", "info", { family_id: family.id });
    },
    [appendDebugEvent, layoutTemplate, updateAtlas]
  );

  const handleDeleteFamily = useCallback(
    (familyId: string) => {
      if (layoutTemplate === "handbook") {
        setStatus("Family deletion is locked in Handbook");
        return;
      }
      if (!window.confirm("Delete this Family? Member tiles will not be deleted.")) return;
      updateAtlas((current) => ({
        ...current,
        families: (current.families ?? []).filter((family) => family.id !== familyId)
      }));
      setSelection(null);
      setStatus("Family deleted");
      appendDebugEvent("family.delete", "Family deleted", "warning", { family_id: familyId });
    },
    [appendDebugEvent, layoutTemplate, updateAtlas]
  );

  const handleMoveHandbookFamily = useCallback(
    (familyId: string, direction: -1 | 1) => {
      updateAtlas((current) => {
        const orderedFamilies = [...(current.families ?? [])].sort((left, right) => left.order - right.order);
        const index = orderedFamilies.findIndex((family) => family.id === familyId);
        const targetIndex = index + direction;
        if (index < 0 || targetIndex < 0 || targetIndex >= orderedFamilies.length) return current;
        const nextFamilies = [...orderedFamilies];
        const currentFamily = nextFamilies[index];
        nextFamilies[index] = nextFamilies[targetIndex];
        nextFamilies[targetIndex] = currentFamily;
        const orderById = new Map(nextFamilies.map((family, order) => [family.id, order]));
        return {
          ...current,
          families: (current.families ?? []).map((family) => ({ ...family, order: orderById.get(family.id) ?? family.order }))
        };
      });
      setStatus("Handbook volume order updated");
      appendDebugEvent("handbook.family_order", "Handbook volume order updated", "info", { family_id: familyId, direction });
    },
    [appendDebugEvent, updateAtlas]
  );

  const handleToggleTileFamily = useCallback(
    (tileId: string, familyId: string, included: boolean) => {
      if (layoutTemplate === "handbook") {
        setStatus("Family membership changes are locked in Handbook");
        return;
      }
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
    [appendDebugEvent, layoutTemplate, updateAtlas]
  );

  const handleDeleteTile = useCallback(
    (tileId: string) => {
      if (layoutTemplate === "handbook") {
        setStatus("Tile deletion is locked in Handbook");
        return;
      }
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
    [appendDebugEvent, appMode, atlas, layoutTemplate, updateAtlas]
  );

  const handleDuplicateTile = useCallback(
    (tileId: string) => {
      if (layoutTemplate === "handbook") {
        setStatus("Tile duplication is locked in Handbook");
        return;
      }
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
    [appendDebugEvent, appMode, atlas, layoutTemplate, updateAtlas]
  );

  const handleUpdateLink = useCallback(
    (link: Link) => {
      if (!isLifecycleEditable(resolveLifecycle(link), appMode)) {
        setStatus("Selection is read-only in this mode");
        return;
      }
      updateAtlas((current) => ({
        ...current,
        links: current.links.map((candidate) => {
          if (candidate.id !== link.id) return candidate;
          if (
            layoutTemplate === "handbook" &&
            (candidate.from !== link.from ||
              candidate.to !== link.to ||
              candidate.type !== link.type ||
              candidate.from_port !== link.from_port ||
              candidate.to_port !== link.to_port ||
              candidate.directional !== link.directional)
          ) {
            setStatus("Relationship topology is locked in Handbook");
            return candidate;
          }
          return link;
        })
      }));
      setStatus("Relationship updated");
      appendDebugEvent("link.update", "Relationship updated", "info", { id: link.id, type: link.type });
    },
    [appendDebugEvent, appMode, layoutTemplate, updateAtlas]
  );

  const handleDeleteLink = useCallback(
    (linkId: string) => {
      if (layoutTemplate === "handbook") {
        setStatus("Relationship deletion is locked in Handbook");
        return;
      }
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
    [appendDebugEvent, appMode, atlas, layoutTemplate, updateAtlas]
  );

  const handleStackSiblings = useCallback(
    (tileId: string) => {
      if (layoutTemplate === "handbook") {
        setStatus("Stack changes are locked in Handbook");
        return;
      }
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
    [appendDebugEvent, atlas, layoutTemplate, updateAtlas]
  );

  const handleStackMountChildren = useCallback(
    (mountTileId: string) => {
      if (layoutTemplate === "handbook") {
        setStatus("Stack changes are locked in Handbook");
        return;
      }
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
    [appendDebugEvent, atlas, layoutTemplate, updateAtlas]
  );

  const handleUpdateStack = useCallback(
    (stack: TileStack) => {
      if (layoutTemplate === "handbook") {
        setStatus("Stack changes are locked in Handbook");
        return;
      }
      updateAtlas((current) => ({
        ...current,
        stacks: (current.stacks ?? []).map((candidate) => (candidate.id === stack.id ? stack : candidate))
      }));
      setStatus("Stack updated");
      appendDebugEvent("stack.update", "Stack updated", "info", { stack_id: stack.id });
    },
    [appendDebugEvent, layoutTemplate, updateAtlas]
  );

  const handleUnstack = useCallback(
    (stackId: string) => {
      if (layoutTemplate === "handbook") {
        setStatus("Stack changes are locked in Handbook");
        return;
      }
      updateAtlas((current) => ({
        ...current,
        stacks: (current.stacks ?? []).filter((stack) => stack.id !== stackId)
      }));
      setSelection(null);
      setStackContextMenu(null);
      setStatus("Stack removed");
      appendDebugEvent("stack.delete", "Stack removed", "info", { stack_id: stackId });
    },
    [appendDebugEvent, layoutTemplate, updateAtlas]
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
      const nextTemplate = activeTemplateForUi(view.layout_template);
      setActiveViewId(view.id);
      setLayoutTemplate(nextTemplate);
      if (nextTemplate === "handbook") setSelectedHandbookVolumeId(null);
      setSelection(null);
      setStatus(`Layer: ${view.title}`);
      appendDebugEvent("view.select", "Layer selected", "info", { id: view.id, title: view.title, layout_template: view.layout_template });
    },
    [appendDebugEvent]
  );

  const handleTemplateChange = useCallback(
    (nextTemplate: LayoutTemplate) => {
      if (nextTemplate === "handbook") {
        const selectedTileId = selection?.kind === "tile" ? selection.id : null;
        const currentAtlas = latestAtlasRef.current;
        if (selectedTileId && currentAtlas) {
          const volume = findHandbookVolumeForTile(buildHandbookDocument(currentAtlas), selectedTileId);
          setSelectedHandbookVolumeId(volume?.id ?? null);
        } else {
          setSelectedHandbookVolumeId(null);
        }
      }
      setLayoutTemplate(nextTemplate);
      updateAtlas((current) => ({
        ...current,
        views: current.views.map((view) => (view.id === activeViewId ? { ...view, layout_template: nextTemplate } : view))
      }));
      setStatus(nextTemplate === "canvas_topology" ? "Canvas topology template" : "Handbook template");
      appendDebugEvent("view.template", "Layout template changed", "info", { layout_template: nextTemplate });
    },
    [activeViewId, appendDebugEvent, selection, updateAtlas]
  );

  const handleSelectHandbookVolume = useCallback((volumeId: string) => {
    setSelectedHandbookVolumeId(volumeId);
    setSelection(null);
    setStatus("Handbook volume selected");
  }, []);

  const handleSelectHandbookTile = useCallback((volumeId: string, tileId: string) => {
    setSelectedHandbookVolumeId(volumeId);
    setSelection({ kind: "tile", id: tileId });
    setStatus("Handbook tile selected");
  }, []);

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
      camera: { x: 0, y: 0, zoom: 1 },
      layout_template: sourceView?.layout_template ?? layoutTemplate
    };
    updateAtlas((current) => ({ ...current, views: [...current.views, view] }));
    setActiveViewId(view.id);
    setLayoutTemplate(activeTemplateForUi(view.layout_template));
    setStatus(`Created layer: ${view.title}`);
    appendDebugEvent("view.create", "Layer created", "info", { id: view.id, title: view.title });
  }, [activeView, appendDebugEvent, atlas, layoutTemplate, updateAtlas]);

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
    setLayoutTemplate(activeTemplateForUi(nextView.layout_template));
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

  const handleLoadSeed = useCallback(() => {
    if (!window.confirm("This will overwrite your current ALTAS, Download your current ATLAS .json file first so you can revert to it later if you don't want to lose it.")) return;
    const seed = createSeedAtlas();
    commitDirtyAtlas(seed);
    setActiveViewId("everything");
    setLayoutTemplate("canvas_topology");
    setSelection(null);
    setStatus("CTDC sample loaded");
    appendDebugEvent("seed.load", "CTDC sample loaded", "info", atlasSummary(seed));
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
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        if (layoutTemplate === "handbook") return;
        if (selection?.kind === "tile") {
          event.preventDefault();
          handleDuplicateTile(selection.id);
        }
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (layoutTemplate === "handbook") return;
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
  }, [handleDeleteLink, handleDeleteTile, handleDuplicateTile, handleSave, layoutTemplate, selection]);

  const brokenLinkCount = atlas
    ? atlas.links.filter((link) => !atlas.tiles.some((tile) => tile.id === link.from) || !atlas.tiles.some((tile) => tile.id === link.to)).length
    : 0;
  const warnings = useMemo(() => (atlas ? validateAtlasWarnings(atlas) : []), [atlas]);
  const updateNotice = useMemo<UpdateNoticeView | null>(() => {
    if (!updateAdvisory) return null;
    if (isUpdateNoticeSnoozed(updateAdvisory)) return null;
    if (updateAdvisory.status === "available") {
      return {
        tone: "available",
        title: `Update ${updateAdvisory.latest_version ?? ""} available`.trim(),
        message: updateAdvisory.target?.notes || "A newer CTRoadmap build is available."
      };
    }
    if (updateAdvisory.status === "disabled" || updateAdvisory.status === "failed") {
      return {
        tone: "manual",
        title: "Manual update check",
        message: "Beta Docker updates can be checked manually when advisory checks are unavailable."
      };
    }
    return null;
  }, [updateAdvisory, updateNoticeRevision]);

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
    <div className="app-shell" data-theme={themePaletteId}>
      <TopBar
        appMode={appMode}
        exportMenuOpen={exportMenuOpen}
        exportMenuRef={exportMenuRef}
        fileInputRef={fileInputRef}
        isExporting={isExporting}
        isSaving={isSaving}
        saveStatusClass={saveStatusClass}
        saveStatusText={saveStatusText}
        searchInputRef={searchInputRef}
        searchTerm={searchTerm}
        settingsOpen={settingsOpen}
        updateAdvisory={updateAdvisory}
        updateNotice={updateNotice}
        onCopyUpdateCommand={() => void handleCopyUpdateCommand()}
        onExportMenuToggle={() => setExportMenuOpen((open) => !open)}
        onFileSelected={(file) => void handleImportAtlas(file)}
        onLoadSeed={handleLoadSeed}
        onDownloadAtlasJson={handleDownloadAtlasJson}
        onRemindUpdateLater={handleRemindUpdateLater}
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
        onViewReleaseNotes={handleViewReleaseNotes}
      />

      <main className="workspace">
        <LeftSidebar
          activeView={activeView}
          activeViewId={activeViewId}
          atlas={atlas}
          collapsedPaletteEntries={collapsedPaletteEntries}
          familyPaletteColor={FAMILY_PALETTE_COLOR}
          handbookThemeMode={handbookThemeMode}
          layoutTemplate={layoutTemplate}
          searchResults={searchResults}
          searchTerm={searchTerm}
          selectedHandbookTileId={selection?.kind === "tile" ? selection.id : null}
          selectedHandbookVolumeId={selectedHandbookVolumeId}
          selection={selection}
          sidebarState={sidebarState}
          themePaletteId={themePaletteId}
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
          onHandbookThemeModeChange={setHandbookThemeMode}
          onMoveHandbookFamily={handleMoveHandbookFamily}
          onPaletteClick={handlePaletteClick}
          onPaletteDragEnd={handlePaletteDragEnd}
          onPaletteDragStart={handlePaletteDragStart}
          onSelectSearchResult={selectSearchResult}
          onSelectHandbookTile={handleSelectHandbookTile}
          onSelectHandbookVolume={handleSelectHandbookVolume}
          onSelectView={handleSelectView}
          onSelectWarningLink={(linkId) => setSelection({ kind: "link", id: linkId })}
          onSelectWarningTile={selectTileAndFocus}
          onTemplateChange={handleTemplateChange}
          onToggleSidebarSection={toggleSidebarSection}
          onToggleViewLinkType={handleToggleViewLinkType}
          onToggleViewTileType={handleToggleViewTileType}
        />

        {layoutTemplate === "handbook" ? (
          <HandbookView
            atlas={atlas}
            selectedVolumeId={selectedHandbookVolumeId}
            themeMode={handbookThemeMode}
            selection={selection}
            onNotesFocus={() => setSelection(null)}
            onSelectTile={(tileId) => setSelection({ kind: "tile", id: tileId })}
            onUpdateTile={handleUpdateTile}
          />
        ) : (
          <CanvasFrame
            activeViewId={activeViewId}
            appMode={appMode}
            brokenLinkCount={brokenLinkCount}
            canvasBackgroundId={canvasBackgroundId}
            canvasRef={canvasRef}
            edges={edges}
            exportResults={exportResults}
            fitViewOptions={FIT_VIEW_OPTIONS}
            flowNodes={flowNodes}
            isInteractive={isInteractive}
            layoutTemplate={layoutTemplate}
            lifecycleCounts={lifecycleCounts}
            searchResultsCount={searchResults.length}
            searchTerm={searchTerm}
            stackContextMenu={stackContextMenu}
            status={status}
            themePaletteId={themePaletteId}
            viewBarOpen={viewBarOpen}
            views={atlas.views}
            visibleLinks={visibleLinks}
            visibleTiles={visibleTiles}
            warningsCount={warnings.length}
            onCanvasDoubleClick={handleCanvasDoubleClick}
            onCanvasDragOver={handleCanvasDragOver}
            onCanvasDrop={handleCanvasDrop}
            onConnect={handleConnect}
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
        )}

        <Inspector
          atlas={atlas}
          layoutTemplate={layoutTemplate}
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
          layoutTemplate={layoutTemplate}
          canvasBackgroundId={canvasBackgroundId}
          paletteId={themePaletteId}
          updateAdvisory={updateAdvisory}
          onClearDebugLog={handleClearDebugLog}
          onClose={() => setSettingsOpen(false)}
          onCopyUpdateCommand={handleCopyUpdateCommand}
          onExportDebugLog={handleExportDebugLog}
          onCanvasBackgroundChange={handleCanvasBackgroundChange}
          onPaletteChange={handlePaletteChange}
          onUpdateSettings={handleUpdateSettings}
          onViewReleaseNotes={handleViewReleaseNotes}
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

function getStoredHandbookThemeMode(): HandbookThemeMode {
  try {
    const stored = window.localStorage.getItem(HANDBOOK_THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
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

function updateNoticeKey(advisory: UpdateAdvisory | null): string {
  if (!advisory) return `${UPDATE_NOTICE_PREFIX}unknown`;
  if (advisory.status === "available") {
    return `${UPDATE_NOTICE_PREFIX}available:${advisory.latest_version ?? "unknown"}`;
  }
  return `${UPDATE_NOTICE_PREFIX}manual:${advisory.status}`;
}

function isUpdateNoticeSnoozed(advisory: UpdateAdvisory): boolean {
  const key = updateNoticeKey(advisory);
  const hiddenAt = window.localStorage.getItem(key);
  if (!hiddenAt) return false;
  const hiddenDate = new Date(hiddenAt);
  if (Number.isNaN(hiddenDate.getTime())) {
    window.localStorage.removeItem(key);
    return false;
  }
  const expiresAt = hiddenDate.getTime() + UPDATE_NOTICE_SNOOZE_HOURS * 60 * 60 * 1000;
  if (Date.now() < expiresAt) return true;
  window.localStorage.removeItem(key);
  return false;
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
