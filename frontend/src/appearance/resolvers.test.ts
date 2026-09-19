import { describe, expect, it } from "vitest";
import { LINK_COLOR, LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "../lib/constants";
import { CANVAS_THEMES, CANVAS_BACKGROUNDS, getCanvasTheme, getCanvasBackground, isCanvasThemeId, isCanvasBackgroundId } from "./registry";
import type { CanvasBackgroundId, CanvasThemeId } from "./types";
import { getLinkVisualTokens, getTileVisualTokens } from "./resolvers";

const CYBER_THEME = getCanvasTheme("cyber");
const HEX_BACKGROUND = getCanvasBackground("hex");

describe("public Canvas visuals", () => {
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
      const tokens = getLinkVisualTokens(type, "cyber");
      expect(tokens.strokeColor).toBe(LINK_COLOR[type]);
      expect(tokens.labelSurfaceColor).toBe(CYBER_THEME.visuals.edgeLabelSurface);
      expect(tokens.labelTextColor).toBe(CYBER_THEME.visuals.edgeLabelText);
    }
  });

  it("exposes the fixed HEX React Flow overlay", () => {
    expect(HEX_BACKGROUND.id).toBe("hex");
    expect(HEX_BACKGROUND.reactFlowOverlay).toEqual({ variant: "dots", color: "#1f3a55", gap: 20, size: 1, opacity: 1 });
  });

  it("provides every semantic color and presentation for all nine themes", () => {
    expect(CANVAS_THEMES).toHaveLength(9);
    for (const theme of CANVAS_THEMES) {
      expect(isCanvasThemeId(theme.id)).toBe(true);
      for (const type of TILE_TYPES) {
        expect(getTileVisualTokens(type, theme.id)).toMatchObject({ accentColor: theme.tileColors[type], surfaceColor: theme.visuals.tileSurface, tilePresentation: theme.tilePresentation });
      }
      for (const type of LINK_TYPES) expect(getLinkVisualTokens(type, theme.id).strokeColor).toBe(theme.linkColors[type]);
    }
    for (const id of ["blueprint", "blueprint-ii"] as const) {
      expect(getTileVisualTokens("node", id).iconColor).toBe(getTileVisualTokens("node", "cyber").iconColor);
    }
    for (const id of ["revealer", "revealer-lite", "stellar"] as const) expect(getTileVisualTokens("service", id).tilePresentation).toBe("cover-reveal");
  });

  it("registers twelve backgrounds and keeps public fallbacks independent of registry ordering", () => {
    expect(CANVAS_BACKGROUNDS).toHaveLength(12);
    for (const background of CANVAS_BACKGROUNDS) expect(isCanvasBackgroundId(background.id)).toBe(true);
    expect(getCanvasBackground("missing" as CanvasBackgroundId).id).toBe("hex");
    expect(getCanvasTheme("missing" as CanvasThemeId).id).toBe("cyber");
    expect(getCanvasBackground("nebula_dive").zoomTransition).toEqual({ transitionStart: 0.73, transitionEnd: 1.1 });
    expect(isCanvasThemeId("blueprint_ii")).toBe(false);
    expect(isCanvasBackgroundId("blueprint-ii")).toBe(false);
  });
});
