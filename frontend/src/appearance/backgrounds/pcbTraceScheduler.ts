import { PCB_TRACE, PCB_TRACE_ROUTES, type PcbTraceRoute } from "./pcbTraceRoutes";

export function pcbTraceIdleGap(random: () => number = Math.random): number {
  return Math.round(PCB_TRACE.minGapMs + random() * (PCB_TRACE.maxGapMs - PCB_TRACE.minGapMs));
}

export function createPcbTracePicker(random: () => number = Math.random) {
  let bag: PcbTraceRoute[] = [];
  let previousId: string | undefined;
  return () => {
    if (!bag.length) {
      bag = [...PCB_TRACE_ROUTES];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      const last = bag.length - 1;
      if (bag[last].id === previousId) [bag[last], bag[0]] = [bag[0], bag[last]];
    }
    const route = bag.pop()!;
    previousId = route.id;
    return route;
  };
}

// One timeout owned by the mounted PCB background. CSS handles all pulse and
// CPU glow frames. Kept local so this feature does not change Tron behavior.
export function createPcbTraceScheduler(onRoute: (route: PcbTraceRoute | null) => void, random: () => number = Math.random) {
  const nextRoute = createPcbTracePicker(random);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let enabled = false;
  let disposed = false;
  let active = false;
  function clear() { clearTimeout(timer); timer = undefined; }
  function idle() {
    timer = setTimeout(() => {
      if (!enabled || disposed) return;
      const route = nextRoute();
      active = true;
      onRoute(route);
      timer = setTimeout(() => {
        if (!enabled || disposed) return;
        active = false;
        onRoute(null);
        idle();
      }, route.durationMs);
    }, pcbTraceIdleGap(random));
  }
  return {
    setEnabled(value: boolean) {
      if (disposed || enabled === value) return;
      enabled = value;
      clear();
      if (active) { active = false; onRoute(null); }
      if (enabled) idle(); // Resuming starts a fresh gap; no missed events replay.
    },
    dispose() { disposed = true; enabled = false; clear(); }
  };
}
