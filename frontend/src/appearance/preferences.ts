import type { PublicCanvasAppearanceV1 } from "./types";

export const PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY = "ctroadmap.public.canvasAppearance.v1";

export const DEFAULT_PUBLIC_CANVAS_APPEARANCE: PublicCanvasAppearanceV1 = {
  version: 1,
  canvasTheme: "cyber",
  canvasBackground: "hex"
};

export interface AppearanceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readCanvasAppearance(storage: AppearanceStorage | null = getBrowserStorage()): PublicCanvasAppearanceV1 {
  try {
    const value = storage?.getItem(PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY);
    if (!value) return { ...DEFAULT_PUBLIC_CANVAS_APPEARANCE };
    const parsed = JSON.parse(value) as Partial<PublicCanvasAppearanceV1>;
    if (parsed.version === 1 && parsed.canvasTheme === "cyber" && parsed.canvasBackground === "hex") {
      return { ...DEFAULT_PUBLIC_CANVAS_APPEARANCE };
    }
  } catch {
    // Browser-local appearance state is optional.
  }
  return { ...DEFAULT_PUBLIC_CANVAS_APPEARANCE };
}

export function writeCanvasAppearance(
  appearance: PublicCanvasAppearanceV1 = DEFAULT_PUBLIC_CANVAS_APPEARANCE,
  storage: AppearanceStorage | null = getBrowserStorage()
): void {
  try {
    storage?.setItem(PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    // Storage failures must not block atlas editing.
  }
}

function getBrowserStorage(): AppearanceStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
