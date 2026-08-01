import { MarkerType, type Edge, type Node, type NodeChange } from "@xyflow/react";
import { getLinkVisualTokens, getTileVisualTokens } from "../appearance";
import { isLifecycleEditable, resolveLifecycle, resolveSourcePort, resolveTargetPort, type StackState } from "./atlasSelectors";
import type { ConnectorRoutingMode, RoutingRect } from "./edgeRouting";
import type { AppMode, Atlas, Family, Link, Tile } from "../types/atlas";

export interface GraphMappingOptions {
  appMode: AppMode;
  atlas: Atlas | null;
  childrenByParent: Map<string, Tile[]>;
  isInteractive: boolean;
  selection: { kind: string; id: string } | null;
  stackState: StackState;
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
  selection,
  stackState,
  visibleTiles,
  onFocusFamily,
  onResizeFamily
}: GraphMappingOptions): Node[] {
  if (!atlas) return [];
  const familyNodes: Node[] = [...(atlas.families ?? [])]
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
          }));

  const tileNodes = visibleTiles.map((tile) => {
    const parentTitle = tile.parent ? atlas.tiles.find((candidate) => candidate.id === tile.parent)?.title : undefined;
    const lifecycle = resolveLifecycle(tile);
    const editable = isLifecycleEditable(lifecycle, appMode);
    const stack = stackState.stackByRepresentative.get(tile.id);
    const tileVisuals = getTileVisualTokens(tile.type);
    return {
      id: tile.id,
      type: "tileNode",
      position: tile.position,
      zIndex: 1000,
      draggable: isInteractive && editable && !stack,
      data: {
        tile,
        parentTitle,
        accentColor: tileVisuals.accentColor,
        iconAccentColor: tileVisuals.iconColor,
        visualTokens: tileVisuals,
        hasChildren: Boolean(childrenByParent.get(tile.id)?.length),
        lifecycle,
        isMuted: !editable,
        stack
      }
    };
  });
  return [...familyNodes, ...tileNodes];
}

export function mapAtlasToEdges(appMode: AppMode, visibleLinks: Link[], stackState: StackState, options: EdgeMappingOptions = {}): Edge[] {
  const useAvoidTiles = options.connectorRoutingMode === "avoid_tiles";
  return visibleLinks.map((link) => {
    const lifecycle = resolveLifecycle(link);
    const editable = isLifecycleEditable(lifecycle, appMode);
    const linkVisuals = getLinkVisualTokens(link.type);
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
        stroke: editable ? linkVisuals.strokeColor : "rgba(148, 163, 184, 0.55)",
        strokeWidth: editable ? 2 : 1.5,
        opacity: editable ? 1 : 0.55
      },
      labelStyle: {
        fill: editable ? linkVisuals.labelTextColor : "#94a3b8",
        fontSize: 12,
        fontWeight: 700
      },
      labelBgStyle: {
        fill: linkVisuals.labelSurfaceColor,
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

