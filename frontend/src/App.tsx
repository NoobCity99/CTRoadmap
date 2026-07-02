import {
  applyNodeChanges,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type FitViewOptions,
  type Node,
  type NodeChange
} from "@xyflow/react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  ExternalLink,
  FileCode2,
  FileText,
  GitBranch,
  LayoutDashboard,
  Loader2,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  Upload,
  X
} from "lucide-react";
import {
  type CSSProperties,
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
import { Inspector } from "./components/Inspector";
import { SettingsPanel } from "./components/SettingsPanel";
import { TileNode } from "./components/TileNode";
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
import { BRAND_ICON, DEFAULT_FIELDS, LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "./lib/constants";
import { atlasSummary, createFrontendDebugEvent, downloadDebugLog } from "./lib/debug";
import { createSeedAtlas } from "./lib/seed";
import {
  getAssociatedCanvasBackground,
  getLinkColor,
  getStoredCanvasBackground,
  getStoredThemePalette,
  getTileColor,
  storeCanvasBackground,
  storeThemePalette
} from "./lib/theme";
import { validateAtlasWarnings } from "./lib/validation";
import type {
  Atlas,
  AppVersion,
  DebugEvent,
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

const nodeTypes = { tileNode: TileNode };
const TILE_DRAG_MIME = "application/ctroadmap-tile-type";
const FIT_VIEW_OPTIONS: FitViewOptions = { padding: 0.28, duration: 450 };
const UPDATE_NOTICE_PREFIX = "ctroadmap:update-notice:";
const UPDATE_NOTICE_SNOOZE_HOURS = 24;
const MANUAL_UPDATE_COMMAND = "cd ~/ctroadmap-beta && docker compose pull && docker compose up -d";
const SIDEBAR_STORAGE_KEY = "ctroadmap.sidebarSections";
const AUTOSAVE_DEBOUNCE_MS = 1000;

type SidebarSectionId = "tilePalette" | "views" | "filters" | "relationships";
type SaveReason = "autosave" | "manual" | "export";

interface SidebarState {
  collapsed: Record<SidebarSectionId, boolean>;
  paletteIndex: number;
}

type SearchResult =
  | { kind: "tile"; id: string; title: string; detail: string }
  | { kind: "link"; id: string; title: string; detail: string };

interface StackContextMenu {
  x: number;
  y: number;
  tileId: string;
  stackId?: string;
  canStack: boolean;
  canStackMountChildren: boolean;
  tileType: TileType;
}

interface StackRenderInfo {
  id: string;
  kind: "sibling_type" | "mount_children";
  badgeShape: "circle" | "hex";
  count: number;
  name: string;
  subtitle: string;
}

interface StackState {
  stacks: TileStack[];
  hiddenMemberIds: Set<string>;
  memberToRepresentative: Map<string, string>;
  stackByRepresentative: Map<string, StackRenderInfo>;
}

function App() {
  return (
    <ReactFlowProvider>
      <AtlasEditor />
    </ReactFlowProvider>
  );
}

function AtlasEditor() {
  const { fitView, screenToFlowPosition, setCenter } = useReactFlow();
  const canvasRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isNodeDragging = useRef(false);
  const lastPaletteDragAt = useRef(0);
  const collapsedPaletteTouchY = useRef<number | null>(null);
  const lastVisibleTileCount = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lastWarningCount = useRef<number | null>(null);
  const latestAtlasRef = useRef<Atlas | null>(null);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>("live");
  const [sidebarState, setSidebarState] = useState<SidebarState>(() => getStoredSidebarState());
  const [stackContextMenu, setStackContextMenu] = useState<StackContextMenu | null>(null);
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
          setLayoutTemplate(defaultView.layout_template);
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

  const activeView = useMemo(() => {
    if (!atlas) return null;
    return atlas.views.find((view) => view.id === activeViewId) ?? atlas.views[0] ?? null;
  }, [atlas, activeViewId]);

  const collapsedPaletteTypes = useMemo(() => {
    const activeIndex = normalizePaletteIndex(sidebarState.paletteIndex);
    return [
      { slot: "previous", type: TILE_TYPES[normalizePaletteIndex(activeIndex - 1)], interactive: false },
      { slot: "active", type: TILE_TYPES[activeIndex], interactive: true },
      { slot: "next", type: TILE_TYPES[normalizePaletteIndex(activeIndex + 1)], interactive: false }
    ] as const;
  }, [sidebarState.paletteIndex]);

  const lifecycleCounts = useMemo(() => {
    const counts = {
      liveTiles: 0,
      plannedTiles: 0,
      liveLinks: 0,
      plannedLinks: 0
    };
    if (!atlas) return counts;
    for (const tile of atlas.tiles) {
      if (resolveLifecycle(tile) === "planned") counts.plannedTiles += 1;
      else counts.liveTiles += 1;
    }
    for (const link of atlas.links) {
      if (resolveLifecycle(link) === "planned") counts.plannedLinks += 1;
      else counts.liveLinks += 1;
    }
    return counts;
  }, [atlas]);

  const childrenByParent = useMemo(() => {
    const grouped = new Map<string, Tile[]>();
    if (!atlas) return grouped;
    for (const tile of atlas.tiles) {
      if (!tile.parent) continue;
      const children = grouped.get(tile.parent) ?? [];
      children.push(tile);
      grouped.set(tile.parent, children);
    }
    return grouped;
  }, [atlas]);

  const stackState = useMemo(() => (atlas ? buildStackState(atlas) : emptyStackState()), [atlas]);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!atlas) return [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];
    const tileMatches = atlas.tiles
      .filter((tile) => {
        const allowedByView = !activeView?.visible_types.length || activeView.visible_types.includes(tile.type);
        const searchable = `${tile.title} ${tile.type} ${resolveLifecycle(tile)} ${tile.notes ?? ""} ${(tile.tags ?? []).join(" ")} ${JSON.stringify(tile.fields)}`.toLowerCase();
        return allowedByView && searchable.includes(query);
      })
      .map<SearchResult>((tile) => ({
        kind: "tile",
        id: tile.id,
        title: tile.title,
        detail: `${resolveLifecycle(tile)} ${TILE_TYPE_CONFIG[tile.type].label} tile`
      }));
    const linkMatches = atlas.links
      .filter((link) => {
        const allowedByView = !activeView?.visible_links.length || activeView.visible_links.includes(link.type);
        const searchable = `${link.type} ${resolveLifecycle(link)} ${link.label ?? ""} ${link.notes ?? ""}`.toLowerCase();
        return allowedByView && searchable.includes(query);
      })
      .map<SearchResult>((link) => {
        const source = atlas.tiles.find((tile) => tile.id === link.from)?.title ?? link.from;
        const target = atlas.tiles.find((tile) => tile.id === link.to)?.title ?? link.to;
        return {
          kind: "link",
          id: link.id,
          title: link.label || link.type,
          detail: `${resolveLifecycle(link)}: ${source} -> ${target}`
        };
      });
    return [...tileMatches, ...linkMatches].slice(0, 30);
  }, [activeView, atlas, searchTerm]);

  const visibleTiles = useMemo(() => {
    if (!atlas) return [];
    const query = searchTerm.trim().toLowerCase();
    return atlas.tiles.filter((tile) => {
      const allowedByView = !activeView?.visible_types.length || activeView.visible_types.includes(tile.type);
      const searchable = `${tile.title} ${tile.type} ${resolveLifecycle(tile)} ${tile.notes ?? ""} ${(tile.tags ?? []).join(" ")} ${JSON.stringify(tile.fields)}`.toLowerCase();
      const allowedBySearch = !query || searchable.includes(query);
      return allowedByView && allowedBySearch && !stackState.hiddenMemberIds.has(tile.id);
    });
  }, [activeView, atlas, searchTerm, stackState.hiddenMemberIds]);

  const visibleTileIds = useMemo(() => new Set(visibleTiles.map((tile) => tile.id)), [visibleTiles]);

  const visibleLinks = useMemo(() => {
    if (!atlas) return [];
    return atlas.links.filter((link) => {
      const allowedByView = !activeView?.visible_links.length || activeView.visible_links.includes(link.type);
      const searchable = `${link.type} ${resolveLifecycle(link)} ${link.label ?? ""} ${link.notes ?? ""}`.toLowerCase();
      const renderedSource = stackState.memberToRepresentative.get(link.from) ?? link.from;
      const renderedTarget = stackState.memberToRepresentative.get(link.to) ?? link.to;
      const allowedBySearch =
        !searchTerm.trim() ||
        searchable.includes(searchTerm.trim().toLowerCase()) ||
        visibleTileIds.has(renderedSource) ||
        visibleTileIds.has(renderedTarget);
      return allowedByView && allowedBySearch && renderedSource !== renderedTarget && visibleTileIds.has(renderedSource) && visibleTileIds.has(renderedTarget);
    });
  }, [activeView, atlas, searchTerm, stackState.memberToRepresentative, visibleTileIds]);

  const derivedNodes: Node[] = useMemo(() => {
    if (!atlas) return [];
    const layoutPositions = layoutTemplate === "layered_hierarchy" ? computeLayeredPositions(visibleTiles) : new Map<string, { x: number; y: number }>();

    return visibleTiles.map((tile) => {
      const parentTitle = tile.parent ? atlas.tiles.find((candidate) => candidate.id === tile.parent)?.title : undefined;
      const position = layoutPositions.get(tile.id) ?? tile.position;
      const lifecycle = resolveLifecycle(tile);
      const editable = isLifecycleEditable(lifecycle, appMode);
      const stack = stackState.stackByRepresentative.get(tile.id);
      return {
        id: tile.id,
        type: "tileNode",
        position,
        draggable: isInteractive && editable && !stack && layoutTemplate === "canvas_topology",
        data: {
          tile,
          parentTitle,
          accentColor: getTileColor(tile.type, themePaletteId),
          iconAccentColor: themePaletteId === "blueprint" ? getTileColor(tile.type, "cyber") : getTileColor(tile.type, themePaletteId),
          hasChildren: Boolean(childrenByParent.get(tile.id)?.length),
          lifecycle,
          isMuted: !editable,
          stack
        }
      };
    });
  }, [appMode, atlas, childrenByParent, isInteractive, layoutTemplate, stackState.stackByRepresentative, themePaletteId, visibleTiles]);

  useEffect(() => {
    if (isNodeDragging.current) return;
    setFlowNodes(derivedNodes);
  }, [derivedNodes]);

  const edges: Edge[] = useMemo(() => {
    return visibleLinks.map((link) => {
      const lifecycle = resolveLifecycle(link);
      const editable = isLifecycleEditable(lifecycle, appMode);
      const isBlueprint = themePaletteId === "blueprint";
      const label = `${link.label || link.type}${lifecycle === "planned" ? " [planned]" : ""}`;
      return {
        id: link.id,
        source: stackState.memberToRepresentative.get(link.from) ?? link.from,
        target: stackState.memberToRepresentative.get(link.to) ?? link.to,
        sourceHandle: resolveSourcePort(link),
        targetHandle: resolveTargetPort(link),
        label,
        animated: editable && ["calls", "controls", "fails_if"].includes(link.type),
        markerEnd: link.directional === false ? undefined : { type: MarkerType.ArrowClosed },
        style: {
          stroke: editable ? getLinkColor(link.type, themePaletteId) : "rgba(148, 163, 184, 0.55)",
          strokeWidth: editable ? 2 : 1.5,
          opacity: editable ? 1 : 0.55
        },
        labelStyle: {
          fill: isBlueprint ? (editable ? "#06245a" : "rgba(6, 36, 90, 0.7)") : editable ? "#f8fafc" : "#94a3b8",
          fontSize: 12,
          fontWeight: 700
        },
        labelBgStyle: {
          fill: isBlueprint ? "rgba(238, 247, 255, 0.86)" : "rgba(5, 10, 22, 0.88)",
          fillOpacity: 0.9
        }
      };
    });
  }, [appMode, stackState.memberToRepresentative, themePaletteId, visibleLinks]);

  const updateAtlas = useCallback((updater: (current: Atlas) => Atlas) => {
    const current = latestAtlasRef.current;
    if (!current) return;
    commitDirtyAtlas(sanitizeAtlasStacks(updater(withAtlasStacks(current))));
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
          `Replace the current atlas with this validated JSON file?\n\nTiles: ${preview.tiles}\nRelationships: ${preview.links}\nViews: ${preview.views}${warningText}`
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
          setLayoutTemplate(nextView.layout_template);
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
      const title = window.prompt("Tile title");
      if (!title) return;
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

  const handlePaletteDragEnd = useCallback(() => {
    lastPaletteDragAt.current = Date.now();
  }, []);

  const handleCanvasDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isInteractive) return;
    if (!Array.from(event.dataTransfer.types).includes(TILE_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, [isInteractive]);

  const handleCanvasDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
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
    [appendDebugEvent, getCanvasDebugContext, handleCreateTile, isInteractive, screenToFlowPosition]
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
      if (!draggedNodes.some((draggedNode) => isLifecycleEditable(resolveLifecycle(draggedNode.data?.tile as Tile | undefined), appMode))) return;
      isNodeDragging.current = true;
      appendDebugEvent("tile.drag_start", "Tile drag started", "info", getCanvasDebugContext({ tile_id: node.id, dragged_count: draggedNodes.length }));
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
      const positionsById = new Map(
        draggedNodes
          .filter((draggedNode) => isLifecycleEditable(resolveLifecycle(draggedNode.data?.tile as Tile | undefined), appMode))
          .map((draggedNode) => [draggedNode.id, draggedNode.position])
      );
      if (!positionsById.size) {
        setFlowNodes(derivedNodes);
        return;
      }
      updateAtlas((current) => ({
        ...current,
        tiles: current.tiles.map((tile) => {
          const position = positionsById.get(tile.id);
          return position ? { ...tile, position } : tile;
        })
      }));
      appendDebugEvent(
        "tile.drag_stop",
        "Tile drag stopped",
        "info",
        getCanvasDebugContext({
          tile_id: node.id,
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
        links: current.links.filter((link) => link.from !== tileId && link.to !== tileId)
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
      setLayoutTemplate(view.layout_template);
      setSelection(null);
      setStatus(`View: ${view.title}`);
      appendDebugEvent("view.select", "View selected", "info", { id: view.id, title: view.title, layout_template: view.layout_template });
    },
    [appendDebugEvent]
  );

  const handleTemplateChange = useCallback(
    (nextTemplate: LayoutTemplate) => {
      setLayoutTemplate(nextTemplate);
      updateAtlas((current) => ({
        ...current,
        views: current.views.map((view) => (view.id === activeViewId ? { ...view, layout_template: nextTemplate } : view))
      }));
      setStatus(nextTemplate === "canvas_topology" ? "Canvas topology template" : "Layered hierarchy template");
      appendDebugEvent("view.template", "Layout template changed", "info", { layout_template: nextTemplate });
    },
    [activeViewId, appendDebugEvent, updateAtlas]
  );

  const handleCreateView = useCallback(() => {
    if (!atlas) return;
    const title = window.prompt("View title");
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
    setLayoutTemplate(view.layout_template);
    setStatus(`Created view: ${view.title}`);
    appendDebugEvent("view.create", "View created", "info", { id: view.id, title: view.title });
  }, [activeView, appendDebugEvent, atlas, layoutTemplate, updateAtlas]);

  const handleEditView = useCallback(() => {
    if (!activeView) return;
    const title = window.prompt("View title", activeView.title);
    if (!title) return;
    const description = window.prompt("View description", activeView.description) ?? activeView.description;
    updateAtlas((current) => ({
      ...current,
      views: current.views.map((view) => (view.id === activeView.id ? { ...view, title, description } : view))
    }));
    setStatus(`Updated view: ${title}`);
    appendDebugEvent("view.update", "View updated", "info", { id: activeView.id, title });
  }, [activeView, appendDebugEvent, updateAtlas]);

  const handleDeleteView = useCallback(() => {
    if (!atlas || !activeView) return;
    if (atlas.views.length <= 1) {
      window.alert("At least one view is required.");
      return;
    }
    if (!window.confirm(`Delete view "${activeView.title}"?`)) return;
    const remainingViews = atlas.views.filter((view) => view.id !== activeView.id);
    const nextView = remainingViews.find((view) => view.id === "everything") ?? remainingViews[0];
    updateAtlas((current) => ({ ...current, views: current.views.filter((view) => view.id !== activeView.id) }));
    setActiveViewId(nextView.id);
    setLayoutTemplate(nextView.layout_template);
    setSelection(null);
    setStatus(`Deleted view: ${activeView.title}`);
    appendDebugEvent("view.delete", "View deleted", "warning", { id: activeView.id, title: activeView.title });
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
    if (!window.confirm("Replace the current unsaved atlas with optional CTDC sample data?")) return;
    const seed = createSeedAtlas();
    commitDirtyAtlas(seed);
    setActiveViewId("everything");
    setLayoutTemplate("canvas_topology");
    setSelection(null);
    setStatus("CTDC sample loaded");
    appendDebugEvent("seed.load", "CTDC sample loaded", "info", atlasSummary(seed));
  }, [appendDebugEvent, commitDirtyAtlas]);

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
  const updateNotice = useMemo(() => {
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

  const BrandIcon = BRAND_ICON;

  return (
    <div className="app-shell" data-theme={themePaletteId}>
        <header className="topbar">
          <div className="topbar__main">
            <div className="brand">
              <div className="brand__mark">
                <BrandIcon size={28} />
              </div>
              <div>
                <strong>CTRoadmap</strong>
                <span>Local Infrastructure Atlas</span>
              </div>
            </div>
            <div className="topbar__actions">
              <button className="toolbar-button toolbar-button--icon-only" onClick={handleSave} disabled={isSaving} title="Save" aria-label="Save">
                {isSaving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
              </button>
              <span className={saveStatusClass}>{saveStatusText}</span>
              <button className="toolbar-button" onClick={() => fileInputRef.current?.click()} title="Import atlas.json">
                <Upload size={18} /> Import atlas.json
              </button>
              <input
                ref={fileInputRef}
                className="hidden-input"
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) void handleImportAtlas(file);
                }}
              />
              <button className="toolbar-button" onClick={handleDownloadAtlasJson} title="Download your Atlas">
                <Download size={18} /> Download your Atlas
              </button>
              <button className="toolbar-button" onClick={handleLoadSeed} title="Load Demo">
                <Upload size={18} /> Load Demo
              </button>
              <div className="toolbar-menu">
                <button
                  className="toolbar-button"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={exportMenuOpen}
                  onClick={() => setExportMenuOpen((open) => !open)}
                  disabled={Boolean(isExporting)}
                  title="3rd Party Export"
                >
                  {isExporting ? <Loader2 className="spin" size={18} /> : <Download size={18} />} 3rd Party Export
                </button>
                {exportMenuOpen ? (
                  <div className="toolbar-popover" role="menu" aria-label="3rd Party Export">
                    <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => void handleToolbarExport("markdown")}>
                      <FileText size={16} /> Markdown
                    </button>
                    <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => void handleToolbarExport("yaml")}>
                      <Download size={16} /> YAML
                    </button>
                    <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => void handleToolbarExport("mermaid")}>
                      <FileCode2 size={16} /> Mermaid
                    </button>
                  </div>
                ) : null}
              </div>
              <button
                className={appMode === "planning" ? "toolbar-button toolbar-button--planning toolbar-button--active" : "toolbar-button toolbar-button--planning"}
                onClick={() => {
                  const nextMode: AppMode = appMode === "planning" ? "live" : "planning";
                  setAppMode(nextMode);
                  setSelection(null);
                  setStatus(nextMode === "planning" ? "Planning Mode" : "Live View");
                  appendDebugEvent("planning.mode", nextMode === "planning" ? "Planning Mode enabled" : "Live View enabled", "info", { mode: nextMode });
                }}
                title="Planning Mode"
              >
                <Plus size={18} /> Planning Mode
              </button>
              {updateNotice ? (
                <div className={`update-advisory update-advisory--${updateNotice.tone}`}>
                  <div>
                    <strong>{updateNotice.title}</strong>
                    <span>{updateNotice.message}</span>
                  </div>
                  {updateAdvisory?.target?.release_notes_url || updateAdvisory?.target?.download_url ? (
                    <button className="mini-icon-button" onClick={handleViewReleaseNotes} title="View release notes" aria-label="View release notes">
                      <ExternalLink size={15} />
                    </button>
                  ) : null}
                  <button className="mini-icon-button" onClick={() => void handleCopyUpdateCommand()} title="Copy update command" aria-label="Copy update command">
                    <Download size={15} />
                  </button>
                  <button className="mini-icon-button" onClick={handleRemindUpdateLater} title="Remind me later" aria-label="Remind me later">
                    <X size={15} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="topbar__right">
            <div className="search-box">
              <Search size={18} />
              <input ref={searchInputRef} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search tiles..." />
              {searchTerm ? (
                <button
                  className="search-box__clear"
                  type="button"
                  aria-label="Clear search"
                  title="Clear search"
                  onClick={() => {
                    setSearchTerm("");
                    searchInputRef.current?.focus();
                  }}
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>
            <button className="icon-button" onClick={handleOpenSettings} title="Settings">
              <Settings size={19} />
            </button>
          </div>
        </header>

        <main className="workspace">
          <aside className="sidebar">
            <section className={sidebarState.collapsed.tilePalette ? "sidebar-section sidebar-section--collapsed" : "sidebar-section"}>
              <button className="sidebar-section__header" type="button" aria-expanded={!sidebarState.collapsed.tilePalette} onClick={() => toggleSidebarSection("tilePalette")}>
                <span className="panel-title">Tile Palette</span>
                <ChevronDown className="sidebar-section__chevron" size={16} />
              </button>
              {sidebarState.collapsed.tilePalette ? (
                <div
                  className="tile-palette tile-palette--collapsed"
                  onWheel={handleCollapsedPaletteWheel}
                  onTouchStart={handleCollapsedPaletteTouchStart}
                  onTouchEnd={handleCollapsedPaletteTouchEnd}
                >
                  <button className="palette-cycle-button" type="button" onClick={() => cycleCollapsedPalette(-1)} title="Previous tile type" aria-label="Previous tile type">
                    <ChevronUp size={16} />
                  </button>
                  {collapsedPaletteTypes.map(({ slot, type, interactive }) => {
                    const config = TILE_TYPE_CONFIG[type];
                    const Icon = config.icon;
                    const paletteAccent = themePaletteId === "blueprint" ? getTileColor(type, "cyber") : getTileColor(type, themePaletteId);
                    const style = { "--tile-accent": paletteAccent } as CSSProperties;
                    return interactive ? (
                      <button
                        key={`${slot}-${type}`}
                        className="palette-item palette-item--collapsed palette-item--active-slot"
                        style={style}
                        draggable
                        onClick={() => handlePaletteClick(type)}
                        onDragStart={(event) => handlePaletteDragStart(event, type)}
                        onDragEnd={handlePaletteDragEnd}
                        title={`Click to create ${config.label}; drag onto the map to place it.`}
                      >
                        <Icon size={19} />
                        {config.label}
                      </button>
                    ) : (
                      <div key={`${slot}-${type}`} className="palette-item palette-item--collapsed palette-item--reference" style={style} aria-hidden="true">
                        <Icon size={19} />
                        {config.label}
                      </div>
                    );
                  })}
                  <button className="palette-cycle-button" type="button" onClick={() => cycleCollapsedPalette(1)} title="Next tile type" aria-label="Next tile type">
                    <ChevronDown size={16} />
                  </button>
                </div>
              ) : (
                <div className="tile-palette">
                  {TILE_TYPES.map((type) => {
                    const config = TILE_TYPE_CONFIG[type];
                    const Icon = config.icon;
                    const paletteAccent = themePaletteId === "blueprint" ? getTileColor(type, "cyber") : getTileColor(type, themePaletteId);
                    return (
                      <button
                        key={type}
                        className="palette-item"
                        style={{ "--tile-accent": paletteAccent } as CSSProperties}
                        draggable
                        onClick={() => handlePaletteClick(type)}
                        onDragStart={(event) => handlePaletteDragStart(event, type)}
                        onDragEnd={handlePaletteDragEnd}
                        title={`Click to create ${config.label}; drag onto the map to place it.`}
                      >
                        <Icon size={19} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="panel-title panel-title--spaced">Search Results</div>
            <div className="search-results">
              {searchTerm.trim() ? (
                searchResults.length ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.kind}-${result.id}`}
                      className={selection?.kind === result.kind && selection.id === result.id ? "search-result search-result--active" : "search-result"}
                      onClick={() => selectSearchResult(result)}
                    >
                      <span>{result.kind}</span>
                      <strong>{result.title}</strong>
                      <small>{result.detail}</small>
                    </button>
                  ))
                ) : (
                  <div className="warning-empty">No matches</div>
                )
              ) : (
                <div className="warning-empty">Use search to find tiles and relationships</div>
              )}
            </div>

            <section className={sidebarState.collapsed.views ? "sidebar-section sidebar-section--collapsed sidebar-section--spaced" : "sidebar-section sidebar-section--spaced"}>
              <button className="sidebar-section__header" type="button" aria-expanded={!sidebarState.collapsed.views} onClick={() => toggleSidebarSection("views")}>
                <span className="panel-title">Views</span>
                <ChevronDown className="sidebar-section__chevron" size={16} />
              </button>
              {!sidebarState.collapsed.views ? (
                <div className="sidebar-section__body">
                  <div className="view-list">
                    {atlas.views.map((view) => (
                      <button key={view.id} className={activeViewId === view.id ? "view-button view-button--active" : "view-button"} onClick={() => handleSelectView(view)}>
                        <Eye size={16} />
                        {view.title}
                      </button>
                    ))}
                  </div>
                  <div className="view-actions">
                    <button className="small-button" onClick={handleCreateView}>
                      <Plus size={15} /> New
                    </button>
                    <button className="small-button" onClick={handleEditView} disabled={!activeView}>
                      <Settings size={15} /> Edit
                    </button>
                    <button className="small-button small-button--danger" onClick={handleDeleteView} disabled={!activeView || atlas.views.length <= 1}>
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              ) : null}
            </section>

            <div className="panel-title panel-title--spaced">Template</div>
            <div className="segmented">
              <button className={layoutTemplate === "canvas_topology" ? "active" : ""} onClick={() => handleTemplateChange("canvas_topology")}>
                <LayoutDashboard size={15} /> Canvas
              </button>
              <button className={layoutTemplate === "layered_hierarchy" ? "active" : ""} onClick={() => handleTemplateChange("layered_hierarchy")}>
                <GitBranch size={15} /> Layered
              </button>
            </div>

            <section className={sidebarState.collapsed.filters ? "sidebar-section sidebar-section--collapsed sidebar-section--spaced" : "sidebar-section sidebar-section--spaced"}>
              <button className="sidebar-section__header" type="button" aria-expanded={!sidebarState.collapsed.filters} onClick={() => toggleSidebarSection("filters")}>
                <span className="panel-title">Filters</span>
                <ChevronDown className="sidebar-section__chevron" size={16} />
              </button>
              {!sidebarState.collapsed.filters ? (
                <div className="filter-grid">
                  {TILE_TYPES.map((type) => (
                    <label key={type} className="filter-check">
                      <input
                        type="checkbox"
                        checked={!activeView?.visible_types.length || activeView.visible_types.includes(type)}
                        onChange={() => handleToggleViewTileType(type)}
                      />
                      {TILE_TYPE_CONFIG[type].label}
                    </label>
                  ))}
                </div>
              ) : null}
            </section>

            <section className={sidebarState.collapsed.relationships ? "sidebar-section sidebar-section--collapsed sidebar-section--spaced" : "sidebar-section sidebar-section--spaced"}>
              <button className="sidebar-section__header" type="button" aria-expanded={!sidebarState.collapsed.relationships} onClick={() => toggleSidebarSection("relationships")}>
                <span className="panel-title">Relationships</span>
                <ChevronDown className="sidebar-section__chevron" size={16} />
              </button>
              {!sidebarState.collapsed.relationships ? (
                <div className="filter-grid filter-grid--links">
                  {LINK_TYPES.map((type) => (
                    <label key={type} className="filter-check">
                      <input
                        type="checkbox"
                        checked={!activeView?.visible_links.length || activeView.visible_links.includes(type)}
                        onChange={() => handleToggleViewLinkType(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              ) : null}
            </section>

            <div className="panel-title panel-title--spaced">Warnings</div>
            <div className="warning-list">
              {warnings.length ? (
                warnings.slice(0, 8).map((warning) => (
                  <button
                    key={warning.id}
                    className={`warning-item warning-item--${warning.severity}`}
                    onClick={() => {
                      if (warning.targetKind === "tile" && warning.targetId) selectTileAndFocus(warning.targetId);
                      if (warning.targetKind === "link" && warning.targetId) setSelection({ kind: "link", id: warning.targetId });
                    }}
                  >
                    {warning.message}
                  </button>
                ))
              ) : (
                <div className="warning-empty">No validation warnings</div>
              )}
              {warnings.length > 8 ? <div className="warning-empty">+{warnings.length - 8} more warnings</div> : null}
            </div>
          </aside>

          <section
            ref={canvasRef}
            className={`canvas-frame canvas-frame--${layoutTemplate}`}
            data-background={canvasBackgroundId}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            onDoubleClick={handleCanvasDoubleClick}
          >
            <div className="view-tabs">
              {atlas.views.map((view) => (
                <button key={view.id} className={activeViewId === view.id ? "active" : ""} onClick={() => handleSelectView(view)}>
                  {view.title}
                </button>
              ))}
            </div>
            <ReactFlow
              nodes={flowNodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={handleNodesChange}
              onConnect={handleConnect}
              onNodeDragStart={handleNodeDragStart}
              onNodeDragStop={handleNodeDragStop}
              onNodeClick={(_, node) => selectTileAndFocus(node.id)}
              onNodeContextMenu={handleNodeContextMenu}
              onEdgeClick={(_, edge) => setSelection({ kind: "link", id: edge.id })}
              onError={handleReactFlowError}
              onPaneClick={() => {
                setSelection(null);
                setStackContextMenu(null);
              }}
              nodesDraggable={isInteractive && layoutTemplate === "canvas_topology"}
              nodesConnectable={isInteractive}
              elementsSelectable
              fitView
              fitViewOptions={FIT_VIEW_OPTIONS}
              zoomOnDoubleClick={false}
              minZoom={0.2}
              maxZoom={1.8}
            >
              <Background color="var(--canvas-grid-line)" gap={20} size={1} />
              <MiniMap pannable zoomable nodeColor={(node) => getTileColor((node.data.tile as Tile).type, themePaletteId)} />
              <Controls fitViewOptions={FIT_VIEW_OPTIONS} onInteractiveChange={handleInteractiveChange} />
            </ReactFlow>
            <div className="status-strip">
              <span>{status}</span>
              <span>{visibleTiles.length} tiles</span>
              <span>{visibleLinks.length} links</span>
              <span>{appMode === "planning" ? "Planning Mode" : "Live View"}</span>
              {lifecycleCounts.plannedTiles || lifecycleCounts.plannedLinks ? <span>{lifecycleCounts.plannedTiles} planned tiles / {lifecycleCounts.plannedLinks} planned links</span> : null}
              {searchTerm.trim() ? <span>{searchResults.length} search results</span> : null}
              {brokenLinkCount > 0 ? <strong>{brokenLinkCount} broken links</strong> : <span>No broken links</span>}
              {warnings.length > 0 ? <strong>{warnings.length} warnings</strong> : null}
              {exportResults.markdown ? <span>Markdown ready</span> : null}
              {exportResults.yaml ? <span>YAML ready</span> : null}
              {exportResults.mermaid ? <span>Mermaid ready</span> : null}
            </div>
            {stackContextMenu ? (
              <div className="canvas-context-menu" style={{ left: stackContextMenu.x, top: stackContextMenu.y }}>
                {stackContextMenu.canStack ? (
                  <button onClick={() => handleStackSiblings(stackContextMenu.tileId)}>Stack sibling {TILE_TYPE_CONFIG[stackContextMenu.tileType].label} tiles</button>
                ) : null}
                {stackContextMenu.canStackMountChildren ? <button onClick={() => handleStackMountChildren(stackContextMenu.tileId)}>Stack mounted items</button> : null}
                {stackContextMenu.stackId ? (
                  <button
                    onClick={() => {
                      if (stackContextMenu.stackId) handleUnstack(stackContextMenu.stackId);
                    }}
                  >
                    Unstack
                  </button>
                ) : null}
                {!stackContextMenu.canStack && !stackContextMenu.canStackMountChildren && !stackContextMenu.stackId ? <span>No stack actions</span> : null}
              </div>
            ) : null}
          </section>

          <Inspector
            atlas={atlas}
            mode={appMode}
            selection={selection}
            onUpdateTile={handleUpdateTile}
            onUpdateStack={handleUpdateStack}
            onUnstack={handleUnstack}
            onDeleteTile={handleDeleteTile}
            onDuplicateTile={handleDuplicateTile}
            onAddSubtile={handleAddSubtile}
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

function emptyStackState(): StackState {
  return {
    stacks: [],
    hiddenMemberIds: new Set(),
    memberToRepresentative: new Map(),
    stackByRepresentative: new Map()
  };
}

function buildStackState(atlas: Atlas): StackState {
  const stacks = sanitizeStacks(atlas);
  const hiddenMemberIds = new Set<string>();
  const memberToRepresentative = new Map<string, string>();
  const stackByRepresentative = new Map<string, StackRenderInfo>();

  for (const stack of stacks) {
    const stackKind = stack.stack_kind ?? "sibling_type";
    for (const memberId of stack.member_ids) {
      memberToRepresentative.set(memberId, stack.representative_id);
      if (stackKind === "mount_children" || memberId !== stack.representative_id) hiddenMemberIds.add(memberId);
    }
    stackByRepresentative.set(stack.representative_id, {
      id: stack.id,
      kind: stackKind,
      badgeShape: stackKind === "mount_children" ? "hex" : "circle",
      count: stack.member_ids.length,
      name: stack.name,
      subtitle: stackKind === "mount_children" ? `${stack.member_ids.length} Mounted Items` : `${stack.member_ids.length} ${TILE_TYPE_CONFIG[stack.tile_type].label} tiles`
    });
  }

  return { stacks, hiddenMemberIds, memberToRepresentative, stackByRepresentative };
}

function withAtlasStacks(atlas: Atlas): Atlas {
  return { ...atlas, stacks: atlas.stacks ?? [] };
}

function sanitizeAtlasStacks(atlas: Atlas): Atlas {
  return { ...atlas, stacks: sanitizeStacks(atlas) };
}

function sanitizeStacks(atlas: Atlas): TileStack[] {
  const tileById = new Map(atlas.tiles.map((tile) => [tile.id, tile]));
  const usedIds = new Set<string>();
  const sanitized: TileStack[] = [];

  for (const stack of atlas.stacks ?? []) {
    const stackKind = stack.stack_kind ?? "sibling_type";
    const parent = tileById.get(stack.parent_id);
    if (!parent) continue;
    if (stackKind === "mount_children") {
      if (parent.type !== "mount" || stack.representative_id !== parent.id) continue;
      const memberIds = stack.member_ids.filter((memberId, index, allIds) => {
        const member = tileById.get(memberId);
        return Boolean(member && member.parent === parent.id && allIds.indexOf(memberId) === index);
      });
      if (memberIds.length < 2) continue;
      const id = uniqueId(stack.id, usedIds);
      usedIds.add(id);
      sanitized.push({
        ...stack,
        id,
        stack_kind: "mount_children",
        tile_type: "mount",
        member_ids: memberIds,
        representative_id: parent.id,
        name: stack.name_is_custom ? stack.name : defaultMountStackName(memberIds.length),
        name_is_custom: Boolean(stack.name_is_custom)
      });
      continue;
    }
    const memberIds = stack.member_ids.filter((memberId, index, allIds) => {
      const member = tileById.get(memberId);
      return Boolean(member && member.parent === stack.parent_id && member.type === stack.tile_type && allIds.indexOf(memberId) === index);
    });
    if (memberIds.length < 2) continue;
    const members = memberIds.map((memberId) => tileById.get(memberId)).filter((tile): tile is Tile => Boolean(tile));
    const representative = memberIds.includes(stack.representative_id) ? tileById.get(stack.representative_id) : closestTileToParent(members, parent);
    if (!representative) continue;
    const id = uniqueId(stack.id, usedIds);
    usedIds.add(id);
    sanitized.push({
      ...stack,
      id,
      stack_kind: "sibling_type",
      member_ids: memberIds,
      representative_id: representative.id,
      name: stack.name_is_custom ? stack.name : defaultStackName(memberIds.length, stack.tile_type),
      name_is_custom: Boolean(stack.name_is_custom)
    });
  }

  return sanitized;
}

function canStackSiblingTiles(tile: Tile, tiles: Tile[]): boolean {
  if (!tile.parent) return false;
  return tiles.filter((candidate) => candidate.parent === tile.parent && candidate.type === tile.type).length >= 2;
}

function canStackMountChildren(tile: Tile, tiles: Tile[]): boolean {
  return tile.type === "mount" && tiles.filter((candidate) => candidate.parent === tile.id).length >= 2;
}

function closestTileToParent(members: Tile[], parent: Tile): Tile {
  return members.reduce((closest, member) => (distanceSquared(member.position, parent.position) < distanceSquared(closest.position, parent.position) ? member : closest), members[0]);
}

function distanceSquared(left: { x: number; y: number }, right: { x: number; y: number }): number {
  return (left.x - right.x) ** 2 + (left.y - right.y) ** 2;
}

function defaultStackName(count: number, tileType: TileType): string {
  const label = TILE_TYPE_CONFIG[tileType].label;
  return `${count} ${label}${label.endsWith("s") ? "" : "s"}`;
}

function defaultMountStackName(count: number): string {
  return `${count} Mounted Items`;
}

function uniqueId(baseId: string, usedIds: Set<string>): string {
  let candidate = baseId;
  let index = 2;
  while (usedIds.has(candidate)) {
    candidate = `${baseId}_${index}`;
    index += 1;
  }
  return candidate;
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

function normalizePaletteIndex(index: number): number {
  const count = TILE_TYPES.length;
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

function resolveSourcePort(link: Link): LinkSourcePort {
  return link.from_port ?? (link.type === "contains" ? "child" : "out");
}

function resolveTargetPort(link: Link): LinkTargetPort {
  return link.to_port ?? (link.type === "contains" ? "parent" : "in");
}

function resolveLifecycle(item: Tile | Link | undefined | null): Lifecycle {
  return item?.lifecycle === "planned" ? "planned" : "live";
}

function isLifecycleEditable(lifecycle: Lifecycle, mode: AppMode): boolean {
  return mode === "planning" ? lifecycle === "planned" : lifecycle === "live";
}

function canConnectTiles(sourceTile: Tile, targetTile: Tile, mode: AppMode): boolean {
  if (mode === "planning") {
    return resolveLifecycle(sourceTile) === "planned" || resolveLifecycle(targetTile) === "planned";
  }
  return resolveLifecycle(sourceTile) === "live" && resolveLifecycle(targetTile) === "live";
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

function isEditableNodeChange(change: NodeChange, nodes: Node[], mode: AppMode): boolean {
  if (!("id" in change)) return true;
  const node = nodes.find((candidate) => candidate.id === change.id);
  return isLifecycleEditable(resolveLifecycle(node?.data?.tile as Tile | undefined), mode);
}

function asSourcePort(value: string | null | undefined): LinkSourcePort {
  return value === "child" ? "child" : "out";
}

function asTargetPort(value: string | null | undefined): LinkTargetPort {
  return value === "parent" ? "parent" : "in";
}

function createId(prefix: string, label: string, existingIds: string[]): string {
  const base = `${prefix}_${label}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  let candidate = base || `${prefix}_${Date.now()}`;
  let index = 2;
  while (existingIds.includes(candidate)) {
    candidate = `${base}_${index}`;
    index += 1;
  }
  return candidate;
}

function computeLayeredPositions(tiles: Tile[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const byParent = new Map<string, Tile[]>();
  const roots = tiles.filter((tile) => !tile.parent || !tiles.some((candidate) => candidate.id === tile.parent));

  for (const tile of tiles) {
    if (!tile.parent) continue;
    const siblings = byParent.get(tile.parent) ?? [];
    siblings.push(tile);
    byParent.set(tile.parent, siblings);
  }

  function place(tile: Tile, depth: number, row: { value: number }) {
    positions.set(tile.id, { x: 140 + depth * 330, y: 120 + row.value * 138 });
    row.value += 1;
    for (const child of byParent.get(tile.id) ?? []) {
      place(child, depth + 1, row);
    }
  }

  roots.forEach((tile, index) => {
    const row = { value: index === 0 ? 0 : positions.size + 1 };
    place(tile, 0, row);
  });

  return positions;
}

function cloneFields(fields: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(fields)) as Record<string, unknown>;
}

function toggleViewSelection<T extends string>(current: T[], all: readonly T[], value: T): T[] {
  const selected = new Set(current.length ? current : all);
  if (selected.has(value)) {
    selected.delete(value);
  } else {
    selected.add(value);
  }
  if (selected.size === 0) return current;
  if (selected.size === all.length) return [];
  return all.filter((item) => selected.has(item));
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
