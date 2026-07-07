import { Download, FileCode2, FileText, Loader2 } from "lucide-react";
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
        title="3rd Party Export"
      >
        {isExporting ? <Loader2 className="spin" size={18} /> : <Download size={18} />} 3rd Party Export
      </button>
      {exportMenuOpen ? (
        <div className="toolbar-popover" role="menu" aria-label="3rd Party Export">
          <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => onExport("markdown")}>
            <FileText size={16} /> Markdown
          </button>
          <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => onExport("yaml")}>
            <Download size={16} /> YAML
          </button>
          <button type="button" role="menuitem" disabled={Boolean(isExporting)} onClick={() => onExport("mermaid")}>
            <FileCode2 size={16} /> Mermaid
          </button>
        </div>
      ) : null}
    </div>
  );
}
