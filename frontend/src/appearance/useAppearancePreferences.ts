import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PUBLIC_CANVAS_APPEARANCE, readCanvasAppearance, writeCanvasAppearance } from "./preferences";
import type { AppearanceDebugEvent, PublicCanvasAppearanceV1 } from "./types";

interface UseAppearancePreferencesOptions {
  onDebugEvent?: (event: AppearanceDebugEvent) => void;
}

export function useAppearancePreferences({ onDebugEvent }: UseAppearancePreferencesOptions = {}) {
  const [appearance, setAppearance] = useState<PublicCanvasAppearanceV1>(() => readCanvasAppearance());

  useEffect(() => {
    writeCanvasAppearance(appearance);
  }, [appearance]);

  const resetCanvasAppearance = useCallback(() => {
    const next = { ...DEFAULT_PUBLIC_CANVAS_APPEARANCE };
    setAppearance(next);
    writeCanvasAppearance(next);
    onDebugEvent?.({
      action: "settings.canvas_style",
      message: "Canvas appearance reset to CYBER / HEX",
      context: { canvasTheme: "cyber", canvasBackground: "hex" }
    });
  }, [onDebugEvent]);

  return { appearance, resetCanvasAppearance };
}
