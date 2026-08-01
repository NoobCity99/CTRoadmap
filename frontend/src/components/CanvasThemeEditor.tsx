import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useState } from "react";
import { CanvasStylePreview } from "./CanvasStylePreview";

interface CanvasThemeEditorProps {
  onReset: () => void;
}

export function CanvasThemeEditor({ onReset }: CanvasThemeEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={expanded ? "settings-section canvas-theme-editor canvas-theme-editor--expanded" : "settings-section canvas-theme-editor"}>
      <div className="canvas-theme-editor__summary">
        <div>
          <div className="settings-section__title">Canvas Base</div>
          <span>CYBER · HEX</span>
        </div>
        <button className="toolbar-button" type="button" aria-expanded={expanded} aria-controls="canvas-theme-editor-content" onClick={() => setExpanded((value) => !value)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? "Collapse" : "Preview"}
        </button>
      </div>
      {expanded ? (
        <div id="canvas-theme-editor-content" className="canvas-theme-editor__content">
          <CanvasStylePreview />
          <div className="settings-note">This fork intentionally uses CYBER with HEX as its fixed Canvas base.</div>
          <div className="canvas-theme-editor__actions">
            <button className="toolbar-button" type="button" onClick={onReset}>
              <RotateCcw size={16} /> Reset to CYBER / HEX
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
