import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CSSProperties } from "react";
import { TILE_TYPE_CONFIG } from "../lib/constants";
import type { Tile } from "../types/atlas";

export interface TileNodeData extends Record<string, unknown> {
  tile: Tile;
  parentTitle?: string;
}

export function TileNode({ data, selected }: NodeProps) {
  const { tile, parentTitle } = data as TileNodeData;
  const config = TILE_TYPE_CONFIG[tile.type];
  const Icon = config.icon;
  const fieldEntries = Object.entries(tile.fields ?? {}).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  const tags = tile.tags ?? [];

  return (
    <div
      className={`tile-node tile-node--${tile.type} ${selected ? "tile-node--selected" : ""}`}
      style={{ "--tile-accent": config.color } as CSSProperties}
    >
      <Handle type="target" position={Position.Top} />
      <div className="tile-node__header">
        <div className="tile-node__icon">
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <div className="tile-node__title-wrap">
          <div className="tile-node__title">{tile.title}</div>
          <div className="tile-node__type">{config.label}</div>
        </div>
      </div>
      {parentTitle ? <div className="tile-node__parent">inside {parentTitle}</div> : null}
      {fieldEntries.length > 0 ? (
        <div className="tile-node__fields">
          {fieldEntries.slice(0, 3).map(([key, value]) => (
            <div key={key} className="tile-node__field">
              <span>{key}</span>
              <strong>{String(value)}</strong>
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
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
