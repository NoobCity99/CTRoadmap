import { afterEach, describe, expect, it, vi } from "vitest";
import { TRON_LEGACY, TRON_LEGACY_ROUTES, tronLegacyPath } from "./tronLegacyRoutes";
import { createTronLegacyScheduler, createTronRoutePicker, tracerIdleGap } from "./tronLegacyScheduler";

describe("Tron grid routes", () => {
  it("defines 13 unique, grid-aligned single-turn routes entering and exiting both planes", () => {
    expect(TRON_LEGACY_ROUTES).toHaveLength(13);
    expect(new Set(TRON_LEGACY_ROUTES.map((r) => r.id)).size).toBe(13);
    expect(TRON_LEGACY_ROUTES.filter((r) => r.plane === "lower")).toHaveLength(7);
    expect(TRON_LEGACY_ROUTES.filter((r) => r.plane === "upper")).toHaveLength(6);
    for (const route of TRON_LEGACY_ROUTES) {
      const [a, b, c] = route.points;
      for (const point of route.points) {
        expect(Math.abs(point.x) % TRON_LEGACY.gridUnit).toBe(0);
        expect(Math.abs(point.y) % TRON_LEGACY.gridUnit).toBe(0);
      }
      const firstHorizontal = a.y === b.y && a.x !== b.x;
      const firstVertical = a.x === b.x && a.y !== b.y;
      const secondHorizontal = b.y === c.y && b.x !== c.x;
      const secondVertical = b.x === c.x && b.y !== c.y;
      expect((firstHorizontal && secondVertical) || (firstVertical && secondHorizontal)).toBe(true);
      expect(b.x).toBeGreaterThan(0); expect(b.x).toBeLessThan(TRON_LEGACY.width);
      expect(b.y).toBeGreaterThan(0); expect(b.y).toBeLessThan(TRON_LEGACY.height);
      for (const end of [a, c]) expect(end.x < 0 || end.y < 0 || end.x > TRON_LEGACY.width || end.y > TRON_LEGACY.height).toBe(true);
      expect(tronLegacyPath(route)).toMatch(/^M -?\d+ -?\d+ [HV] -?\d+ [HV] -?\d+$/);
      expect(route.durationMs).toBeGreaterThanOrEqual(TRON_LEGACY.minDurationMs);
      expect(route.durationMs).toBeLessThanOrEqual(TRON_LEGACY.maxDurationMs);
    }
  });
});

describe("Tron shuffled bag and timer lifecycle", () => {
  afterEach(() => vi.useRealTimers());
  const ids = TRON_LEGACY_ROUTES.map((route) => route.id).sort();
  it("visits all known IDs exactly once per bag and varies with injected randomness", () => {
    const first = createTronRoutePicker(() => 0);
    const second = createTronRoutePicker(() => 0.9999);
    const firstBag = Array.from({ length: 13 }, () => first().id);
    expect([...firstBag].sort()).toEqual(ids);
    expect(Array.from({ length: 13 }, () => first().id).sort()).toEqual(ids);
    expect(Array.from({ length: 13 }, () => second().id)).not.toEqual(firstBag);
  });
  it("avoids an immediate repeat even when the next shuffle puts the previous ID first", () => {
    let calls = 0;
    const next = createTronRoutePicker(() => calls++ < 12 ? 0.9999 : 0);
    const first = Array.from({ length: 13 }, () => next().id);
    const second = Array.from({ length: 13 }, () => next().id);
    expect(second[0]).not.toBe(first[12]);
    expect(second.sort()).toEqual(ids);
  });
  it("keeps randomized idle delays within the configured limits", () => {
    expect(tracerIdleGap(() => 0)).toBe(TRON_LEGACY.minGapMs);
    expect(tracerIdleGap(() => 1)).toBe(TRON_LEGACY.maxGapMs);
    expect(tracerIdleGap(() => 0.5)).toBe((TRON_LEGACY.minGapMs + TRON_LEGACY.maxGapMs) / 2);
  });
  it("alternates a single active route and an idle gap using only one timer", () => {
    vi.useFakeTimers();
    const onRoute = vi.fn();
    const scheduler = createTronLegacyScheduler(onRoute, () => 0);
    expect(vi.getTimerCount()).toBe(0);
    scheduler.setEnabled(true);
    scheduler.setEnabled(true);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(TRON_LEGACY.minGapMs - 1);
    expect(onRoute).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    const route = onRoute.mock.calls[0][0];
    expect(ids).toContain(route.id);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(route.durationMs);
    expect(onRoute).toHaveBeenLastCalledWith(null);
    expect(onRoute).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(1);
    scheduler.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("pauses immediately, resumes after a fresh gap, and cannot fire after disposal", () => {
    vi.useFakeTimers();
    const onRoute = vi.fn();
    const scheduler = createTronLegacyScheduler(onRoute, () => 0);
    scheduler.setEnabled(true);
    vi.advanceTimersByTime(TRON_LEGACY.minGapMs);
    scheduler.setEnabled(false);
    expect(onRoute).toHaveBeenLastCalledWith(null);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(100_000);
    expect(onRoute).toHaveBeenCalledTimes(2);
    scheduler.setEnabled(true);
    vi.advanceTimersByTime(TRON_LEGACY.minGapMs - 1);
    expect(onRoute).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(onRoute).toHaveBeenCalledTimes(3);
    scheduler.dispose();
    scheduler.setEnabled(true);
    vi.advanceTimersByTime(100_000);
    expect(onRoute).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);
  });
});
