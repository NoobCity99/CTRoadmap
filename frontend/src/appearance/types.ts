import type { LinkType, TileType } from "../types/atlas";

export type CanvasThemeId = "cyber" | "aurora" | "ember" | "blueprint" | "blueprint-ii" | "nes" | "revealer" | "revealer-lite" | "stellar";
export type CanvasThemeVariant = "standard" | "blueprint" | "nes";
export type TilePresentation = "standard" | "cover-reveal";
export type TileSurfaceTone = "light" | "dark";
export type CanvasBackgroundId = "grid" | "hex" | "tron_dark" | "tron_lite" | "blueprint" | "blueprint_ii" | "nes_grid" | "lt_draft_grid" | "zima_carbon" | "nebula_dive" | "tron_legacy" | "pcb_trace";
export type CanvasBackgroundRenderer = "static" | "zoom-transition" | "animated";
export type CanvasOverlayVariant = "dots" | "lines" | "cross";

export interface CanvasStyleSelection {
  canvasThemeId: CanvasThemeId;
  canvasBackgroundId: CanvasBackgroundId;
}

export interface PublicCanvasAppearanceV2 extends CanvasStyleSelection {
  version: 2;
}

export interface CanvasThemeVisuals {
  tileSurfaceTone: TileSurfaceTone;
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
  tilePresentation: TilePresentation;
  /** Bundled decorative images used by this theme. */
  assets?: readonly string[];
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

export interface CanvasZoomTransitionDefinition {
  transitionStart: number;
  transitionEnd: number;
}

interface CanvasBackgroundBase {
  id: CanvasBackgroundId;
  label: string;
  description: string;
  reactFlowOverlay: CanvasBackgroundOverlay;
}

export interface StaticCanvasBackgroundDefinition extends CanvasBackgroundBase {
  renderer: "static";
  zoomTransition?: never;
}

export interface ZoomCanvasBackgroundDefinition extends CanvasBackgroundBase {
  renderer: "zoom-transition";
  zoomTransition: CanvasZoomTransitionDefinition;
}

export interface AnimatedCanvasBackgroundDefinition extends CanvasBackgroundBase {
  renderer: "animated";
  zoomTransition?: never;
}

export type CanvasBackgroundDefinition =
  | StaticCanvasBackgroundDefinition
  | ZoomCanvasBackgroundDefinition
  | AnimatedCanvasBackgroundDefinition;

export interface TileVisualTokens {
  tilePresentation: TilePresentation;
  accentColor: string;
  iconColor: string;
  surfaceTone: TileSurfaceTone;
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
