import { describe, expect, it } from "vitest";
import { LINK_TYPES, TILE_TYPES } from "../lib/constants";
import { CANVAS_BACKGROUNDS, CANVAS_THEMES } from "./registry";
import { getLinkVisualTokens, getTileVisualTokens } from "./resolvers";

describe("appearance registries and resolvers", () => {
  it("defines every semantic tile and link color for every Canvas Theme", () => {
    for (const theme of CANVAS_THEMES) {
      expect(Object.keys(theme.tileColors).sort()).toEqual([...TILE_TYPES].sort());
      expect(Object.keys(theme.linkColors).sort()).toEqual([...LINK_TYPES].sort());
      expect(theme.swatches).toHaveLength(4);
    }
  });

  it("defines a complete, theme-independent overlay for every Canvas Background", () => {
    for (const background of CANVAS_BACKGROUNDS) {
      expect(background.reactFlowOverlay.color).toBeTruthy();
      expect(background.reactFlowOverlay.gap).toBeGreaterThan(0);
      expect(background.reactFlowOverlay.size).toBeGreaterThan(0);
      expect(background.reactFlowOverlay.opacity).toBeGreaterThanOrEqual(0);
      expect(background.reactFlowOverlay.opacity).toBeLessThanOrEqual(1);
    }
  });

  it("centralizes Blueprint's Cyber icon contrast policy", () => {
    const blueprint = getTileVisualTokens("service", "blueprint");
    const cyber = getTileVisualTokens("service", "cyber");
    expect(blueprint.iconColor).toBe(cyber.iconColor);
    expect(blueprint.accentColor).not.toBe(cyber.accentColor);
  });

  it("resolves structural tile and edge label tokens", () => {
    expect(getTileVisualTokens("node", "nes").surfaceColor).toBe("#ffffff");
    expect(getLinkVisualTokens("calls", "blueprint").labelTextColor).toBe("#06245a");
    expect(getLinkVisualTokens("calls", "ember").strokeColor).toBe("#f472b6");
  });
});
