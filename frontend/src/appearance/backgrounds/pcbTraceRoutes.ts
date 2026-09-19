export type PcbTraceFlow = "into-cpu" | "out-of-cpu" | "pass-through";
export interface PcbTraceRoute {
  id: string;
  flow: PcbTraceFlow;
  d: string;
  label: string;
  durationMs: number;
}

// PCB TIMING / GEOMETRY TUNING — one pulse at a time; the board stays still.
// SVG coordinates and path directions preserve approved Concept A exactly.
export const PCB_TRACE = {
  width: 1600, height: 1000,
  minGapMs: 4000, maxGapMs: 9000
} as const;

// These paths draw the static traces. Pulse <use> elements reference them,
// so changing a route here changes both its visible trace and its animation.
export const PCB_TRACE_ROUTES: readonly PcbTraceRoute[] = [
  { id: "a-route-01", flow: "into-cpu", d: "M0 260H400L560 420H640L672 452H704", label: "A01 — west edge into west CPU pin", durationMs: 2600 },
  { id: "a-route-02", flow: "into-cpu", d: "M560 0V180L744 364V404", label: "A02 — north fan into north CPU pin", durationMs: 2200 },
  { id: "a-route-03", flow: "into-cpu", d: "M1080 0V148L856 372V404", label: "A03 — northeast fan into north CPU pin", durationMs: 2200 },
  { id: "a-route-04", flow: "into-cpu", d: "M1600 320H1240L1076 484H896", label: "A04 — east edge into east CPU pin", durationMs: 2600 },
  { id: "a-route-05", flow: "into-cpu", d: "M1120 1000V900L856 636V596", label: "A05 — southeast fan into south CPU pin", durationMs: 2200 },
  { id: "a-route-06", flow: "out-of-cpu", d: "M704 516H620L440 696H180L0 876", label: "A06 — CPU west to southwest edge", durationMs: 2800 },
  { id: "a-route-07", flow: "out-of-cpu", d: "M704 484H620L376 240H80L0 160", label: "A07 — CPU west to northwest edge", durationMs: 2800 },
  { id: "a-route-08", flow: "out-of-cpu", d: "M776 404V332L644 200V0", label: "A08 — CPU north to north edge", durationMs: 2200 },
  { id: "a-route-09", flow: "out-of-cpu", d: "M776 596V664L620 820V1000", label: "A09 — CPU south to southwest fan", durationMs: 2200 },
  { id: "a-route-10", flow: "out-of-cpu", d: "M896 548H980L1160 728H1416L1600 912", label: "A10 — CPU east to southeast edge", durationMs: 3000 },
  { id: "a-route-11", flow: "pass-through", d: "M0 100H356L596 340H680V280L840 120H1600", label: "A11 — upper perimeter bypass, west to east", durationMs: 3800 },
  { id: "a-route-12", flow: "pass-through", d: "M0 940H480L656 764H1040L1216 940H1600", label: "A12 — lower perimeter bypass, west to east", durationMs: 3600 },
  { id: "a-route-13", flow: "pass-through", d: "M1600 100H1400L1280 220V560L1420 700H1600", label: "A13 — east component corridor bypass", durationMs: 3200 },
];
