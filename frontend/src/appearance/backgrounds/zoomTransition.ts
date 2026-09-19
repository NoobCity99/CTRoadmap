import type { CanvasZoomTransitionDefinition } from "../types";

// ZOOM TUNING — decorative pass-through intensity (not React Flow camera zoom).
// Transition start/end are per-background controls in appearance/registry.ts.
export const ZOOM_PASSAGE = {
  scaleIncrease: 0.25,
  maxBlurPx: 6,
  cloudBaseOpacity: 0.32,
  cloudBoostOpacity: 0.58
} as const;

export function zoomTransitionProgress(zoom: number, band: CanvasZoomTransitionDefinition): number {
  // Guard manual tuning mistakes; never let invalid values reach CSS transforms.
  if (!Number.isFinite(zoom) || !Number.isFinite(band.transitionStart) || !Number.isFinite(band.transitionEnd)) return 0;
  if (band.transitionEnd <= band.transitionStart) return zoom >= band.transitionStart ? 1 : 0;
  const p = Math.max(0, Math.min(1, (zoom - band.transitionStart) / (band.transitionEnd - band.transitionStart)));
  // ZOOM BEHAVIOR — reversible smoothstep; zoom alone determines the scene.
  return p * p * (3 - 2 * p);
}

export function zoomTransitionVisuals(zoom: number, band: CanvasZoomTransitionDefinition) {
  const progress = zoomTransitionProgress(zoom, band);
  const haze = Math.sin(Math.PI * progress);
  return {
    progress,
    nearOpacity: 1 - progress,
    deepOpacity: progress,
    nearScale: 1 + ZOOM_PASSAGE.scaleIncrease * progress,
    nearBlur: ZOOM_PASSAGE.maxBlurPx * progress,
    cloudOpacity: ZOOM_PASSAGE.cloudBaseOpacity + ZOOM_PASSAGE.cloudBoostOpacity * haze
  };
}
