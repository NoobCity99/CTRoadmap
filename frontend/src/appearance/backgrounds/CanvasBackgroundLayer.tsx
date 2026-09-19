import type { CanvasBackgroundDefinition } from "../types";
import { NebulaDiveBackground } from "./NebulaDiveBackground";
import { TronLegacyBackground } from "./TronLegacyBackground";
import { PCBTraceBackground } from "./PCBTraceBackground";

interface Props {
  background: CanvasBackgroundDefinition;
  exportMode?: boolean;
  previewMode?: boolean;
}

// The single ID-to-renderer boundary for Canvas and picker decorations.
// New implementations belong here; graph/editor state never owns animation.
export function CanvasBackgroundLayer({ background, exportMode = false, previewMode = false }: Props) {
  switch (background.renderer) {
    case "static":
      return null;
    case "zoom-transition":
      // Existing zoom previews use their static CSS artwork, without a camera.
      if (previewMode) return null;
      return background.id === "nebula_dive" ? <NebulaDiveBackground background={background} exportMode={exportMode} /> : null;
    case "animated":
      if (background.id === "tron_legacy") return <TronLegacyBackground exportMode={exportMode || previewMode} />;
      if (background.id === "pcb_trace") return <PCBTraceBackground exportMode={exportMode || previewMode} />;
      return null;
  }
}
