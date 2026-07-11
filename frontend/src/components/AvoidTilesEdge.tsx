import { BaseEdge, EdgeText, getBezierPath, type EdgeProps } from "@xyflow/react";
import {
  getOrthogonalLabelPosition,
  orthogonalPath,
  routeOrthogonalEdge,
  type AvoidTilesEdgeData
} from "../lib/edgeRouting";

export function AvoidTilesEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  label,
  labelStyle,
  labelBgStyle,
  animated,
  data
}: EdgeProps) {
  const [fallbackPath, fallbackLabelX, fallbackLabelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  const edgeData = data as AvoidTilesEdgeData | undefined;
  const points = routeOrthogonalEdge({
    source: { x: sourceX, y: sourceY },
    target: { x: targetX, y: targetY },
    sourcePosition,
    targetPosition,
    sourceNodeId: source,
    targetNodeId: target,
    obstacles: edgeData?.obstacles ?? []
  });
  const path = points ? orthogonalPath(points) : fallbackPath;
  const labelPosition = points ? getOrthogonalLabelPosition(points) : { x: fallbackLabelX, y: fallbackLabelY };
  const edgeStyle = {
    ...style,
    ...(animated ? { strokeDasharray: "5 5", animation: "connector-edge-dash 0.7s linear infinite" } : {})
  };

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={edgeStyle} />
      {label ? (
        <EdgeText
          x={labelPosition.x}
          y={labelPosition.y}
          label={label}
          labelStyle={labelStyle}
          labelBgStyle={labelBgStyle}
          labelShowBg
          labelBgPadding={[5, 3]}
          labelBgBorderRadius={4}
        />
      ) : null}
    </>
  );
}
