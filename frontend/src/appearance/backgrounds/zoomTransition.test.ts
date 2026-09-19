import { describe, expect, it } from "vitest";
import { zoomTransitionProgress, zoomTransitionVisuals } from "./zoomTransition";

// Exercise the math with a fixed band; manual registry tuning must not change
// these numeric examples. Dispatcher/browser coverage uses the actual entry.
const band = { transitionStart: 0.85, transitionEnd: 1.1 };
describe("zoom-driven scene transition", () => {
  it.each([[0.2, 0], [0.84, 0], [0.85, 0], [0.975, 0.5], [1.1, 1], [1.8, 1], [-1, 0], [4, 1]])("maps zoom %s to eased progress %s", (zoom, expected) => {
    expect(zoomTransitionProgress(zoom, band)).toBeCloseTo(expected);
  });
  it("eases and reverses solely from zoom, including forward scale and a haze peak", () => {
    expect(zoomTransitionProgress(0.9125, band)).toBeCloseTo(0.15625);
    const near = zoomTransitionVisuals(0.85, band);
    const middle = zoomTransitionVisuals(0.975, band);
    const deep = zoomTransitionVisuals(1.1, band);
    expect(near.nearOpacity).toBe(1);
    expect(deep.nearOpacity).toBe(0);
    expect(deep.deepOpacity).toBe(1);
    expect(middle.nearScale).toBeGreaterThan(near.nearScale);
    expect(deep.nearScale).toBeCloseTo(1.25);
    expect(middle.cloudOpacity).toBeGreaterThan(near.cloudOpacity);
    expect(middle.cloudOpacity).toBeGreaterThan(deep.cloudOpacity);
    expect(zoomTransitionVisuals(0.85, band)).toEqual(near);
  });
  it("handles invalid manual bands without NaN styles", () => {
    expect(zoomTransitionProgress(1, { transitionStart: 1, transitionEnd: 1 })).toBe(1);
    expect(zoomTransitionProgress(NaN, band)).toBe(0);
    expect(zoomTransitionProgress(1, { transitionStart: 1, transitionEnd: NaN })).toBe(0);
  });
});
