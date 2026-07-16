import { Download, ExternalLink, KeyRound, LogOut, ServerCog, ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import { DiscordInviteSettingsBanner } from "./UpdatePopup";
import { CANVAS_BACKGROUNDS, THEME_PALETTES, getThemePalette } from "../lib/theme";
import type {
  AppAppearanceMode,
  AppVersion,
  Atlas,
  AuthStatus,
  CanvasBackgroundId,
  DebugEvent,
  LayoutTemplate,
  ThemePaletteId,
  UpdateAdvisory,
  UpdateSettings,
  View
} from "../types/atlas";

type AuthDialogMode = "setup" | "change" | "remove" | "logout-all" | null;

interface SettingsPanelProps {
  atlas: Atlas;
  activeView: View | null;
  appVersion: AppVersion | null;
  authStatus: AuthStatus;
  backendHealth: string;
  debugEvents: DebugEvent[];
  layoutTemplate: LayoutTemplate;
  appAppearanceMode: AppAppearanceMode;
  canvasBackgroundId: CanvasBackgroundId;
  paletteId: ThemePaletteId;
  updateAdvisory: UpdateAdvisory | null;
  onAppAppearanceModeChange: (mode: AppAppearanceMode) => void;
  onClearDebugLog: () => void;
  onChangePasscode: (currentPasscode: string, newPasscode: string) => void | Promise<void>;
  onClose: () => void;
  onCopyUpdateCommand: () => void | Promise<void>;
  onExportDebugLog: () => void;
  onLogoutAllPasscode: () => void | Promise<void>;
  onCanvasBackgroundChange: (backgroundId: CanvasBackgroundId) => void;
  onPaletteChange: (paletteId: ThemePaletteId) => void;
  onRemovePasscode: (currentPasscode: string) => void | Promise<void>;
  onSetupPasscode: (passcode: string) => void | Promise<void>;
  onUpdateSettings: (settings: UpdateSettings) => void | Promise<void>;
  onViewReleaseNotes: () => void;
}

export function SettingsPanel({
  atlas,
  activeView,
  appVersion,
  authStatus,
  backendHealth,
  debugEvents,
  layoutTemplate,
  appAppearanceMode,
  canvasBackgroundId,
  paletteId,
  updateAdvisory,
  onAppAppearanceModeChange,
  onClearDebugLog,
  onChangePasscode,
  onClose,
  onCopyUpdateCommand,
  onExportDebugLog,
  onLogoutAllPasscode,
  onCanvasBackgroundChange,
  onPaletteChange,
  onRemovePasscode,
  onSetupPasscode,
  onUpdateSettings,
  onViewReleaseNotes
}: SettingsPanelProps) {
  const activePalette = getThemePalette(paletteId);
  const recentEvents = debugEvents.slice(-8).reverse();
  const version = appVersion ?? updateAdvisory;
  const updateState = updateAdvisory?.state;
  const updateTarget = updateAdvisory?.target;
  const [setupPasscode, setSetupPasscode] = useState("");
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [removePasscode, setRemovePasscode] = useState("");
  const [authDialogMode, setAuthDialogMode] = useState<AuthDialogMode>(null);
  const [authBusyAction, setAuthBusyAction] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  async function runAuthAction(action: string, successMessage: string, callback: () => void | Promise<void>, clearFields: () => void) {
    setAuthBusyAction(action);
    setAuthError("");
    setAuthMessage("");
    try {
      await callback();
      clearFields();
      setAuthMessage(successMessage);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : String(error));
    } finally {
      setAuthBusyAction(null);
    }
  }

  function openAuthDialog(mode: Exclude<AuthDialogMode, null>) {
    setAuthError("");
    setAuthMessage("");
    setAuthDialogMode(mode);
  }

  function closeAuthDialog() {
    if (authBusyAction !== null) return;
    setSetupPasscode("");
    setCurrentPasscode("");
    setNewPasscode("");
    setRemovePasscode("");
    setAuthDialogMode(null);
  }

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

        <DiscordInviteSettingsBanner />

        <div className="settings-section app-appearance-settings">
          <div className="app-appearance-options" role="group" aria-label="App Appearance Mode">
            <button
              type="button"
              className={appAppearanceMode === "classic" ? "app-appearance-option app-appearance-option--active" : "app-appearance-option"}
              aria-pressed={appAppearanceMode === "classic"}
              onClick={() => onAppAppearanceModeChange("classic")}
            >
              Classic Mode
            </button>
            <button
              type="button"
              className={appAppearanceMode === "zima" ? "app-appearance-option app-appearance-option--active" : "app-appearance-option"}
              aria-pressed={appAppearanceMode === "zima"}
              onClick={() => onAppAppearanceModeChange("zima")}
            >
              ZIMA Mode
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section__title">Theme Palette</div>
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

        <div className="settings-section local-access-settings-card">
          <div className="settings-section__title">Local Access Passcode</div>
          <p>
            {authStatus.passcode_configured
              ? "A Local Access Passcode is configured for this local instance."
              : "No Local Access Passcode is configured. App access is currently open on this local instance."}
          </p>
          <div className="settings-actions local-access-settings-card__actions">
            {!authStatus.passcode_configured ? (
              <button className="toolbar-button" onClick={() => openAuthDialog("setup")} disabled={authBusyAction !== null}>
                <ShieldCheck size={17} /> Set Access Passcode
              </button>
            ) : (
              <>
                <button className="toolbar-button" onClick={() => openAuthDialog("change")} disabled={authBusyAction !== null}>
                  <KeyRound size={17} /> Change Local Access Passcode
                </button>
                <button className="toolbar-button" onClick={() => openAuthDialog("remove")} disabled={authBusyAction !== null}>
                  <Trash2 size={17} /> Remove Local Access Passcode
                </button>
                <button className="toolbar-button" onClick={() => openAuthDialog("logout-all")} disabled={authBusyAction !== null}>
                  <LogOut size={17} /> Log out all
                </button>
              </>
            )}
          </div>
          <div className="settings-note">Minimum 8 characters for beta. Longer passphrases are recommended.</div>
          {authMessage ? <div className="settings-note settings-note--success">{authMessage}</div> : null}
          {authError ? <div className="settings-note settings-note--warning">{authError}</div> : null}
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
      {authDialogMode ? (
        <div
          className="local-access-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation();
            closeAuthDialog();
          }}
        >
          <div className="local-access-dialog" role="dialog" aria-modal="true" aria-label="Local Access Passcode" onMouseDown={(event) => event.stopPropagation()}>
            <button className="mini-icon-button local-access-dialog__close" onClick={closeAuthDialog} aria-label="Close Local Access Passcode dialog">
              <X size={17} />
            </button>
            <div>
              <h3>{authDialogTitle(authDialogMode)}</h3>
              <p>{authDialogDescription(authDialogMode)}</p>
            </div>
            {authDialogMode === "setup" ? (
              <form
                className="local-access-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void runAuthAction(
                    "setup",
                    "Local Access Passcode set.",
                    () => onSetupPasscode(setupPasscode),
                    () => {
                      setSetupPasscode("");
                      setAuthDialogMode(null);
                    }
                  );
                }}
              >
                <label>
                  <span>New Local Access Passcode</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={setupPasscode}
                    onChange={(event) => setSetupPasscode(event.currentTarget.value)}
                    placeholder="At least 8 characters"
                    autoFocus
                  />
                </label>
                <button className="toolbar-button" type="submit" disabled={authBusyAction !== null}>
                  <ShieldCheck size={17} /> Set Access Passcode
                </button>
              </form>
            ) : null}
            {authDialogMode === "change" ? (
              <form
                className="local-access-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void runAuthAction(
                    "change",
                    "Local Access Passcode changed.",
                    () => onChangePasscode(currentPasscode, newPasscode),
                    () => {
                      setCurrentPasscode("");
                      setNewPasscode("");
                      setAuthDialogMode(null);
                    }
                  );
                }}
              >
                <label>
                  <span>Current Local Access Passcode</span>
                  <input type="password" autoComplete="current-password" value={currentPasscode} onChange={(event) => setCurrentPasscode(event.currentTarget.value)} autoFocus />
                </label>
                <label>
                  <span>New Local Access Passcode</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={newPasscode}
                    onChange={(event) => setNewPasscode(event.currentTarget.value)}
                    placeholder="At least 8 characters"
                  />
                </label>
                <button className="toolbar-button" type="submit" disabled={authBusyAction !== null}>
                  <KeyRound size={17} /> Change Local Access Passcode
                </button>
              </form>
            ) : null}
            {authDialogMode === "remove" ? (
              <form
                className="local-access-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void runAuthAction(
                    "remove",
                    "Local Access Passcode removed.",
                    () => onRemovePasscode(removePasscode),
                    () => {
                      setRemovePasscode("");
                      setAuthDialogMode(null);
                    }
                  );
                }}
              >
                <label>
                  <span>Confirm Current Local Access Passcode</span>
                  <input type="password" autoComplete="current-password" value={removePasscode} onChange={(event) => setRemovePasscode(event.currentTarget.value)} autoFocus />
                </label>
                <button className="toolbar-button" type="submit" disabled={authBusyAction !== null}>
                  <Trash2 size={17} /> Remove Local Access Passcode
                </button>
              </form>
            ) : null}
            {authDialogMode === "logout-all" ? (
              <div className="local-access-form">
                <button
                  className="toolbar-button"
                  onClick={() =>
                    void runAuthAction(
                      "logout-all",
                      "All sessions logged out.",
                      onLogoutAllPasscode,
                      () => setAuthDialogMode(null)
                    )
                  }
                  disabled={authBusyAction !== null}
                >
                  <LogOut size={17} /> Log out all sessions
                </button>
              </div>
            ) : null}
            {authError ? <div className="local-access-error">{authError}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function authDialogTitle(mode: Exclude<AuthDialogMode, null>): string {
  if (mode === "setup") return "Set Access Passcode";
  if (mode === "change") return "Change Local Access Passcode";
  if (mode === "remove") return "Remove Local Access Passcode";
  return "Log out all sessions";
}

function authDialogDescription(mode: Exclude<AuthDialogMode, null>): string {
  if (mode === "setup") return "Create a passphrase of at least 8 characters. Spaces are allowed.";
  if (mode === "change") return "Enter the current Local Access Passcode before setting a new one.";
  if (mode === "remove") return "Enter the current Local Access Passcode to reopen local access.";
  return "This revokes every active Local Access Passcode session.";
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
