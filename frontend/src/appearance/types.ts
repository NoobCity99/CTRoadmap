import type { LinkType, TileType } from "../types/atlas";

export type AppAppearanceMode = "classic" | "zima";
export type CanvasThemeId = "cyber" | "aurora" | "ember" | "blueprint" | "nes";
export type CanvasThemeVariant = "standard" | "blueprint" | "nes";
export type CanvasBackgroundId = "grid" | "hex" | "tron_dark" | "tron_lite" | "blueprint" | "pcb_board" | "nes_grid" | "lt_draft_grid" | "zima_carbon";
export type CanvasOverlayVariant = "dots" | "lines" | "cross";

export interface CanvasStyleSelection {
  canvasThemeId: CanvasThemeId;
  canvasBackgroundId: CanvasBackgroundId;
}

export interface AppearancePreferencesV2 {
  version: 2;
  appAppearanceMode: AppAppearanceMode;
  perMode: {
    classic: CanvasStyleSelection;
    zima?: CanvasStyleSelection;
  };
}

export interface CanvasThemeVisuals {
  tileSurface: string;
  tileText: string;
  tileMutedText: string;
  edgeLabelSurface: string;
  edgeLabelText: string;
}

export interface CanvasThemeDefinition {
  id: CanvasThemeId;
  label: string;
  description: string;
  source: "built-in";
  variant: CanvasThemeVariant;
  swatches: readonly [string, string, string, string];
  tileColors: Readonly<Record<TileType, string>>;
  linkColors: Readonly<Record<LinkType, string>>;
  visuals: CanvasThemeVisuals;
}

export interface CanvasBackgroundOverlay {
  variant: CanvasOverlayVariant;
  color: string;
  gap: number;
  size: number;
  opacity: number;
}

export interface CanvasBackgroundDefinition {
  id: CanvasBackgroundId;
  label: string;
  description: string;
  reactFlowOverlay: CanvasBackgroundOverlay;
}

export interface TileVisualTokens {
  accentColor: string;
  iconColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  glowColor: string;
}

export interface LinkVisualTokens {
  strokeColor: string;
  labelSurfaceColor: string;
  labelTextColor: string;
}

export interface AppearanceDebugEvent {
  action: "settings.app_appearance" | "settings.canvas_style";
  message: string;
  context: Record<string, unknown>;
}
