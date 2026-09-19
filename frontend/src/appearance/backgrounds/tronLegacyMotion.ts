export function gridAnimationPhase(currentTime: number, periodMs: number): number {
  return ((currentTime % periodMs) + periodMs) % periodMs / periodMs;
}

interface TracerDriftInput {
  gridPeriodMs: number;
  routeDurationMs: number;
  /** SVG user units, not the perspective plane's CSS pixels. */
  gridUnit: number;
  direction: 1 | -1;
  initialPhase: number;
}

// SYNCHRONIZATION — grid offsets wrap every cell, but a unique route never
// wraps. Equal velocity keeps their difference an integer number of cells.
export function buildTracerDrift({ gridPeriodMs, routeDurationMs, gridUnit, direction, initialPhase }: TracerDriftInput) {
  const start = initialPhase * gridUnit * direction;
  return { start, end: start + routeDurationMs / gridPeriodMs * gridUnit * direction };
}
