import { isCanvasBackgroundId, isCanvasThemeId } from "./registry";
import type { AppAppearanceMode, AppearancePreferencesV2, CanvasStyleSelection } from "./types";

export const APPEARANCE_PREFERENCES_STORAGE_KEY = "ctroadmap.appearancePreferences.v2";
export const V1_APPEARANCE_PREFERENCES_STORAGE_KEY = "ctroadmap.appearancePreferences.v1";
export const LEGACY_CANVAS_THEME_STORAGE_KEY = "ctroadmap.themePalette";
export const LEGACY_CANVAS_BACKGROUND_STORAGE_KEY = "ctroadmap.canvasBackground";

export const DEFAULT_CLASSIC_CANVAS_STYLE: CanvasStyleSelection = {
  canvasThemeId: "cyber",
  canvasBackgroundId: "grid"
};

export const DEFAULT_ZIMA_CANVAS_STYLE: CanvasStyleSelection = {
  canvasThemeId: "blueprint",
  canvasBackgroundId: "zima_carbon"
};

export interface AppearanceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface AppearancePreferencesV1Shape {
  version?: unknown;
  appAppearanceMode?: unknown;
  perMode?: {
    classic?: { themePalette?: unknown; canvasBackground?: unknown };
    zima?: { themePalette?: unknown; canvasBackground?: unknown };
  };
}

export function getDefaultCanvasStyle(mode: AppAppearanceMode): CanvasStyleSelection {
  return { ...(mode === "zima" ? DEFAULT_ZIMA_CANVAS_STYLE : DEFAULT_CLASSIC_CANVAS_STYLE) };
}

export function getActiveCanvasStyle(preferences: AppearancePreferencesV2): CanvasStyleSelection {
  return preferences.appAppearanceMode === "zima" ? preferences.perMode.zima ?? DEFAULT_ZIMA_CANVAS_STYLE : preferences.perMode.classic;
}

export function readAppearancePreferences(storage: AppearanceStorage | null = getBrowserStorage()): AppearancePreferencesV2 {
  const storedV2 = safeGet(storage, APPEARANCE_PREFERENCES_STORAGE_KEY);
  const parsedV2 = parseJson(storedV2);
  if (isValidV2(parsedV2)) return clonePreferences(parsedV2);

  const storedV1 = safeGet(storage, V1_APPEARANCE_PREFERENCES_STORAGE_KEY);
  const parsedV1 = parseJson(storedV1);
  const migratedV1 = migrateV1(parsedV1);
  if (migratedV1) return migratedV1;

  const legacyTheme = safeGet(storage, LEGACY_CANVAS_THEME_STORAGE_KEY);
  const legacyBackground = safeGet(storage, LEGACY_CANVAS_BACKGROUND_STORAGE_KEY);
  return {
    version: 2,
    appAppearanceMode: "classic",
    perMode: {
      classic: {
        canvasThemeId: isCanvasThemeId(legacyTheme) ? legacyTheme : DEFAULT_CLASSIC_CANVAS_STYLE.canvasThemeId,
        canvasBackgroundId: isCanvasBackgroundId(legacyBackground) ? legacyBackground : DEFAULT_CLASSIC_CANVAS_STYLE.canvasBackgroundId
      }
    }
  };
}

export function writeAppearancePreferences(preferences: AppearancePreferencesV2, storage: AppearanceStorage | null = getBrowserStorage()): void {
  try {
    storage?.setItem(APPEARANCE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Browser-local appearance preferences are optional and must not block atlas editing.
  }
}

export function transitionAppearanceMode(preferences: AppearancePreferencesV2, nextMode: AppAppearanceMode): AppearancePreferencesV2 {
  if (preferences.appAppearanceMode === nextMode) return preferences;
  return {
    ...preferences,
    appAppearanceMode: nextMode,
    perMode: {
      ...preferences.perMode,
      ...(nextMode === "zima" && !preferences.perMode.zima ? { zima: { ...DEFAULT_ZIMA_CANVAS_STYLE } } : {})
    }
  };
}

export function applyCanvasStyleSelection(preferences: AppearancePreferencesV2, selection: CanvasStyleSelection): AppearancePreferencesV2 {
  const mode = preferences.appAppearanceMode;
  return {
    ...preferences,
    perMode: {
      ...preferences.perMode,
      [mode]: { ...selection }
    }
  };
}

function migrateV1(value: unknown): AppearancePreferencesV2 | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as AppearancePreferencesV1Shape;
  if (!candidate.perMode || typeof candidate.perMode !== "object") return null;
  const classic = normalizeV1Selection(candidate.perMode.classic, DEFAULT_CLASSIC_CANVAS_STYLE);
  const mode: AppAppearanceMode = candidate.appAppearanceMode === "zima" ? "zima" : "classic";
  const zima = candidate.perMode.zima ? normalizeV1Selection(candidate.perMode.zima, DEFAULT_ZIMA_CANVAS_STYLE) : undefined;
  return {
    version: 2,
    appAppearanceMode: mode,
    perMode: {
      classic,
      ...(zima || mode === "zima" ? { zima: zima ?? { ...DEFAULT_ZIMA_CANVAS_STYLE } } : {})
    }
  };
}

function normalizeV1Selection(value: unknown, fallback: CanvasStyleSelection): CanvasStyleSelection {
  if (!value || typeof value !== "object") return { ...fallback };
  const candidate = value as { themePalette?: unknown; canvasBackground?: unknown };
  return {
    canvasThemeId: isCanvasThemeId(candidate.themePalette) ? candidate.themePalette : fallback.canvasThemeId,
    canvasBackgroundId: isCanvasBackgroundId(candidate.canvasBackground) ? candidate.canvasBackground : fallback.canvasBackgroundId
  };
}

function isValidV2(value: unknown): value is AppearancePreferencesV2 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppearancePreferencesV2>;
  if (candidate.version !== 2 || (candidate.appAppearanceMode !== "classic" && candidate.appAppearanceMode !== "zima")) return false;
  if (!candidate.perMode || !isValidSelection(candidate.perMode.classic)) return false;
  if (candidate.perMode.zima !== undefined && !isValidSelection(candidate.perMode.zima)) return false;
  return candidate.appAppearanceMode !== "zima" || candidate.perMode.zima !== undefined;
}

function isValidSelection(value: unknown): value is CanvasStyleSelection {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CanvasStyleSelection>;
  return isCanvasThemeId(candidate.canvasThemeId) && isCanvasBackgroundId(candidate.canvasBackgroundId);
}

function clonePreferences(preferences: AppearancePreferencesV2): AppearancePreferencesV2 {
  return {
    version: 2,
    appAppearanceMode: preferences.appAppearanceMode,
    perMode: {
      classic: { ...preferences.perMode.classic },
      ...(preferences.perMode.zima ? { zima: { ...preferences.perMode.zima } } : {})
    }
  };
}

function parseJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function safeGet(storage: AppearanceStorage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function getBrowserStorage(): AppearanceStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
