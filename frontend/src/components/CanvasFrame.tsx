import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  type Connection,
  type Edge,
  type FitViewOptions,
  type Node,
  type NodeChange
} from "@xyflow/react";
import { Spline, Workflow } from "lucide-react";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { AvoidTilesEdge } from "./AvoidTilesEdge";
import { FamilyNode } from "./FamilyNode";
import { TileNode } from "./TileNode";
import { TILE_TYPE_CONFIG } from "../lib/constants";
import type { ConnectorRoutingMode } from "../lib/edgeRouting";
import { getCanvasBackground, getTileVisualTokens, type CanvasBackgroundId, type CanvasThemeId } from "../appearance";
import type { AppMode, ExportFormat, Family, LayoutTemplate, Link, Tile, View } from "../types/atlas";
import { LayerBar } from "./LayerBar";

const nodeTypes = { tileNode: TileNode, familyNode: FamilyNode };
const edgeTypes = { avoidTiles: AvoidTilesEdge };

export interface StackContextMenuView {
  x: number;
  y: number;
  tileId: string;
  stackId?: string;
  canStack: boolean;
  canStackMountChildren: boolean;
  tileType: Tile["type"];
}

interface CanvasFrameProps {
  activeViewId: string;
  appMode: AppMode;
  brokenLinkCount: number;
  canvasBackgroundId: CanvasBackgroundId;
  canvasRef: RefObject<HTMLElement>;
  connectorRoutingMode: ConnectorRoutingMode;
  edges: Edge[];
  exportResults: Partial<Record<ExportFormat, unknown>>;
  fitViewOptions: FitViewOptions;
  flowNodes: Node[];
  isInteractive: boolean;
  layoutTemplate: LayoutTemplate;
  lifecycleCounts: { plannedTiles: number; plannedLinks: number };
  searchResultsCount: number;
  searchTerm: string;
  stackContextMenu: StackContextMenuView | null;
  status: string;
  canvasThemeId: CanvasThemeId;
  viewBarOpen: boolean;
  views: View[];
  visibleLinks: Link[];
  visibleTiles: Tile[];
  warningsCount: number;
  onCanvasDoubleClick: (event: React.MouseEvent<HTMLElement>) => void;
  onCanvasDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onCanvasDrop: (event: React.DragEvent<HTMLElement>) => void;
  onConnect: (connection: Connection) => void;
  onConnectorRoutingModeToggle: () => void;
  onEdgeClick: (edge: Edge) => void;
  onInteractiveChange: (interactiveStatus: boolean) => void;
  onNodeClick: (node: Node) => void;
  onNodeContextMenu: (event: ReactMouseEvent, node: Node) => void;
  onNodeDragStart: (event: MouseEvent | TouchEvent, node: Node, draggedNodes: Node[]) => void;
  onNodeDragStop: (event: MouseEvent | TouchEvent, node: Node, draggedNodes: Node[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onPaneClick: () => void;
  onReactFlowError: (id: string, message: string) => void;
  onSelectView: (view: View) => void;
  onStackMountChildren: (tileId: string) => void;
  onStackSiblings: (tileId: string) => void;
  onToggleViewBar: () => void;
  onUnstack: (stackId: string) => void;
}

export function CanvasFrame({
  activeViewId,
  appMode,
  brokenLinkCount,
  canvasBackgroundId,
  canvasRef,
  connectorRoutingMode,
  edges,
  exportResults,
  fitViewOptions,
  flowNodes,
  isInteractive,
  layoutTemplate,
  lifecycleCounts,
  searchResultsCount,
  searchTerm,
  stackContextMenu,
  status,
  canvasThemeId,
  viewBarOpen,
  views,
  visibleLinks,
  visibleTiles,
  warningsCount,
  onCanvasDoubleClick,
  onCanvasDragOver,
  onCanvasDrop,
  onConnect,
  onConnectorRoutingModeToggle,
  onEdgeClick,
  onInteractiveChange,
  onNodeClick,
  onNodeContextMenu,
  onNodeDragStart,
  onNodeDragStop,
  onNodesChange,
  onPaneClick,
  onReactFlowError,
  onSelectView,
  onStackMountChildren,
  onStackSiblings,
  onToggleViewBar,
  onUnstack
}: CanvasFrameProps) {
  const canvasBackground = getCanvasBackground(canvasBackgroundId);
  const overlay = canvasBackground.reactFlowOverlay;
  return (
    <section
      ref={canvasRef}
      className={`canvas-frame canvas-frame--${layoutTemplate}`}
      data-background={canvasBackgroundId}
      onDragOver={onCanvasDragOver}
      onDrop={onCanvasDrop}
      onDoubleClick={onCanvasDoubleClick}
    >
      <LayerBar activeViewId={activeViewId} viewBarOpen={viewBarOpen} views={views} onSelectView={onSelectView} onToggleViewBar={onToggleViewBar} />
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(_, node) => onNodeClick(node)}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeClick={(_, edge) => onEdgeClick(edge)}
        onError={onReactFlowError}
        onPaneClick={onPaneClick}
        nodesDraggable={isInteractive && layoutTemplate === "canvas_topology"}
        nodesConnectable={isInteractive}
        elementsSelectable
        fitView
        fitViewOptions={fitViewOptions}
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={1.8}
      >
        <Background
          color={overlay.color}
          gap={overlay.gap}
          size={overlay.size}
          variant={overlay.variant as BackgroundVariant}
          style={{ opacity: overlay.opacity }}
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => {
            const family = node.data.family as Family | undefined;
            if (family) return family.color || "#38a3ff";
            return getTileVisualTokens((node.data.tile as Tile).type, canvasThemeId).accentColor;
          }}
        />
        <Controls fitViewOptions={fitViewOptions} onInteractiveChange={onInteractiveChange} />
        <Panel position="bottom-left" className="connector-routing-panel">
          <button
            className="connector-routing-toggle"
            type="button"
            title={connectorRoutingMode === "avoid_tiles" ? "Connector routing: Avoid Tiles. Switch to Curved." : "Connector routing: Curved. Switch to Avoid Tiles."}
            aria-label={connectorRoutingMode === "avoid_tiles" ? "Switch connector routing to Curved" : "Switch connector routing to Avoid Tiles"}
            aria-pressed={connectorRoutingMode === "avoid_tiles"}
            onClick={onConnectorRoutingModeToggle}
          >
            {connectorRoutingMode === "avoid_tiles" ? <Spline size={16} /> : <Workflow size={16} />}
          </button>
        </Panel>
      </ReactFlow>
      <div className="status-strip">
        <span>{status}</span>
        <span>{visibleTiles.length} tiles</span>
        <span>{visibleLinks.length} links</span>
        <span>{appMode === "planning" ? "Planning Mode" : "Live View"}</span>
        {lifecycleCounts.plannedTiles || lifecycleCounts.plannedLinks ? <span>{lifecycleCounts.plannedTiles} planned tiles / {lifecycleCounts.plannedLinks} planned links</span> : null}
        {searchTerm.trim() ? <span>{searchResultsCount} search results</span> : null}
        {brokenLinkCount > 0 ? <strong>{brokenLinkCount} broken links</strong> : <span>No broken links</span>}
        {warningsCount > 0 ? <strong>{warningsCount} warnings</strong> : null}
        {exportResults.markdown ? <span>Markdown ready</span> : null}
        {exportResults.yaml ? <span>YAML ready</span> : null}
        {exportResults.mermaid ? <span>Mermaid ready</span> : null}
      </div>
      {stackContextMenu ? (
        <div className="canvas-context-menu" style={{ left: stackContextMenu.x, top: stackContextMenu.y }}>
          {stackContextMenu.canStack ? (
            <button onClick={() => onStackSiblings(stackContextMenu.tileId)}>Stack sibling {TILE_TYPE_CONFIG[stackContextMenu.tileType].label} tiles</button>
          ) : null}
          {stackContextMenu.canStackMountChildren ? <button onClick={() => onStackMountChildren(stackContextMenu.tileId)}>Stack mounted items</button> : null}
          {stackContextMenu.stackId ? (
            <button
              onClick={() => {
                if (stackContextMenu.stackId) onUnstack(stackContextMenu.stackId);
              }}
            >
              Unstack
            </button>
          ) : null}
          {!stackContextMenu.canStack && !stackContextMenu.canStackMountChildren && !stackContextMenu.stackId ? <span>No stack actions</span> : null}
        </div>
      ) : null}
    </section>
  );
}
