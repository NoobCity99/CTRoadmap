import { isCanvasBackgroundId, isCanvasThemeId } from "./registry";
import type { PublicCanvasAppearanceV2 } from "./types";

export const PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY = "ctroadmap.public.canvasAppearance.v2";

export const DEFAULT_PUBLIC_CANVAS_APPEARANCE: PublicCanvasAppearanceV2 = {
  version: 2,
  canvasThemeId: "cyber",
  canvasBackgroundId: "hex"
};

export interface AppearanceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readCanvasAppearance(storage: AppearanceStorage | null = getBrowserStorage()): PublicCanvasAppearanceV2 {
  try {
    const value = storage?.getItem(PUBLIC_CANVAS_APPEARANCE_STORAGE_KEY);
    if (!value) return { ...DEFAULT_PUBLIC_CANVAS_APPEARANCE };
    const parsed = JSON.parse(value) as Partial<PublicCanvasAppearanceV2> | null;
    if (parsed?.version === 2 && isCanvasThemeId(parsed.canvasThemeId) && isCanvasBackgroundId(parsed.canvasBackgroundId)) {
      return { version: 2, canvasThemeId: parsed.canvasThemeId, canvasBackgroundId: parsed.canvasBackgroundId };
    }
  } catch {
    // Browser-local appearance state is optional.
  }
  return { ...DEFAULT_PUBLIC_CANVAS_APPEARANCE };
}

export function writeCanvasAppearance(
  appearance: PublicCanvasAppearanceV2 = DEFAULT_PUBLIC_CANVAS_APPEARANCE,
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
