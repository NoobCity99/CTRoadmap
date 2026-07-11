import { Download, ExternalLink, Loader2, Plus, Save, Settings, Upload, X } from "lucide-react";
import type { RefObject } from "react";
import type { AppMode, ExportFormat, UpdateAdvisory } from "../types/atlas";
import { ExportMenu } from "./ExportMenu";
import { SearchBox } from "./SearchBox";

export interface UpdateNoticeView {
  tone: string;
  title: string;
  message: string;
}

interface TopBarProps {
  appMode: AppMode;
  exportMenuOpen: boolean;
  exportMenuRef: RefObject<HTMLDivElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  isExporting: ExportFormat | null;
  isSaving: boolean;
  saveStatusClass: string;
  saveStatusText: string;
  searchInputRef: RefObject<HTMLInputElement>;
  searchTerm: string;
  settingsOpen: boolean;
  updateAdvisory: UpdateAdvisory | null;
  updateNotice: UpdateNoticeView | null;
  onCopyUpdateCommand: () => void;
  onExportMenuToggle: () => void;
  onFileSelected: (file: File) => void;
  onLoadSeed: () => void;
  onDownloadAtlasJson: () => void;
  onRemindUpdateLater: () => void;
  onSave: () => void;
  onSearchChange: (value: string) => void;
  onToggleAppMode: () => void;
  onToggleSettings: () => void;
  onToolbarExport: (format: ExportFormat) => void;
  onViewReleaseNotes: () => void;
}

export function TopBar({
  appMode,
  exportMenuOpen,
  exportMenuRef,
  fileInputRef,
  isExporting,
  isSaving,
  saveStatusClass,
  saveStatusText,
  searchInputRef,
  searchTerm,
  settingsOpen,
  updateAdvisory,
  updateNotice,
  onCopyUpdateCommand,
  onExportMenuToggle,
  onFileSelected,
  onLoadSeed,
  onDownloadAtlasJson,
  onRemindUpdateLater,
  onSave,
  onSearchChange,
  onToggleAppMode,
  onToggleSettings,
  onToolbarExport,
  onViewReleaseNotes
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__main">
        <div className="brand" aria-label="CTRoadmap Homelab Diagram and Documentation">
          <img className="brand__logo" src="/brand/ctroadmap-topbar-logo.png" alt="CTRoadmap Homelab Diagram and Documentation" />
        </div>
        <div className="topbar__actions">
          <button className="toolbar-button toolbar-button--icon-only" onClick={onSave} disabled={isSaving} title="Save" aria-label="Save">
            {isSaving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
          </button>
          <span className={saveStatusClass}>{saveStatusText}</span>
          <button className="toolbar-button" onClick={() => fileInputRef.current?.click()} title="Import atlas.json">
            <Upload size={18} /> Import atlas.json
          </button>
          <input
            ref={fileInputRef}
            className="hidden-input"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onFileSelected(file);
            }}
          />
          <button className="toolbar-button" onClick={onDownloadAtlasJson} title="Download your Atlas">
            <Download size={18} /> Download your Atlas
          </button>
          <button className="toolbar-button" onClick={onLoadSeed} title="Load Demo">
            <Upload size={18} /> Load Demo
          </button>
          <ExportMenu exportMenuOpen={exportMenuOpen} exportMenuRef={exportMenuRef} isExporting={isExporting} onExport={onToolbarExport} onToggle={onExportMenuToggle} />
          <button
            className={appMode === "planning" ? "toolbar-button toolbar-button--planning toolbar-button--active" : "toolbar-button toolbar-button--planning"}
            onClick={onToggleAppMode}
            title="Planning Mode"
          >
            <Plus size={18} /> Planning Mode
          </button>
          {updateNotice ? (
            <div className={`update-advisory update-advisory--${updateNotice.tone}`}>
              <div>
                <strong>{updateNotice.title}</strong>
                <span>{updateNotice.message}</span>
              </div>
              {updateAdvisory?.target?.release_notes_url || updateAdvisory?.target?.download_url ? (
                <button className="mini-icon-button" onClick={onViewReleaseNotes} title="View release notes" aria-label="View release notes">
                  <ExternalLink size={15} />
                </button>
              ) : null}
              <button className="mini-icon-button" onClick={onCopyUpdateCommand} title="Copy update command" aria-label="Copy update command">
                <Download size={15} />
              </button>
              <button className="mini-icon-button" onClick={onRemindUpdateLater} title="Remind me later" aria-label="Remind me later">
                <X size={15} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="topbar__right">
        <SearchBox inputRef={searchInputRef} searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <button className="icon-button" onClick={onToggleSettings} title={settingsOpen ? "Close settings" : "Settings"} aria-label={settingsOpen ? "Close settings" : "Settings"} aria-expanded={settingsOpen}>
          <Settings size={19} />
        </button>
      </div>
    </header>
  );
}
