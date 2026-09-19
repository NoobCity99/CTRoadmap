import { useViewport } from "@xyflow/react";
import { memo, type CSSProperties } from "react";
import type { ZoomCanvasBackgroundDefinition } from "../types";
import { STAR_MAP_SIZE, STAR_MAP_VARIABLES } from "./starMaps";
import { zoomTransitionVisuals } from "./zoomTransition";
import "./zoomCanvasBackground.css";

interface NebulaDiveBackgroundProps {
  background: ZoomCanvasBackgroundDefinition;
  exportMode?: boolean;
}

const ASSET_ROOT = "/assets/backgrounds/nebula-dive/";

// VIEWPORT BOUNDARY — only this small component subscribes. Do not lift zoom
// into App/Atlas state or use pan x/y for the decorative effect.
export const NebulaDiveBackground = memo(function NebulaDiveBackground({ background, exportMode = false }: NebulaDiveBackgroundProps) {
  const { zoom } = useViewport();
  const visual = zoomTransitionVisuals(zoom, background.zoomTransition);
  const style = {
    ...STAR_MAP_VARIABLES,
    "--zoom-star-map-size": `${STAR_MAP_SIZE}px`,
    // EXPORT POLICY — a fixed deep starfield, independent of camera zoom.
    "--zoom-transition-progress": exportMode ? 1 : visual.progress,
    "--zoom-near-opacity": exportMode ? 0 : visual.nearOpacity,
    "--zoom-deep-opacity": exportMode ? 1 : visual.deepOpacity,
    "--zoom-near-scale": visual.nearScale,
    "--zoom-cloud-opacity": visual.cloudOpacity,
    "--zoom-near-blur": `${visual.nearBlur}px`
  } as CSSProperties;

  return (
    <div className="zoom-canvas-background zoom-bg--nebula-dive" aria-hidden="true" data-export={exportMode || undefined} style={style}>
      <div className="zoom-bg__deep">
        <div className="zoom-bg__stars zoom-bg__stars--small" />
        <div className="zoom-bg__stars zoom-bg__stars--medium" />
        <div className="zoom-bg__stars zoom-bg__stars--large" />
      </div>
      {!exportMode && <>
        <div className="zoom-bg__near">
          <div className="zoom-bg__space-base" />
          <div className="zoom-bg__stars zoom-bg__near-stars" />
          <div className="zoom-bg__nebula" />
          <div className="zoom-bg__clouds" />
        </div>
        {/* Keep live artwork preloads out of the deep-only export scene. */}
        <img className="zoom-bg__asset" src={`${ASSET_ROOT}nebula.svg`} alt="" />
        <img className="zoom-bg__asset" src={`${ASSET_ROOT}clouds.svg`} alt="" />
      </>}
    </div>
  );
});
