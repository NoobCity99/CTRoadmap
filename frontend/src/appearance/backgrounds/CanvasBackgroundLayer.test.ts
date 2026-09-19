import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { getCanvasBackground } from "../registry";
import type { CanvasBackgroundDefinition } from "../types";
import { CanvasBackgroundLayer } from "./CanvasBackgroundLayer";

describe("Canvas decorative renderer boundary", () => {
  it("keeps static backgrounds and unknown renderer/ID pairings empty", () => {
    const { renderer, zoomTransition, ...base } = getCanvasBackground("grid");
    const backgrounds: CanvasBackgroundDefinition[] = [
      getCanvasBackground("grid"),
      { ...base, id: "tron_legacy", renderer: "zoom-transition", zoomTransition: { transitionStart: 0.73, transitionEnd: 1.1 } },
      { ...base, id: "nebula_dive", renderer: "animated" }
    ];
    for (const background of backgrounds) {
      expect(renderToStaticMarkup(createElement(CanvasBackgroundLayer, { background }))).toBe("");
    }
  });
  it("requires zoom configuration exclusively on the zoom renderer at compile time", () => {
    const { renderer, zoomTransition, ...base } = getCanvasBackground("grid");
    const band = { transitionStart: 0.73, transitionEnd: 1.1 };
    const zoom: CanvasBackgroundDefinition = { ...base, renderer: "zoom-transition", zoomTransition: band };
    expect(zoom.zoomTransition).toEqual(band);
    // These guards are checked by the production TypeScript build, not Vitest.
    // @ts-expect-error A zoom renderer must declare its transition band.
    ({ ...base, renderer: "zoom-transition" } satisfies CanvasBackgroundDefinition);
    // @ts-expect-error Static backgrounds cannot carry zoom configuration.
    ({ ...base, renderer: "static", zoomTransition: band } satisfies CanvasBackgroundDefinition);
    // @ts-expect-error Animated backgrounds cannot carry zoom configuration.
    ({ ...base, renderer: "animated", zoomTransition: band } satisfies CanvasBackgroundDefinition);
  });
  it("exports only deep Nebula stars while retaining the live near scene and static preview", () => {
    const background = getCanvasBackground("nebula_dive");
    expect(renderToStaticMarkup(createElement(CanvasBackgroundLayer, { background, previewMode: true }))).toBe("");
    for (const exportMode of [false, true]) {
      const markup = renderToStaticMarkup(createElement(ReactFlowProvider, null, createElement(CanvasBackgroundLayer, { background, exportMode })));
      expect(markup).toContain("zoom-bg--nebula-dive");
      for (const layer of ["zoom-bg__deep", "zoom-bg__stars--small", "zoom-bg__stars--medium", "zoom-bg__stars--large"]) {
        expect(markup).toContain(layer);
      }
      for (const layer of ["zoom-bg__near", "zoom-bg__space-base", "zoom-bg__nebula", "zoom-bg__clouds", "zoom-bg__near-stars", "zoom-bg__asset"]) {
        expect(markup.includes(layer)).toBe(!exportMode);
      }
      expect(markup).toContain("--zoom-transition-progress:");
      expect(markup).toContain("--zoom-near-opacity:");
      expect(markup).toContain("--zoom-deep-opacity:");
      if (exportMode) {
        expect(markup).toContain("--zoom-transition-progress:1;");
        expect(markup).toContain("--zoom-near-opacity:0;");
        expect(markup).toContain("--zoom-deep-opacity:1;");
      }
      expect(markup.includes("/assets/backgrounds/nebula-dive/nebula.svg")).toBe(!exportMode);
      expect(markup.includes("/assets/backgrounds/nebula-dive/clouds.svg")).toBe(!exportMode);
      expect(markup.includes('data-export="true"')).toBe(exportMode);
    }
  });
  it("renders Tron without React Flow and freezes previews and exports", () => {
    for (const mode of [{ previewMode: true }, { exportMode: true }]) {
      const markup = renderToStaticMarkup(createElement(CanvasBackgroundLayer, { background: getCanvasBackground("tron_legacy"), ...mode }));
      expect(markup).toContain("tron-legacy-background");
      expect(markup).toContain('data-export="true"');
      expect(markup).not.toContain("data-route-id");
    }
  });
  it("renders static PCB previews/exports with unique SVG references and no pulses", () => {
    const background = getCanvasBackground("pcb_trace");
    const markup = renderToStaticMarkup(createElement(Fragment, null,
      createElement(CanvasBackgroundLayer, { background, previewMode: true }),
      createElement(CanvasBackgroundLayer, { background, exportMode: true })
    ));
    expect(markup.match(/data-export="true"/g)).toHaveLength(2);
    expect(markup.match(/data-pcb-route=/g)).toHaveLength(26);
    expect(markup).not.toContain('class="pcb-trace-active"');
    const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [, id] of markup.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(id);
  });
});
