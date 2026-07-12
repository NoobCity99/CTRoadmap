import { Download, FileCode2, FileImage, FileText, Loader2 } from "lucide-react";
import type { RefObject } from "react";
import type { ExportFormat } from "../types/atlas";

interface ExportMenuProps {
  exportMenuOpen: boolean;
  exportMenuRef: RefObject<HTMLDivElement>;
  isExporting: ExportFormat | null;
  onExport: (format: ExportFormat) => void;
  onToggle: () => void;
}

export function ExportMenu({ exportMenuOpen, exportMenuRef, isExporting, onExport, onToggle }: ExportMenuProps) {
  return (
    <div className="toolbar-menu" ref={exportMenuRef}>
      <button
        className="toolbar-button"
        type="button"
        aria-haspopup="menu"
        aria-expanded={exportMenuOpen}
        onClick={onToggle}
        disabled={Boolean(isExporting)}
        title="Export"
      >
        {isExporting ? <Loader2 className="spin" size={18} /> : <Download size={18} />} Export
      </button>
      {exportMenuOpen ? (
        <div className="toolbar-popover" role="menu" aria-label="Export">
          <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => onExport("markdown")}>
            <FileText size={16} /> Markdown
          </button>
          <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => onExport("yaml")}>
            <Download size={16} /> YAML
          </button>
          <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => onExport("mermaid")}>
            <FileCode2 size={16} /> Mermaid
          </button>
          <button type="button" role="menuitem" disabled className="toolbar-popover__disabled" title="PDF export is not available yet">
            <FileText size={16} /> PDF-TBD
          </button>
          <button type="button" role="menuitem" disabled className="toolbar-popover__disabled" title="PNG export is not available yet">
            <FileImage size={16} /> PNG-TBD
          </button>
        </div>
      ) : null}
    </div>
  );
}
