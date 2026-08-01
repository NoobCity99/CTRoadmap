import { describe, expect, it } from "vitest";
import {
  DEFAULT_PUBLIC_CANVAS_APPEARANCE,
  PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY,
  readCanvasAppearance,
  writeCanvasAppearance,
  type AppearanceStorage
} from "./preferences";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const reads: string[] = [];
  const writes: Array<[string, string]> = [];
  const storage: AppearanceStorage = {
    getItem(key) { reads.push(key); return values.get(key) ?? null; },
    setItem(key, value) { writes.push([key, value]); values.set(key, value); }
  };
  return { reads, storage, values, writes };
}

describe("public Canvas appearance preferences", () => {
  it("uses fixed CYBER and HEX defaults for fresh storage", () => {
    expect(readCanvasAppearance(memoryStorage().storage)).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
  });

  it("persists only the fork-specific fixed preference", () => {
    const state = memoryStorage();
    writeCanvasAppearance(DEFAULT_PUBLIC_CANVAS_APPEARANCE, state.storage);
    expect(state.writes).toEqual([[PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY, '{"version":1,"canvasTheme":"cyber","canvasBackground":"hex"}']]);
    expect(readCanvasAppearance(state.storage)).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
  });

  it.each(["not-json", '{"version":2}', '{"version":1,"canvasTheme":"nes","canvasBackground":"grid"}'])(
    "falls back for corrupt or unsupported value %s",
    (value) => {
      const state = memoryStorage({ [PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY]: value });
      expect(readCanvasAppearance(state.storage)).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
    }
  );

  it("reset writes the exact fixed defaults", () => {
    const state = memoryStorage();
    writeCanvasAppearance(undefined, state.storage);
    expect(JSON.parse(state.values.get(PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY) ?? "null")).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
  });

  it("ignores every legacy appearance key", () => {
    const state = memoryStorage({
      "ctroadmap.appearancePreferences.v2": '{"appAppearanceMode":"zima"}',
      "ctroadmap.appearancePreferences.v1": '{"canvasThemeId":"nes"}',
      "ctroadmap.themePalette": "blueprint",
      "ctroadmap.canvasBackground": "grid",
      "ctroadmap.handbookThemeMode": "light"
    });
    expect(readCanvasAppearance(state.storage)).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
    expect(state.reads).toEqual([PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY]);
  });

  it("tolerates unavailable storage", () => {
    const broken: AppearanceStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
    expect(readCanvasAppearance(broken)).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
    expect(() => writeCanvasAppearance(DEFAULT_PUBLIC_CANVAS_APPEARANCE, broken)).not.toThrow();
  });
});
