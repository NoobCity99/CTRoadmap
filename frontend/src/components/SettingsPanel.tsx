import { Download, ServerCog, Trash2, X } from "lucide-react";
import { THEME_PALETTES, getThemePalette } from "../lib/theme";
import type { Atlas, DebugEvent, LayoutTemplate, ThemePaletteId, View } from "../types/atlas";

interface SettingsPanelProps {
  atlas: Atlas;
  activeView: View | null;
  backendHealth: string;
  debugEvents: DebugEvent[];
  layoutTemplate: LayoutTemplate;
  paletteId: ThemePaletteId;
  onClearDebugLog: () => void;
  onClose: () => void;
  onExportDebugLog: () => void;
  onPaletteChange: (paletteId: ThemePaletteId) => void;
}

export function SettingsPanel({
  atlas,
  activeView,
  backendHealth,
  debugEvents,
  layoutTemplate,
  paletteId,
  onClearDebugLog,
  onClose,
  onExportDebugLog,
  onPaletteChange
}: SettingsPanelProps) {
  const activePalette = getThemePalette(paletteId);
  const recentEvents = debugEvents.slice(-8).reverse();

  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="settings-panel" role="dialog" aria-modal="true" aria-label="Settings" onMouseDown={(event) => event.stopPropagation()}>
        <header className="settings-panel__header">
          <div>
            <h2>Settings</h2>
            <span>UI preferences and local troubleshooting</span>
          </div>
          <button className="mini-icon-button" onClick={onClose} aria-label="Close settings">
            <X size={17} />
          </button>
        </header>

        <div className="settings-section">
          <div className="settings-section__title">Palette</div>
          <div className="palette-options">
            {THEME_PALETTES.map((palette) => (
              <button
                key={palette.id}
                className={palette.id === paletteId ? "palette-option palette-option--active" : "palette-option"}
                onClick={() => onPaletteChange(palette.id)}
              >
                <span className="palette-option__swatches">
                  {palette.swatches.map((swatch) => (
                    <i key={swatch} style={{ background: swatch }} />
                  ))}
                </span>
                <strong>{palette.label}</strong>
                <small>{palette.description}</small>
              </button>
            ))}
          </div>
          <div className="settings-note">Current palette: {activePalette.label}. Palette data is stored in this browser only.</div>
        </div>

        <div className="settings-section">
          <div className="settings-section__title">App Metadata</div>
          <div className="metadata-grid">
            <span>Version</span>
            <strong>{atlas.version}</strong>
            <span>Tiles</span>
            <strong>{atlas.tiles.length}</strong>
            <span>Links</span>
            <strong>{atlas.links.length}</strong>
            <span>Views</span>
            <strong>{atlas.views.length}</strong>
            <span>Active view</span>
            <strong>{activeView?.title ?? "None"}</strong>
            <span>Layout</span>
            <strong>{layoutTemplate}</strong>
            <span>Backend</span>
            <strong>{backendHealth}</strong>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section__title">Debug Log</div>
          <div className="settings-actions">
            <button className="toolbar-button" onClick={onExportDebugLog}>
              <Download size={17} /> Export Debug Log
            </button>
            <button className="toolbar-button" onClick={onClearDebugLog}>
              <Trash2 size={17} /> Clear Local Log
            </button>
          </div>
          <div className="settings-note">
            Log entries include event metadata and summary counts only. Atlas contents and secret-like fields are excluded.
          </div>
          <div className="debug-list">
            {recentEvents.length ? (
              recentEvents.map((event) => (
                <div key={event.id} className={`debug-item debug-item--${event.severity}`}>
                  <div>
                    <strong>{event.action}</strong>
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <p>{event.message}</p>
                  <small>
                    <ServerCog size={13} /> {event.source}
                  </small>
                </div>
              ))
            ) : (
              <div className="warning-empty">No debug events yet</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
