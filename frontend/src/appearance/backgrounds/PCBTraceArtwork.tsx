import { memo } from "react";
import { PCB_TRACE_ROUTES } from "./pcbTraceRoutes";

// Approved Concept A, with each stroke RGB channel brightened ~10%.
// Palette/line tuning lives in these SVG attributes; fills and opacities retain
// the approved shades. Per-instance IDs isolate Canvas, preview and PNG defs.
export const PCBTraceArtwork = memo(function PCBTraceArtwork({ prefix }: { prefix: string }) {
  return <>
  <defs>
    <radialGradient id={`${prefix}-substrate`} cx="50%" cy="50%" r="70%"><stop stopColor="#0c201c"/><stop offset=".55" stopColor="#081613"/><stop offset="1" stopColor="#040c0b"/></radialGradient>
    <linearGradient id={`${prefix}-package`} x2=".8" y2="1"><stop stopColor="#152c26"/><stop offset="1" stopColor="#07110f"/></linearGradient>
    <pattern id={`${prefix}-grain`} width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#7da28d" opacity=".08"/></pattern>
    <g id={`${prefix}-via`}><circle r="4" fill="#071310" stroke="#4d836f" strokeWidth="1.2"/><circle r="1.3" fill="#244b3f"/></g>
    <g id={`${prefix}-mount`}><circle r="12" fill="#050d0b" stroke="#355342"/><circle r="6" fill="#020807" stroke="#4f7057" strokeWidth="2"/></g>
    <g id={`${prefix}-resistor`}><rect x="-13" y="-5" width="26" height="10" rx="2" fill="#101d17" stroke="#365542"/><path d="M-10-5V5M10-5V5" stroke="#768258" strokeWidth="4"/></g>
    <g id={`${prefix}-small-chip`}>
      <path d="M-36-18H-26M-36-6H-26M-36 6H-26M-36 18H-26M26-18H36M26-6H36M26 6H36M26 18H36" stroke="#506f5e" strokeWidth="4"/>
      <rect x="-26" y="-30" width="52" height="60" rx="3" fill="#09120f" stroke="#2f5643"/>
      <path d="M-17-19H10M-17-13H2" stroke="#3e624a"/><circle cx="-17" cy="19" r="2" fill="#628568"/>
    </g>
    {/* One original northwest fan, mirrored into four quadrants. These dim
         supporting traces are artwork; the 13 continuous routes are below. */}
    <g id={`${prefix}-fan`} fill="none" stroke="#2c5f4b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 152H308L528 372H640L688 420M0 168H300L512 380H624L680 436M0 184H292L496 388H600L664 452"/>
      <path d="M0 208H264L460 404H560L608 452H640M0 224H252L448 420H544L592 468H652M0 240H236L432 436H528L576 484H652"/>
      <path d="M0 288H236L376 428V452L424 500H564M0 304H220L360 444V468L408 516H532"/>
      <path d="M380 0V132L604 356H668L720 408M400 0V120L620 340H684L736 392M420 0V108L636 324H700L752 376"/>
      <path d="M448 0V108L648 308H716L764 356V380M472 0V100L664 292H732L780 340V372"/>
      <path d="M608 0V144L744 280V348M632 0V128L760 256V324M656 0V112L776 232V304"/>
      <path d="M84 0V68H208L240 100H280M104 0V48H220L252 80H288M0 352H180L216 388H280"/>
      <path d="M112 380H176L220 424V488M128 396H168L204 432V500M280 40V96L352 168H408"/>
    </g>
    <g id={`${prefix}-fan-vias`}><use href={`#${prefix}-via`} x="640" y="420"/><use href={`#${prefix}-via`} x="652" y="468"/><use href={`#${prefix}-via`} x="652" y="484"/><use href={`#${prefix}-via`} x="564" y="500"/><use href={`#${prefix}-via`} x="532" y="516"/><use href={`#${prefix}-via`} x="744" y="348"/><use href={`#${prefix}-via`} x="760" y="324"/><use href={`#${prefix}-via`} x="776" y="304"/><use href={`#${prefix}-via`} x="220" y="488"/><use href={`#${prefix}-via`} x="204" y="500"/></g>
    <g id={`${prefix}-pin-bank`} stroke="#48705b" strokeWidth="4">
      <path d="M-64-96V-76M-56-96V-76M-48-96V-76M-40-96V-76M-32-96V-76M-24-96V-76M-16-96V-76M-8-96V-76M0-96V-76M8-96V-76M16-96V-76M24-96V-76M32-96V-76M40-96V-76M48-96V-76M56-96V-76M64-96V-76"/>
    </g>
  </defs>
  <rect width="1600" height="1000" fill={`url(#${prefix}-substrate)`}/>
  <rect width="1600" height="1000" fill={`url(#${prefix}-grain)`}/>
  <path d="M48 24H1552L1576 48V952L1552 976H48L24 952V48Z" fill="none" stroke="#1e382c"/>
  <g opacity=".8"><use href={`#${prefix}-mount`} x="48" y="48"/><use href={`#${prefix}-mount`} x="1552" y="48"/><use href={`#${prefix}-mount`} x="48" y="952"/><use href={`#${prefix}-mount`} x="1552" y="952"/></g>
  <g opacity=".85"><use href={`#${prefix}-fan`}/><use href={`#${prefix}-fan`} transform="translate(1600 0) scale(-1 1)"/><use href={`#${prefix}-fan`} transform="translate(0 1000) scale(1 -1)"/><use href={`#${prefix}-fan`} transform="translate(1600 1000) scale(-1 -1)"/></g>
  <g opacity=".55"><use href={`#${prefix}-fan-vias`}/><use href={`#${prefix}-fan-vias`} transform="translate(1600 0) scale(-1 1)"/><use href={`#${prefix}-fan-vias`} transform="translate(0 1000) scale(1 -1)"/><use href={`#${prefix}-fan-vias`} transform="translate(1600 1000) scale(-1 -1)"/></g>
  {/* These visible paths also supply the active pulse overlay via <use>. */}
  <g id={`${prefix}-candidate-routes`} className="pcb-trace-routes" fill="none" stroke="#53a17d" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity=".76">
    {PCB_TRACE_ROUTES.map((route) => <path key={route.id} id={`${prefix}-${route.id}`} data-pcb-route={route.id} data-flow={route.flow} d={route.d} pathLength="1"><title>{route.label}</title></path>)}
  </g>
  <g fill="none" stroke="#284d37" strokeWidth="1">
    <rect x="296" y="552" width="136" height="96" rx="6"/><rect x="1168" y="352" width="136" height="96" rx="6"/>
    <path d="M310 542H420M1180 458H1290M752 202H848M752 798H848"/>
  </g>
  <g opacity=".85"><use href={`#${prefix}-small-chip`} x="364" y="600"/><use href={`#${prefix}-small-chip`} x="1236" y="400"/><use href={`#${prefix}-resistor`} x="344" y="530"/><use href={`#${prefix}-resistor`} x="384" y="530"/><use href={`#${prefix}-resistor`} x="1216" y="470"/><use href={`#${prefix}-resistor`} x="1256" y="470"/><use href={`#${prefix}-resistor`} x="776" y="188"/><use href={`#${prefix}-resistor`} x="824" y="188"/><use href={`#${prefix}-resistor`} x="776" y="812"/><use href={`#${prefix}-resistor`} x="824" y="812"/></g>
  {/* CPU outer pin tips occupy x=704/896 and y=404/596. */}
  <g id={`${prefix}-cpu`} transform="translate(800 500)">
    <rect x="-110" y="-110" width="220" height="220" rx="10" fill="none" stroke="#28563e" strokeDasharray="5 9" opacity=".5"/>
    <use href={`#${prefix}-pin-bank`}/><use href={`#${prefix}-pin-bank`} transform="rotate(90)"/><use href={`#${prefix}-pin-bank`} transform="rotate(180)"/><use href={`#${prefix}-pin-bank`} transform="rotate(270)"/>
    <rect x="-76" y="-76" width="152" height="152" rx="7" fill={`url(#${prefix}-package)`} stroke="#5c9575" strokeWidth="1.6"/>
    <rect x="-62" y="-62" width="124" height="124" rx="3" fill="#091712" stroke="#2d563f"/>
    <path d="M-52-40V-52H-40M40-52H52V-40M52 40V52H40M-40 52H-52V40" fill="none" stroke="#76ab87" strokeWidth="1.4"/>
    <path d="M-29-20H29M-29-13H13M-29 28H29" stroke="#36694d"/><circle cx="-62" cy="-62" r="3" fill="#6ea782"/>
    <text y="11" fill="#739c80" fontFamily="monospace" fontSize="19" textAnchor="middle" letterSpacing="4">CORE</text>
  </g>
  <g fill="#44634d" fontFamily="monospace" fontSize="10" letterSpacing="2" opacity=".7"><text x="309" y="670">U02</text><text x="1180" y="338">U03</text></g>
  </>;
});
