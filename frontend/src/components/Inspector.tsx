import { Plus, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "../lib/constants";
import type { Atlas, Link, LinkType, Selection, Tile, TileType } from "../types/atlas";

interface InspectorProps {
  atlas: Atlas;
  selection: Selection;
  onUpdateTile: (tile: Tile) => void;
  onDeleteTile: (tileId: string) => void;
  onAddSubtile: (parentId: string) => void;
  onUpdateLink: (link: Link) => void;
  onDeleteLink: (linkId: string) => void;
}

export function Inspector({
  atlas,
  selection,
  onUpdateTile,
  onDeleteTile,
  onAddSubtile,
  onUpdateLink,
  onDeleteLink
}: InspectorProps) {
  const selectedTile = selection?.kind === "tile" ? atlas.tiles.find((tile) => tile.id === selection.id) : null;
  const selectedLink = selection?.kind === "link" ? atlas.links.find((link) => link.id === selection.id) : null;

  if (selectedTile) {
    const config = TILE_TYPE_CONFIG[selectedTile.type];
    const Icon = config.icon;
    const tags = selectedTile.tags ?? [];
    const descendantIds = getDescendantIds(atlas.tiles, selectedTile.id);

    return (
      <aside className="inspector">
        <div className="panel-title">Inspector</div>
        <div className="inspector__hero" style={{ "--tile-accent": config.color } as CSSProperties}>
          <Icon size={28} />
          <div>
            <input
              className="title-input"
              value={selectedTile.title}
              onChange={(event) => onUpdateTile({ ...selectedTile, title: event.target.value })}
            />
            <span>{config.label}</span>
          </div>
        </div>
        <label>
          Type
          <select
            value={selectedTile.type}
            onChange={(event) => onUpdateTile({ ...selectedTile, type: event.target.value as TileType })}
          >
            {TILE_TYPES.map((type) => (
              <option key={type} value={type}>
                {TILE_TYPE_CONFIG[type].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Parent
          <select
            value={selectedTile.parent ?? ""}
            onChange={(event) => onUpdateTile({ ...selectedTile, parent: event.target.value || null })}
          >
            <option value="">No parent</option>
            {atlas.tiles
              .filter((tile) => tile.id !== selectedTile.id && !descendantIds.has(tile.id))
              .map((tile) => (
                <option key={tile.id} value={tile.id}>
                  {tile.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          Tags
          <input
            value={tags.join(", ")}
            onChange={(event) =>
              onUpdateTile({
                ...selectedTile,
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              })
            }
          />
        </label>
        <div className="field-editor">
          <div className="field-editor__title">Fields</div>
          {Object.entries(selectedTile.fields ?? {}).map(([key, value]) => (
            <label key={key}>
              {key}
              <input
                value={String(value)}
                onChange={(event) =>
                  onUpdateTile({
                    ...selectedTile,
                    fields: { ...selectedTile.fields, [key]: coerceFieldValue(value, event.target.value) }
                  })
                }
              />
            </label>
          ))}
          <button
            className="ghost-button"
            onClick={() => {
              const key = window.prompt("Field name");
              if (!key) return;
              onUpdateTile({ ...selectedTile, fields: { ...selectedTile.fields, [key]: "" } });
            }}
          >
            <Plus size={16} /> Add Field
          </button>
        </div>
        <label>
          Notes
          <textarea
            value={selectedTile.notes ?? ""}
            onChange={(event) => onUpdateTile({ ...selectedTile, notes: event.target.value })}
          />
        </label>
        <button className="ghost-button" onClick={() => onAddSubtile(selectedTile.id)}>
          <Plus size={16} /> Add Subtile
        </button>
        <button className="danger-button" onClick={() => onDeleteTile(selectedTile.id)}>
          <Trash2 size={16} /> Delete Tile
        </button>
      </aside>
    );
  }

  if (selectedLink) {
    const fromTile = atlas.tiles.find((tile) => tile.id === selectedLink.from);
    const toTile = atlas.tiles.find((tile) => tile.id === selectedLink.to);

    return (
      <aside className="inspector">
        <div className="panel-title">Inspector</div>
        <div className="inspector__hero inspector__hero--link">
          <div>
            <div className="title-input title-input--readonly">{selectedLink.label || selectedLink.type}</div>
            <span>
              {fromTile?.title ?? selectedLink.from} to {toTile?.title ?? selectedLink.to}
            </span>
          </div>
        </div>
        <label>
          From
          <select
            value={selectedLink.from}
            onChange={(event) => onUpdateLink({ ...selectedLink, from: event.target.value })}
          >
            {atlas.tiles.map((tile) => (
              <option key={tile.id} value={tile.id}>
                {tile.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <select
            value={selectedLink.to}
            onChange={(event) => onUpdateLink({ ...selectedLink, to: event.target.value })}
          >
            {atlas.tiles.map((tile) => (
              <option key={tile.id} value={tile.id}>
                {tile.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select
            value={selectedLink.type}
            onChange={(event) => onUpdateLink({ ...selectedLink, type: event.target.value as LinkType })}
          >
            {LINK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Label
          <input
            value={selectedLink.label ?? ""}
            onChange={(event) => onUpdateLink({ ...selectedLink, label: event.target.value })}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={selectedLink.directional ?? true}
            onChange={(event) => onUpdateLink({ ...selectedLink, directional: event.target.checked })}
          />
          Directional
        </label>
        <label>
          Notes
          <textarea
            value={selectedLink.notes ?? ""}
            onChange={(event) => onUpdateLink({ ...selectedLink, notes: event.target.value })}
          />
        </label>
        <button className="danger-button" onClick={() => onDeleteLink(selectedLink.id)}>
          <Trash2 size={16} /> Delete Link
        </button>
      </aside>
    );
  }

  return (
    <aside className="inspector">
      <div className="panel-title">Inspector</div>
      <div className="empty-state">
        <strong>Select a tile or relationship</strong>
        <span>Edit details, fields, tags, notes, and relationships here.</span>
      </div>
    </aside>
  );
}

function coerceFieldValue(original: unknown, next: string): unknown {
  if (typeof original === "boolean") {
    return next === "true" || next === "1" || next.toLowerCase() === "yes";
  }
  return next;
}

function getDescendantIds(tiles: Tile[], tileId: string): Set<string> {
  const descendants = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const tile of tiles) {
      if (tile.parent && (tile.parent === tileId || descendants.has(tile.parent)) && !descendants.has(tile.id)) {
        descendants.add(tile.id);
        changed = true;
      }
    }
  }
  return descendants;
}
