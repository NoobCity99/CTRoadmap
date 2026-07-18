import { Box } from "lucide-react";
import type { CSSProperties } from "react";
import { getCanvasBackground, getCanvasTheme, getLinkVisualTokens, getTileVisualTokens, type CanvasStyleSelection } from "../appearance";

interface CanvasStylePreviewProps {
  selection: CanvasStyleSelection;
}

export function CanvasStylePreview({ selection }: CanvasStylePreviewProps) {
  const theme = getCanvasTheme(selection.canvasThemeId);
  const background = getCanvasBackground(selection.canvasBackgroundId);
  const tile = getTileVisualTokens("service", selection.canvasThemeId);
  const link = getLinkVisualTokens("calls", selection.canvasThemeId);
  const overlayStyle = getOverlayStyle(background.reactFlowOverlay);

  return (
    <div
      className="canvas-style-preview canvas-frame"
      data-background={selection.canvasBackgroundId}
      data-canvas-theme={selection.canvasThemeId}
      data-canvas-theme-variant={theme.variant}
      aria-label="Canvas Style preview; changes are not applied"
    >
      <div className="canvas-style-preview__overlay" style={overlayStyle} />
      <div
        className={`canvas-style-preview__tile canvas-style-preview__tile--${theme.variant}`}
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
      <div className="canvas-style-preview__swatches" aria-label={`${theme.label} colors`}>
        {theme.swatches.map((swatch) => <i key={swatch} style={{ background: swatch }} />)}
      </div>
      <span className="canvas-style-preview__draft-label">PREVIEW · NOT APPLIED</span>
    </div>
  );
}

function getOverlayStyle(overlay: ReturnType<typeof getCanvasBackground>["reactFlowOverlay"]): CSSProperties {
  const color = overlay.color;
  const gap = `${overlay.gap}px`;
  const size = `${Math.max(1, overlay.size)}px`;
  const backgroundImage = overlay.variant === "lines"
    ? `linear-gradient(${color} ${size}, transparent ${size}), linear-gradient(90deg, ${color} ${size}, transparent ${size})`
    : overlay.variant === "cross"
      ? `linear-gradient(${color} ${size}, transparent ${size}), linear-gradient(90deg, ${color} ${size}, transparent ${size})`
      : `radial-gradient(circle, ${color} 0 ${size}, transparent ${size})`;
  return { backgroundImage, backgroundSize: `${gap} ${gap}`, opacity: overlay.opacity };
}
