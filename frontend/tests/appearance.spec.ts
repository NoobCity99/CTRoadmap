import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const atlas = JSON.parse(readFileSync(fileURLToPath(new URL("../../data/atlas.json", import.meta.url)), "utf8"));
const preferenceKey = "ctroadmap.appearancePreferences.v2";
const v1Key = "ctroadmap.appearancePreferences.v1";

const appVersion = {
  deployment_type: "source",
  channel: "beta",
  current_version: "0.3.0-beta",
  build_sha: "playwright",
  build_date: "2026-07-17"
};

const updateAdvisory = {
  ...appVersion,
  status: "current",
  state: {
    last_checked_at: "2026-07-17T00:00:00Z",
    last_result: "current",
    latest_seen_version: "0.3.0-beta",
    target: null,
    last_error: null,
    update_checks_enabled: true,
    check_interval_hours: 24
  },
  latest_version: "0.3.0-beta",
  manifest_url: "mock://manifest",
  target: null,
  error: null
};

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => console.error(`Browser page error: ${error.message}`));
  page.on("crash", () => console.error("Browser page crashed"));
});

async function installApiMocks(page: Page) {
  let atlasPutCount = 0;
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/atlas" && request.method() === "PUT") {
      atlasPutCount += 1;
      return route.fulfill({ json: atlas });
    }
    if (pathname === "/api/atlas") return route.fulfill({ json: atlas });
    if (pathname === "/api/auth/status") {
      return route.fulfill({ json: { passcode_configured: true, authenticated: true, session_expires_at: null } });
    }
    if (pathname === "/api/app/version") return route.fulfill({ json: appVersion });
    if (pathname === "/api/app/update") return route.fulfill({ json: updateAdvisory });
    if (pathname === "/api/health") return route.fulfill({ json: { app: "CTRoadmap", status: "ok" } });
    if (pathname === "/api/assets/icons") return route.fulfill({ json: { icons: [] } });
    if (pathname === "/api/debug/log") return route.fulfill({ json: { events: [] } });
    return route.fulfill({ status: 204, body: "" });
  });
  return () => atlasPutCount;
}

async function initializeStorage(page: Page, entries: Record<string, string> = {}) {
  await page.addInitScript((initialEntries) => {
    if (sessionStorage.getItem("ctroadmap.playwright.initialized") === "true") return;
    localStorage.clear();
    localStorage.setItem("ctroadmap.updatePopup.0.3.0-beta", JSON.stringify({ dismissCount: 2, completed: true }));
    for (const [key, value] of Object.entries(initialEntries)) localStorage.setItem(key, value);
    sessionStorage.setItem("ctroadmap.playwright.initialized", "true");
  }, entries);
}

async function loadApp(page: Page) {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator(".canvas-frame")).toBeVisible();
}

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
}

test("fresh storage persists the Classic defaults without writing atlas", async ({ page }) => {
  const getAtlasPutCount = await installApiMocks(page);
  await initializeStorage(page);
  await loadApp(page);

  await expect(page.locator(".app-shell")).toHaveAttribute("data-app-appearance-mode", "classic");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "cyber");
  await expect(page.locator(".canvas-frame")).toHaveAttribute("data-background", "grid");
  expect(await page.evaluate((key) => localStorage.getItem(key), preferenceKey)).not.toBeNull();
  expect(getAtlasPutCount()).toBe(0);
});

test("v1 is imported read-only and both remembered mode styles survive switching", async ({ page }) => {
  const getAtlasPutCount = await installApiMocks(page);
  const v1 = JSON.stringify({
    version: 1,
    appAppearanceMode: "classic",
    perMode: {
      classic: { themePalette: "ember", canvasBackground: "hex" },
      zima: { themePalette: "nes", canvasBackground: "nes_grid" }
    }
  });
  await initializeStorage(page, { [v1Key]: v1 });
  await loadApp(page);

  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "ember");
  await expect(page.locator(".canvas-frame")).toHaveAttribute("data-background", "hex");
  await openSettings(page);
  await page.getByRole("button", { name: "ZIMA Mode" }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "nes");
  await expect(page.locator(".canvas-frame")).toHaveAttribute("data-background", "nes_grid");
  await page.getByRole("button", { name: "Classic Mode" }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "ember");
  await expect(page.evaluate((key) => localStorage.getItem(key), v1Key)).resolves.toBe(v1);
  expect(getAtlasPutCount()).toBe(0);
});

test("draft preview is isolated; Apply commits once and restores focus", async ({ page }) => {
  const getAtlasPutCount = await installApiMocks(page);
  await initializeStorage(page);
  await loadApp(page);
  await openSettings(page);
  await page.getByRole("button", { name: "Customize", exact: true }).click();

  const classicShellSurface = await page.locator(".app-shell").evaluate((element) => getComputedStyle(element).getPropertyValue("--app-shell-bg").trim());
  await page.getByLabel("Canvas Theme").selectOption("aurora");
  await page.getByLabel("Canvas Background").selectOption("pcb_board");
  await expect(page.getByText("Unapplied changes")).toBeVisible();
  await expect(page.locator(".canvas-style-preview")).toHaveAttribute("data-canvas-theme", "aurora");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "cyber");
  await expect(page.locator(".canvas-frame").first()).toHaveAttribute("data-background", "grid");
  expect(getAtlasPutCount()).toBe(0);

  await page.getByRole("button", { name: "Apply Canvas Style" }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Settings" })).toBeFocused();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "aurora");
  await expect(page.locator(".canvas-frame")).toHaveAttribute("data-background", "pcb_board");
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), preferenceKey);
  expect(stored.perMode.classic).toEqual({ canvasThemeId: "aurora", canvasBackgroundId: "pcb_board" });
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "aurora");
  await expect(page.locator(".canvas-frame")).toHaveAttribute("data-background", "pcb_board");
  const reloadedShellSurface = await page.locator(".app-shell").evaluate((element) => getComputedStyle(element).getPropertyValue("--app-shell-bg").trim());
  expect(reloadedShellSurface).toBe(classicShellSurface);
  expect(getAtlasPutCount()).toBe(0);
});

test("Cancel and manual collapse discard drafts while Reset remains draft-only", async ({ page }) => {
  const getAtlasPutCount = await installApiMocks(page);
  const v2 = JSON.stringify({
    version: 2,
    appAppearanceMode: "classic",
    perMode: { classic: { canvasThemeId: "ember", canvasBackgroundId: "hex" } }
  });
  await initializeStorage(page, { [preferenceKey]: v2 });
  await loadApp(page);
  await openSettings(page);
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await page.getByRole("button", { name: "Reset to Default" }).click();
  await expect(page.getByLabel("Canvas Theme")).toHaveValue("cyber");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "ember");
  await page.getByRole("button", { name: "Collapse", exact: true }).click();
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await expect(page.getByLabel("Canvas Theme")).toHaveValue("ember");
  await page.getByLabel("Canvas Theme").selectOption("nes");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeHidden();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "ember");
  await expect(page.evaluate((key) => localStorage.getItem(key), preferenceKey)).resolves.toBe(v2);
  expect(getAtlasPutCount()).toBe(0);
});

test("first ZIMA entry initializes once and later customization remains independent", async ({ page }) => {
  const getAtlasPutCount = await installApiMocks(page);
  await initializeStorage(page);
  await loadApp(page);
  await openSettings(page);
  await page.getByRole("button", { name: "ZIMA Mode" }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-app-appearance-mode", "zima");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "blueprint");
  await expect(page.locator(".canvas-frame")).toHaveAttribute("data-background", "zima_carbon");
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await page.getByLabel("Canvas Theme").selectOption("aurora");
  await page.getByLabel("Canvas Background").selectOption("tron_lite");
  await page.getByRole("button", { name: "Apply Canvas Style" }).click();

  await openSettings(page);
  await page.getByRole("button", { name: "Classic Mode" }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "cyber");
  await page.getByRole("button", { name: "ZIMA Mode" }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-canvas-theme", "aurora");
  await expect(page.locator(".canvas-frame")).toHaveAttribute("data-background", "tron_lite");
  expect(getAtlasPutCount()).toBe(0);
});

test("mode switching collapses a draft and the editor remains usable at mobile width", async ({ page }) => {
  const getAtlasPutCount = await installApiMocks(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await initializeStorage(page);
  await loadApp(page);
  await openSettings(page);
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await page.getByLabel("Canvas Theme").selectOption("ember");
  await page.getByRole("button", { name: "ZIMA Mode" }).click();

  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Customize", exact: true })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await expect(page.getByLabel("Canvas Theme")).toHaveValue("blueprint");
  await expect(page.getByRole("button", { name: "Apply Canvas Style" })).toBeDisabled();
  const horizontalOverflow = await page.locator(".settings-panel").evaluate((panel) => panel.scrollWidth > panel.clientWidth + 1);
  expect(horizontalOverflow).toBe(false);
  expect(getAtlasPutCount()).toBe(0);
});
