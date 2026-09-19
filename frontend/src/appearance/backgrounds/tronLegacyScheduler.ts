import { TRON_LEGACY, TRON_LEGACY_ROUTES, type TronLegacyRoute } from "./tronLegacyRoutes";

export function tracerIdleGap(random: () => number = Math.random): number {
  return Math.round(TRON_LEGACY.minGapMs + random() * (TRON_LEGACY.maxGapMs - TRON_LEGACY.minGapMs));
}

export function createTronRoutePicker(random: () => number = Math.random) {
  let bag: TronLegacyRoute[] = [];
  let previousId: string | undefined;
  return () => {
    if (!bag.length) {
      bag = [...TRON_LEGACY_ROUTES];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // Pop from the end. Swap its next item if it would repeat the last bag.
      const last = bag.length - 1;
      if (bag[last].id === previousId) [bag[last], bag[0]] = [bag[0], bag[last]];
    }
    const route = bag.pop()!;
    previousId = route.id;
    return route;
  };
}

// One low-frequency timeout, owned by one mounted Tron component. CSS handles
// grid/dash movement and WAAPI handles tracer drift; callbacks occur only at
// route start/end or an explicit pause.
export function createTronLegacyScheduler(onRoute: (route: TronLegacyRoute | null) => void, random: () => number = Math.random) {
  const nextRoute = createTronRoutePicker(random);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let enabled = false;
  let disposed = false;
  let active = false;
  function clear() {
    clearTimeout(timer);
    timer = undefined;
  }
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
    }, tracerIdleGap(random));
  }
  return {
    setEnabled(value: boolean) {
      if (disposed || enabled === value) return;
      enabled = value;
      clear();
      if (active) { active = false; onRoute(null); }
      // Resuming always starts a fresh normal gap, never a catch-up burst.
      if (enabled) idle();
    },
    dispose() {
      disposed = true;
      enabled = false;
      clear();
    }
  };
}
