import { expect, test } from "@playwright/test";
import { boot, mockCanvas, openStyleEditor, tileNode, tinyPng } from "./fixtures/publicCanvas";

test.use({ viewport: { width: 1440, height: 1000 } });

test("failed upload and deletion leave saved icon references usable", async ({ page }) => {
  const api = await mockCanvas(page, { sharedIcon: true, uploadFails: true, deleteFails: true });
  await boot(page);
  await tileNode(page, "node").click();
  await page.getByRole("button", { name: "Choose Icon" }).click();
  await page.getByLabel("Upload New Icon", { exact: true }).setInputFiles({ name: "test.png", mimeType: "image/png", buffer: tinyPng });
  await expect(page.getByText("Upload failed", { exact: true })).toBeVisible();
  await page.locator(".icon-library__edit").click();
  await page.getByRole("button", { name: "Remove shared.png from icon library" }).click();
  await expect(page.getByText("Delete failed", { exact: true })).toBeVisible();
  await expect(tileNode(page, "node").locator("img")).toBeVisible();
  await expect(tileNode(page, "service").locator("img")).toBeVisible();
  expect(api.saves).toHaveLength(0);
});

test("changing editability during upload cannot edit a live tile in Planning Mode", async ({ page }) => {
  const api = await mockCanvas(page, { uploadDelay: 800 });
  await boot(page);
  await tileNode(page, "node").click();
  await page.getByRole("button", { name: "Choose Icon" }).click();
  const uploaded = page.waitForResponse((response) => response.request().method() === "POST" && response.url().endsWith("/api/assets/icons"));
  await page.getByLabel("Upload New Icon", { exact: true }).setInputFiles({ name: "test.png", mimeType: "image/png", buffer: tinyPng });
  await page.getByRole("button", { name: "Planning Mode", exact: true }).click();
  await uploaded;
  // Public mode switching clears selection; selecting again remains read-only.
  await tileNode(page, "node").click();
  await expect(page.getByRole("button", { name: "Choose Icon" })).toBeDisabled();
  expect(api.saves).toHaveLength(0);
  expect(api.atlas().tiles[0].fields).not.toHaveProperty("icon_ref");
});

test("a delayed library response cannot erase an upload that just completed", async ({ page }) => {
  await mockCanvas(page);
  await page.route("**/api/assets/icons", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ icons: [] }) });
  });
  await boot(page);
  await tileNode(page, "node").click();
  const listed = page.waitForResponse((response) => response.request().method() === "GET" && response.url().endsWith("/api/assets/icons"));
  await page.getByRole("button", { name: "Choose Icon" }).click();
  await page.getByLabel("Upload New Icon", { exact: true }).setInputFiles({ name: "test.png", mimeType: "image/png", buffer: tinyPng });
  await expect(tileNode(page, "node").locator("img")).toBeVisible();
  await listed;
  await expect(page.getByTitle("upload-uuid.png", { exact: true })).toBeVisible();
});

test("unavailable Web Animations keeps Tron static and Canvas editable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => { Object.defineProperty(Element.prototype, "animate", { configurable: true, value: undefined }); });
  const api = await mockCanvas(page);
  await boot(page, "cyber", "tron_legacy");
  await expect(page.locator(".tron-legacy-plane")).toHaveCount(2);
  await expect(page.locator(".tron-legacy-background")).toHaveAttribute("data-export", "true");
  await tileNode(page, "node").click();
  await expect(page.locator('.inspector input[value="Primary Node"]')).toBeEditable();
  await expect(page.locator("[data-route-id]")).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(api.saves).toHaveLength(0);
});

test("appearance controls and draft preview remain usable on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 });
  const api = await mockCanvas(page);
  await boot(page);
  await openStyleEditor(page);
  await page.getByRole("combobox", { name: "Canvas Theme", exact: true }).selectOption("blueprint-ii");
  await page.getByRole("combobox", { name: "Canvas Background", exact: true }).selectOption("nebula_dive");
  const preview = page.locator(".canvas-style-preview");
  await expect(preview).toBeVisible();
  expect(await preview.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Apply Canvas Style" }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "blueprint-ii");
  expect(api.saves).toHaveLength(0);
});
