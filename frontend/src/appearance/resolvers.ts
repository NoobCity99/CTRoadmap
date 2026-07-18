import type { LinkType, TileType } from "../types/atlas";
import { getCanvasTheme } from "./registry";
import type { CanvasThemeId, LinkVisualTokens, TileVisualTokens } from "./types";

export function getTileVisualTokens(tileType: TileType, canvasThemeId: CanvasThemeId): TileVisualTokens {
  const theme = getCanvasTheme(canvasThemeId);
  const accentColor = theme.tileColors[tileType];
  const iconColor = theme.variant === "blueprint" ? getCanvasTheme("cyber").tileColors[tileType] : accentColor;
  return {
    accentColor,
    iconColor,
    surfaceColor: theme.visuals.tileSurface,
    textColor: theme.visuals.tileText,
    mutedTextColor: theme.visuals.tileMutedText,
    borderColor: accentColor,
    glowColor: accentColor
  };
}

export function getLinkVisualTokens(linkType: LinkType, canvasThemeId: CanvasThemeId): LinkVisualTokens {
  const theme = getCanvasTheme(canvasThemeId);
  return {
    strokeColor: theme.linkColors[linkType],
    labelSurfaceColor: theme.visuals.edgeLabelSurface,
    labelTextColor: theme.visuals.edgeLabelText
  };
}
