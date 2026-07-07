import { Download, ExternalLink, ServerCog, Trash2, X } from "lucide-react";
import { CANVAS_BACKGROUNDS, THEME_PALETTES, getThemePalette } from "../lib/theme";
import type { AppVersion, Atlas, CanvasBackgroundId, DebugEvent, LayoutTemplate, ThemePaletteId, UpdateAdvisory, UpdateSettings, View } from "../types/atlas";

interface SettingsPanelProps {
  atlas: Atlas;
  activeView: View | null;
  appVersion: AppVersion | null;
  backendHealth: string;
  debugEvents: DebugEvent[];
  layoutTemplate: LayoutTemplate;
  canvasBackgroundId: CanvasBackgroundId;
  paletteId: ThemePaletteId;
  updateAdvisory: UpdateAdvisory | null;
  onClearDebugLog: () => void;
  onClose: () => void;
  onCopyUpdateCommand: () => void | Promise<void>;
  onExportDebugLog: () => void;
  onCanvasBackgroundChange: (backgroundId: CanvasBackgroundId) => void;
  onPaletteChange: (paletteId: ThemePaletteId) => void;
  onUpdateSettings: (settings: UpdateSettings) => void | Promise<void>;
  onViewReleaseNotes: () => void;
}

export function SettingsPanel({
  atlas,
  activeView,
  appVersion,
  backendHealth,
  debugEvents,
  layoutTemplate,
  canvasBackgroundId,
  paletteId,
  updateAdvisory,
  onClearDebugLog,
  onClose,
  onCopyUpdateCommand,
  onExportDebugLog,
  onCanvasBackgroundChange,
  onPaletteChange,
  onUpdateSettings,
  onViewReleaseNotes
}: SettingsPanelProps) {
  const activePalette = getThemePalette(paletteId);
  const recentEvents = debugEvents.slice(-8).reverse();
  const version = appVersion ?? updateAdvisory;
  const updateState = updateAdvisory?.state;
  const updateTarget = updateAdvisory?.target;

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
          <div className="settings-section__title">Canvas Background</div>
          <label className="settings-select-field">
            <span>Background</span>
            <select value={canvasBackgroundId} onChange={(event) => onCanvasBackgroundChange(event.currentTarget.value as CanvasBackgroundId)}>
              {CANVAS_BACKGROUNDS.map((background) => (
                <option key={background.id} value={background.id}>
                  {background.label}
                </option>
              ))}
            </select>
          </label>
          <div className="settings-note">{CANVAS_BACKGROUNDS.find((background) => background.id === canvasBackgroundId)?.description}</div>
        </div>

        <div className="settings-section">
          <div className="settings-section__title">App Metadata</div>
          <div className="metadata-grid">
            <span>Version</span>
            <strong>{version?.current_version ?? atlas.version}</strong>
            <span>Channel</span>
            <strong>{version?.channel ?? "unknown"}</strong>
            <span>Deployment</span>
            <strong>{version?.deployment_type ?? "unknown"}</strong>
            <span>Build SHA</span>
            <strong>{shortBuildSha(version?.build_sha)}</strong>
            <span>Build date</span>
            <strong>{version?.build_date ?? "unknown"}</strong>
            <span>Tiles</span>
            <strong>{atlas.tiles.length}</strong>
            <span>Links</span>
            <strong>{atlas.links.length}</strong>
            <span>Layers</span>
            <strong>{atlas.views.length}</strong>
            <span>Active layer</span>
            <strong>{activeView?.title ?? "None"}</strong>
            <span>Layout</span>
            <strong>{layoutTemplate}</strong>
            <span>Backend</span>
            <strong>{backendHealth}</strong>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section__title">Update Advisory</div>
          <div className="metadata-grid">
            <span>Status</span>
            <strong>{updateAdvisory?.status ?? "unknown"}</strong>
            <span>Latest seen</span>
            <strong>{updateAdvisory?.latest_version ?? updateState?.latest_seen_version ?? "Not checked"}</strong>
            <span>Last checked</span>
            <strong>{formatDateTime(updateState?.last_checked_at)}</strong>
            <span>Manifest</span>
            <strong>{updateAdvisory?.manifest_url ? "configured" : "unknown"}</strong>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={updateState?.update_checks_enabled ?? true}
              onChange={(event) =>
                void onUpdateSettings({
                  update_checks_enabled: event.currentTarget.checked,
                  check_interval_hours: updateState?.check_interval_hours ?? 24
                })
              }
            />
            Enable passive update checks
          </label>
          <label className="settings-inline-field">
            <span>Check interval</span>
            <input
              type="number"
              min={1}
              max={720}
              value={updateState?.check_interval_hours ?? 24}
              onChange={(event) =>
                void onUpdateSettings({
                  update_checks_enabled: updateState?.update_checks_enabled ?? true,
                  check_interval_hours: Number(event.currentTarget.value) || 24
                })
              }
            />
            <span>hours</span>
          </label>
          <div className="settings-actions">
            <button className="toolbar-button" onClick={() => void onCopyUpdateCommand()}>
              <Download size={17} /> Copy Update Command
            </button>
            {updateTarget?.release_notes_url || updateTarget?.download_url ? (
              <button className="toolbar-button" onClick={onViewReleaseNotes}>
                <ExternalLink size={17} /> View Release Notes
              </button>
            ) : null}
          </div>
          {updateAdvisory?.error ? <div className="settings-note settings-note--warning">Last update check failed: {updateAdvisory.error}</div> : null}
          <div className="settings-note">
            Privacy: CTRoadmap only downloads a public version file. No atlas data, debug log data, or local system data is uploaded.
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

function shortBuildSha(value: string | undefined): string {
  if (!value || value === "unknown") return "unknown";
  return value.slice(0, 12);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Not checked";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
