import { useCallback, useEffect, useState } from "react";
import { readCanvasAppearance, writeCanvasAppearance } from "./preferences";
import { isCanvasBackgroundId, isCanvasThemeId } from "./registry";
import type { AppearanceDebugEvent, CanvasStyleSelection, PublicCanvasAppearanceV2 } from "./types";

interface UseAppearancePreferencesOptions {
  onDebugEvent?: (event: AppearanceDebugEvent) => void;
}

export function useAppearancePreferences({ onDebugEvent }: UseAppearancePreferencesOptions = {}) {
  const [appearance, setAppearance] = useState<PublicCanvasAppearanceV2>(() => readCanvasAppearance());

  useEffect(() => {
    writeCanvasAppearance(appearance);
  }, [appearance]);

  const applyCanvasStyle = useCallback((selection: CanvasStyleSelection) => {
    if (!isCanvasThemeId(selection.canvasThemeId) || !isCanvasBackgroundId(selection.canvasBackgroundId)) return;
    const next: PublicCanvasAppearanceV2 = { version: 2, canvasThemeId: selection.canvasThemeId, canvasBackgroundId: selection.canvasBackgroundId };
    setAppearance(next);
    onDebugEvent?.({
      action: "settings.canvas_style",
      message: "Canvas style applied",
      context: { canvasThemeId: next.canvasThemeId, canvasBackgroundId: next.canvasBackgroundId }
    });
  }, [onDebugEvent]);

  return { appearance, applyCanvasStyle };
}
