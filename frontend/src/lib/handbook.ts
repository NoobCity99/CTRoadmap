import { TILE_TYPE_CONFIG } from "./constants";
import { resolveLifecycle } from "./atlasSelectors";
import type { Atlas, Family, LinkType, Tile } from "../types/atlas";

export interface HandbookTileSection {
  tile: Tile;
  anchorId: string;
  children: HandbookTileSection[];
  relationships: HandbookRelationship[];
  warnings: string[];
}

export interface HandbookChapter {
  tile: Tile;
  anchorId: string;
  sections: HandbookTileSection[];
  relationships: HandbookRelationship[];
  warnings: string[];
}

export interface HandbookVolume {
  id: string;
  title: string;
  anchorId: string;
  color: string;
  family?: Family;
  chapters: HandbookChapter[];
  epilogue: HandbookTileSection[];
  emptyMessage?: string;
  unassigned: boolean;
}

export interface HandbookOutlineItem {
  id: string;
  title: string;
  color: string;
  depth: number;
  kind: "volume" | "tile";
  tileId?: string;
}

export interface HandbookDocument {
  volumes: HandbookVolume[];
  outline: HandbookOutlineItem[];
}

export interface HandbookRelationship {
  id: string;
  type: LinkType;
  label: string;
  endpointTitle: string;
  lifecycle: "live" | "planned";
}

const UNASSIGNED_COLOR = "#94a3b8";

export function buildHandbookDocument(atlas: Atlas): HandbookDocument {
  const tileById = new Map(atlas.tiles.map((tile) => [tile.id, tile]));
  const tileOrder = new Map(atlas.tiles.map((tile, index) => [tile.id, index]));
  const familyTileIds = new Set<string>();
  const volumes: HandbookVolume[] = [];

  const families = (atlas.families ?? []).slice().sort((left, right) => left.order - right.order);
  for (const family of families) {
    const memberIds = new Set(family.member_tile_ids.filter((memberId) => tileById.has(memberId)));
    for (const memberId of memberIds) familyTileIds.add(memberId);
    volumes.push(buildVolume(atlas, memberIds, tileOrder, family.color || "#38a3ff", family.title, `family-${family.id}`, family));
  }

  const unassignedIds = new Set(atlas.tiles.filter((tile) => !familyTileIds.has(tile.id)).map((tile) => tile.id));
  volumes.push(buildVolume(atlas, unassignedIds, tileOrder, UNASSIGNED_COLOR, "Unassigned / No Family", "unassigned", undefined, true));

  const outline = volumes.flatMap((volume) => buildHandbookVolumeOutline(volume));

  return { volumes, outline };
}

export function buildHandbookVolumeOutline(volume: HandbookVolume | null | undefined): HandbookOutlineItem[] {
  if (!volume) return [];
  const items: HandbookOutlineItem[] = [{ id: volume.anchorId, title: volume.title, color: volume.color, depth: 0, kind: "volume" }];
  for (const chapter of volume.chapters) {
    items.push({ id: chapter.anchorId, title: chapter.tile.title, color: volume.color, depth: 1, kind: "tile", tileId: chapter.tile.id });
    for (const section of chapter.sections) appendTileSectionOutline(items, section, volume.color, 2);
  }
  for (const section of volume.epilogue) appendTileSectionOutline(items, section, volume.color, 1);
  return items;
}

export function findHandbookVolumeForTile(document: HandbookDocument, tileId: string): HandbookVolume | null {
  return document.volumes.find((volume) => volumeContainsTile(volume, tileId)) ?? null;
}

function appendTileSectionOutline(items: HandbookOutlineItem[], section: HandbookTileSection, color: string, depth: number) {
  items.push({ id: section.anchorId, title: section.tile.title, color, depth, kind: "tile", tileId: section.tile.id });
  for (const child of section.children) appendTileSectionOutline(items, child, color, depth + 1);
}

function volumeContainsTile(volume: HandbookVolume, tileId: string): boolean {
  for (const chapter of volume.chapters) {
    if (chapter.tile.id === tileId) return true;
    if (sectionsContainTile(chapter.sections, tileId)) return true;
  }
  return sectionsContainTile(volume.epilogue, tileId);
}

function sectionsContainTile(sections: HandbookTileSection[], tileId: string): boolean {
  return sections.some((section) => section.tile.id === tileId || sectionsContainTile(section.children, tileId));
}

function buildVolume(
  atlas: Atlas,
  memberIds: Set<string>,
  tileOrder: Map<string, number>,
  color: string,
  title: string,
  id: string,
  family?: Family,
  unassigned = false
): HandbookVolume {
  const tileById = new Map(atlas.tiles.map((tile) => [tile.id, tile]));
  const childrenByParent = new Map<string, Tile[]>();
  for (const tile of atlas.tiles) {
    if (!tile.parent || !memberIds.has(tile.id) || !memberIds.has(tile.parent)) continue;
    const children = childrenByParent.get(tile.parent) ?? [];
    children.push(tile);
    childrenByParent.set(tile.parent, children);
  }
  for (const children of childrenByParent.values()) {
    children.sort((left, right) => compareTileOrder(left, right, tileOrder));
  }

  const memberTiles = atlas.tiles.filter((tile) => memberIds.has(tile.id));
  const chapterTiles = memberTiles
    .filter((tile) => !tile.parent || !memberIds.has(tile.parent))
    .filter((tile) => (childrenByParent.get(tile.id) ?? []).length > 0 || unassigned)
    .sort((left, right) => compareTileOrder(left, right, tileOrder));
  const chapterIds = new Set(chapterTiles.map((tile) => tile.id));
  const renderedIds = new Set<string>();

  const chapters = chapterTiles.map<HandbookChapter>((tile) => {
    renderedIds.add(tile.id);
    const childSections = (childrenByParent.get(tile.id) ?? []).map((child) => buildTileSection(child, atlas, childrenByParent, renderedIds));
    return {
      tile,
      anchorId: tileAnchor(tile.id),
      sections: childSections,
      relationships: relationshipsForTile(tile.id, atlas),
      warnings: warningsForTile(tile, tileById)
    };
  });

  const epilogue = memberTiles
    .filter((tile) => !renderedIds.has(tile.id) && !chapterIds.has(tile.id))
    .filter((tile) => !tile.parent || !memberIds.has(tile.parent))
    .sort((left, right) => compareTileOrder(left, right, tileOrder))
    .map((tile) => buildTileSection(tile, atlas, childrenByParent, renderedIds));

  return {
    id,
    title,
    anchorId: volumeAnchor(id),
    color,
    family,
    chapters,
    epilogue,
    emptyMessage: memberTiles.length ? undefined : "No tiles in this volume yet.",
    unassigned
  };
}

function buildTileSection(tile: Tile, atlas: Atlas, childrenByParent: Map<string, Tile[]>, renderedIds: Set<string>): HandbookTileSection {
  renderedIds.add(tile.id);
  return {
    tile,
    anchorId: tileAnchor(tile.id),
    children: (childrenByParent.get(tile.id) ?? []).map((child) => buildTileSection(child, atlas, childrenByParent, renderedIds)),
    relationships: relationshipsForTile(tile.id, atlas),
    warnings: warningsForTile(tile, new Map(atlas.tiles.map((candidate) => [candidate.id, candidate])))
  };
}

function relationshipsForTile(tileId: string, atlas: Atlas): HandbookRelationship[] {
  const tileById = new Map(atlas.tiles.map((tile) => [tile.id, tile]));
  return atlas.links
    .filter((link) => link.from === tileId || link.to === tileId)
    .map((link) => {
      const endpointId = link.from === tileId ? link.to : link.from;
      const direction = link.from === tileId ? "forward" : "inverse";
      return {
        id: link.id,
        type: link.type,
        label: relationshipLabel(link.type, direction),
        endpointTitle: tileById.get(endpointId)?.title ?? endpointId,
        lifecycle: resolveLifecycle(link)
      };
    });
}

function relationshipLabel(type: LinkType, direction: "forward" | "inverse"): string {
  const labels: Record<LinkType, { forward: string; inverse: string }> = {
    contains: { forward: "CONTAINS", inverse: "CONTAINED IN" },
    runs: { forward: "RUNS", inverse: "RUN BY" },
    hosts: { forward: "HOSTS", inverse: "HOSTED BY" },
    calls: { forward: "CALLS", inverse: "CALLED BY" },
    controls: { forward: "CONTROLS", inverse: "CONTROLLED BY" },
    depends_on: { forward: "DEPENDS ON", inverse: "REQUIRED BY" },
    uses_storage: { forward: "USES STORAGE", inverse: "STORAGE USED BY" },
    mounted_at: { forward: "MOUNTED AT", inverse: "MOUNT POINT FOR" },
    backs_up_to: { forward: "BACKS UP TO", inverse: "BACKED UP BY" },
    requires_key: { forward: "REQUIRES KEY", inverse: "KEY REQUIRED BY" },
    requires_config: { forward: "REQUIRES CONFIG", inverse: "CONFIG REQUIRED BY" },
    exposes_url: { forward: "EXPOSES URL", inverse: "URL EXPOSED BY" },
    validates_with: { forward: "VALIDATES WITH", inverse: "VALIDATES" },
    fails_if: { forward: "FAILS IF", inverse: "FAILURE CONDITION FOR" },
    documents: { forward: "DOCUMENTS", inverse: "DOCUMENTED BY" },
    related_to: { forward: "RELATED TO", inverse: "RELATED TO" }
  };
  return labels[type][direction];
}

function warningsForTile(tile: Tile, tileById: Map<string, Tile>): string[] {
  const warnings: string[] = [];
  if (tile.parent && !tileById.has(tile.parent)) warnings.push("Parent reference is missing.");
  if (!TILE_TYPE_CONFIG[tile.type]) warnings.push("Tile type is not recognized.");
  return warnings;
}

function compareTileOrder(left: Tile, right: Tile, tileOrder: Map<string, number>): number {
  return (tileOrder.get(left.id) ?? 0) - (tileOrder.get(right.id) ?? 0);
}

export function volumeAnchor(id: string): string {
  return `handbook-volume-${safeAnchor(id)}`;
}

export function tileAnchor(id: string): string {
  return `handbook-tile-${safeAnchor(id)}`;
}

function safeAnchor(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}
