import { NodeResizer, type NodeProps } from "@xyflow/react";
import { type CSSProperties, useState } from "react";
import type { Family } from "../types/atlas";

export interface FamilyNodeData extends Record<string, unknown> {
  family: Family;
  memberCount: number;
  onResizeFamily: (familyId: string, size: { width: number; height: number }) => void;
  onFocusFamily: (family: Family) => void;
}

const DEFAULT_FAMILY_COLOR = "#38a3ff";

export function FamilyNode({ data, selected, width, height }: NodeProps) {
  const { family, memberCount, onResizeFamily, onFocusFamily } = data as FamilyNodeData;
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);
  const color = family.color || DEFAULT_FAMILY_COLOR;
  const renderedWidth = previewSize?.width ?? width ?? family.size.width;
  const renderedHeight = previewSize?.height ?? height ?? family.size.height;
  const style = {
    "--family-color": color,
    width: renderedWidth,
    height: renderedHeight
  } as CSSProperties;

  return (
    <div className={selected ? "family-node family-node--selected" : "family-node"} style={style}>
      <NodeResizer
        isVisible={selected}
        minWidth={240}
        minHeight={160}
        color={color}
        onResize={(_, params) => setPreviewSize({ width: Math.round(params.width), height: Math.round(params.height) })}
        onResizeEnd={(_, params) => {
          setPreviewSize(null);
          onResizeFamily(family.id, { width: Math.round(params.width), height: Math.round(params.height) });
        }}
      />
      <div
        className="family-node__header"
        role="button"
        tabIndex={0}
        title="Focus family"
        onClick={(event) => {
          event.stopPropagation();
          onFocusFamily(family);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          onFocusFamily(family);
        }}
      >
        <strong>{family.title}</strong>
      </div>
      {family.tag ? <div className="family-node__tag">{family.tag}</div> : null}
      {family.description ? <p>{family.description}</p> : null}
      <div className="family-node__meta">{memberCount} member{memberCount === 1 ? "" : "s"}</div>
    </div>
  );
}
