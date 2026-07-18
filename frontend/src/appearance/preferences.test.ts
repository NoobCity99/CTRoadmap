import { describe, expect, it } from "vitest";
import {
  APPEARANCE_PREFERENCES_STORAGE_KEY,
  DEFAULT_CLASSIC_CANVAS_STYLE,
  DEFAULT_ZIMA_CANVAS_STYLE,
  LEGACY_CANVAS_BACKGROUND_STORAGE_KEY,
  LEGACY_CANVAS_THEME_STORAGE_KEY,
  V1_APPEARANCE_PREFERENCES_STORAGE_KEY,
  applyCanvasStyleSelection,
  getActiveCanvasStyle,
  readAppearancePreferences,
  transitionAppearanceMode,
  writeAppearancePreferences,
  type AppearanceStorage
} from "./preferences";
import type { AppearancePreferencesV2 } from "./types";

class MemoryStorage implements AppearanceStorage {
  readonly values = new Map<string, string>();
  readonly writes: string[] = [];
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.writes.push(key); this.values.set(key, value); }
}

describe("appearance preferences", () => {
  it("defaults fresh storage to Classic / Cyber / Grid", () => {
    const result = readAppearancePreferences(new MemoryStorage());
    expect(result).toEqual({ version: 2, appAppearanceMode: "classic", perMode: { classic: DEFAULT_CLASSIC_CANVAS_STYLE } });
  });

  it("reads a valid v2 preference before older keys", () => {
    const storage = new MemoryStorage();
    const expected: AppearancePreferencesV2 = {
      version: 2,
      appAppearanceMode: "zima",
      perMode: {
        classic: { canvasThemeId: "ember", canvasBackgroundId: "hex" },
        zima: { canvasThemeId: "cyber", canvasBackgroundId: "zima_carbon" }
      }
    };
    storage.values.set(APPEARANCE_PREFERENCES_STORAGE_KEY, JSON.stringify(expected));
    storage.values.set(V1_APPEARANCE_PREFERENCES_STORAGE_KEY, "not used");
    expect(readAppearancePreferences(storage)).toEqual(expected);
  });

  it("migrates both remembered v1 mode selections", () => {
    const storage = new MemoryStorage();
    storage.values.set(V1_APPEARANCE_PREFERENCES_STORAGE_KEY, JSON.stringify({
      version: 1,
      appAppearanceMode: "zima",
      perMode: {
        classic: { themePalette: "aurora", canvasBackground: "pcb_board" },
        zima: { themePalette: "nes", canvasBackground: "zima_carbon" }
      }
    }));
    expect(readAppearancePreferences(storage)).toEqual({
      version: 2,
      appAppearanceMode: "zima",
      perMode: {
        classic: { canvasThemeId: "aurora", canvasBackgroundId: "pcb_board" },
        zima: { canvasThemeId: "nes", canvasBackgroundId: "zima_carbon" }
      }
    });
  });

  it("falls through corrupt or partially invalid v2 to v1", () => {
    const storage = new MemoryStorage();
    storage.values.set(APPEARANCE_PREFERENCES_STORAGE_KEY, JSON.stringify({
      version: 2,
      appAppearanceMode: "classic",
      perMode: { classic: { canvasThemeId: "missing", canvasBackgroundId: "grid" } }
    }));
    storage.values.set(V1_APPEARANCE_PREFERENCES_STORAGE_KEY, JSON.stringify({
      version: 1,
      appAppearanceMode: "classic",
      perMode: { classic: { themePalette: "ember", canvasBackground: "hex" } }
    }));
    expect(getActiveCanvasStyle(readAppearancePreferences(storage))).toEqual({ canvasThemeId: "ember", canvasBackgroundId: "hex" });
    storage.values.set(APPEARANCE_PREFERENCES_STORAGE_KEY, "{");
    expect(getActiveCanvasStyle(readAppearancePreferences(storage))).toEqual({ canvasThemeId: "ember", canvasBackgroundId: "hex" });
  });

  it("imports scalar legacy values only when no versioned preference is valid", () => {
    const storage = new MemoryStorage();
    storage.values.set(LEGACY_CANVAS_THEME_STORAGE_KEY, "blueprint");
    storage.values.set(LEGACY_CANVAS_BACKGROUND_STORAGE_KEY, "lt_draft_grid");
    expect(getActiveCanvasStyle(readAppearancePreferences(storage))).toEqual({ canvasThemeId: "blueprint", canvasBackgroundId: "lt_draft_grid" });
  });

  it("normalizes invalid migrated v1 fields safely", () => {
    const storage = new MemoryStorage();
    storage.values.set(V1_APPEARANCE_PREFERENCES_STORAGE_KEY, JSON.stringify({
      version: 1,
      appAppearanceMode: "classic",
      perMode: { classic: { themePalette: "bad", canvasBackground: "bad" } }
    }));
    expect(getActiveCanvasStyle(readAppearancePreferences(storage))).toEqual(DEFAULT_CLASSIC_CANVAS_STYLE);
  });

  it("initializes ZIMA once and preserves both remembered pairs", () => {
    const original = readAppearancePreferences(new MemoryStorage());
    const firstZima = transitionAppearanceMode(original, "zima");
    expect(firstZima.perMode.zima).toEqual(DEFAULT_ZIMA_CANVAS_STYLE);
    const customized = applyCanvasStyleSelection(firstZima, { canvasThemeId: "ember", canvasBackgroundId: "hex" });
    const classicAgain = transitionAppearanceMode(customized, "classic");
    expect(getActiveCanvasStyle(classicAgain)).toEqual(DEFAULT_CLASSIC_CANVAS_STYLE);
    const zimaAgain = transitionAppearanceMode(classicAgain, "zima");
    expect(getActiveCanvasStyle(zimaAgain)).toEqual({ canvasThemeId: "ember", canvasBackgroundId: "hex" });
  });

  it("applies Canvas Theme and Background atomically without association side effects", () => {
    const original = readAppearancePreferences(new MemoryStorage());
    const result = applyCanvasStyleSelection(original, { canvasThemeId: "blueprint", canvasBackgroundId: "zima_carbon" });
    expect(getActiveCanvasStyle(result)).toEqual({ canvasThemeId: "blueprint", canvasBackgroundId: "zima_carbon" });
    const second = applyCanvasStyleSelection(result, { canvasThemeId: "nes", canvasBackgroundId: "zima_carbon" });
    expect(getActiveCanvasStyle(second)).toEqual({ canvasThemeId: "nes", canvasBackgroundId: "zima_carbon" });
  });

  it("writes only v2 and tolerates unavailable storage", () => {
    const storage = new MemoryStorage();
    const preferences = readAppearancePreferences(storage);
    writeAppearancePreferences(preferences, storage);
    expect(storage.writes).toEqual([APPEARANCE_PREFERENCES_STORAGE_KEY]);
    expect(() => readAppearancePreferences({ getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } })).not.toThrow();
    expect(() => writeAppearancePreferences(preferences, { getItem: () => null, setItem: () => { throw new Error("blocked"); } })).not.toThrow();
  });
});
