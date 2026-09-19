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
  it("uses Cyber and Hex defaults for fresh storage", () => {
    expect(readCanvasAppearance(memoryStorage().storage)).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
  });

  it("persists the public v2 preference", () => {
    const state = memoryStorage();
    writeCanvasAppearance(DEFAULT_PUBLIC_CANVAS_APPEARANCE, state.storage);
    expect(state.writes).toEqual([[PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY, '{"version":2,"canvasThemeId":"cyber","canvasBackgroundId":"hex"}']]);
    expect(readCanvasAppearance(state.storage)).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
  });

  it.each(["not-json", "null", "[]", '{"version":2}', '{"version":1,"canvasTheme":"nes","canvasBackground":"grid"}', '{"version":2,"canvasThemeId":"missing","canvasBackgroundId":"grid"}', '{"version":2,"canvasThemeId":"nes","canvasBackgroundId":"missing"}'])(
    "falls back for corrupt or unsupported value %s",
    (value) => {
      const state = memoryStorage({ [PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY]: value });
      expect(readCanvasAppearance(state.storage)).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
    }
  );

  it("reset writes the exact public defaults", () => {
    const state = memoryStorage();
    writeCanvasAppearance(undefined, state.storage);
    expect(JSON.parse(state.values.get(PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY) ?? "null")).toEqual(DEFAULT_PUBLIC_CANVAS_APPEARANCE);
  });

  it("ignores every legacy appearance key", () => {
    const state = memoryStorage({
      "ctroadmap.public.canvasAppearance.v1": '{"version":1,"canvasTheme":"cyber","canvasBackground":"hex"}',
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

  it("round-trips a chosen style and discards unrelated stored properties", () => {
    const state = memoryStorage();
    const style = { version: 2, canvasThemeId: "stellar", canvasBackgroundId: "pcb_trace" } as const;
    writeCanvasAppearance(style, state.storage);
    expect(readCanvasAppearance(state.storage)).toEqual(style);
    state.values.set(PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY, JSON.stringify({ ...style, extra: "discard" }));
    expect(readCanvasAppearance(state.storage)).toEqual(style);
  });
});
