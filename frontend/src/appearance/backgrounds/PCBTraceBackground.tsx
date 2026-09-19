import { memo, useEffect, useId, useState, type CSSProperties } from "react";
import { PCBTraceArtwork } from "./PCBTraceArtwork";
import { PCB_TRACE, type PcbTraceRoute } from "./pcbTraceRoutes";
import { createPcbTraceScheduler } from "./pcbTraceScheduler";
import "./pcbTraceBackground.css";

export const PCBTraceBackground = memo(function PCBTraceBackground({ exportMode = false }: { exportMode?: boolean }) {
  const prefix = `pcb-${useId().replace(/:/g, "")}`;
  const [activeRoute, setActiveRoute] = useState<PcbTraceRoute | null>(null);
  const [cpuGlow, setCpuGlow] = useState<PcbTraceRoute | null>(null);
  useEffect(() => {
    setActiveRoute(null);
    setCpuGlow(null);
    if (exportMode) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scheduler = createPcbTraceScheduler((route) => {
      setActiveRoute(route);
      // An arrival glow must finish even after its tracer leaves the DOM.
      if (route && route.flow !== "pass-through") setCpuGlow(route);
    });
    const sync = () => {
      const enabled = !motion.matches && document.visibilityState === "visible";
      scheduler.setEnabled(enabled);
      if (!enabled) setCpuGlow(null);
    };
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      scheduler.dispose();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [exportMode]);
  const route = exportMode ? null : activeRoute;
  const glow = exportMode ? null : cpuGlow;
  return <div className="pcb-trace-background" aria-hidden="true" data-export={exportMode || undefined}>
    <svg className="pcb-trace-board" viewBox={`0 0 ${PCB_TRACE.width} ${PCB_TRACE.height}`} preserveAspectRatio="xMidYMid slice" focusable="false">
      <PCBTraceArtwork prefix={prefix} />
      {route ? <g key={route.id} className="pcb-trace-active" data-route-id={route.id} data-flow={route.flow}
        style={{ "--pcb-route-duration": `${route.durationMs}ms` } as CSSProperties}>
        {/* Both strokes reference the actual visible trace, in the same SVG. */}
        <use className="pcb-trace-pulse pcb-trace-pulse--glow" href={`#${prefix}-${route.id}`} />
        <use className="pcb-trace-pulse pcb-trace-pulse--core" href={`#${prefix}-${route.id}`} />
      </g> : null}
      {glow ? <rect key={`cpu-${glow.id}`} className={`pcb-trace-cpu-glow pcb-trace-cpu-glow--${glow.flow}`}
        style={{ "--pcb-route-duration": `${glow.durationMs}ms` } as CSSProperties}
        onAnimationEnd={() => setCpuGlow(null)} x="724" y="424" width="152" height="152" rx="7" /> : null}
    </svg>
  </div>;
});
