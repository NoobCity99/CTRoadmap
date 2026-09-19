import { expect, type Page } from "@playwright/test";

export const appearanceKey = "ctroadmap.public.canvasAppearance.v2";
export const tinyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1X8AAAAASUVORK5CYII=", "base64");

export function canvasAtlas() {
  const tiles = [
    { id: "node", type: "node", title: "Primary Node", parent: null, position: { x: 0, y: 0 }, fields: { primary_node: true, ip: "127.0.0.1" } },
    { id: "service", type: "service", title: "API Service", parent: "node", position: { x: 320, y: 0 }, fields: { port: 8080 } },
    { id: "flow", type: "flow", title: "Operations Flow", parent: null, position: { x: 0, y: 230 }, fields: { steps: [] } },
    { id: "note", type: "note", title: "Operations Note", parent: null, position: { x: 320, y: 230 }, fields: { text: "Keep this readable" } },
    { id: "planned", type: "service", title: "Planned Service", parent: null, position: { x: 640, y: 230 }, fields: { port: 9090 } },
    { id: "drive-a", type: "drive", title: "Storage", parent: "node", position: { x: 640, y: 0 }, fields: { path: "/data" } },
    { id: "drive-b", type: "drive", title: "Storage B", parent: "node", position: { x: 640, y: 0 }, fields: { path: "/backup" } }
  ].map((tile) => ({ ...tile, size: { width: 240, height: 132 }, lifecycle: tile.id === "planned" ? "planned" : "live", tags: ["test"], notes: "" }));
  return {
    version: "0.1", metadata: { name: "Appearance Test", description: "Public fixture", updated_at: null }, tiles,
    links: [{ id: "calls", from: "node", to: "service", type: "calls", from_port: "out", to_port: "in", lifecycle: "live", label: "calls", directional: true, notes: "" }],
    views: [{ id: "everything", title: "Everything", description: "All", visible_types: [], visible_links: [], camera: { x: 0, y: 0, zoom: 1 } }],
    stacks: [{ id: "storage-stack", parent_id: "node", tile_type: "drive", member_ids: ["drive-a", "drive-b"], representative_id: "drive-a", name: "Storage stack", name_is_custom: true }], families: []
  };
}

export async function mockCanvas(page: Page, options: { missingIcon?: boolean; sharedIcon?: boolean; listFails?: boolean; uploadDelay?: number; uploadFails?: boolean; deleteFails?: boolean } = {}) {
  let atlas = canvasAtlas();
  const icon = { id: "uploaded:shared.png", filename: "shared.png", url: "/api/assets/icons/shared.png", media_type: "image/png" };
  let icons = options.sharedIcon ? [icon] : [];
  if (options.sharedIcon || options.missingIcon) {
    for (const id of ["node", "service"]) Object.assign(atlas.tiles.find((tile) => tile.id === id)!.fields, { icon_ref: { ...icon, kind: "uploaded" } });
  }
  const saves: unknown[] = [];
  const requests: string[] = [];
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    requests.push(`${method} ${path}`);
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (path === "/api/atlas") {
      if (method === "PUT") { atlas = request.postDataJSON(); saves.push(atlas); }
      return json(atlas);
    }
    if (path === "/api/assets/icons") {
      if (method === "POST") {
        if (options.uploadDelay) await new Promise((resolve) => setTimeout(resolve, options.uploadDelay));
        if (options.uploadFails) return json({ detail: "Upload failed" }, 500);
        const uploaded = { id: "upload-uuid", filename: "upload-uuid.png", url: "/api/assets/icons/upload-uuid.png", media_type: "image/png" };
        icons.unshift({ ...uploaded, id: `uploaded:${uploaded.filename}` });
        return json(uploaded);
      }
      if (options.listFails) return json({ detail: "Library unavailable" }, 500);
      return json({ icons });
    }
    if (path.startsWith("/api/assets/icons/")) {
      if (method === "DELETE") {
        if (options.deleteFails) return json({ detail: "Delete failed" }, 500);
        icons = icons.filter((asset) => asset.url !== path);
        return json({ status: "deleted" });
      }
      if (!icons.some((asset) => asset.url === path)) return json({ detail: "Icon not found" }, 404);
      return route.fulfill({ status: 200, contentType: "image/png", body: tinyPng });
    }
    if (path === "/api/health") return json({ status: "ok", app: "CTRoadmap" });
    if (path === "/api/app/version") return json({ current_version: "test", build_sha: "test", build_date: "test", deployment_type: "docker", channel: "beta" });
    if (path === "/api/debug/log") return json({ events: [] });
    return json({ detail: "Not found" }, 404);
  });
  return { saves, requests, atlas: () => atlas };
}

export async function boot(page: Page, theme = "cyber", background = "hex") {
  await page.addInitScript(({ key, theme, background }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, canvasThemeId: theme, canvasBackgroundId: background }));
  }, { key: appearanceKey, theme, background });
  await page.goto("/");
  await expect(page.locator("section.canvas-frame")).toBeVisible();
  await expect(page.locator(".react-flow__node").last()).toBeVisible();
  // Initial fit-to-view can move a tile after Playwright has placed the pointer.
  // Wait for the actual camera transform to settle before hover/drag assertions.
  await page.evaluate(() => new Promise<void>((resolve) => {
    const viewport = document.querySelector(".react-flow__viewport")!;
    let lastTransform = getComputedStyle(viewport).transform;
    let stableSince = performance.now();
    const check = (now: number) => {
      const transform = getComputedStyle(viewport).transform;
      if (transform !== lastTransform) {
        lastTransform = transform;
        stableSince = now;
      }
      if (now - stableSince >= 150) resolve();
      else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }));
}

export async function openStyleEditor(page: Page) {
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
}

export async function applyStyle(page: Page, theme: string, background: string) {
  await openStyleEditor(page);
  await page.getByRole("combobox", { name: "Canvas Theme", exact: true }).selectOption(theme);
  await page.getByRole("combobox", { name: "Canvas Background", exact: true }).selectOption(background);
  const apply = page.getByRole("button", { name: "Apply Canvas Style" });
  if (await apply.isEnabled()) await apply.click();
  await page.getByRole("dialog", { name: "Settings" }).getByLabel("Close settings").click();
}

export const tileNode = (page: Page, id: string) => page.locator(`.react-flow__node[data-id="${id}"] .tile-node`);
