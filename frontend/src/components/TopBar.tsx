import { AlertTriangle, Check, Clock3, Download, Flame, Loader2, MonitorX, Plus, Save, Settings, Upload } from "lucide-react";
import type { RefObject } from "react";
import type { AppMode, ExportFormat } from "../types/atlas";
import { ExportMenu } from "./ExportMenu";
import { SearchBox } from "./SearchBox";

interface TopBarProps {
  appMode: AppMode;
  exportMenuOpen: boolean;
  exportMenuRef: RefObject<HTMLDivElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  isExporting: ExportFormat | null;
  isSaving: boolean;
  resetMenuOpen: boolean;
  resetMenuRef: RefObject<HTMLDivElement>;
  saveStatusClass: string;
  saveStatusText: string;
  searchInputRef: RefObject<HTMLInputElement>;
  settingsButtonRef: RefObject<HTMLButtonElement>;
  searchTerm: string;
  settingsOpen: boolean;
  onExportMenuToggle: () => void;
  onFileSelected: (file: File) => void;
  onLoadDemo: () => void;
  onDownloadAtlasJson: () => void;
  onResetMenuToggle: () => void;
  onSave: () => void;
  onSearchChange: (value: string) => void;
  onToggleAppMode: () => void;
  onToggleSettings: () => void;
  onToolbarExport: (format: ExportFormat) => void;
  onWipeCanvas: () => void;
}

export function TopBar({
  appMode,
  exportMenuOpen,
  exportMenuRef,
  fileInputRef,
  isExporting,
  isSaving,
  resetMenuOpen,
  resetMenuRef,
  saveStatusClass,
  saveStatusText,
  searchInputRef,
  settingsButtonRef,
  searchTerm,
  settingsOpen,
  onExportMenuToggle,
  onFileSelected,
  onLoadDemo,
  onDownloadAtlasJson,
  onResetMenuToggle,
  onSave,
  onSearchChange,
  onToggleAppMode,
  onToggleSettings,
  onToolbarExport,
  onWipeCanvas
}: TopBarProps) {
  const saveStatusTone = saveStatusClass.includes("save-status--error") ? "error" : isSaving || saveStatusClass.includes("save-status--dirty") ? "pending" : "saved";

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
          <span className={`${saveStatusClass} save-status--icon save-status--${saveStatusTone}`} title={saveStatusText} aria-label={saveStatusText}>
            {saveStatusTone === "error" ? <AlertTriangle size={14} /> : saveStatusTone === "pending" ? <Clock3 size={14} /> : <Check size={14} />}
          </span>
          <button className="toolbar-button" onClick={() => fileInputRef.current?.click()} title="Import Atlas"><Upload size={18} /> Import Atlas</button>
          <input ref={fileInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onFileSelected(file);
          }} />
          <button className="toolbar-button" onClick={onDownloadAtlasJson} title="Download Atlas"><Download size={18} /> Download Atlas</button>
          <div className="toolbar-menu" ref={resetMenuRef}>
            <button className="toolbar-button" type="button" aria-haspopup="menu" aria-expanded={resetMenuOpen} onClick={onResetMenuToggle} title="Reset"><MonitorX size={18} /> Reset</button>
            {resetMenuOpen ? (
              <div className="toolbar-popover" role="menu" aria-label="Reset">
                <button type="button" role="menuitem" onClick={onLoadDemo}><Upload size={16} /> Load Demo</button>
                <button type="button" role="menuitem" className="toolbar-popover__danger" onClick={onWipeCanvas}><Flame size={16} /> Wipe Canvas</button>
              </div>
            ) : null}
          </div>
          <ExportMenu exportMenuOpen={exportMenuOpen} exportMenuRef={exportMenuRef} isExporting={isExporting} onExport={onToolbarExport} onToggle={onExportMenuToggle} />
          <button className={appMode === "planning" ? "toolbar-button toolbar-button--planning toolbar-button--active" : "toolbar-button toolbar-button--planning"} onClick={onToggleAppMode} title="Planning Mode">
            <Plus size={18} /> Planning Mode
          </button>
        </div>
      </div>
      <div className="topbar__right">
        <SearchBox inputRef={searchInputRef} searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <button ref={settingsButtonRef} className="icon-button" onClick={onToggleSettings} title={settingsOpen ? "Close settings" : "Settings"} aria-label={settingsOpen ? "Close settings" : "Settings"} aria-expanded={settingsOpen}>
          <Settings size={19} />
        </button>
      </div>
    </header>
  );
}
