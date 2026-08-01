import { Box } from "lucide-react";
import type { CSSProperties } from "react";
import { CYBER_THEME, getLinkVisualTokens, getTileVisualTokens, HEX_BACKGROUND } from "../appearance";

export function CanvasStylePreview() {
  const tile = getTileVisualTokens("service");
  const link = getLinkVisualTokens("calls");
  const overlay = HEX_BACKGROUND.reactFlowOverlay;
  const overlayStyle: CSSProperties = {
    backgroundImage: `radial-gradient(circle, ${overlay.color} 0 ${Math.max(1, overlay.size)}px, transparent ${Math.max(1, overlay.size)}px)`,
    backgroundSize: `${overlay.gap}px ${overlay.gap}px`,
    opacity: overlay.opacity
  };

  return (
    <div className="canvas-style-preview canvas-frame" aria-label="Fixed CYBER and HEX Canvas preview">
      <div className="canvas-style-preview__overlay" style={overlayStyle} />
      <div
        className="canvas-style-preview__tile"
        style={{
          "--preview-accent": tile.accentColor,
          "--preview-icon": tile.iconColor,
          "--preview-surface": tile.surfaceColor,
          "--preview-text": tile.textColor,
          "--preview-muted": tile.mutedTextColor,
          "--preview-glow": tile.glowColor
        } as CSSProperties}
      >
        <span className="canvas-style-preview__icon"><Box size={18} /></span>
        <span className="canvas-style-preview__copy"><strong>Example Service</strong><small>service · live</small></span>
        <span className="canvas-style-preview__badge">LIVE</span>
        <i className="canvas-style-preview__handle" />
      </div>
      <svg className="canvas-style-preview__connector" viewBox="0 0 150 42" aria-hidden="true">
        <path d="M4 21 C42 21 52 8 88 21 S126 21 146 21" fill="none" stroke={link.strokeColor} strokeWidth="3" />
        <rect x="55" y="4" width="43" height="18" rx="4" fill={link.labelSurfaceColor} />
        <text x="76.5" y="17" textAnchor="middle" fill={link.labelTextColor}>calls</text>
      </svg>
      <div className="canvas-style-preview__swatches" aria-label="Cyber colors">
        {CYBER_THEME.swatches.map((swatch) => <i key={swatch} style={{ background: swatch }} />)}
      </div>
      <span className="canvas-style-preview__draft-label">FIXED PUBLIC FORK BASE</span>
    </div>
  );
}
