import { afterEach, describe, expect, it, vi } from "vitest";
import { getCanvasTheme } from "../appearance";
import type { Atlas, Link, Tile } from "../types/atlas";
import { emptyStackState } from "./atlasSelectors";
import { isEditableNodeChange, mapAtlasToEdges, mapAtlasToNodes, mergeNodeMeasurements } from "./graphMapping";
import { deleteTileIcon, listTileIcons, uploadTileIcon } from "./api";

const tile: Tile = { id: "node", type: "node", title: "Node", position: { x: 5, y: 9 }, fields: { icon_ref: { kind: "lucide", id: "lucide:Cpu", name: "Cpu" } } };
const link: Link = { id: "calls", from: "node", to: "service", type: "calls" };

describe("appearance integration", () => {
  it("retains measured geometry while replacing appearance and selection data", () => {
    const current = [{ id: "node", position: tile.position, measured: { width: 240, height: 132 }, data: { old: true } }];
    const next = [{ id: "node", position: { x: 30, y: 40 }, data: { theme: "stellar", isSelected: true } }];
    expect(mergeNodeMeasurements(next, current)).toEqual([{ ...next[0], measured: current[0].measured }]);
    expect(next[0]).not.toHaveProperty("measured");
  });
  it("accepts display measurements for planned tiles while rejecting edits in Live View", () => {
    const nodes = [{ id: "node", position: tile.position, data: { tile: { ...tile, lifecycle: "planned" } } }];
    expect(isEditableNodeChange({ type: "dimensions", id: "node", dimensions: { width: 240, height: 132 } }, nodes, "live")).toBe(true);
    expect(isEditableNodeChange({ type: "select", id: "node", selected: true }, nodes, "live")).toBe(true);
    expect(isEditableNodeChange({ type: "position", id: "node", position: { x: 20, y: 40 } }, nodes, "live")).toBe(false);
    expect(isEditableNodeChange({ type: "position", id: "node", position: { x: 20, y: 40 } }, nodes, "planning")).toBe(true);
  });
  it("threads theme and application selection through graph data without mutating Atlas", () => {
    const atlas: Atlas = { version: "0.1", metadata: { name: "Test", description: "", updated_at: null }, tiles: [tile], links: [link], views: [], stacks: [], families: [] };
    const original = JSON.stringify(atlas);
    const nodes = mapAtlasToNodes({ canvasThemeId: "stellar", appMode: "live", atlas, childrenByParent: new Map(), isInteractive: true, selection: { kind: "tile", id: "node" }, stackState: emptyStackState(), visibleTiles: [tile], visibleLinks: [link], onFocusFamily: vi.fn(), onResizeFamily: vi.fn() });
    expect(nodes[0].data).toMatchObject({ isSelected: true, visualTokens: { tilePresentation: "cover-reveal", accentColor: getCanvasTheme("stellar").tileColors.node } });
    for (const connectorRoutingMode of ["curved", "avoid_tiles"] as const) {
      const edges = mapAtlasToEdges("live", [link], emptyStackState(), { canvasThemeId: "ember", connectorRoutingMode });
      expect(edges[0].style?.stroke).toBe(getCanvasTheme("ember").linkColors.calls);
      expect(edges[0].labelBgStyle?.fill).toBe(getCanvasTheme("ember").visuals.edgeLabelSurface);
    }
    expect(JSON.stringify(atlas)).toBe(original);
  });
});

describe("public icon API client", () => {
  afterEach(() => vi.unstubAllGlobals());
  const uploaded = { id: "uuid", filename: "uuid.png", url: "/api/assets/icons/uuid.png", media_type: "image/png" };

  it("lets the browser set the multipart boundary and normalizes list responses", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(uploaded), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ icons: [uploaded] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const file = new File(["png"], "test.png", { type: "image/png" });
    expect(await uploadTileIcon(file)).toEqual(uploaded);
    const init = fetch.mock.calls[0][1] as RequestInit;
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBe(file);
    expect(init.headers).toBeUndefined();
    expect(init.credentials).toBeUndefined();
    expect((await listTileIcons()).icons[0]).toEqual({ ...uploaded, kind: "uploaded", id: "uploaded:uuid.png" });
  });

  it("surfaces backend errors and safely encodes deletion filenames", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Icon not found" }), { status: 404 }));
    vi.stubGlobal("fetch", fetch);
    await expect(deleteTileIcon("../bad.png")).rejects.toThrow("Icon not found");
    expect(fetch.mock.calls[0][0]).toBe("/api/assets/icons/..%2Fbad.png");
  });
});
