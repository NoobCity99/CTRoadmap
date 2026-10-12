import { expect, test } from "@playwright/test";
import { mockCanvas } from "./fixtures/publicCanvas";

const storageKey = "ctroadmap.public.splitSourceNotice.v1";
const hideDuration = 96 * 60 * 60 * 1000;

test.beforeEach(async ({ page }) => {
  await mockCanvas(page);
});

test("notice appears at the far right and opens a white modal with blue text and only an X action", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/");
  const notice = page.getByRole("button", { name: "NOTICE", exact: true });
  await expect(notice).toBeVisible();
  await expect(notice).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(notice).toHaveCSS("background-color", "rgb(200, 30, 30)");
  await expect(notice).not.toHaveCSS("box-shadow", "none");
  const settingsBox = await page.getByRole("button", { name: "Settings", exact: true }).boundingBox();
  const noticeBox = await notice.boundingBox();
  expect(noticeBox!.x).toBeGreaterThan(settingsBox!.x + settingsBox!.width);
  expect(1600 - noticeBox!.x - noticeBox!.width).toBeLessThanOrEqual(20);

  await notice.click();
  const modal = page.getByRole("dialog", { name: "Split-Source Model" });
  await expect(modal).toBeVisible();
  await expect(modal).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(modal).toHaveCSS("color", "rgb(30, 64, 175)");
  await expect(modal.locator("p")).toHaveText([
    "CTRoadmap follows an intentional split-source / open-core development model. The publicly available source focuses on the Canvas and diagramming functionality, while the full application—including Handbook, Rack View, and Mobile View—is developed in a private repository and distributed through the public Docker image.",
    "The public repository is not currently a source-complete representation of the distributed application, and its diagramming code may lag behind the latest release. My goal is to progressively bring the public Canvas implementation into alignment with the shipping version while retaining flexibility around the development of additional features."
  ]);
  await expect(modal.locator("strong")).toHaveText("split-source / open-core development model");
  await expect(modal.getByRole("button")).toHaveCount(1);
  await expect(modal.getByRole("button", { name: "Close notice" })).toBeFocused();
  await page.keyboard.press("Escape");
  await page.mouse.click(5, 5);
  await expect(modal).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
  await modal.getByRole("button", { name: "Close notice" }).click();
  await expect(modal).toHaveCount(0);
  await expect(notice).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeFocused();
});

test("first dismissal lasts exactly 96 hours across reloads and the second stays hidden", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-11T12:00:00Z") });
  await page.goto("/");
  const notice = page.getByRole("button", { name: "NOTICE", exact: true });
  await notice.click();
  await page.getByRole("button", { name: "Close notice" }).click();
  const firstDismissal = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(firstDismissal.dismissals).toBe(1);
  await page.reload();
  await expect(page.locator(".topbar")).toBeVisible();
  await expect(notice).toHaveCount(0);

  const expiresAt = firstDismissal.dismissedAt + hideDuration;
  await page.clock.pauseAt(expiresAt - 1);
  await expect(notice).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(notice).toBeVisible();
  await notice.click();
  await page.getByRole("button", { name: "Close notice" }).click();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).dismissals, storageKey)).toBe(2);
  await page.clock.fastForward(365 * 24 * 60 * 60 * 1000);
  await page.reload();
  await expect(page.locator(".topbar")).toBeVisible();
  await expect(notice).toHaveCount(0);
});

test("an expired first dismissal shows the notice on a later visit", async ({ page }) => {
  await page.addInitScript(({ key, duration }) => {
    localStorage.setItem(key, JSON.stringify({ dismissals: 1, dismissedAt: Date.now() - duration }));
  }, { key: storageKey, duration: hideDuration });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "NOTICE", exact: true })).toBeVisible();
});

test("notice remains usable on a narrow screen when storage is unavailable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage blocked"); } });
  });
  await page.goto("/");
  const notice = page.getByRole("button", { name: "NOTICE", exact: true });
  await notice.click();
  const modal = page.getByRole("dialog", { name: "Split-Source Model" });
  const box = await modal.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  expect(box!.height).toBeLessThanOrEqual(667);
  await modal.getByRole("button", { name: "Close notice" }).click();
  await expect(notice).toHaveCount(0);
  await expect(page.locator("section.canvas-frame")).toBeVisible();
});
