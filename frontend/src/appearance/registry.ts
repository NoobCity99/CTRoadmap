import type { LinkType, TileType } from "../types/atlas";
import type { CanvasBackgroundDefinition, CanvasBackgroundId, CanvasThemeDefinition, CanvasThemeId } from "./types";

const CYBER_TILE_COLORS: Record<TileType, string> = {
  node: "#38a3ff",
  service: "#55d7ff",
  container: "#25b8ff",
  drive: "#77df7a",
  mount: "#8fe6b3",
  script: "#a77cff",
  config: "#a4b8ff",
  secret_ref: "#b77cff",
  flow: "#ffca45",
  iot_device: "#ff9f2f",
  url: "#4fdfff",
  check: "#7ce071",
  note: "#cbd5e1"
};

const CYBER_LINK_COLORS: Record<LinkType, string> = {
  contains: "#38a3ff",
  runs: "#55d7ff",
  hosts: "#55d7ff",
  calls: "#a77cff",
  controls: "#ffca45",
  depends_on: "#f7f7ff",
  uses_storage: "#77df7a",
  mounted_at: "#8fe6b3",
  backs_up_to: "#58d68d",
  requires_key: "#b77cff",
  requires_config: "#a4b8ff",
  exposes_url: "#4fdfff",
  validates_with: "#7ce071",
  fails_if: "#ff6b6b",
  documents: "#cbd5e1",
  related_to: "#94a3b8"
};

const STANDARD_VISUALS = {
  tileSurface: "rgba(8, 17, 32, 0.95)",
  tileText: "#f8fafc",
  tileMutedText: "#8fa5c4",
  edgeLabelSurface: "rgba(5, 10, 22, 0.88)",
  edgeLabelText: "#f8fafc"
} as const;

function theme(
  definition: Omit<CanvasThemeDefinition, "source" | "tileColors" | "linkColors"> & {
    tileColors?: Partial<Record<TileType, string>>;
    linkColors?: Partial<Record<LinkType, string>>;
  }
): CanvasThemeDefinition {
  return {
    ...definition,
    source: "built-in",
    tileColors: { ...CYBER_TILE_COLORS, ...definition.tileColors },
    linkColors: { ...CYBER_LINK_COLORS, ...definition.linkColors }
  };
}

export const CANVAS_THEMES: readonly CanvasThemeDefinition[] = [
  theme({
    id: "cyber",
    label: "Cyber",
    description: "Blue network console with high-contrast topology accents.",
    variant: "standard",
    swatches: ["#38a3ff", "#55d7ff", "#a77cff", "#ffca45"],
    visuals: STANDARD_VISUALS
  }),
  theme({
    id: "aurora",
    label: "Aurora",
    description: "Green, teal, and violet accents for calmer infrastructure maps.",
    variant: "standard",
    swatches: ["#2dd4bf", "#7dd3fc", "#a78bfa", "#f9a8d4"],
    visuals: STANDARD_VISUALS,
    tileColors: {
      node: "#7dd3fc", service: "#2dd4bf", container: "#38bdf8", drive: "#86efac", mount: "#5eead4", script: "#c4b5fd",
      config: "#93c5fd", secret_ref: "#f9a8d4", flow: "#fde047", iot_device: "#fbbf24", url: "#67e8f9", check: "#bef264", note: "#e2e8f0"
    },
    linkColors: { contains: "#7dd3fc", calls: "#c4b5fd", controls: "#fde047", depends_on: "#e0f2fe", validates_with: "#bef264", fails_if: "#fb7185" }
  }),
  theme({
    id: "ember",
    label: "Ember",
    description: "Warm operational palette for dependency and incident planning.",
    variant: "standard",
    swatches: ["#fb923c", "#facc15", "#22d3ee", "#f472b6"],
    visuals: STANDARD_VISUALS,
    tileColors: {
      node: "#38bdf8", service: "#fb923c", container: "#f97316", drive: "#a3e635", mount: "#facc15", script: "#f472b6",
      config: "#fcd34d", secret_ref: "#e879f9", flow: "#fdba74", iot_device: "#fb923c", url: "#22d3ee", check: "#84cc16", note: "#e5e7eb"
    },
    linkColors: { contains: "#38bdf8", calls: "#f472b6", controls: "#fdba74", depends_on: "#f8fafc", validates_with: "#84cc16", fails_if: "#ef4444" }
  }),
  theme({
    id: "blueprint",
    label: "Blueprint",
    description: "High-tech blueprint drawing style with pale ink accents.",
    variant: "blueprint",
    swatches: ["#0041ba", "#eaf6ff", "#b9e6ff", "#d9f2ff"],
    visuals: {
      tileSurface: "#eef7ff",
      tileText: "#06245a",
      tileMutedText: "#294d7f",
      edgeLabelSurface: "rgba(238, 247, 255, 0.86)",
      edgeLabelText: "#06245a"
    },
    tileColors: {
      node: "#f8fcff", service: "#eef9ff", container: "#e4f5ff", drive: "#f6fbff", mount: "#e8f8ff", script: "#f5f1ff",
      config: "#edf7ff", secret_ref: "#fff3fb", flow: "#fff9df", iot_device: "#fff0d7", url: "#e7fbff", check: "#f4ffe8", note: "#f8fbff"
    },
    linkColors: { contains: "#f5fbff", calls: "#eef8ff", controls: "#fff9e6", depends_on: "#f8fcff", validates_with: "#f4ffe8", fails_if: "#fff0f4" }
  }),
  theme({
    id: "nes",
    label: "NES",
    description: "Muted 8-bit console colors with white tiles and solid borders.",
    variant: "nes",
    swatches: ["#cacbd1", "#7f4a4d", "#005fd7", "#E60012"],
    visuals: {
      tileSurface: "#ffffff",
      tileText: "#0f0f0f",
      tileMutedText: "#5f574f",
      edgeLabelSurface: "rgba(5, 10, 22, 0.88)",
      edgeLabelText: "#f8fafc"
    },
    tileColors: {
      node: "#7f4a4d", service: "#005fd7", container: "#0044a5", drive: "#008751", mount: "#3f7f1f", script: "#a54200",
      config: "#5f574f", secret_ref: "#8b3f96", flow: "#E60012", iot_device: "#b53120", url: "#008787", check: "#008751", note: "#737373"
    },
    linkColors: { contains: "#005fd7", calls: "#8b3f96", controls: "#E60012", depends_on: "#5f574f", validates_with: "#008751", fails_if: "#b53120" }
  })
] as const;

export const CANVAS_BACKGROUNDS: readonly CanvasBackgroundDefinition[] = [
  { id: "grid", label: "Grid", description: "Square grid with a soft center glow.", reactFlowOverlay: { variant: "dots", color: "#1f3a55", gap: 20, size: 1, opacity: 1 } },
  { id: "hex", label: "Hex", description: "Subtle hex lattice for dense infrastructure maps.", reactFlowOverlay: { variant: "dots", color: "#1f3a55", gap: 20, size: 1, opacity: 1 } },
  { id: "tron_dark", label: "Tron Dark", description: "Dark horizon grid with glowing perspective floor and ceiling planes.", reactFlowOverlay: { variant: "dots", color: "rgba(188, 203, 255, 0.26)", gap: 20, size: 1, opacity: 1 } },
  { id: "tron_lite", label: "Tron Lite", description: "Light horizon grid with soft blue perspective floor and ceiling planes.", reactFlowOverlay: { variant: "dots", color: "rgba(91, 183, 249, 0.24)", gap: 20, size: 1, opacity: 1 } },
  { id: "blueprint", label: "Blueprint", description: "Blue drafting surface with faint white construction lines.", reactFlowOverlay: { variant: "dots", color: "rgba(255, 255, 255, 0.28)", gap: 20, size: 1, opacity: 1 } },
  { id: "pcb_board", label: "PCB Board", description: "Green circuit-board canvas with gold grid and solder pads.", reactFlowOverlay: { variant: "dots", color: "rgba(246, 203, 95, 0.18)", gap: 20, size: 1, opacity: 1 } },
  { id: "nes_grid", label: "NES Grid", description: "Light gray 8-bit grid with muted red construction lines.", reactFlowOverlay: { variant: "dots", color: "rgba(214, 17, 30, 0.07)", gap: 20, size: 1, opacity: 1 } },
  { id: "lt_draft_grid", label: "LT Draft Grid", description: "Pale lavender canvas with a wide soft blue grid.", reactFlowOverlay: { variant: "dots", color: "rgba(71, 74, 255, 0.09)", gap: 20, size: 1, opacity: 1 } },
  { id: "zima_carbon", label: "Zima Carbon", description: "Pearl-white seamless carbon weave designed for the ZIMA shell.", reactFlowOverlay: { variant: "dots", color: "rgba(255, 255, 255, 0.28)", gap: 20, size: 1, opacity: 1 } }
] as const;

export function isCanvasThemeId(value: unknown): value is CanvasThemeId {
  return typeof value === "string" && CANVAS_THEMES.some((entry) => entry.id === value);
}

export function isCanvasBackgroundId(value: unknown): value is CanvasBackgroundId {
  return typeof value === "string" && CANVAS_BACKGROUNDS.some((entry) => entry.id === value);
}

export function getCanvasTheme(id: CanvasThemeId): CanvasThemeDefinition {
  return CANVAS_THEMES.find((entry) => entry.id === id) ?? CANVAS_THEMES[0];
}

export function getCanvasBackground(id: CanvasBackgroundId): CanvasBackgroundDefinition {
  return CANVAS_BACKGROUNDS.find((entry) => entry.id === id) ?? CANVAS_BACKGROUNDS[0];
}
