import { Eye } from "lucide-react";
import type { View } from "../types/atlas";

interface LayerBarProps {
  activeViewId: string;
  viewBarOpen: boolean;
  views: View[];
  onSelectView: (view: View) => void;
  onToggleViewBar: () => void;
}

export function LayerBar({ activeViewId, viewBarOpen, views, onSelectView, onToggleViewBar }: LayerBarProps) {
  return (
    <div className={viewBarOpen ? "view-tabs" : "view-tabs view-tabs--collapsed"}>
      <button
        className="view-tabs__toggle"
        type="button"
        onClick={onToggleViewBar}
        title={viewBarOpen ? "Hide layers" : "Show layers"}
        aria-label={viewBarOpen ? "Hide layers" : "Show layers"}
        aria-expanded={viewBarOpen}
      >
        <Eye size={16} />
      </button>
      {viewBarOpen
        ? views.map((view) => (
            <button key={view.id} className={activeViewId === view.id ? "active" : ""} onClick={() => onSelectView(view)}>
              {view.title}
            </button>
          ))
        : null}
    </div>
  );
}
