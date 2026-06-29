import { LINK_COLOR, TILE_TYPE_CONFIG } from "./constants";
import type { LinkType, ThemePaletteId, TileType } from "../types/atlas";

export interface ThemePalette {
  id: ThemePaletteId;
  label: string;
  description: string;
  swatches: string[];
  tileColors: Partial<Record<TileType, string>>;
  linkColors: Partial<Record<LinkType, string>>;
}

const STORAGE_KEY = "ctroadmap.themePalette";

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "cyber",
    label: "Cyber",
    description: "Blue network console with high-contrast topology accents.",
    swatches: ["#38a3ff", "#55d7ff", "#a77cff", "#ffca45"],
    tileColors: {},
    linkColors: {}
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Green, teal, and violet accents for calmer infrastructure maps.",
    swatches: ["#2dd4bf", "#7dd3fc", "#a78bfa", "#f9a8d4"],
    tileColors: {
      node: "#7dd3fc",
      service: "#2dd4bf",
      container: "#38bdf8",
      drive: "#86efac",
      mount: "#5eead4",
      script: "#c4b5fd",
      config: "#93c5fd",
      secret_ref: "#f9a8d4",
      flow: "#fde047",
      url: "#67e8f9",
      check: "#bef264",
      note: "#e2e8f0"
    },
    linkColors: {
      contains: "#7dd3fc",
      calls: "#c4b5fd",
      controls: "#fde047",
      depends_on: "#e0f2fe",
      validates_with: "#bef264",
      fails_if: "#fb7185"
    }
  },
  {
    id: "ember",
    label: "Ember",
    description: "Warm operational palette for dependency and incident planning.",
    swatches: ["#fb923c", "#facc15", "#22d3ee", "#f472b6"],
    tileColors: {
      node: "#38bdf8",
      service: "#fb923c",
      container: "#f97316",
      drive: "#a3e635",
      mount: "#facc15",
      script: "#f472b6",
      config: "#fcd34d",
      secret_ref: "#e879f9",
      flow: "#fdba74",
      url: "#22d3ee",
      check: "#84cc16",
      note: "#e5e7eb"
    },
    linkColors: {
      contains: "#38bdf8",
      calls: "#f472b6",
      controls: "#fdba74",
      depends_on: "#f8fafc",
      validates_with: "#84cc16",
      fails_if: "#ef4444"
    }
  }
];

export function getStoredThemePalette(): ThemePaletteId {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return THEME_PALETTES.some((palette) => palette.id === stored) ? (stored as ThemePaletteId) : "cyber";
}

export function storeThemePalette(paletteId: ThemePaletteId): void {
  window.localStorage.setItem(STORAGE_KEY, paletteId);
}

export function getThemePalette(paletteId: ThemePaletteId): ThemePalette {
  return THEME_PALETTES.find((palette) => palette.id === paletteId) ?? THEME_PALETTES[0];
}

export function getTileColor(type: TileType, paletteId: ThemePaletteId): string {
  const palette = getThemePalette(paletteId);
  return palette.tileColors[type] ?? TILE_TYPE_CONFIG[type].color;
}

export function getLinkColor(type: LinkType, paletteId: ThemePaletteId): string {
  const palette = getThemePalette(paletteId);
  return palette.linkColors[type] ?? LINK_COLOR[type];
}
