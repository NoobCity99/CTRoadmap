import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import { TILE_TYPE_CONFIG } from "../lib/constants";
import type { Tile } from "../types/atlas";

export interface TileNodeData extends Record<string, unknown> {
  accentColor?: string;
  childCount?: number;
  hasChildren?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (tileId: string) => void;
  tile: Tile;
  parentTitle?: string;
}

export function TileNode({ data, selected }: NodeProps) {
  const { accentColor, childCount = 0, hasChildren, isCollapsed, onToggleCollapse, tile, parentTitle } = data as TileNodeData;
  const config = TILE_TYPE_CONFIG[tile.type];
  const Icon = config.icon;
  const fieldEntries = getTileFieldPreviews(tile);
  const tags = tile.tags ?? [];

  return (
    <div
      className={`tile-node tile-node--${tile.type} ${parentTitle ? "tile-node--child" : ""} ${hasChildren ? "tile-node--parent" : ""} ${
        selected ? "tile-node--selected" : ""
      }`}
      style={{ "--tile-accent": accentColor ?? config.color } as CSSProperties}
    >
      <Handle id="parent" type="target" position={Position.Top} className="tile-node__handle tile-node__handle--parent" />
      <Handle id="in" type="target" position={Position.Left} className="tile-node__handle tile-node__handle--in" />
      <div className="tile-node__port-label tile-node__port-label--in">IN</div>
      <div className="tile-node__header">
        <div className="tile-node__icon">
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <div className="tile-node__title-wrap">
          <div className="tile-node__title">{tile.title}</div>
          <div className="tile-node__type">{config.label}</div>
        </div>
        {hasChildren ? (
          <button
            className="tile-node__collapse"
            onClick={(event) => {
              event.stopPropagation();
              onToggleCollapse?.(tile.id);
            }}
            title={isCollapsed ? "Expand children" : "Collapse children"}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            {childCount}
          </button>
        ) : null}
      </div>
      {parentTitle ? <div className="tile-node__parent">inside {parentTitle}</div> : null}
      {fieldEntries.length > 0 ? (
        <div className="tile-node__fields">
          {fieldEntries.slice(0, 3).map(([key, value]) => (
            <div key={key} className="tile-node__field">
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {tags.length > 0 ? (
        <div className="tile-node__tags">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <Handle id="out" type="source" position={Position.Right} className="tile-node__handle tile-node__handle--out" />
      <div className="tile-node__port-label tile-node__port-label--out">OUT</div>
      <Handle id="child" type="source" position={Position.Bottom} className="tile-node__handle tile-node__handle--child" />
    </div>
  );
}

function getTileFieldPreviews(tile: Tile): Array<[string, string]> {
  return Object.entries(tile.fields ?? {})
    .map(([key, value]): [string, string] | null => {
      const preview = formatFieldPreview(tile, key, value);
      return preview ? [key, preview] : null;
    })
    .filter((entry): entry is [string, string] => Boolean(entry));
}

function formatFieldPreview(tile: Tile, key: string, value: unknown): string {
  if (value === "" || value === null || value === undefined) return "";
  if (tile.type === "flow" && key === "steps") {
    const stepCount = Array.isArray(value) ? value.length : 0;
    return stepCount ? String(stepCount) : "";
  }
  if (Array.isArray(value)) {
    const values = value.filter((item) => ["string", "number", "boolean"].includes(typeof item)).map(String);
    return values.length ? values.join(", ") : `${value.length} items`;
  }
  if (typeof value === "object") return "configured";
  return String(value);
}
