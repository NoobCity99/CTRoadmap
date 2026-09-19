import { describe, expect, it } from "vitest";
import { buildTracerDrift, gridAnimationPhase } from "./tronLegacyMotion";

describe("Tron conveyor / independent tracer drift", () => {
  it("reads the actual animation phase across repeats", () => {
    expect(gridAnimationPhase(0, 1000)).toBe(0);
    expect(gridAnimationPhase(2750, 1000)).toBe(0.75);
    expect(gridAnimationPhase(999, 1000)).toBe(0.999);
    expect(gridAnimationPhase(1001, 1000)).toBe(0.001);
  });
  it.each([1, -1] as const)("starts at the live phase and drifts continuously in direction %s", (direction) => {
    const drift = buildTracerDrift({ gridPeriodMs: 1000, routeDurationMs: 2800, gridUnit: 80, direction, initialPhase: 0.75 });
    expect(drift.start).toBe(direction * 60);
    expect(drift.end).toBe(direction * 284);
    const at = (elapsed: number) => drift.start + (drift.end - drift.start) * elapsed / 2800;
    for (const elapsed of [0, 249, 251, 1251, 2800]) {
      const grid = gridAnimationPhase(750 + elapsed, 1000) * 80 * direction;
      const cells = (at(elapsed) - grid) / 80;
      expect(cells).toBeCloseTo(Math.round(cells), 9);
    }
    expect(at(251) - at(249)).toBeCloseTo(direction * 0.16, 9);
  });
  it("scales velocity with the configured cell and period, independent of route duration", () => {
    expect(buildTracerDrift({ gridPeriodMs: 2000, routeDurationMs: 3000, gridUnit: 40, direction: -1, initialPhase: 0.5 })).toEqual({ start: -20, end: -80 });
  });
});
