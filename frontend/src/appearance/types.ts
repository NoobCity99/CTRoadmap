import type { LinkType, TileType } from "../types/atlas";

export interface PublicCanvasAppearanceV1 {
  version: 1;
  canvasTheme: "cyber";
  canvasBackground: "hex";
}

export interface CanvasThemeVisuals {
  tileSurface: string;
  tileText: string;
  tileMutedText: string;
  edgeLabelSurface: string;
  edgeLabelText: string;
}

export interface CanvasThemeDefinition {
  id: "cyber";
  label: string;
  description: string;
  swatches: readonly [string, string, string, string];
  tileColors: Readonly<Record<TileType, string>>;
  linkColors: Readonly<Record<LinkType, string>>;
  visuals: CanvasThemeVisuals;
}

export interface CanvasBackgroundOverlay {
  variant: "dots";
  color: string;
  gap: number;
  size: number;
  opacity: number;
}

export interface CanvasBackgroundDefinition {
  id: "hex";
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
  action: "settings.canvas_style";
  message: string;
  context: Record<string, unknown>;
}
