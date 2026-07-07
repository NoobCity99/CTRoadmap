import { TILE_TYPE_CONFIG } from "./constants";
import { defaultMountStackName, defaultStackName, sanitizeFamilies, sanitizeStacks } from "./atlasSelectors";
import type { Atlas, TileType } from "../types/atlas";

export { defaultMountStackName, defaultStackName };

export function withAtlasDefaults(atlas: Atlas): Atlas {
  return { ...atlas, stacks: atlas.stacks ?? [], families: atlas.families ?? [] };
}

export function sanitizeAtlas(atlas: Atlas): Atlas {
  return { ...atlas, stacks: sanitizeStacks(atlas), families: sanitizeFamilies(atlas) };
}

export function createId(prefix: string, label: string, existingIds: string[]): string {
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

export function nextGeneratedTileTitle(type: TileType, tiles: { title: string }[]): string {
  const label = TILE_TYPE_CONFIG[type].label.toUpperCase();
  const prefix = `NEW ${label} `;
  const usedNumbers = new Set<number>();
  for (const tile of tiles) {
    const title = tile.title.trim().toUpperCase();
    if (!title.startsWith(prefix)) continue;
    const value = Number(title.slice(prefix.length).trim());
    if (Number.isInteger(value) && value > 0) usedNumbers.add(value);
  }
  let index = 1;
  while (usedNumbers.has(index)) index += 1;
  return `${prefix}${index}`;
}

export function cloneFields(fields: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(fields)) as Record<string, unknown>;
}
