import { TILE_TYPE_CONFIG } from "./constants";
import type {
  AppMode,
  Atlas,
  LayoutTemplate,
  Lifecycle,
  Link,
  LinkSourcePort,
  LinkTargetPort,
  Tile,
  TileStack,
  TileType,
  View
} from "../types/atlas";

export type SearchResult =
  | { kind: "tile"; id: string; title: string; detail: string }
  | { kind: "link"; id: string; title: string; detail: string };

export interface StackRenderInfo {
  id: string;
  kind: "sibling_type" | "mount_children";
  badgeShape: "circle" | "hex";
  count: number;
  name: string;
  subtitle: string;
}

export interface StackState {
  stacks: TileStack[];
  hiddenMemberIds: Set<string>;
  memberToRepresentative: Map<string, string>;
  stackByRepresentative: Map<string, StackRenderInfo>;
}

export function emptyStackState(): StackState {
  return {
    stacks: [],
    hiddenMemberIds: new Set(),
    memberToRepresentative: new Map(),
    stackByRepresentative: new Map()
  };
}

export function buildStackState(atlas: Atlas): StackState {
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

export function sanitizeStacks(atlas: Atlas): TileStack[] {
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

export function sanitizeFamilies(atlas: Atlas) {
  const tileIds = new Set(atlas.tiles.map((tile) => tile.id));
  const usedIds = new Set<string>();
  return (atlas.families ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((family) => {
      const id = uniqueId(family.id, usedIds);
      usedIds.add(id);
      return {
        ...family,
        id,
        title: family.title || "Family",
        description: family.description ?? "",
        member_tile_ids: family.member_tile_ids.filter((memberId, index, allIds) => tileIds.has(memberId) && allIds.indexOf(memberId) === index),
        position: family.position ?? { x: 0, y: 0 },
        size: {
          width: Math.max(240, family.size?.width ?? 360),
          height: Math.max(160, family.size?.height ?? 240)
        },
        order: Number.isFinite(family.order) ? family.order : 0,
        color: family.color || null,
        tag: family.tag || null
      };
    });
}

export function canStackSiblingTiles(tile: Tile, tiles: Tile[]): boolean {
  if (!tile.parent) return false;
  return tiles.filter((candidate) => candidate.parent === tile.parent && candidate.type === tile.type).length >= 2;
}

export function canStackMountChildren(tile: Tile, tiles: Tile[]): boolean {
  return tile.type === "mount" && tiles.filter((candidate) => candidate.parent === tile.id).length >= 2;
}

export function closestTileToParent(members: Tile[], parent: Tile): Tile {
  return members.reduce((closest, member) => (distanceSquared(member.position, parent.position) < distanceSquared(closest.position, parent.position) ? member : closest), members[0]);
}

export function defaultStackName(count: number, tileType: TileType): string {
  const label = TILE_TYPE_CONFIG[tileType].label;
  return `${count} ${label}${label.endsWith("s") ? "" : "s"}`;
}

export function defaultMountStackName(count: number): string {
  return `${count} Mounted Items`;
}

export function activeTemplateForUi(template: LayoutTemplate): LayoutTemplate {
  return template === "layered_hierarchy" ? "canvas_topology" : template;
}

export function resolveSourcePort(link: Link): LinkSourcePort {
  return link.from_port ?? (link.type === "contains" ? "child" : "out");
}

export function resolveTargetPort(link: Link): LinkTargetPort {
  return link.to_port ?? (link.type === "contains" ? "parent" : "in");
}

export function resolveLifecycle(item: Tile | Link | undefined | null): Lifecycle {
  return item?.lifecycle === "planned" ? "planned" : "live";
}

export function isLifecycleEditable(lifecycle: Lifecycle, mode: AppMode): boolean {
  return mode === "planning" ? lifecycle === "planned" : lifecycle === "live";
}

export function canConnectTiles(sourceTile: Tile, targetTile: Tile, mode: AppMode): boolean {
  if (mode === "planning") {
    return resolveLifecycle(sourceTile) === "planned" || resolveLifecycle(targetTile) === "planned";
  }
  return resolveLifecycle(sourceTile) === "live" && resolveLifecycle(targetTile) === "live";
}

export function getLifecycleCounts(atlas: Atlas | null) {
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
}

export function getChildrenByParent(atlas: Atlas | null): Map<string, Tile[]> {
  const grouped = new Map<string, Tile[]>();
  if (!atlas) return grouped;
  for (const tile of atlas.tiles) {
    if (!tile.parent) continue;
    const children = grouped.get(tile.parent) ?? [];
    children.push(tile);
    grouped.set(tile.parent, children);
  }
  return grouped;
}

export function getActiveView(atlas: Atlas | null, activeViewId: string): View | null {
  if (!atlas) return null;
  return atlas.views.find((view) => view.id === activeViewId) ?? atlas.views[0] ?? null;
}

export function getSearchResults(atlas: Atlas | null, activeView: View | null, searchTerm: string): SearchResult[] {
  if (!atlas) return [];
  const query = searchTerm.trim().toLowerCase();
  if (!query) return [];
  const tileMatches = atlas.tiles
    .filter((tile) => {
      const allowedByView = !activeView?.visible_types.length || activeView.visible_types.includes(tile.type);
      const searchable = getTileSearchText(tile);
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
      const searchable = getLinkSearchText(link);
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
}

export function getVisibleTiles(atlas: Atlas | null, activeView: View | null, searchTerm: string, stackState: StackState): Tile[] {
  if (!atlas) return [];
  const query = searchTerm.trim().toLowerCase();
  return atlas.tiles.filter((tile) => {
    const allowedByView = !activeView?.visible_types.length || activeView.visible_types.includes(tile.type);
    const allowedBySearch = !query || getTileSearchText(tile).includes(query);
    return allowedByView && allowedBySearch && !stackState.hiddenMemberIds.has(tile.id);
  });
}

export function getVisibleLinks(atlas: Atlas | null, activeView: View | null, searchTerm: string, visibleTileIds: Set<string>, stackState: StackState): Link[] {
  if (!atlas) return [];
  const query = searchTerm.trim().toLowerCase();
  return atlas.links.filter((link) => {
    const allowedByView = !activeView?.visible_links.length || activeView.visible_links.includes(link.type);
    const renderedSource = stackState.memberToRepresentative.get(link.from) ?? link.from;
    const renderedTarget = stackState.memberToRepresentative.get(link.to) ?? link.to;
    const allowedBySearch = !query || getLinkSearchText(link).includes(query) || visibleTileIds.has(renderedSource) || visibleTileIds.has(renderedTarget);
    return allowedByView && allowedBySearch && renderedSource !== renderedTarget && visibleTileIds.has(renderedSource) && visibleTileIds.has(renderedTarget);
  });
}

export function toggleViewSelection<T extends string>(current: T[], all: readonly T[], value: T): T[] {
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

function getTileSearchText(tile: Tile): string {
  return `${tile.title} ${tile.type} ${resolveLifecycle(tile)} ${tile.notes ?? ""} ${(tile.tags ?? []).join(" ")} ${JSON.stringify(tile.fields)}`.toLowerCase();
}

function getLinkSearchText(link: Link): string {
  return `${link.type} ${resolveLifecycle(link)} ${link.label ?? ""} ${link.notes ?? ""}`.toLowerCase();
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

function distanceSquared(left: { x: number; y: number }, right: { x: number; y: number }): number {
  return (left.x - right.x) ** 2 + (left.y - right.y) ** 2;
}
