import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyCanvasStyleSelection,
  getActiveCanvasStyle,
  readAppearancePreferences,
  transitionAppearanceMode,
  writeAppearancePreferences
} from "./preferences";
import { getCanvasTheme } from "./registry";
import type { AppAppearanceMode, AppearanceDebugEvent, AppearancePreferencesV2, CanvasStyleSelection } from "./types";

interface UseAppearancePreferencesOptions {
  onDebugEvent?: (event: AppearanceDebugEvent) => void;
}

export function useAppearancePreferences({ onDebugEvent }: UseAppearancePreferencesOptions = {}) {
  const [preferences, setPreferences] = useState<AppearancePreferencesV2>(() => readAppearancePreferences());
  const preferencesRef = useRef(preferences);
  preferencesRef.current = preferences;

  useEffect(() => {
    writeAppearancePreferences(preferences);
  }, [preferences]);

  const setAppAppearanceMode = useCallback(
    (nextMode: AppAppearanceMode) => {
      const current = preferencesRef.current;
      const next = transitionAppearanceMode(current, nextMode);
      if (next === current) return;
      preferencesRef.current = next;
      setPreferences(next);
      onDebugEvent?.({
        action: "settings.app_appearance",
        message: "App Appearance Mode changed",
        context: { appAppearanceMode: nextMode }
      });
    },
    [onDebugEvent]
  );

  const applyCanvasStyle = useCallback(
    (selection: CanvasStyleSelection) => {
      const current = preferencesRef.current;
      const active = getActiveCanvasStyle(current);
      if (active.canvasThemeId === selection.canvasThemeId && active.canvasBackgroundId === selection.canvasBackgroundId) return;
      const next = applyCanvasStyleSelection(current, selection);
      preferencesRef.current = next;
      setPreferences(next);
      onDebugEvent?.({
        action: "settings.canvas_style",
        message: "Canvas Style applied",
        context: {
          appAppearanceMode: current.appAppearanceMode,
          canvasTheme: selection.canvasThemeId,
          canvasBackground: selection.canvasBackgroundId
        }
      });
    },
    [onDebugEvent]
  );

  const activeCanvasStyle = getActiveCanvasStyle(preferences);
  const canvasTheme = getCanvasTheme(activeCanvasStyle.canvasThemeId);
  return {
    preferences,
    appAppearanceMode: preferences.appAppearanceMode,
    activeCanvasStyle,
    canvasTheme,
    setAppAppearanceMode,
    applyCanvasStyle
  };
}
