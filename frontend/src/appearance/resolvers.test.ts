import { describe, expect, it } from "vitest";
import { LINK_COLOR, LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "../lib/constants";
import { CYBER_THEME, HEX_BACKGROUND } from "./registry";
import { getLinkVisualTokens, getTileVisualTokens } from "./resolvers";

describe("fixed public Canvas visuals", () => {
  it("maps every tile type to its canonical built-in semantic color", () => {
    for (const type of TILE_TYPES) {
      const tokens = getTileVisualTokens(type);
      expect(tokens.accentColor).toBe(TILE_TYPE_CONFIG[type].color);
      expect(tokens.iconColor).toBe(TILE_TYPE_CONFIG[type].color);
      expect(tokens.surfaceColor).toBe(CYBER_THEME.visuals.tileSurface);
    }
  });

  it("maps every relationship type to its canonical semantic color", () => {
    for (const type of LINK_TYPES) {
      const tokens = getLinkVisualTokens(type);
      expect(tokens.strokeColor).toBe(LINK_COLOR[type]);
      expect(tokens.labelSurfaceColor).toBe(CYBER_THEME.visuals.edgeLabelSurface);
      expect(tokens.labelTextColor).toBe(CYBER_THEME.visuals.edgeLabelText);
    }
  });

  it("exposes the fixed HEX React Flow overlay", () => {
    expect(HEX_BACKGROUND.id).toBe("hex");
    expect(HEX_BACKGROUND.reactFlowOverlay).toEqual({ variant: "dots", color: "#1f3a55", gap: 20, size: 1, opacity: 1 });
  });
});
