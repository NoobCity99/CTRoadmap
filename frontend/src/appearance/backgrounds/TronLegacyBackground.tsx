import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { TRON_LEGACY, tronLegacyPath, type TronLegacyRoute } from "./tronLegacyRoutes";
import { createTronLegacyScheduler } from "./tronLegacyScheduler";
import { buildTracerDrift, gridAnimationPhase } from "./tronLegacyMotion";
import "./tronLegacyBackground.css";

function TronLegacyTracer({ route }: { route: TronLegacyRoute }) {
  const ref = useRef<SVGGElement>(null);
  // Read the browser's live grid phase before this route's first paint. A
  // fresh mount owns exactly one WAAPI transform, canceled with the route.
  useLayoutEffect(() => {
    const element = ref.current!;
    const grid = element.closest(".tron-legacy-plane")!.querySelector(".tron-legacy-grid-motion")!;
    if (typeof grid.getAnimations !== "function" || typeof element.animate !== "function" || typeof CSSAnimation === "undefined") return;
    const animation = grid.getAnimations().find((item) => item instanceof CSSAnimation && item.animationName === "tron-legacy-grid-scroll");
    const currentTime = animation?.currentTime;
    const period = Number(animation?.effect?.getTiming().duration);
    // Static/reduced-motion renders have no grid timeline; never flash a
    // tracer at an arbitrary zero offset if motion was just disabled.
    if (typeof currentTime !== "number" || !Number.isFinite(period) || period <= 0) return;
    const { start, end } = buildTracerDrift({
      gridPeriodMs: period, routeDurationMs: route.durationMs,
      gridUnit: TRON_LEGACY.gridUnit, direction: route.plane === "lower" ? 1 : -1,
      initialPhase: gridAnimationPhase(currentTime, period)
    });
    // SVG transforms use the viewBox's user units. Its responsive mapping
    // scales these 80-unit cells exactly like the CSS percentage grid.
    const drift = element.animate([
      { transform: `translateY(${start}px)` },
      { transform: `translateY(${end}px)` }
    ], { duration: route.durationMs, easing: "linear", fill: "both" });
    drift.id = "tron-tracer-drift";
    // Share this frame's document timestamp rather than waiting for WAAPI's
    // next pending-play frame, which would introduce a small phase lag.
    drift.startTime = document.timeline.currentTime;
    element.style.visibility = "visible";
    return () => { drift.cancel(); element.style.removeProperty("visibility"); };
  }, [route]);
  return <g ref={ref} className="tron-legacy-tracer-drift" data-route-id={route.id} style={{ "--tron-route-duration": `${route.durationMs}ms` } as CSSProperties}>
    <path className="tron-legacy-tracer tron-legacy-tracer--glow" d={tronLegacyPath(route)} pathLength="1" />
    <path className="tron-legacy-tracer tron-legacy-tracer--core" d={tronLegacyPath(route)} pathLength="1" />
  </g>;
}

export const TronLegacyBackground = memo(function TronLegacyBackground({ exportMode = false }: { exportMode?: boolean }) {
  const staticMode = exportMode || typeof Element === "undefined" || typeof Element.prototype.animate !== "function" || typeof Element.prototype.getAnimations !== "function" || typeof CSSAnimation === "undefined";
  const [activeRoute, setActiveRoute] = useState<TronLegacyRoute | null>(null);
  useEffect(() => {
    if (staticMode) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scheduler = createTronLegacyScheduler(setActiveRoute);
    const sync = () => scheduler.setEnabled(!motion.matches && document.visibilityState === "visible");
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      scheduler.dispose();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [staticMode]);
  const route = staticMode ? null : activeRoute;
  const style = {
    "--tron-grid-x": `${100 * TRON_LEGACY.gridUnit / TRON_LEGACY.width}%`,
    "--tron-grid-y": `${100 * TRON_LEGACY.gridUnit / TRON_LEGACY.height}%`,
    // Grid paint extends one cell above/below the plane; compensate its
    // percentage pitch so overscan does not change the shared logical grid.
    "--tron-grid-paint-y": `${100 * TRON_LEGACY.gridUnit / (TRON_LEGACY.height + 2 * TRON_LEGACY.gridUnit)}%`,
    "--tron-grid-period": `${TRON_LEGACY.gridPeriodMs}ms`
  } as CSSProperties;
  return <div className="tron-legacy-background" aria-hidden="true" data-export={staticMode || undefined} style={style}>
    {(["upper", "lower"] as const).map((plane) => <div key={plane} className={`tron-legacy-plane tron-legacy-plane--${plane}`}>
      <div className="tron-legacy-grid-motion">
        <div className="tron-legacy-grid tron-legacy-grid--glow" />
        <div className="tron-legacy-grid" />
      </div>
      <svg className="tron-legacy-routes" viewBox={`0 0 ${TRON_LEGACY.width} ${TRON_LEGACY.height}`} preserveAspectRatio="none">
        {route?.plane === plane ? <TronLegacyTracer key={route.id} route={route} /> : null}
      </svg>
      <div className="tron-legacy-plane__mask" />
    </div>)}
    <div className="tron-legacy-horizon" />
  </div>;
});
