import { Download, ServerCog, Trash2, X } from "lucide-react";
import { CanvasThemeEditor } from "./CanvasThemeEditor";
import type { AppVersion, Atlas, DebugEvent, View } from "../types/atlas";

interface SettingsPanelProps {
  atlas: Atlas;
  activeView: View | null;
  appVersion: AppVersion | null;
  backendHealth: string;
  debugEvents: DebugEvent[];
  onClearDebugLog: () => void;
  onClose: () => void;
  onExportDebugLog: () => void;
  onResetCanvasAppearance: () => void;
}

export function SettingsPanel({ atlas, activeView, appVersion, backendHealth, debugEvents, onClearDebugLog, onClose, onExportDebugLog, onResetCanvasAppearance }: SettingsPanelProps) {
  const recentEvents = debugEvents.slice(-8).reverse();
  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="settings-panel" role="dialog" aria-modal="true" aria-label="Settings" onMouseDown={(event) => event.stopPropagation()}>
        <header className="settings-panel__header">
          <div><h2>Settings</h2><span>Canvas appearance and local troubleshooting</span></div>
          <button className="mini-icon-button" onClick={onClose} aria-label="Close settings"><X size={17} /></button>
        </header>

        <CanvasThemeEditor onReset={onResetCanvasAppearance} />

        <div className="settings-section">
          <div className="settings-section__title">App Metadata</div>
          <div className="metadata-grid">
            <span>Version</span><strong>{appVersion?.current_version ?? atlas.version}</strong>
            <span>Channel</span><strong>{appVersion?.channel ?? "unknown"}</strong>
            <span>Deployment</span><strong>{appVersion?.deployment_type ?? "unknown"}</strong>
            <span>Build SHA</span><strong>{shortBuildSha(appVersion?.build_sha)}</strong>
            <span>Build date</span><strong>{appVersion?.build_date ?? "unknown"}</strong>
            <span>Tiles</span><strong>{atlas.tiles.length}</strong>
            <span>Links</span><strong>{atlas.links.length}</strong>
            <span>Layers</span><strong>{atlas.views.length}</strong>
            <span>Active layer</span><strong>{activeView?.title ?? "None"}</strong>
            <span>Backend</span><strong>{backendHealth}</strong>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section__title">Debug Log</div>
          <div className="settings-actions">
            <button className="toolbar-button" onClick={onExportDebugLog}><Download size={17} /> Export Debug Log</button>
            <button className="toolbar-button" onClick={onClearDebugLog}><Trash2 size={17} /> Clear Local Log</button>
          </div>
          <div className="settings-note">Log entries include event metadata and summary counts only. Atlas contents and secret-like fields are excluded.</div>
          <div className="debug-list">
            {recentEvents.length ? recentEvents.map((event) => (
              <div key={event.id} className={`debug-item debug-item--${event.severity}`}>
                <div><strong>{event.action}</strong><span>{new Date(event.timestamp).toLocaleString()}</span></div>
                <p>{event.message}</p><small><ServerCog size={13} /> {event.source}</small>
              </div>
            )) : <div className="warning-empty">No debug events yet</div>}
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
