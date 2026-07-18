import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CANVAS_BACKGROUNDS,
  CANVAS_THEMES,
  getCanvasBackground,
  getCanvasTheme,
  getDefaultCanvasStyle,
  type AppAppearanceMode,
  type CanvasBackgroundId,
  type CanvasStyleSelection,
  type CanvasThemeId
} from "../appearance";
import { CanvasStylePreview } from "./CanvasStylePreview";

interface CanvasThemeEditorProps {
  activeStyle: CanvasStyleSelection;
  appAppearanceMode: AppAppearanceMode;
  onApply: (selection: CanvasStyleSelection) => void;
  onCancel: () => void;
}

export function CanvasThemeEditor({ activeStyle, appAppearanceMode, onApply, onCancel }: CanvasThemeEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<CanvasStyleSelection>(activeStyle);

  useEffect(() => {
    setExpanded(false);
    setDraft(activeStyle);
  }, [appAppearanceMode]);

  useEffect(() => {
    if (!expanded) setDraft(activeStyle);
  }, [activeStyle, expanded]);

  const changed = draft.canvasThemeId !== activeStyle.canvasThemeId || draft.canvasBackgroundId !== activeStyle.canvasBackgroundId;
  const activeTheme = getCanvasTheme(activeStyle.canvasThemeId);
  const activeBackground = getCanvasBackground(activeStyle.canvasBackgroundId);

  function toggleExpanded() {
    if (expanded) {
      setDraft(activeStyle);
      setExpanded(false);
      return;
    }
    setDraft(activeStyle);
    setExpanded(true);
  }

  return (
    <div className={expanded ? "settings-section canvas-theme-editor canvas-theme-editor--expanded" : "settings-section canvas-theme-editor"}>
      <div className="canvas-theme-editor__summary">
        <div>
          <div className="settings-section__title">Customize Canvas</div>
          <span>{activeTheme.label} · {activeBackground.label}</span>
        </div>
        <button className="toolbar-button" type="button" aria-expanded={expanded} aria-controls="canvas-theme-editor-content" onClick={toggleExpanded}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? "Collapse" : "Customize"}
        </button>
      </div>
      {expanded ? (
        <div id="canvas-theme-editor-content" className="canvas-theme-editor__content">
          <CanvasStylePreview selection={draft} />
          <label className="settings-select-field" htmlFor="canvas-theme-select">
            <span>Canvas Theme</span>
            <select
              id="canvas-theme-select"
              value={draft.canvasThemeId}
              onChange={(event) => {
                const canvasThemeId = event.currentTarget.value as CanvasThemeId;
                setDraft((current) => ({ ...current, canvasThemeId }));
              }}
            >
              {CANVAS_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}
            </select>
          </label>
          <div className="settings-note">{getCanvasTheme(draft.canvasThemeId).description}</div>
          <label className="settings-select-field" htmlFor="canvas-background-select">
            <span>Canvas Background</span>
            <select
              id="canvas-background-select"
              value={draft.canvasBackgroundId}
              onChange={(event) => {
                const canvasBackgroundId = event.currentTarget.value as CanvasBackgroundId;
                setDraft((current) => ({ ...current, canvasBackgroundId }));
              }}
            >
              {CANVAS_BACKGROUNDS.map((background) => <option key={background.id} value={background.id}>{background.label}</option>)}
            </select>
          </label>
          <div className="settings-note">{getCanvasBackground(draft.canvasBackgroundId).description}</div>
          <div className={changed ? "canvas-theme-editor__status canvas-theme-editor__status--changed" : "canvas-theme-editor__status"} aria-live="polite">
            {changed ? "Unapplied changes" : "Preview matches the active Canvas Style"}
          </div>
          <div className="canvas-theme-editor__actions">
            <button className="toolbar-button" type="button" onClick={() => setDraft(getDefaultCanvasStyle(appAppearanceMode))}>
              <RotateCcw size={16} /> Reset to Default
            </button>
            <button className="toolbar-button" type="button" onClick={onCancel}>Cancel</button>
            <button className="toolbar-button canvas-theme-editor__apply" type="button" disabled={!changed} onClick={() => onApply(draft)}>
              Apply Canvas Style
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
