import { LINK_COLOR, TILE_TYPE_CONFIG } from "./constants";
import type {
  AppearancePreferencesV1,
  AppearanceSelection,
  AppAppearanceMode,
  CanvasBackgroundId,
  LinkType,
  ThemePaletteId,
  TileType
} from "../types/atlas";

export interface ThemePalette {
  id: ThemePaletteId;
  label: string;
  description: string;
  swatches: string[];
  tileColors: Partial<Record<TileType, string>>;
  linkColors: Partial<Record<LinkType, string>>;
}

const STORAGE_KEY = "ctroadmap.themePalette";
const CANVAS_BACKGROUND_STORAGE_KEY = "ctroadmap.canvasBackground";
export const APPEARANCE_PREFERENCES_STORAGE_KEY = "ctroadmap.appearancePreferences.v1";

export const DEFAULT_CLASSIC_APPEARANCE: AppearanceSelection = {
  themePalette: "cyber",
  canvasBackground: "grid"
};

export const DEFAULT_ZIMA_APPEARANCE: AppearanceSelection = {
  themePalette: "blueprint",
  canvasBackground: "zima_carbon"
};

export interface CanvasBackgroundOption {
  id: CanvasBackgroundId;
  label: string;
  description: string;
}

export const CANVAS_BACKGROUNDS: CanvasBackgroundOption[] = [
  {
    id: "grid",
    label: "Grid",
    description: "Current square grid with a soft center glow."
  },
  {
    id: "hex",
    label: "Hex",
    description: "Subtle hex lattice for dense infrastructure maps."
  },
  {
    id: "tron_dark",
    label: "Tron Dark",
    description: "Dark horizon grid with glowing perspective floor and ceiling planes."
  },
  {
    id: "tron_lite",
    label: "Tron Lite",
    description: "Light horizon grid with soft blue perspective floor and ceiling planes."
  },
  {
    id: "blueprint",
    label: "Blueprint",
    description: "Blue drafting surface with faint white construction lines."
  },
  {
    id: "pcb_board",
    label: "PCB Board",
    description: "Green circuit-board canvas with gold grid and solder pads."
  },
  {
    id: "nes_grid",
    label: "NES Grid",
    description: "Light gray 8-bit grid with muted red construction lines."
  },
  {
    id: "lt_draft_grid",
    label: "LT Draft Grid",
    description: "Pale lavender canvas with a wide soft blue grid."
  },
  {
    id: "zima_carbon",
    label: "Zima Carbon",
    description: "Pearl-white seamless carbon weave designed for the ZIMA shell."
  }
];

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
      iot_device: "#fbbf24",
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
      iot_device: "#fb923c",
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
  },
  {
    id: "blueprint",
    label: "Blueprint",
    description: "High-tech blueprint drawing style with pale ink accents.",
    swatches: ["#0041ba", "#eaf6ff", "#b9e6ff", "#d9f2ff"],
    tileColors: {
      node: "#f8fcff",
      service: "#eef9ff",
      container: "#e4f5ff",
      drive: "#f6fbff",
      mount: "#e8f8ff",
      script: "#f5f1ff",
      config: "#edf7ff",
      secret_ref: "#fff3fb",
      flow: "#fff9df",
      iot_device: "#fff0d7",
      url: "#e7fbff",
      check: "#f4ffe8",
      note: "#f8fbff"
    },
    linkColors: {
      contains: "#f5fbff",
      calls: "#eef8ff",
      controls: "#fff9e6",
      depends_on: "#f8fcff",
      validates_with: "#f4ffe8",
      fails_if: "#fff0f4"
    }
  },
  {
    id: "nes",
    label: "NES",
    description: "Muted 8-bit console colors with white tiles and solid borders.",
    swatches: ["#cacbd1", "#7f4a4d", "#005fd7", "#E60012"],
    tileColors: {
      node: "#7f4a4d",
      service: "#005fd7",
      container: "#0044a5",
      drive: "#008751",
      mount: "#3f7f1f",
      script: "#a54200",
      config: "#5f574f",
      secret_ref: "#8b3f96",
      flow: "#E60012",
      iot_device: "#b53120",
      url: "#008787",
      check: "#008751",
      note: "#737373"
    },
    linkColors: {
      contains: "#005fd7",
      calls: "#8b3f96",
      controls: "#E60012",
      depends_on: "#5f574f",
      validates_with: "#008751",
      fails_if: "#b53120"
    }
  }
];

export function getStoredThemePalette(): ThemePaletteId {
  const stored = safeStorageGet(STORAGE_KEY);
  return THEME_PALETTES.some((palette) => palette.id === stored) ? (stored as ThemePaletteId) : "cyber";
}

export function storeThemePalette(paletteId: ThemePaletteId): void {
  safeStorageSet(STORAGE_KEY, paletteId);
}

export function getStoredCanvasBackground(): CanvasBackgroundId {
  const stored = safeStorageGet(CANVAS_BACKGROUND_STORAGE_KEY);
  return CANVAS_BACKGROUNDS.some((background) => background.id === stored) ? (stored as CanvasBackgroundId) : "grid";
}

export function storeCanvasBackground(backgroundId: CanvasBackgroundId): void {
  safeStorageSet(CANVAS_BACKGROUND_STORAGE_KEY, backgroundId);
}

export function getStoredAppearancePreferences(): AppearancePreferencesV1 {
  const migratedClassic: AppearanceSelection = {
    themePalette: getStoredThemePalette(),
    canvasBackground: getStoredCanvasBackground()
  };
  const stored = safeStorageGet(APPEARANCE_PREFERENCES_STORAGE_KEY);
  if (!stored) {
    return {
      version: 1,
      appAppearanceMode: "classic",
      perMode: { classic: migratedClassic }
    };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AppearancePreferencesV1>;
    const appAppearanceMode: AppAppearanceMode = parsed.appAppearanceMode === "zima" ? "zima" : "classic";
    const classic = normalizeAppearanceSelection(parsed.perMode?.classic, migratedClassic);
    const storedZima = parsed.perMode?.zima;
    const zima = storedZima ? normalizeAppearanceSelection(storedZima, DEFAULT_ZIMA_APPEARANCE) : undefined;
    return {
      version: 1,
      appAppearanceMode,
      perMode: {
        classic,
        ...(zima || appAppearanceMode === "zima" ? { zima: zima ?? { ...DEFAULT_ZIMA_APPEARANCE } } : {})
      }
    };
  } catch {
    return {
      version: 1,
      appAppearanceMode: "classic",
      perMode: { classic: migratedClassic }
    };
  }
}

export function storeAppearancePreferences(preferences: AppearancePreferencesV1): void {
  safeStorageSet(APPEARANCE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  const activeSelection = getActiveAppearanceSelection(preferences);
  storeThemePalette(activeSelection.themePalette);
  storeCanvasBackground(activeSelection.canvasBackground);
}

export function getActiveAppearanceSelection(preferences: AppearancePreferencesV1): AppearanceSelection {
  if (preferences.appAppearanceMode === "zima") {
    return preferences.perMode.zima ?? DEFAULT_ZIMA_APPEARANCE;
  }
  return preferences.perMode.classic;
}

export function getAssociatedCanvasBackground(paletteId: ThemePaletteId): CanvasBackgroundId | null {
  if (paletteId === "blueprint") return "blueprint";
  if (paletteId === "nes") return "nes_grid";
  return null;
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

function normalizeAppearanceSelection(value: unknown, fallback: AppearanceSelection): AppearanceSelection {
  if (!value || typeof value !== "object") return { ...fallback };
  const candidate = value as Partial<AppearanceSelection>;
  return {
    themePalette: THEME_PALETTES.some((palette) => palette.id === candidate.themePalette) ? (candidate.themePalette as ThemePaletteId) : fallback.themePalette,
    canvasBackground: CANVAS_BACKGROUNDS.some((background) => background.id === candidate.canvasBackground)
      ? (candidate.canvasBackground as CanvasBackgroundId)
      : fallback.canvasBackground
  };
}

function safeStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Browser-local appearance preferences are optional and must not block atlas editing.
  }
}
