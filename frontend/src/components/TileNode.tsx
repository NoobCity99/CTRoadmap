import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { TILE_TYPE_CONFIG } from "../lib/constants";
import { normalizeTileIconRef, TileIconGlyph } from "../lib/icons";
import type { Tile } from "../types/atlas";

export interface TileNodeData extends Record<string, unknown> {
  accentColor?: string;
  hasChildren?: boolean;
  iconAccentColor?: string;
  isMuted?: boolean;
  lifecycle?: "live" | "planned";
  stack?: {
    badgeShape?: "circle" | "hex";
    count: number;
    kind?: "sibling_type" | "mount_children";
    name: string;
    subtitle: string;
  };
  tile: Tile;
  parentTitle?: string;
}

export function TileNode({ data, selected }: NodeProps) {
  const { accentColor, hasChildren, iconAccentColor, isMuted, lifecycle = "live", stack, tile, parentTitle } = data as TileNodeData;
  const config = TILE_TYPE_CONFIG[tile.type];
  const Icon = config.icon;
  const fieldEntries = getTileFieldPreviews(tile);
  const tags = tile.tags ?? [];
  const isPrimaryNode = tile.type === "node" && tile.fields?.primary_node === true;
  const iconRef = normalizeTileIconRef(tile);
  const [iconFailed, setIconFailed] = useState(false);
  const [copyNotice, setCopyNotice] = useState("");

  useEffect(() => {
    setIconFailed(false);
  }, [iconRef?.id]);

  async function handleCopyPath(path: string) {
    try {
      if (!navigator.clipboard?.writeText) {
        window.prompt("Copy path", path);
        return;
      }
      await navigator.clipboard.writeText(path);
      setCopyNotice("Path Copied");
      window.setTimeout(() => setCopyNotice(""), 3000);
    } catch {
      window.prompt("Copy path", path);
    }
  }

  return (
    <div
      className={`tile-node tile-node--${tile.type} ${parentTitle ? "tile-node--child" : ""} ${hasChildren ? "tile-node--parent" : ""} ${
        isMuted ? "tile-node--muted" : ""
      } ${
        selected ? "tile-node--selected" : ""
      } ${
        isPrimaryNode ? "tile-node--primary-node" : ""
      } ${
        stack ? "tile-node--stacked" : ""
      }`}
      style={{ "--tile-accent": accentColor ?? config.color, "--tile-icon-accent": iconAccentColor ?? accentColor ?? config.color } as CSSProperties}
    >
      <Handle id="parent" type="target" position={Position.Top} className="tile-node__handle tile-node__handle--parent" />
      <Handle id="in" type="target" position={Position.Left} className="tile-node__handle tile-node__handle--in" />
      <div className="tile-node__port-label tile-node__port-label--in">IN</div>
      {copyNotice ? <div className="tile-node__copy-toast">{copyNotice}</div> : null}
      {stack ? <div className={stack.badgeShape === "hex" ? "tile-node__stack-count tile-node__stack-count--hex" : "tile-node__stack-count"}>{stack.count}</div> : null}
      <div className="tile-node__header">
        <div className="tile-node__icon">
          <TileIconGlyph fallback={Icon} forceFallback={iconFailed} iconRef={iconRef} onUploadedError={() => setIconFailed(true)} size={20} strokeWidth={2.2} />
        </div>
        <div className="tile-node__title-wrap">
          <div className="tile-node__title">{tile.title}</div>
          <div className="tile-node__type">{config.label}</div>
        </div>
        {lifecycle === "planned" ? <div className="tile-node__lifecycle tile-node__lifecycle--planned">planned</div> : null}
      </div>
      {stack ? (
        <div className="tile-node__stack-meta">
          <strong>{stack.name}</strong>
          <span>{stack.subtitle}</span>
        </div>
      ) : null}
      {parentTitle ? <div className="tile-node__parent">inside {parentTitle}</div> : null}
      {fieldEntries.length > 0 ? (
        <div className="tile-node__fields">
          {fieldEntries.slice(0, 3).map(([key, value]) => (
            <div key={key} className="tile-node__field">
              <span>{key}</span>
              <TileFieldValue fieldKey={key} value={value} onCopyPath={handleCopyPath} />
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
  if (tile.type === "node" && key === "primary_node") return "";
  if (key === "icon_ref") return "";
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

function TileFieldValue({ fieldKey, onCopyPath, value }: { fieldKey: string; onCopyPath: (path: string) => void; value: string }) {
  const normalizedKey = fieldKey.toLowerCase();
  if (normalizedKey === "url" || normalizedKey === "ip") {
    return (
      <a
        className="tile-node__field-action nodrag nopan"
        href={normalizeHref(value)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {value}
      </a>
    );
  }
  if (normalizedKey === "path") {
    return (
      <button
        className="tile-node__field-action tile-node__field-action--button nodrag nopan"
        type="button"
        title="click to copy"
        onClick={(event) => {
          event.stopPropagation();
          void onCopyPath(value);
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {value}
      </button>
    );
  }
  return <strong>{value}</strong>;
}

function normalizeHref(value: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `http://${value}`;
}
