import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type Edge,
  type FitViewOptions,
  type Node,
  type NodeChange
} from "@xyflow/react";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { FamilyNode } from "./FamilyNode";
import { TileNode } from "./TileNode";
import { TILE_TYPE_CONFIG } from "../lib/constants";
import { getTileColor } from "../lib/theme";
import type { AppMode, CanvasBackgroundId, ExportFormat, Family, LayoutTemplate, Link, ThemePaletteId, Tile, View } from "../types/atlas";
import { LayerBar } from "./LayerBar";

const nodeTypes = { tileNode: TileNode, familyNode: FamilyNode };

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
  themePaletteId: ThemePaletteId;
  viewBarOpen: boolean;
  views: View[];
  visibleLinks: Link[];
  visibleTiles: Tile[];
  warningsCount: number;
  onCanvasDoubleClick: (event: React.MouseEvent<HTMLElement>) => void;
  onCanvasDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onCanvasDrop: (event: React.DragEvent<HTMLElement>) => void;
  onConnect: (connection: Connection) => void;
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
  themePaletteId,
  viewBarOpen,
  views,
  visibleLinks,
  visibleTiles,
  warningsCount,
  onCanvasDoubleClick,
  onCanvasDragOver,
  onCanvasDrop,
  onConnect,
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
        <Background color="var(--canvas-grid-line)" gap={20} size={1} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => {
            const family = node.data.family as Family | undefined;
            if (family) return family.color || "#38a3ff";
            return getTileColor((node.data.tile as Tile).type, themePaletteId);
          }}
        />
        <Controls fitViewOptions={fitViewOptions} onInteractiveChange={onInteractiveChange} />
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
