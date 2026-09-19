import { expect, test } from "@playwright/test";
import { appearanceKey, applyStyle, boot, mockCanvas, openStyleEditor, tileNode, tinyPng } from "./fixtures/publicCanvas";

test.use({ viewport: { width: 1440, height: 1000 } });

const themes = ["cyber", "aurora", "ember", "blueprint", "blueprint-ii", "nes", "revealer", "revealer-lite", "stellar"];
const backgrounds = ["grid", "hex", "tron_dark", "tron_lite", "blueprint", "blueprint_ii", "nes_grid", "lt_draft_grid", "zima_carbon", "nebula_dive", "tron_legacy", "pcb_trace"];

test("draft, Cancel, Reset, Apply and reload keep appearance independent of Atlas", async ({ page }) => {
  test.setTimeout(60_000);
  const api = await mockCanvas(page);
  await boot(page);
  await openStyleEditor(page);
  await expect(page.getByRole("combobox", { name: "Canvas Theme", exact: true }).locator("option")).toHaveCount(9);
  await expect(page.getByRole("combobox", { name: "Canvas Background", exact: true }).locator("option")).toHaveCount(12);
  await page.getByRole("combobox", { name: "Canvas Theme", exact: true }).selectOption("stellar");
  await page.getByRole("combobox", { name: "Canvas Background", exact: true }).selectOption("pcb_trace");
  await expect(page.locator(".canvas-style-preview")).toHaveAttribute("data-canvas-theme", "stellar");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "cyber");
  await expect(page.locator("section.canvas-frame")).toHaveAttribute("data-background", "hex");
  await expect(page.getByText("Unapplied changes", { exact: true })).toBeVisible();
  await expect(page.locator(".canvas-style-preview .pcb-trace-background")).toHaveAttribute("data-export", "true");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Canvas Theme", exact: true })).toHaveValue("cyber");
  await page.getByRole("combobox", { name: "Canvas Theme", exact: true }).selectOption("ember");
  await page.getByRole("dialog", { name: "Settings" }).getByLabel("Close settings").click();
  await openStyleEditor(page);
  await expect(page.getByRole("combobox", { name: "Canvas Theme", exact: true })).toHaveValue("cyber");
  await page.getByRole("combobox", { name: "Canvas Theme", exact: true }).selectOption("stellar");
  await page.getByRole("combobox", { name: "Canvas Background", exact: true }).selectOption("zima_carbon");
  await page.getByRole("button", { name: "Apply Canvas Style" }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "stellar");
  await page.reload();
  await expect(page.locator("section.canvas-frame")).toHaveAttribute("data-background", "zima_carbon");
  await openStyleEditor(page);
  await page.getByRole("button", { name: "Reset to Default" }).click();
  await expect(page.getByRole("combobox", { name: "Canvas Theme", exact: true })).toHaveValue("cyber");
  await expect(page.getByRole("combobox", { name: "Canvas Background", exact: true })).toHaveValue("hex");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "stellar");
  await page.getByRole("button", { name: "Apply Canvas Style" }).click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), appearanceKey)).toEqual({ version: 2, canvasThemeId: "cyber", canvasBackgroundId: "hex" });
  expect(api.saves).toHaveLength(0);
  expect(api.requests.some((r) => /auth|handbook|app\/update/.test(r))).toBe(false);
});

for (const theme of themes) test(`${theme}: tile states, selection, links and independent preview`, async ({ page }, testInfo) => {
  const api = await mockCanvas(page);
  await boot(page, theme);
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", theme);
  for (const id of ["node", "service", "flow", "note", "planned", "drive-a"]) await expect(tileNode(page, id)).toBeVisible();
  await expect(tileNode(page, "drive-a")).toHaveClass(/tile-node--stacked/);
  const cover = ["revealer", "revealer-lite", "stellar"].includes(theme);
  const node = tileNode(page, "node");
  await expect(node).toHaveAttribute("data-tile-presentation", cover ? "cover-reveal" : "standard");
  await node.click();
  await page.mouse.move(5, 5);
  await expect(node).toHaveAttribute("data-tile-selected", "true");
  if (cover) await expect.poll(() => node.evaluate((el) => getComputedStyle(el).getPropertyValue("--cover-reveal-progress").trim())).toBe("1");
  await expect(page.locator(".react-flow__edge-path").first()).toHaveAttribute("style", /stroke:/);
  await expect(page.locator(".react-flow__edge-text").first()).toContainText("calls");
  const stroke = await page.locator(".react-flow__edge-path").first().evaluate((el) => getComputedStyle(el).stroke);
  await page.getByRole("button", { name: "Switch connector routing to Avoid Tiles" }).click();
  await expect(page.locator(".react-flow__edge-avoidTiles")).toBeVisible();
  expect(await page.locator(".react-flow__edge-path").first().evaluate((el) => getComputedStyle(el).stroke)).toBe(stroke);
  await page.getByRole("button", { name: "Switch connector routing to Curved" }).click();
  const before = await node.evaluate((el) => ({ background: getComputedStyle(el).background, color: getComputedStyle(el).color }));
  await openStyleEditor(page);
  await page.getByRole("combobox", { name: "Canvas Theme", exact: true }).selectOption(theme === "stellar" ? "nes" : "stellar");
  expect(await node.evaluate((el) => ({ background: getComputedStyle(el).background, color: getComputedStyle(el).color }))).toEqual(before);
  await expect(page.locator("[data-app-appearance-mode]")).toHaveCount(0);
  expect(api.saves).toHaveLength(0);
  await page.screenshot({ path: testInfo.outputPath(`${theme}.png`) });
  await page.getByRole("dialog", { name: "Settings" }).getByLabel("Close settings").click();
  const box = (await node.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 45, box.y + 55, { steps: 8 });
  await expect(node).toHaveAttribute("data-tile-dragging", "true");
  await page.mouse.up();
  await expect(node).toHaveAttribute("data-tile-dragging", "false");
  await expect(page.locator(".react-flow__edge-path")).toBeVisible();
  await expect.poll(() => api.saves.length).toBeGreaterThan(0);
});

test("cover hover and dragging preserve handles and tile editing", async ({ page }) => {
  const api = await mockCanvas(page);
  await boot(page, "stellar");
  const node = tileNode(page, "node");
  await expect(node).toHaveAttribute("data-tile-selected", "false");
  await node.hover();
  await expect.poll(() => node.evaluate((el) => getComputedStyle(el).getPropertyValue("--cover-reveal-progress").trim())).toBe("1");
  const box = (await node.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + 65, { steps: 8 });
  await expect(node).toHaveAttribute("data-tile-dragging", "true");
  await page.mouse.up();
  await expect(node).toHaveAttribute("data-tile-dragging", "false");
  await expect(node.locator(".react-flow__handle")).toHaveCount(4);
  await expect.poll(() => api.saves.length).toBeGreaterThan(0);
  expect(await page.locator(".cover-reveal-art").first().evaluate((el) => getComputedStyle(el).backgroundImage)).toContain("StellarBodies.webp");
});

for (const background of backgrounds) test(`${background}: renders without blocking Canvas controls`, async ({ page }) => {
  const api = await mockCanvas(page);
  const assetErrors: string[] = [];
  page.on("response", (response) => { if (response.url().includes("/assets/") && response.status() >= 400) assetErrors.push(response.url()); });
  await boot(page, "cyber", background);
  const canvas = page.locator("section.canvas-frame");
  await expect(canvas).toHaveAttribute("data-background", background);
  await page.locator(".react-flow__controls-zoomin").click();
  await page.locator(".react-flow__controls-zoomout").click();
  // Exercise the whole supported zoom interval, including the Nebula band.
  const zoomOut = page.locator(".react-flow__controls-zoomout");
  const zoomIn = page.locator(".react-flow__controls-zoomin");
  for (let n = 0; n < 20 && await zoomOut.isEnabled(); n++) await zoomOut.click();
  await expect(zoomOut).toBeDisabled();
  for (let n = 0; n < 20 && await zoomIn.isEnabled(); n++) await zoomIn.click();
  await expect(zoomIn).toBeDisabled();
  await page.locator(".react-flow__controls-fitview").click();
  await tileNode(page, "service").click();
  await expect(page.locator('.inspector input[value="API Service"]')).toBeVisible();
  if (background === "zima_carbon") expect(await canvas.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain("zima-carbon.svg");
  if (background === "pcb_trace") await expect(canvas.locator(".pcb-trace-board")).toBeVisible();
  if (background === "tron_legacy") await expect(canvas.locator(".tron-legacy-plane")).toHaveCount(2);
  expect(assetErrors).toEqual([]);
  expect(api.saves).toHaveLength(0);
});

test("Nebula transitions with zoom without saving Atlas", async ({ page }) => {
  const api = await mockCanvas(page);
  await boot(page, "cyber", "nebula_dive");
  const layer = page.locator("section .zoom-canvas-background");
  for (let n = 0; n < 20 && await page.locator(".react-flow__controls-zoomout").isEnabled(); n++) await page.locator(".react-flow__controls-zoomout").click();
  await expect.poll(() => layer.evaluate((el) => el.style.getPropertyValue("--zoom-transition-progress"))).toBe("0");
  for (let n = 0; n < 20 && await page.locator(".react-flow__controls-zoomin").isEnabled(); n++) await page.locator(".react-flow__controls-zoomin").click();
  await expect.poll(() => layer.evaluate((el) => el.style.getPropertyValue("--zoom-transition-progress"))).toBe("1");
  expect(api.saves).toHaveLength(0);
});

for (const background of ["tron_legacy", "pcb_trace"]) test(`${background}: motion, visibility and frozen previews`, async ({ page }) => {
  const api = await mockCanvas(page);
  await boot(page, "cyber", background);
  const canvas = page.locator("section.canvas-frame");
  await expect.poll(() => canvas.locator("[data-route-id]").count(), { timeout: 15000 }).toBeGreaterThan(0);
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(canvas.locator("[data-route-id]")).toHaveCount(0);
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(() => canvas.locator("[data-route-id]").count(), { timeout: 15000 }).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas.locator("[data-route-id]")).toHaveCount(0);
  await openStyleEditor(page);
  await expect(page.locator(".canvas-style-preview [data-export='true']")).toHaveCount(1);
  await expect(page.locator(".canvas-style-preview [data-route-id]")).toHaveCount(0);
  await page.getByRole("combobox", { name: "Canvas Background", exact: true }).selectOption("hex");
  await page.getByRole("button", { name: "Apply Canvas Style" }).click();
  await expect(canvas.locator(".tron-legacy-background, .pcb-trace-background")).toHaveCount(0);
  expect(api.saves).toHaveLength(0);
});

test("Lucide selection saves in fields, survives reload, and resets to default", async ({ page }) => {
  const api = await mockCanvas(page);
  await boot(page);
  await tileNode(page, "node").click();
  await page.getByRole("button", { name: "Choose Icon" }).click();
  await expect(page.locator(".icon-library__option")).toHaveCount(46);
  await page.getByRole("button", { name: "Pizza", exact: true }).click();
  await expect(tileNode(page, "node").locator(".lucide-pizza")).toBeVisible();
  await expect.poll(() => api.saves.length).toBe(1);
  expect(api.atlas().tiles[0].fields).toMatchObject({ icon_ref: { kind: "lucide", id: "lucide:Pizza", name: "Pizza" } });
  await expect(page.locator(".inspector").getByText("icon_ref", { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(tileNode(page, "node").locator(".lucide-pizza")).toBeVisible();
  await tileNode(page, "node").click();
  await page.getByRole("button", { name: "Use Default" }).click();
  await expect.poll(() => api.saves.length).toBe(2);
  expect(api.atlas().tiles[0].fields).not.toHaveProperty("icon_ref");
});

test("upload selects immediately and deletion invalidates other mounted references", async ({ page }) => {
  const api = await mockCanvas(page, { sharedIcon: true });
  await boot(page);
  await expect(tileNode(page, "node").locator("img")).toBeVisible();
  await expect(tileNode(page, "service").locator("img")).toBeVisible();
  await tileNode(page, "node").click();
  await page.getByRole("button", { name: "Choose Icon" }).click();
  await page.locator(".icon-library__edit").click();
  await page.getByRole("button", { name: "Remove shared.png from icon library" }).click();
  await expect(tileNode(page, "node").locator("img")).toHaveCount(0);
  await expect(tileNode(page, "service").locator("img")).toHaveCount(0);
  await expect.poll(() => api.saves.length).toBe(1);
  expect(api.atlas().tiles[1].fields).toHaveProperty("icon_ref");
  await page.getByLabel("Upload New Icon", { exact: true }).setInputFiles({ name: "my-icon.png", mimeType: "image/png", buffer: tinyPng });
  await expect(tileNode(page, "node").locator("img")).toHaveAttribute("src", "/api/assets/icons/upload-uuid.png");
  await expect.poll(() => api.saves.length).toBe(2);
  expect(api.atlas().tiles[0].fields).toHaveProperty("icon_ref.id", "uploaded:upload-uuid.png");
  await page.reload();
  await expect(tileNode(page, "node").locator("img")).toBeVisible();
});

test("missing images and failed library requests retain usable defaults and Lucide options", async ({ page }) => {
  await mockCanvas(page, { missingIcon: true, listFails: true });
  await boot(page);
  await expect(tileNode(page, "node").locator("img")).toHaveCount(0);
  await expect(tileNode(page, "node").locator(".tile-node__icon svg")).toBeVisible();
  await tileNode(page, "node").click();
  await page.getByRole("button", { name: "Choose Icon" }).click();
  await expect(page.getByText("Library unavailable", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cpu", exact: true }).click();
  await expect(tileNode(page, "node").locator(".lucide-cpu")).toBeVisible();
});

test("switching tiles during upload cannot change the newly selected tile", async ({ page }) => {
  const api = await mockCanvas(page, { uploadDelay: 600 });
  await boot(page);
  await tileNode(page, "node").click();
  await page.getByRole("button", { name: "Choose Icon" }).click();
  const upload = page.waitForResponse((response) => response.url().endsWith("/api/assets/icons") && response.request().method() === "POST");
  await page.getByLabel("Upload New Icon", { exact: true }).setInputFiles({ name: "test.png", mimeType: "image/png", buffer: tinyPng });
  await tileNode(page, "service").click();
  await upload;
  await expect(page.locator(".icon-library")).toHaveCount(0);
  expect(api.saves).toHaveLength(0);
  expect(api.atlas().tiles[1].fields).not.toHaveProperty("icon_ref");
  await tileNode(page, "planned").click();
  await expect(page.getByRole("button", { name: "Choose Icon" })).toBeDisabled();
});

test("unavailable browser storage does not block style changes or editing", async ({ page }) => {
  const api = await mockCanvas(page);
  await page.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage blocked"); } }); });
  await page.goto("/");
  await expect(page.locator("section.canvas-frame")).toHaveAttribute("data-background", "hex");
  await applyStyle(page, "aurora", "grid");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "aurora");
  await tileNode(page, "node").click();
  await expect(page.locator('.inspector input[value="Primary Node"]')).toBeEditable();
  expect(api.saves).toHaveLength(0);
});
