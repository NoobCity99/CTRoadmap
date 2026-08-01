import { LINK_COLOR, TILE_TYPES, TILE_TYPE_CONFIG } from "../lib/constants";
import type { TileType } from "../types/atlas";
import type { CanvasBackgroundDefinition, CanvasThemeDefinition } from "./types";

const tileColors = Object.fromEntries(TILE_TYPES.map((type) => [type, TILE_TYPE_CONFIG[type].color])) as Record<TileType, string>;

export const CYBER_THEME: CanvasThemeDefinition = {
  id: "cyber",
  label: "Cyber",
  description: "The fixed high-contrast Canvas palette for the public fork.",
  swatches: ["#38a3ff", "#55d7ff", "#a77cff", "#ffca45"],
  tileColors,
  linkColors: LINK_COLOR,
  visuals: {
    tileSurface: "rgba(8, 17, 32, 0.95)",
    tileText: "#f8fafc",
    tileMutedText: "#8fa5c4",
    edgeLabelSurface: "rgba(5, 10, 22, 0.88)",
    edgeLabelText: "#f8fafc"
  }
};

export const HEX_BACKGROUND: CanvasBackgroundDefinition = {
  id: "hex",
  label: "Hex",
  description: "The fixed subtle hex lattice for the public fork.",
  reactFlowOverlay: { variant: "dots", color: "#1f3a55", gap: 20, size: 1, opacity: 1 }
};
