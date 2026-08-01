import { expect, test, type Page, type Route } from "@playwright/test";

const atlas = {
  version: "0.1",
  metadata: { name: "Public Fork Test", description: "Canvas-only fixture", updated_at: null },
  tiles: [
    { id: "node-1", type: "node", title: "Primary Node", parent: null, position: { x: 100, y: 120 }, size: { width: 240, height: 132 }, lifecycle: "live", fields: { primary_node: true }, notes: "", tags: ["core"] },
    { id: "service-1", type: "service", title: "API Service", parent: "node-1", position: { x: 420, y: 120 }, size: { width: 240, height: 132 }, lifecycle: "live", fields: { port: 8080 }, notes: "", tags: [] }
  ],
  links: [{ id: "link-1", from: "node-1", to: "service-1", type: "contains", from_port: "child", to_port: "parent", lifecycle: "live", label: "contains", notes: "", directional: true }],
  views: [{ id: "everything", title: "Everything", description: "All Canvas objects", visible_types: [], visible_links: [], camera: { x: 0, y: 0, zoom: 1 } }],
  stacks: [],
  families: [{ id: "family-1", title: "Core Family", description: "Retained Family", member_tile_ids: ["node-1", "service-1"], position: { x: 50, y: 70 }, size: { width: 680, height: 280 }, order: 0, color: "#38a3ff", tag: "core" }]
};

async function mockApi(page: Page, demo: "missing" | "valid" | "invalid" = "missing") {
  const requests: string[] = [];
  let saves = 0;
  await page.route("**/api/**", async (route: Route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    requests.push(`${request.method()} ${path}`);
    if (path === "/api/atlas/demo") {
      if (demo === "valid") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...atlas, metadata: { ...atlas.metadata, name: "Runtime Demo" } }) });
      if (demo === "invalid") return route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ detail: "Demo atlas validation failed" }) });
      return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ detail: "No demo is configured. Fork owners can provide data/demo.json." }) });
    }
    if (path === "/api/atlas" && request.method() === "GET") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(atlas) });
    if (path === "/api/atlas" && request.method() === "PUT") {
      saves += 1;
      return route.fulfill({ status: 200, contentType: "application/json", body: request.postData() ?? JSON.stringify(atlas) });
    }
    if (path === "/api/app/version") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ deployment_type: "docker", channel: "beta", current_version: "test", build_sha: "test", build_date: "test" }) });
    if (path === "/api/health") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "ok", app: "CTRoadmap" }) });
    if (path === "/api/debug/log") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ events: [] }) });
    return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ detail: "not found" }) });
  });
  return { requests, saveCount: () => saves };
}

test("boots directly into the fixed Canvas fork and retains core controls", async ({ page }) => {
  const api = await mockApi(page);
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await expect(page.locator(".canvas-frame")).toBeVisible();
  await expect(page.locator(".brand__logo")).toHaveAttribute("src", "/brand/ctroadmap-topbar-logo.png");
  await expect(page.getByText("Primary Node", { exact: true })).toBeVisible();
  await expect(page.getByText("Core Family", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Planning Mode" })).toBeVisible();
  await expect(page.getByText(/Handbook|Discord|Passcode|Update Advisory/i)).toHaveCount(0);
  expect(api.requests.some((request) => /\/api\/(auth|app\/update|assets\/icons)/.test(request))).toBeFalsy();

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByText("CYBER · HEX", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Preview" }).click();
  const savesBeforeReset = api.saveCount();
  await page.getByRole("button", { name: /Reset to CYBER/ }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ctroadmap.public.canvasAppearance.v1"))).toBe('{"version":1,"canvasTheme":"cyber","canvasBackground":"hex"}');
  expect(api.saveCount()).toBe(savesBeforeReset);

  await page.getByRole("dialog", { name: "Settings" }).getByLabel("Close settings").click();
  await page.getByRole("button", { name: "Tile Palette" }).click();
  await page.getByTitle("Click to create Service; drag onto the map to place it.").click();
  await expect(page.locator('.inspector input[value="NEW SERVICE 1"]')).toBeVisible();
  await expect.poll(api.saveCount).toBeGreaterThan(savesBeforeReset);
});

test("Load Demo invalid response preserves the current atlas", async ({ page }) => {
  await mockApi(page, "invalid");
  page.on("dialog", (dialog) => dialog.type() === "confirm" ? dialog.accept() : dialog.dismiss());
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await expect(page.getByText("Primary Node", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("menuitem", { name: "Load Demo" }).click();
  await expect(page.getByText("Primary Node", { exact: true })).toBeVisible();
  await expect(page.locator(".status-strip")).toContainText("Demo atlas validation failed");
});

test("Load Demo accepts a valid runtime atlas only after confirmation", async ({ page }) => {
  await mockApi(page, "valid");
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("menuitem", { name: "Load Demo" }).click();
  await expect(page.locator(".status-strip")).toContainText("Demo loaded");
});

test("Load Demo missing response names the optional runtime path", async ({ page }) => {
  await mockApi(page, "missing");
  page.on("dialog", (dialog) => dialog.type() === "confirm" ? dialog.accept() : dialog.dismiss());
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("menuitem", { name: "Load Demo" }).click();
  await expect(page.locator(".status-strip")).toContainText("data/demo.json");
  await expect(page.getByText("Primary Node", { exact: true })).toBeVisible();
});
