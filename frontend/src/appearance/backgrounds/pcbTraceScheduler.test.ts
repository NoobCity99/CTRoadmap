import { afterEach, describe, expect, it, vi } from "vitest";
import { PCB_TRACE, PCB_TRACE_ROUTES } from "./pcbTraceRoutes";
import { createPcbTracePicker, createPcbTraceScheduler, pcbTraceIdleGap } from "./pcbTraceScheduler";

describe("approved PCB geometry", () => {
  it("preserves all 13 approved paths and their 5-in / 5-out / 3-bypass directions", () => {
    expect(PCB_TRACE_ROUTES).toHaveLength(13);
    expect(PCB_TRACE_ROUTES.every((route) => /^M\s*-?\d/.test(route.d))).toBe(true);
    expect(new Set(PCB_TRACE_ROUTES.map((route) => route.id)).size).toBe(13);
    expect(["into-cpu", "out-of-cpu", "pass-through"].map((flow) => PCB_TRACE_ROUTES.filter((route) => route.flow === flow).length)).toEqual([5, 5, 3]);
    expect(PCB_TRACE_ROUTES.every((route) => route.durationMs >= 2000 && route.durationMs <= 4000)).toBe(true);
  });
});

describe("PCB pulse scheduling", () => {
  afterEach(() => vi.useRealTimers());
  const ids = PCB_TRACE_ROUTES.map((route) => route.id).sort();
  it("visits every route once per bag and avoids boundary repeats", () => {
    let calls = 0;
    const pick = createPcbTracePicker(() => calls++ < 12 ? 0.9999 : 0);
    const first = Array.from({ length: 13 }, () => pick().id);
    const second = Array.from({ length: 13 }, () => pick().id);
    expect(second[0]).not.toBe(first[12]);
    expect([...first].sort()).toEqual(ids);
    expect([...second].sort()).toEqual(ids);
    const other = createPcbTracePicker(() => 0.5);
    expect(Array.from({ length: 13 }, () => other().id)).not.toEqual(first);
  });
  it("keeps idle gaps between four and nine seconds", () => {
    expect(pcbTraceIdleGap(() => 0)).toBe(4000);
    expect(pcbTraceIdleGap(() => 1)).toBe(9000);
    expect(pcbTraceIdleGap(() => 0.5)).toBe(6500);
  });
  it("owns only one timer, clears completed pulses and stops after disposal", () => {
    vi.useFakeTimers();
    const onRoute = vi.fn();
    const scheduler = createPcbTraceScheduler(onRoute, () => 0);
    expect(vi.getTimerCount()).toBe(0);
    scheduler.setEnabled(true);
    scheduler.setEnabled(true);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(PCB_TRACE.minGapMs);
    const active = onRoute.mock.calls[0][0];
    expect(ids).toContain(active.id);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(active.durationMs);
    expect(onRoute).toHaveBeenLastCalledWith(null);
    expect(vi.getTimerCount()).toBe(1);
    scheduler.dispose();
    expect(vi.getTimerCount()).toBe(0);
    scheduler.setEnabled(true);
    vi.advanceTimersByTime(60_000);
    expect(onRoute).toHaveBeenCalledTimes(2);
  });
  it("drops a hidden/reduced-motion pulse and resumes with a fresh gap", () => {
    vi.useFakeTimers();
    const onRoute = vi.fn();
    const scheduler = createPcbTraceScheduler(onRoute, () => 0);
    scheduler.setEnabled(true);
    vi.advanceTimersByTime(PCB_TRACE.minGapMs);
    scheduler.setEnabled(false);
    expect(onRoute).toHaveBeenLastCalledWith(null);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(60_000);
    expect(onRoute).toHaveBeenCalledTimes(2);
    scheduler.setEnabled(true);
    vi.advanceTimersByTime(PCB_TRACE.minGapMs - 1);
    expect(onRoute).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(onRoute).toHaveBeenCalledTimes(3);
    scheduler.dispose();
  });
});
