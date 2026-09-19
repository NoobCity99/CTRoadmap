export type TronLegacyPlane = "upper" | "lower";
export interface GridPoint { x: number; y: number }
export interface TronLegacyRoute {
  id: string;
  plane: TronLegacyPlane;
  points: readonly [GridPoint, GridPoint, GridPoint];
  durationMs: number;
}

// GRID / TIMING TUNING — SVG coordinates and CSS grid spacing share this block.
// Keep dimensions and route points exact multiples of gridUnit.
export const TRON_LEGACY = {
  gridUnit: 80, width: 1600, height: 960,
  // One complete cell per linear loop. The tracer reads this live CSS period.
  gridPeriodMs: 1000,
  minGapMs: 4000, maxGapMs: 9000,
  minDurationMs: 1800, maxDurationMs: 3200
} as const;

// ROUTE TUNING — [entry, sole right-angle bend, exit], in flat grid units.
// Entry/exit extend one cell beyond the clipped SVG. Seven lower, six upper.
export const TRON_LEGACY_ROUTES: readonly TronLegacyRoute[] = [
  { id: "route-01", plane: "lower", points: [{ x: -80, y: 640 }, { x: 800, y: 640 }, { x: 800, y: -80 }], durationMs: 2800 },
  { id: "route-02", plane: "lower", points: [{ x: 1680, y: 480 }, { x: 640, y: 480 }, { x: 640, y: 1040 }], durationMs: 2800 },
  { id: "route-03", plane: "lower", points: [{ x: 560, y: 1040 }, { x: 560, y: 400 }, { x: 1680, y: 400 }], durationMs: 3100 },
  { id: "route-04", plane: "lower", points: [{ x: 1040, y: -80 }, { x: 1040, y: 560 }, { x: -80, y: 560 }], durationMs: 3100 },
  { id: "route-05", plane: "lower", points: [{ x: -80, y: 240 }, { x: 960, y: 240 }, { x: 960, y: 1040 }], durationMs: 3200 },
  { id: "route-06", plane: "lower", points: [{ x: 1680, y: 800 }, { x: 880, y: 800 }, { x: 880, y: -80 }], durationMs: 3000 },
  { id: "route-07", plane: "lower", points: [{ x: 720, y: 1040 }, { x: 720, y: 720 }, { x: -80, y: 720 }], durationMs: 2000 },
  { id: "route-08", plane: "upper", points: [{ x: -80, y: 320 }, { x: 880, y: 320 }, { x: 880, y: 1040 }], durationMs: 3000 },
  { id: "route-09", plane: "upper", points: [{ x: 1680, y: 560 }, { x: 720, y: 560 }, { x: 720, y: -80 }], durationMs: 2800 },
  { id: "route-10", plane: "upper", points: [{ x: 960, y: -80 }, { x: 960, y: 400 }, { x: -80, y: 400 }], durationMs: 2700 },
  { id: "route-11", plane: "upper", points: [{ x: 640, y: 1040 }, { x: 640, y: 240 }, { x: 1680, y: 240 }], durationMs: 3200 },
  { id: "route-12", plane: "upper", points: [{ x: -80, y: 160 }, { x: 560, y: 160 }, { x: 560, y: -80 }], durationMs: 1800 },
  { id: "route-13", plane: "upper", points: [{ x: 1040, y: -80 }, { x: 1040, y: 640 }, { x: 1680, y: 640 }], durationMs: 2400 }
];

export function tronLegacyPath({ points: [a, b, c] }: TronLegacyRoute): string {
  return `M ${a.x} ${a.y} ${a.y === b.y ? `H ${b.x}` : `V ${b.y}`} ${b.y === c.y ? `H ${c.x}` : `V ${c.y}`}`;
}
