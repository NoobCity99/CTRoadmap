import { BookOpenText, ChevronDown, ChevronUp, CircuitBoard, Eye, LayoutDashboard, Plus, Settings, Trash2 } from "lucide-react";
import type { CSSProperties, DragEvent, TouchEvent, WheelEvent } from "react";
import { LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "../lib/constants";
import { getTileVisualTokens, type CanvasThemeId } from "../appearance";
import type { SearchResult } from "../lib/atlasSelectors";
import type { Atlas, AtlasWarning, LayoutTemplate, LinkType, Selection, TileType, View } from "../types/atlas";
import { HandbookToc } from "./HandbookToc";
import type { HandbookThemeMode } from "./HandbookView";

export type SidebarSectionId = "tilePalette" | "views" | "filters" | "relationships";
export type PaletteEntry = { kind: "tile"; type: TileType } | { kind: "family" };

export interface SidebarState {
  collapsed: Record<SidebarSectionId, boolean>;
  paletteIndex: number;
}

export interface CollapsedPaletteEntry {
  slot: string;
  entry: PaletteEntry;
  interactive: boolean;
}

interface LeftSidebarProps {
  activeView: View | null;
  activeViewId: string;
  atlas: Atlas;
  collapsedPaletteEntries: readonly CollapsedPaletteEntry[];
  familyPaletteColor: string;
  handbookThemeMode: HandbookThemeMode;
  layoutTemplate: LayoutTemplate;
  searchResults: SearchResult[];
  searchTerm: string;
  selectedHandbookTileId: string | null;
  selectedHandbookVolumeId: string | null;
  selection: Selection;
  sidebarState: SidebarState;
  canvasThemeId: CanvasThemeId;
  warnings: AtlasWarning[];
  onCollapsedPaletteTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
  onCollapsedPaletteTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onCollapsedPaletteWheel: (event: WheelEvent<HTMLDivElement>) => void;
  onCreateView: () => void;
  onCycleCollapsedPalette: (delta: number) => void;
  onDeleteView: () => void;
  onEditView: () => void;
  onFamilyPaletteClick: () => void;
  onFamilyPaletteDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onHandbookThemeModeChange: (mode: HandbookThemeMode) => void;
  onMoveHandbookFamily: (familyId: string, direction: -1 | 1) => void;
  onPaletteClick: (type: TileType) => void;
  onPaletteDragEnd: () => void;
  onPaletteDragStart: (event: DragEvent<HTMLButtonElement>, type: TileType) => void;
  onSelectSearchResult: (result: SearchResult) => void;
  onSelectHandbookTile: (volumeId: string, tileId: string) => void;
  onSelectHandbookVolume: (volumeId: string) => void;
  onSelectView: (view: View) => void;
  onSelectWarningLink: (linkId: string) => void;
  onSelectWarningTile: (tileId: string) => void;
  onTemplateChange: (template: LayoutTemplate) => void;
  onToggleSidebarSection: (section: SidebarSectionId) => void;
  onToggleViewLinkType: (type: LinkType) => void;
  onToggleViewTileType: (type: TileType) => void;
}

export function LeftSidebar({
  activeView,
  activeViewId,
  atlas,
  collapsedPaletteEntries,
  familyPaletteColor,
  handbookThemeMode,
  layoutTemplate,
  searchResults,
  searchTerm,
  selectedHandbookTileId,
  selectedHandbookVolumeId,
  selection,
  sidebarState,
  canvasThemeId,
  warnings,
  onCollapsedPaletteTouchEnd,
  onCollapsedPaletteTouchStart,
  onCollapsedPaletteWheel,
  onCreateView,
  onCycleCollapsedPalette,
  onDeleteView,
  onEditView,
  onFamilyPaletteClick,
  onFamilyPaletteDragStart,
  onHandbookThemeModeChange,
  onMoveHandbookFamily,
  onPaletteClick,
  onPaletteDragEnd,
  onPaletteDragStart,
  onSelectSearchResult,
  onSelectHandbookTile,
  onSelectHandbookVolume,
  onSelectView,
  onSelectWarningLink,
  onSelectWarningTile,
  onTemplateChange,
  onToggleSidebarSection,
  onToggleViewLinkType,
  onToggleViewTileType
}: LeftSidebarProps) {
  if (layoutTemplate === "handbook") {
    return (
      <aside className="sidebar">
        <div className="panel-title panel-title--spaced">Template</div>
        <div className="segmented">
          <button onClick={() => onTemplateChange("canvas_topology")}>
            <LayoutDashboard size={15} /> Canvas
          </button>
          <button className="active" onClick={() => onTemplateChange("handbook")}>
            <BookOpenText size={15} /> Handbook
          </button>
        </div>
        <div className="panel-title panel-title--spaced">Display</div>
        <div className="segmented">
          <button className={handbookThemeMode === "dark" ? "active" : ""} onClick={() => onHandbookThemeModeChange("dark")}>
            Dark
          </button>
          <button className={handbookThemeMode === "light" ? "active" : ""} onClick={() => onHandbookThemeModeChange("light")}>
            Light
          </button>
        </div>
        <HandbookToc
          atlas={atlas}
          selectedTileId={selectedHandbookTileId}
          selectedVolumeId={selectedHandbookVolumeId}
          onMoveFamily={onMoveHandbookFamily}
          onSelectTile={onSelectHandbookTile}
          onSelectVolume={onSelectHandbookVolume}
        />
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <section className={sidebarState.collapsed.tilePalette ? "sidebar-section sidebar-section--collapsed" : "sidebar-section"}>
        <button className="sidebar-section__header" type="button" aria-expanded={!sidebarState.collapsed.tilePalette} onClick={() => onToggleSidebarSection("tilePalette")}>
          <span className="panel-title">Tile Palette</span>
          <ChevronDown className="sidebar-section__chevron" size={16} />
        </button>
        {sidebarState.collapsed.tilePalette ? (
          <div
            className="tile-palette tile-palette--collapsed"
            onWheel={onCollapsedPaletteWheel}
            onTouchStart={onCollapsedPaletteTouchStart}
            onTouchEnd={onCollapsedPaletteTouchEnd}
          >
            <button className="palette-cycle-button" type="button" onClick={() => onCycleCollapsedPalette(-1)} title="Previous tile type" aria-label="Previous tile type">
              <ChevronUp size={16} />
            </button>
            {collapsedPaletteEntries.map(({ slot, entry, interactive }) => (
              <PaletteEntryButton
                key={entry.kind === "family" ? `${slot}-family` : `${slot}-${entry.type}`}
                entry={entry}
                familyPaletteColor={familyPaletteColor}
                interactive={interactive}
                slot="collapsed"
                canvasThemeId={canvasThemeId}
                onFamilyPaletteClick={onFamilyPaletteClick}
                onFamilyPaletteDragStart={onFamilyPaletteDragStart}
                onPaletteClick={onPaletteClick}
                onPaletteDragEnd={onPaletteDragEnd}
                onPaletteDragStart={onPaletteDragStart}
              />
            ))}
            <button className="palette-cycle-button" type="button" onClick={() => onCycleCollapsedPalette(1)} title="Next tile type" aria-label="Next tile type">
              <ChevronDown size={16} />
            </button>
          </div>
        ) : (
          <div className="tile-palette">
            {buildPaletteEntries().map((entry) => (
              <PaletteEntryButton
                key={entry.kind === "family" ? "family" : entry.type}
                entry={entry}
                familyPaletteColor={familyPaletteColor}
                interactive
                slot="expanded"
                canvasThemeId={canvasThemeId}
                onFamilyPaletteClick={onFamilyPaletteClick}
                onFamilyPaletteDragStart={onFamilyPaletteDragStart}
                onPaletteClick={onPaletteClick}
                onPaletteDragEnd={onPaletteDragEnd}
                onPaletteDragStart={onPaletteDragStart}
              />
            ))}
          </div>
        )}
      </section>

      <div className="panel-title panel-title--spaced">Search Results</div>
      <div className="search-results">
        {searchTerm.trim() ? (
          searchResults.length ? (
            searchResults.map((result) => (
              <button
                key={`${result.kind}-${result.id}`}
                className={selection?.kind === result.kind && selection.id === result.id ? "search-result search-result--active" : "search-result"}
                onClick={() => onSelectSearchResult(result)}
              >
                <span>{result.kind}</span>
                <strong>{result.title}</strong>
                <small>{result.detail}</small>
              </button>
            ))
          ) : (
            <div className="warning-empty">No matches</div>
          )
        ) : (
          <div className="warning-empty">Use search to find tiles and relationships</div>
        )}
      </div>

      <div className="panel-title panel-title--spaced">Template</div>
      <div className="segmented">
        <button className={layoutTemplate === "canvas_topology" ? "active" : ""} onClick={() => onTemplateChange("canvas_topology")}>
          <LayoutDashboard size={15} /> Canvas
        </button>
        <button onClick={() => onTemplateChange("handbook")}>
          <BookOpenText size={15} /> Handbook
        </button>
      </div>

      <section className={sidebarState.collapsed.views ? "sidebar-section sidebar-section--collapsed sidebar-section--spaced" : "sidebar-section sidebar-section--spaced"}>
        <button className="sidebar-section__header" type="button" aria-expanded={!sidebarState.collapsed.views} onClick={() => onToggleSidebarSection("views")}>
          <span className="panel-title">Layers</span>
          <ChevronDown className="sidebar-section__chevron" size={16} />
        </button>
        {!sidebarState.collapsed.views ? (
          <div className="sidebar-section__body">
            <div className="view-list">
              {atlas.views.map((view) => (
                <button key={view.id} className={activeViewId === view.id ? "view-button view-button--active" : "view-button"} onClick={() => onSelectView(view)}>
                  <Eye size={16} />
                  {view.title}
                </button>
              ))}
            </div>
            <div className="view-actions">
              <button className="small-button" onClick={onCreateView}>
                <Plus size={15} /> New
              </button>
              <button className="small-button" onClick={onEditView} disabled={!activeView}>
                <Settings size={15} /> Edit
              </button>
              <button className="small-button small-button--danger" onClick={onDeleteView} disabled={!activeView || atlas.views.length <= 1}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className={sidebarState.collapsed.filters ? "sidebar-section sidebar-section--collapsed sidebar-section--spaced" : "sidebar-section sidebar-section--spaced"}>
        <button className="sidebar-section__header" type="button" aria-expanded={!sidebarState.collapsed.filters} onClick={() => onToggleSidebarSection("filters")}>
          <span className="panel-title">Filters</span>
          <ChevronDown className="sidebar-section__chevron" size={16} />
        </button>
        {!sidebarState.collapsed.filters ? (
          <div className="filter-grid">
            {TILE_TYPES.map((type) => (
              <label key={type} className="filter-check">
                <input type="checkbox" checked={!activeView?.visible_types.length || activeView.visible_types.includes(type)} onChange={() => onToggleViewTileType(type)} />
                {TILE_TYPE_CONFIG[type].label}
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className={sidebarState.collapsed.relationships ? "sidebar-section sidebar-section--collapsed sidebar-section--spaced" : "sidebar-section sidebar-section--spaced"}>
        <button className="sidebar-section__header" type="button" aria-expanded={!sidebarState.collapsed.relationships} onClick={() => onToggleSidebarSection("relationships")}>
          <span className="panel-title">Relationships</span>
          <ChevronDown className="sidebar-section__chevron" size={16} />
        </button>
        {!sidebarState.collapsed.relationships ? (
          <div className="filter-grid filter-grid--links">
            {LINK_TYPES.map((type) => (
              <label key={type} className="filter-check">
                <input type="checkbox" checked={!activeView?.visible_links.length || activeView.visible_links.includes(type)} onChange={() => onToggleViewLinkType(type)} />
                {type}
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <div className="panel-title panel-title--spaced">Warnings</div>
      <div className="warning-list">
        {warnings.length ? (
          warnings.slice(0, 8).map((warning) => (
            <button
              key={warning.id}
              className={`warning-item warning-item--${warning.severity}`}
              onClick={() => {
                if (warning.targetKind === "tile" && warning.targetId) onSelectWarningTile(warning.targetId);
                if (warning.targetKind === "link" && warning.targetId) onSelectWarningLink(warning.targetId);
              }}
            >
              {warning.message}
            </button>
          ))
        ) : (
          <div className="warning-empty">No validation warnings</div>
        )}
        {warnings.length > 8 ? <div className="warning-empty">+{warnings.length - 8} more warnings</div> : null}
      </div>
    </aside>
  );
}

function PaletteEntryButton({
  entry,
  familyPaletteColor,
  interactive,
  slot,
  canvasThemeId,
  onFamilyPaletteClick,
  onFamilyPaletteDragStart,
  onPaletteClick,
  onPaletteDragEnd,
  onPaletteDragStart
}: {
  entry: PaletteEntry;
  familyPaletteColor: string;
  interactive: boolean;
  slot: "collapsed" | "expanded";
  canvasThemeId: CanvasThemeId;
  onFamilyPaletteClick: () => void;
  onFamilyPaletteDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onPaletteClick: (type: TileType) => void;
  onPaletteDragEnd: () => void;
  onPaletteDragStart: (event: DragEvent<HTMLButtonElement>, type: TileType) => void;
}) {
  const className =
    slot === "collapsed"
      ? interactive
        ? "palette-item palette-item--collapsed palette-item--active-slot"
        : "palette-item palette-item--collapsed palette-item--reference"
      : "palette-item";

  if (entry.kind === "family") {
    const style = { "--tile-accent": familyPaletteColor } as CSSProperties;
    return interactive ? (
      <button
        className={className}
        style={style}
        draggable
        onClick={onFamilyPaletteClick}
        onDragStart={onFamilyPaletteDragStart}
        onDragEnd={onPaletteDragEnd}
        title="Click to create Family; drag onto the map to place it."
      >
        <CircuitBoard size={19} />
        Family
      </button>
    ) : (
      <div className={className} style={style} aria-hidden="true">
        <CircuitBoard size={19} />
        Family
      </div>
    );
  }

  const config = TILE_TYPE_CONFIG[entry.type];
  const Icon = config.icon;
  const paletteAccent = getTileVisualTokens(entry.type, canvasThemeId).iconColor;
  const style = { "--tile-accent": paletteAccent } as CSSProperties;
  return interactive ? (
    <button
      className={className}
      style={style}
      draggable
      onClick={() => onPaletteClick(entry.type)}
      onDragStart={(event) => onPaletteDragStart(event, entry.type)}
      onDragEnd={onPaletteDragEnd}
      title={`Click to create ${config.label}; drag onto the map to place it.`}
    >
      <Icon size={19} />
      {config.label}
    </button>
  ) : (
    <div className={className} style={style} aria-hidden="true">
      <Icon size={19} />
      {config.label}
    </div>
  );
}

function buildPaletteEntries(): PaletteEntry[] {
  return [...TILE_TYPES.map((type) => ({ kind: "tile" as const, type })), { kind: "family" }];
}
