import { Copy, ExternalLink } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TILE_TYPE_CONFIG } from "../lib/constants";
import { normalizeTileIconRef, TileIconGlyph } from "../lib/icons";
import { buildHandbookDocument, buildHandbookVolumeOutline, findHandbookVolumeForTile, tileAnchor, type HandbookChapter, type HandbookTileSection, type HandbookVolume } from "../lib/handbook";
import { resolveLifecycle } from "../lib/atlasSelectors";
import type { Atlas, LinkType, Selection, Tile } from "../types/atlas";

export type HandbookThemeMode = "dark" | "light";

interface HandbookViewProps {
  atlas: Atlas;
  selectedVolumeId: string | null;
  themeMode: HandbookThemeMode;
  selection: Selection;
  onNotesFocus: () => void;
  onSelectTile: (tileId: string) => void;
  onUpdateTile: (tile: Tile) => void;
}

export function HandbookView({ atlas, selectedVolumeId, themeMode, selection, onNotesFocus, onSelectTile, onUpdateTile }: HandbookViewProps) {
  const document = useMemo(() => buildHandbookDocument(atlas), [atlas]);
  const selectedVolumeIndex = document.volumes.findIndex((volume) => volume.id === selectedVolumeId);
  const selectedVolume = selectedVolumeIndex >= 0 ? document.volumes[selectedVolumeIndex] : null;
  const selectedTileId = selection?.kind === "tile" ? selection.id : null;
  const outlineItems = useMemo(() => buildHandbookVolumeOutline(selectedVolume), [selectedVolume]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeAnchorId, setActiveAnchorId] = useState(selectedVolume?.anchorId ?? "");

  useEffect(() => {
    setActiveAnchorId(selectedVolume?.anchorId ?? "");
  }, [selectedVolume?.anchorId]);

  useEffect(() => {
    if (selectedTileId) return;
    window.requestAnimationFrame(() => {
      if (selectedVolume) {
        scrollToAnchor(selectedVolume.anchorId);
      } else {
        scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }, [selectedTileId, selectedVolume?.anchorId]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !outlineItems.length) return;

    let animationFrame = 0;
    const updateActiveAnchor = () => {
      animationFrame = 0;
      const anchors = outlineItems
        .map((item) => ({ item, element: globalThis.document.getElementById(item.id) }))
        .filter((entry): entry is { item: (typeof outlineItems)[number]; element: HTMLElement } => entry.element instanceof HTMLElement);
      if (!anchors.length) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if (atBottom) {
        setActiveAnchorId(anchors[anchors.length - 1].item.id);
        return;
      }

      const threshold = scrollerRect.top + Math.min(140, scroller.clientHeight * 0.28);
      const active = anchors.reduce((current, candidate) => {
        const top = candidate.element.getBoundingClientRect().top;
        if (top <= threshold) return candidate;
        return current;
      }, anchors[0]);
      setActiveAnchorId(active.item.id);
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveAnchor);
    };

    scheduleUpdate();
    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      scroller.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [outlineItems, selectedVolume]);

  useEffect(() => {
    if (!selectedTileId || !selectedVolume) return;
    const volume = findHandbookVolumeForTile(document, selectedTileId);
    if (volume?.id !== selectedVolume.id) return;
    const anchorId = tileAnchor(selectedTileId);
    setActiveAnchorId(anchorId);
    window.requestAnimationFrame(() => scrollToAnchor(anchorId));
  }, [document, selectedTileId, selectedVolume]);

  return (
    <section className={themeMode === "light" ? "handbook-shell handbook-shell--light" : "handbook-shell"}>
      <div ref={scrollerRef} className="handbook-document">
        <div className="handbook-document__masthead">
          <span>Handbook</span>
          <h1>{atlas.metadata.name || "CTRoadmap Atlas"}</h1>
          <p>{atlas.metadata.description || "Local infrastructure atlas"}</p>
        </div>
        {selectedVolume ? (
          <HandbookVolumeSection
            key={selectedVolume.id}
            atlas={atlas}
            index={selectedVolumeIndex}
            onNotesFocus={onNotesFocus}
            onSelectTile={onSelectTile}
            onUpdateTile={onUpdateTile}
            selection={selection}
            volume={selectedVolume}
          />
        ) : (
          <div className="handbook-placeholder">SELECT VOLUME YOU WISH TO VIEW FROM THE TABLE OF CONTENTS</div>
        )}
      </div>
      <aside className="handbook-outline">
        <div className="panel-title">Outline</div>
        <div className="handbook-outline__items">
          {outlineItems.length ? (
            outlineItems.map((item) => (
            <button
              key={item.id}
              className={
                activeAnchorId === item.id
                  ? `handbook-outline__item handbook-outline__item--${item.kind} handbook-outline__item--active`
                  : `handbook-outline__item handbook-outline__item--${item.kind}`
              }
              style={{ "--volume-color": item.color, "--outline-indent": `${item.depth * 12}px` } as CSSProperties}
              onClick={() => {
                setActiveAnchorId(item.id);
                if (item.tileId) onSelectTile(item.tileId);
                scrollToAnchor(item.id);
              }}
            >
              {item.title}
            </button>
            ))
          ) : (
            <div className="handbook-outline__empty">Select a volume</div>
          )}
        </div>
      </aside>
    </section>
  );
}

function HandbookVolumeSection({
  atlas,
  index,
  onNotesFocus,
  onSelectTile,
  onUpdateTile,
  selection,
  volume
}: {
  atlas: Atlas;
  index: number;
  onNotesFocus: () => void;
  onSelectTile: (tileId: string) => void;
  onUpdateTile: (tile: Tile) => void;
  selection: Selection;
  volume: HandbookVolume;
}) {
  return (
    <article className="handbook-volume" style={{ "--volume-color": volume.color } as CSSProperties}>
      <header id={volume.anchorId} data-handbook-anchor="true" className="handbook-volume__header">
        <span>Volume {index + 1}</span>
        <h2>{volume.title}</h2>
        {volume.family?.description ? <p>{volume.family.description}</p> : null}
        {volume.family?.tag ? <strong>{volume.family.tag}</strong> : null}
      </header>
      {volume.emptyMessage ? <div className="handbook-empty">{volume.emptyMessage}</div> : null}
      {volume.chapters.map((chapter) => (
        <HandbookChapterSection
          key={chapter.tile.id}
          atlas={atlas}
          chapter={chapter}
          onNotesFocus={onNotesFocus}
          onSelectTile={onSelectTile}
          onUpdateTile={onUpdateTile}
          selection={selection}
        />
      ))}
      {volume.epilogue.length ? (
        <section className="handbook-epilogue">
          <h3>Epilogue: Family Members Without Parents</h3>
          {volume.epilogue.map((section) => (
            <TileSection key={section.tile.id} atlas={atlas} depth={0} onNotesFocus={onNotesFocus} onSelectTile={onSelectTile} onUpdateTile={onUpdateTile} section={section} selection={selection} />
          ))}
        </section>
      ) : null}
    </article>
  );
}

function HandbookChapterSection({
  atlas,
  chapter,
  onNotesFocus,
  onSelectTile,
  onUpdateTile,
  selection
}: {
  atlas: Atlas;
  chapter: HandbookChapter;
  onNotesFocus: () => void;
  onSelectTile: (tileId: string) => void;
  onUpdateTile: (tile: Tile) => void;
  selection: Selection;
}) {
  return (
    <section className="handbook-chapter">
      <TileArticle
        anchorId={chapter.anchorId}
        atlas={atlas}
        className="handbook-chapter__header"
        onNotesFocus={onNotesFocus}
        onSelectTile={onSelectTile}
        onUpdateTile={onUpdateTile}
        relationships={chapter.relationships}
        selection={selection}
        tile={chapter.tile}
        warnings={chapter.warnings}
      />
      {chapter.sections.map((section) => (
        <TileSection key={section.tile.id} atlas={atlas} depth={1} onNotesFocus={onNotesFocus} onSelectTile={onSelectTile} onUpdateTile={onUpdateTile} section={section} selection={selection} />
      ))}
    </section>
  );
}

function TileSection({
  atlas,
  depth,
  onNotesFocus,
  onSelectTile,
  onUpdateTile,
  section,
  selection
}: {
  atlas: Atlas;
  depth: number;
  onNotesFocus: () => void;
  onSelectTile: (tileId: string) => void;
  onUpdateTile: (tile: Tile) => void;
  section: HandbookTileSection;
  selection: Selection;
}) {
  return (
    <section className="handbook-section" style={{ "--section-depth": depth } as CSSProperties}>
      <TileArticle
        anchorId={section.anchorId}
        atlas={atlas}
        className="handbook-section__article"
        onNotesFocus={onNotesFocus}
        onSelectTile={onSelectTile}
        onUpdateTile={onUpdateTile}
        relationships={section.relationships}
        selection={selection}
        tile={section.tile}
        warnings={section.warnings}
      />
      {section.children.map((child) => (
        <TileSection key={child.tile.id} atlas={atlas} depth={depth + 1} onNotesFocus={onNotesFocus} onSelectTile={onSelectTile} onUpdateTile={onUpdateTile} section={child} selection={selection} />
      ))}
    </section>
  );
}

function TileArticle({
  anchorId,
  atlas,
  className,
  onNotesFocus,
  onSelectTile,
  onUpdateTile,
  relationships,
  selection,
  tile,
  warnings
}: {
  anchorId: string;
  atlas: Atlas;
  className: string;
  onNotesFocus: () => void;
  onSelectTile: (tileId: string) => void;
  onUpdateTile: (tile: Tile) => void;
  relationships: HandbookTileSection["relationships"];
  selection: Selection;
  tile: Tile;
  warnings: string[];
}) {
  const config = TILE_TYPE_CONFIG[tile.type];
  const Icon = config.icon;
  const lifecycle = resolveLifecycle(tile);
  const iconRef = normalizeTileIconRef(tile);
  const parent = tile.parent ? atlas.tiles.find((candidate) => candidate.id === tile.parent) : null;
  const tags = tile.tags ?? [];
  const selected = selection?.kind === "tile" && selection.id === tile.id;

  return (
    <article id={anchorId} data-handbook-anchor="true" className={selected ? `${className} handbook-tile handbook-tile--selected` : `${className} handbook-tile`}>
      <button className="handbook-tile__heading" type="button" onClick={() => onSelectTile(tile.id)}>
        <span className="handbook-tile__icon">
          <TileIconGlyph fallback={Icon} iconRef={iconRef} size={22} />
        </span>
        <span>
          <strong>{tile.title}</strong>
          <small>
            {config.label}
            {parent ? ` inside ${parent.title}` : ""}
          </small>
        </span>
        {lifecycle === "planned" ? <em>PLANNED</em> : null}
      </button>

      {tags.length ? (
        <div className="handbook-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      <FieldList tile={tile} />

      {warnings.length ? (
        <div className="handbook-warnings">
          {warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      ) : null}

      <label className="handbook-notes">
        <span>Notes</span>
        <textarea
          value={tile.notes ?? ""}
          placeholder="Add notes for this tile..."
          onFocus={onNotesFocus}
          onChange={(event) => onUpdateTile({ ...tile, notes: event.target.value })}
        />
      </label>

      <div className="handbook-relationships">
        <span>{tile.title} Relationships</span>
        {relationships.length ? (
          <RelationshipGroups relationships={relationships} />
        ) : (
          <p className="handbook-relationship handbook-relationship--empty">No relationships recorded.</p>
        )}
      </div>
    </article>
  );
}

function RelationshipGroups({ relationships }: { relationships: HandbookTileSection["relationships"] }) {
  const groups = new Map<LinkType, { label: string; relationships: HandbookTileSection["relationships"] }>();
  for (const relationship of relationships) {
    const group = groups.get(relationship.type) ?? { label: relationship.label, relationships: [] };
    group.relationships.push(relationship);
    groups.set(relationship.type, group);
  }

  return (
    <div className="handbook-relationship-groups">
      {Array.from(groups.entries()).map(([type, group]) => (
        <div key={type} className="handbook-relationship-group">
          <strong>{group.label}</strong>
          <p>
            {group.relationships.map((relationship, index) => (
              <span key={relationship.id} className="handbook-relationship-target">
                {index > 0 ? ", " : ""}
                {relationship.endpointTitle}
                {relationship.lifecycle === "planned" ? <em>PLANNED</em> : null}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}

function FieldList({ tile }: { tile: Tile }) {
  const fields = Object.entries(tile.fields ?? {}).filter(([key, value]) => key !== "icon_ref" && !(tile.type === "node" && key === "primary_node") && value !== "" && value !== null && value !== undefined);
  if (!fields.length) return null;
  return (
    <div className="handbook-fields">
      {fields.map(([key, value]) => (
        <div key={key} className="handbook-field">
          <span>{key}</span>
          <FieldValue fieldKey={key} value={formatFieldValue(value)} />
        </div>
      ))}
    </div>
  );
}

function FieldValue({ fieldKey, value }: { fieldKey: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const normalizedKey = fieldKey.toLowerCase();

  if (normalizedKey === "url") {
    return (
      <a href={normalizeHref(value)} target="_blank" rel="noopener noreferrer">
        {value} <ExternalLink size={13} />
      </a>
    );
  }

  if (normalizedKey === "path") {
    return (
      <button
        type="button"
        onClick={async () => {
          try {
            if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
            else window.prompt("Copy path", value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            window.prompt("Copy path", value);
          }
        }}
      >
        <Copy size={13} /> {copied ? "Path copied" : value}
      </button>
    );
  }

  return <strong>{value}</strong>;
}

function formatFieldValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item))).join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function scrollToAnchor(anchorId: string) {
  document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function normalizeHref(value: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `http://${value}`;
}

