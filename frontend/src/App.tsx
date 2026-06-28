import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type Node,
  type NodeChange
} from "@xyflow/react";
import {
  Download,
  Eye,
  FileCode2,
  FileText,
  GitBranch,
  LayoutDashboard,
  Loader2,
  Plus,
  Save,
  Search,
  Settings,
  Upload
} from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { Inspector } from "./components/Inspector";
import { TileNode } from "./components/TileNode";
import { loadAtlas, saveAtlas } from "./lib/api";
import { BRAND_ICON, DEFAULT_FIELDS, LINK_COLOR, LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "./lib/constants";
import { createSeedAtlas } from "./lib/seed";
import type { Atlas, LayoutTemplate, Link, LinkType, Selection, Tile, TileType, View } from "./types/atlas";

const nodeTypes = { tileNode: TileNode };

function App() {
  const [atlas, setAtlas] = useState<Atlas | null>(null);
  const [activeViewId, setActiveViewId] = useState("everything");
  const [layoutTemplate, setLayoutTemplate] = useState<LayoutTemplate>("canvas_topology");
  const [selection, setSelection] = useState<Selection>(null);
  const [newTileType, setNewTileType] = useState<TileType>("node");
  const [hiddenTypes, setHiddenTypes] = useState<Set<TileType>>(new Set());
  const [hiddenLinks, setHiddenLinks] = useState<Set<LinkType>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("Loading atlas...");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAtlas()
      .then((nextAtlas) => {
        setAtlas(nextAtlas);
        const defaultView = nextAtlas.views.find((view) => view.id === "everything") ?? nextAtlas.views[0];
        if (defaultView) {
          setActiveViewId(defaultView.id);
          setLayoutTemplate(defaultView.layout_template);
        }
        setStatus("Atlas loaded");
      })
      .catch((error) => {
        console.error(error);
        setStatus("Unable to load atlas");
      });
  }, []);

  const activeView = useMemo(() => {
    if (!atlas) return null;
    return atlas.views.find((view) => view.id === activeViewId) ?? atlas.views[0] ?? null;
  }, [atlas, activeViewId]);

  const visibleTiles = useMemo(() => {
    if (!atlas) return [];
    const query = searchTerm.trim().toLowerCase();
    return atlas.tiles.filter((tile) => {
      const allowedByView = !activeView?.visible_types.length || activeView.visible_types.includes(tile.type);
      const allowedByFilter = !hiddenTypes.has(tile.type);
      const searchable = `${tile.title} ${tile.type} ${(tile.tags ?? []).join(" ")} ${JSON.stringify(tile.fields)}`.toLowerCase();
      const allowedBySearch = !query || searchable.includes(query);
      return allowedByView && allowedByFilter && allowedBySearch;
    });
  }, [activeView, atlas, hiddenTypes, searchTerm]);

  const visibleTileIds = useMemo(() => new Set(visibleTiles.map((tile) => tile.id)), [visibleTiles]);

  const visibleLinks = useMemo(() => {
    if (!atlas) return [];
    return atlas.links.filter((link) => {
      const allowedByView = !activeView?.visible_links.length || activeView.visible_links.includes(link.type);
      const allowedByFilter = !hiddenLinks.has(link.type);
      return allowedByView && allowedByFilter && visibleTileIds.has(link.from) && visibleTileIds.has(link.to);
    });
  }, [activeView, atlas, hiddenLinks, visibleTileIds]);

  const nodes: Node[] = useMemo(() => {
    if (!atlas) return [];
    const layoutPositions = layoutTemplate === "layered_hierarchy" ? computeLayeredPositions(visibleTiles) : new Map<string, { x: number; y: number }>();

    return visibleTiles.map((tile) => {
      const parentTitle = tile.parent ? atlas.tiles.find((candidate) => candidate.id === tile.parent)?.title : undefined;
      const position = layoutPositions.get(tile.id) ?? tile.position;
      return {
        id: tile.id,
        type: "tileNode",
        position,
        draggable: layoutTemplate === "canvas_topology",
        data: { tile, parentTitle }
      };
    });
  }, [atlas, layoutTemplate, visibleTiles]);

  const edges: Edge[] = useMemo(() => {
    return visibleLinks.map((link) => ({
      id: link.id,
      source: link.from,
      target: link.to,
      label: link.label || link.type,
      animated: ["calls", "controls", "fails_if"].includes(link.type),
      markerEnd: link.directional === false ? undefined : { type: MarkerType.ArrowClosed },
      style: {
        stroke: LINK_COLOR[link.type],
        strokeWidth: 2
      },
      labelStyle: {
        fill: "#f8fafc",
        fontSize: 12,
        fontWeight: 700
      },
      labelBgStyle: {
        fill: "rgba(5, 10, 22, 0.88)",
        fillOpacity: 0.9
      }
    }));
  }, [visibleLinks]);

  const updateAtlas = useCallback((updater: (current: Atlas) => Atlas) => {
    setAtlas((current) => (current ? updater(current) : current));
  }, []);

  const handleSave = useCallback(async () => {
    if (!atlas) return;
    setIsSaving(true);
    setStatus("Saving atlas...");
    try {
      const saved = await saveAtlas(atlas);
      setAtlas(saved);
      setStatus("Atlas saved");
    } catch (error) {
      console.error(error);
      setStatus("Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [atlas]);

  const handleCreateTile = useCallback(
    (parentId?: string) => {
      if (!atlas) return;
      const title = window.prompt("Tile title");
      if (!title) return;
      const type = parentId ? chooseTileType(newTileType) : newTileType;
      if (!type) return;
      const tileId = createId(type, title, atlas.tiles.map((tile) => tile.id));
      const parentTile = parentId ? atlas.tiles.find((tile) => tile.id === parentId) : null;
      const tile: Tile = {
        id: tileId,
        type,
        title,
        parent: parentId ?? null,
        position: parentTile ? { x: parentTile.position.x + 280, y: parentTile.position.y + 120 } : { x: 180 + atlas.tiles.length * 24, y: 160 + atlas.tiles.length * 18 },
        size: { width: 240, height: 132 },
        fields: { ...DEFAULT_FIELDS[type] },
        notes: "",
        tags: []
      };
      const containsLink: Link | null = parentId
        ? {
            id: createId("link_contains", `${parentId}_${tileId}`, atlas.links.map((link) => link.id)),
            from: parentId,
            to: tileId,
            type: "contains",
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
    },
    [atlas, newTileType, updateAtlas]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!atlas || !connection.source || !connection.target) return;
      const type = chooseLinkType("depends_on");
      if (!type) return;
      const label = window.prompt("Relationship label", type.replaceAll("_", " ")) ?? type;
      const link: Link = {
        id: createId("link", `${connection.source}_${connection.target}_${type}`, atlas.links.map((candidate) => candidate.id)),
        from: connection.source,
        to: connection.target,
        type,
        label,
        notes: "",
        directional: true
      };
      updateAtlas((current) => ({ ...current, links: [...current.links, link] }));
      setSelection({ kind: "link", id: link.id });
      setStatus("Relationship created");
    },
    [atlas, updateAtlas]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (layoutTemplate !== "canvas_topology") return;
      const positionChanges = changes.filter((change) => change.type === "position" && change.position);
      if (!positionChanges.length) return;
      updateAtlas((current) => ({
        ...current,
        tiles: current.tiles.map((tile) => {
          const change = positionChanges.find((candidate) => candidate.id === tile.id);
          return change?.type === "position" && change.position ? { ...tile, position: change.position } : tile;
        })
      }));
    },
    [layoutTemplate, updateAtlas]
  );

  const handleUpdateTile = useCallback(
    (tile: Tile) => {
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
    },
    [updateAtlas]
  );

  const handleDeleteTile = useCallback(
    (tileId: string) => {
      if (!window.confirm("Delete this tile and its relationships?")) return;
      updateAtlas((current) => ({
        ...current,
        tiles: current.tiles.filter((tile) => tile.id !== tileId).map((tile) => (tile.parent === tileId ? { ...tile, parent: null } : tile)),
        links: current.links.filter((link) => link.from !== tileId && link.to !== tileId)
      }));
      setSelection(null);
      setStatus("Tile deleted");
    },
    [updateAtlas]
  );

  const handleUpdateLink = useCallback(
    (link: Link) => {
      updateAtlas((current) => ({
        ...current,
        links: current.links.map((candidate) => (candidate.id === link.id ? link : candidate))
      }));
      setStatus("Relationship updated");
    },
    [updateAtlas]
  );

  const handleDeleteLink = useCallback(
    (linkId: string) => {
      updateAtlas((current) => ({ ...current, links: current.links.filter((link) => link.id !== linkId) }));
      setSelection(null);
      setStatus("Relationship deleted");
    },
    [updateAtlas]
  );

  const handleSelectView = useCallback(
    (view: View) => {
      setActiveViewId(view.id);
      setLayoutTemplate(view.layout_template);
      setSelection(null);
      setStatus(`View: ${view.title}`);
    },
    []
  );

  const handleTemplateChange = useCallback(
    (nextTemplate: LayoutTemplate) => {
      setLayoutTemplate(nextTemplate);
      updateAtlas((current) => ({
        ...current,
        views: current.views.map((view) => (view.id === activeViewId ? { ...view, layout_template: nextTemplate } : view))
      }));
      setStatus(nextTemplate === "canvas_topology" ? "Canvas topology template" : "Layered hierarchy template");
    },
    [activeViewId, updateAtlas]
  );

  const handleLoadSeed = useCallback(() => {
    if (!window.confirm("Replace the current unsaved atlas with optional CTDC sample data?")) return;
    const seed = createSeedAtlas();
    setAtlas(seed);
    setActiveViewId("everything");
    setLayoutTemplate("canvas_topology");
    setSelection(null);
    setStatus("CTDC sample loaded. Save to persist it.");
  }, []);

  const brokenLinkCount = atlas
    ? atlas.links.filter((link) => !atlas.tiles.some((tile) => tile.id === link.from) || !atlas.tiles.some((tile) => tile.id === link.to)).length
    : 0;

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
    <ReactFlowProvider>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand__mark">
              <BrandIcon size={28} />
            </div>
            <div>
              <strong>CTRoadmap</strong>
              <span>Local Infrastructure Atlas</span>
            </div>
          </div>
          <button className="primary-button" onClick={() => handleCreateTile()}>
            <Plus size={18} /> New Tile
          </button>
          <select className="toolbar-select" value={newTileType} onChange={(event) => setNewTileType(event.target.value as TileType)}>
            {TILE_TYPES.map((type) => (
              <option key={type} value={type}>
                {TILE_TYPE_CONFIG[type].label}
              </option>
            ))}
          </select>
          <button className="toolbar-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Save
          </button>
          <button className="toolbar-button" onClick={handleLoadSeed}>
            <Upload size={18} /> Load Seed
          </button>
          <button className="toolbar-button" disabled title="Phase 2">
            <FileText size={18} /> Export Markdown
          </button>
          <button className="toolbar-button" disabled title="Phase 2">
            <Download size={18} /> Export YAML
          </button>
          <button className="toolbar-button" disabled title="Phase 2">
            <FileCode2 size={18} /> Export Mermaid
          </button>
          <div className="search-box">
            <Search size={18} />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search tiles..." />
          </div>
          <button className="icon-button" disabled title="Settings planned">
            <Settings size={19} />
          </button>
        </header>

        <main className="workspace">
          <aside className="sidebar">
            <div className="panel-title">Tile Palette</div>
            <div className="tile-palette">
              {TILE_TYPES.map((type) => {
                const config = TILE_TYPE_CONFIG[type];
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    className={`palette-item ${newTileType === type ? "palette-item--active" : ""}`}
                    style={{ "--tile-accent": config.color } as CSSProperties}
                    onClick={() => setNewTileType(type)}
                  >
                    <Icon size={19} />
                    {config.label}
                  </button>
                );
              })}
            </div>

            <div className="panel-title panel-title--spaced">Views</div>
            <div className="view-list">
              {atlas.views.map((view) => (
                <button key={view.id} className={activeViewId === view.id ? "view-button view-button--active" : "view-button"} onClick={() => handleSelectView(view)}>
                  <Eye size={16} />
                  {view.title}
                </button>
              ))}
            </div>

            <div className="panel-title panel-title--spaced">Template</div>
            <div className="segmented">
              <button className={layoutTemplate === "canvas_topology" ? "active" : ""} onClick={() => handleTemplateChange("canvas_topology")}>
                <LayoutDashboard size={15} /> Canvas
              </button>
              <button className={layoutTemplate === "layered_hierarchy" ? "active" : ""} onClick={() => handleTemplateChange("layered_hierarchy")}>
                <GitBranch size={15} /> Layered
              </button>
            </div>

            <div className="panel-title panel-title--spaced">Filters</div>
            <div className="filter-grid">
              {TILE_TYPES.map((type) => (
                <label key={type} className="filter-check">
                  <input
                    type="checkbox"
                    checked={!hiddenTypes.has(type)}
                    onChange={() => setHiddenTypes((current) => toggleSet(current, type))}
                  />
                  {TILE_TYPE_CONFIG[type].label}
                </label>
              ))}
            </div>

            <div className="panel-title panel-title--spaced">Relationships</div>
            <div className="filter-grid filter-grid--links">
              {LINK_TYPES.map((type) => (
                <label key={type} className="filter-check">
                  <input
                    type="checkbox"
                    checked={!hiddenLinks.has(type)}
                    onChange={() => setHiddenLinks((current) => toggleSet(current, type))}
                  />
                  {type}
                </label>
              ))}
            </div>
          </aside>

          <section className={`canvas-frame canvas-frame--${layoutTemplate}`}>
            <div className="view-tabs">
              {atlas.views.map((view) => (
                <button key={view.id} className={activeViewId === view.id ? "active" : ""} onClick={() => handleSelectView(view)}>
                  {view.title}
                </button>
              ))}
            </div>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={handleNodesChange}
              onConnect={handleConnect}
              onNodeClick={(_, node) => setSelection({ kind: "tile", id: node.id })}
              onEdgeClick={(_, edge) => setSelection({ kind: "link", id: edge.id })}
              onPaneClick={() => setSelection(null)}
              fitView
              minZoom={0.2}
              maxZoom={1.8}
            >
              <Background color="#1f3a55" gap={20} size={1} />
              <MiniMap pannable zoomable nodeColor={(node) => TILE_TYPE_CONFIG[(node.data.tile as Tile).type].color} />
              <Controls />
            </ReactFlow>
            <div className="status-strip">
              <span>{status}</span>
              <span>{visibleTiles.length} tiles</span>
              <span>{visibleLinks.length} links</span>
              {brokenLinkCount > 0 ? <strong>{brokenLinkCount} broken links</strong> : <span>No broken links</span>}
            </div>
          </section>

          <Inspector
            atlas={atlas}
            selection={selection}
            onUpdateTile={handleUpdateTile}
            onDeleteTile={handleDeleteTile}
            onAddSubtile={handleCreateTile}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
          />
        </main>
      </div>
    </ReactFlowProvider>
  );
}

function chooseTileType(fallback: TileType): TileType | null {
  const value = window.prompt(`Tile type (${TILE_TYPES.join(", ")})`, fallback);
  if (!value) return null;
  return TILE_TYPES.includes(value as TileType) ? (value as TileType) : fallback;
}

function chooseLinkType(fallback: LinkType): LinkType | null {
  const value = window.prompt(`Relationship type (${LINK_TYPES.join(", ")})`, fallback);
  if (!value) return null;
  return LINK_TYPES.includes(value as LinkType) ? (value as LinkType) : fallback;
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

function toggleSet<T>(current: Set<T>, value: T): Set<T> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
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

export default App;
