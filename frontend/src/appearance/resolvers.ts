import type { LinkType, TileType } from "../types/atlas";
import { CYBER_THEME } from "./registry";
import type { LinkVisualTokens, TileVisualTokens } from "./types";

export function getTileVisualTokens(tileType: TileType): TileVisualTokens {
  const accentColor = CYBER_THEME.tileColors[tileType];
  return {
    accentColor,
    iconColor: accentColor,
    surfaceColor: CYBER_THEME.visuals.tileSurface,
    textColor: CYBER_THEME.visuals.tileText,
    mutedTextColor: CYBER_THEME.visuals.tileMutedText,
    borderColor: accentColor,
    glowColor: accentColor
  };
}

export function getLinkVisualTokens(linkType: LinkType): LinkVisualTokens {
  return {
    strokeColor: CYBER_THEME.linkColors[linkType],
    labelSurfaceColor: CYBER_THEME.visuals.edgeLabelSurface,
    labelTextColor: CYBER_THEME.visuals.edgeLabelText
  };
}
