import { MarkerType, type Edge, type Node, type NodeChange } from "@xyflow/react";
import { getLinkColor, getTileColor } from "./theme";
import { isLifecycleEditable, resolveLifecycle, resolveSourcePort, resolveTargetPort, type StackState } from "./atlasSelectors";
import type { ConnectorRoutingMode, RoutingRect } from "./edgeRouting";
import type { AppMode, Atlas, Family, LayoutTemplate, Link, ThemePaletteId, Tile } from "../types/atlas";

export interface GraphMappingOptions {
  appMode: AppMode;
  atlas: Atlas | null;
  childrenByParent: Map<string, Tile[]>;
  isInteractive: boolean;
  layoutTemplate: LayoutTemplate;
  selection: { kind: string; id: string } | null;
  stackState: StackState;
  themePaletteId: ThemePaletteId;
  visibleTiles: Tile[];
  visibleLinks: Link[];
  onFocusFamily: (family: Family) => void;
  onResizeFamily: (familyId: string, size: { width: number; height: number }) => void;
}

export interface EdgeMappingOptions {
  connectorRoutingMode?: ConnectorRoutingMode;
  routingObstacles?: RoutingRect[];
}

export function mapAtlasToNodes({
  appMode,
  atlas,
  childrenByParent,
  isInteractive,
  layoutTemplate,
  selection,
  stackState,
  themePaletteId,
  visibleTiles,
  onFocusFamily,
  onResizeFamily
}: GraphMappingOptions): Node[] {
  if (!atlas) return [];
  const layoutPositions = layoutTemplate === "layered_hierarchy" ? computeLayeredPositions(visibleTiles) : new Map<string, { x: number; y: number }>();
  const familyNodes: Node[] =
    layoutTemplate === "canvas_topology"
      ? [...(atlas.families ?? [])]
          .sort((left, right) => left.order - right.order)
          .map((family) => ({
            id: familyNodeId(family.id),
            type: "familyNode",
            className: "family-flow-node",
            position: family.position,
            draggable: isInteractive,
            dragHandle: ".family-node__header",
            connectable: false,
            selectable: true,
            selected: selection?.kind === "family" && selection.id === family.id,
            zIndex: Math.max(0, Math.min(100, family.order)),
            style: {
              width: family.size.width,
              height: family.size.height
            },
            data: {
              family,
              memberCount: family.member_tile_ids.filter((memberId) => atlas.tiles.some((tile) => tile.id === memberId)).length,
              onResizeFamily,
              onFocusFamily
            }
          }))
      : [];

  const tileNodes = visibleTiles.map((tile) => {
    const parentTitle = tile.parent ? atlas.tiles.find((candidate) => candidate.id === tile.parent)?.title : undefined;
    const position = layoutPositions.get(tile.id) ?? tile.position;
    const lifecycle = resolveLifecycle(tile);
    const editable = isLifecycleEditable(lifecycle, appMode);
    const stack = stackState.stackByRepresentative.get(tile.id);
    return {
      id: tile.id,
      type: "tileNode",
      position,
      zIndex: 1000,
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
  return [...familyNodes, ...tileNodes];
}

export function mapAtlasToEdges(appMode: AppMode, themePaletteId: ThemePaletteId, visibleLinks: Link[], stackState: StackState, options: EdgeMappingOptions = {}): Edge[] {
  const useAvoidTiles = options.connectorRoutingMode === "avoid_tiles";
  return visibleLinks.map((link) => {
    const lifecycle = resolveLifecycle(link);
    const editable = isLifecycleEditable(lifecycle, appMode);
    const isBlueprint = themePaletteId === "blueprint";
    const label = `${link.label || link.type}${lifecycle === "planned" ? " [planned]" : ""}`;
    return {
      id: link.id,
      source: stackState.memberToRepresentative.get(link.from) ?? link.from,
      target: stackState.memberToRepresentative.get(link.to) ?? link.to,
      zIndex: 500,
      sourceHandle: resolveSourcePort(link),
      targetHandle: resolveTargetPort(link),
      type: useAvoidTiles ? "avoidTiles" : undefined,
      label,
      data: useAvoidTiles ? { obstacles: options.routingObstacles ?? [] } : undefined,
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
}

export function isEditableNodeChange(change: NodeChange, nodes: Node[], mode: AppMode): boolean {
  if (!("id" in change)) return true;
  const node = nodes.find((candidate) => candidate.id === change.id);
  if (node?.type === "familyNode") return true;
  return isLifecycleEditable(resolveLifecycle(node?.data?.tile as Tile | undefined), mode);
}

export function familyNodeId(familyId: string): string {
  return `family:${familyId}`;
}

export function computeLayeredPositions(tiles: Tile[]): Map<string, { x: number; y: number }> {
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
