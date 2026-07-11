import { Position, type Node } from "@xyflow/react";
import type { Family, Tile } from "../types/atlas";

export type ConnectorRoutingMode = "curved" | "avoid_tiles";

export interface RoutingPoint {
  x: number;
  y: number;
}

export interface RoutingRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: "tile" | "family-header";
}

export interface AvoidTilesEdgeData extends Record<string, unknown> {
  obstacles: RoutingRect[];
}

interface RouteOrthogonalEdgeOptions {
  source: RoutingPoint;
  target: RoutingPoint;
  sourcePosition: Position;
  targetPosition: Position;
  sourceNodeId: string;
  targetNodeId: string;
  obstacles: RoutingRect[];
}

const TILE_OBSTACLE_BUFFER = 5;
const ROUTE_OFFSET = 28;
const OBSTACLE_CHANNEL = 16;
const TURN_PENALTY = 18;
const MAX_GRID_POINTS = 2600;
const EPSILON = 0.1;

export function buildConnectorObstacles(nodes: Node[]): RoutingRect[] {
  return nodes
    .map((node): RoutingRect | null => {
      if (node.type === "tileNode") {
        const tile = node.data?.tile as Tile | undefined;
        const width = node.width ?? tile?.size?.width ?? (tile?.fields?.primary_node === true ? 272 : 248);
        const height = node.height ?? tile?.size?.height ?? (tile?.fields?.primary_node === true ? 136 : 124);
        return expandRect(
          {
            id: node.id,
            kind: "tile",
            x: node.position.x,
            y: node.position.y,
            width,
            height
          },
          TILE_OBSTACLE_BUFFER
        );
      }
      if (node.type === "familyNode") {
        const family = node.data?.family as Family | undefined;
        const width = node.width ?? family?.size.width ?? 240;
        const titleLength = family?.title.length ?? 8;
        const headerWidth = Math.min(Math.max(160, titleLength * 15 + 72), Math.max(160, width - 10));
        return expandRect(
          {
            id: node.id,
            kind: "family-header",
            x: node.position.x - 1,
            y: node.position.y - 1,
            width: headerWidth,
            height: 42
          },
          TILE_OBSTACLE_BUFFER
        );
      }
      return null;
    })
    .filter((rect): rect is RoutingRect => Boolean(rect));
}

export function routeOrthogonalEdge({
  source,
  target,
  sourcePosition,
  targetPosition,
  sourceNodeId,
  targetNodeId,
  obstacles
}: RouteOrthogonalEdgeOptions): RoutingPoint[] | null {
  const blockingObstacles = obstacles.filter((obstacle) => obstacle.id !== sourceNodeId && obstacle.id !== targetNodeId);
  const sourceExit = offsetFromHandle(source, sourcePosition, ROUTE_OFFSET);
  const targetEntry = offsetFromHandle(target, targetPosition, ROUTE_OFFSET);
  const xValues = uniqueSortedNumbers([source.x, sourceExit.x, targetEntry.x, target.x]);
  const yValues = uniqueSortedNumbers([source.y, sourceExit.y, targetEntry.y, target.y]);

  for (const obstacle of blockingObstacles) {
    xValues.push(...uniqueSortedNumbers([obstacle.x - OBSTACLE_CHANNEL, obstacle.x + obstacle.width + OBSTACLE_CHANNEL]));
    yValues.push(...uniqueSortedNumbers([obstacle.y - OBSTACLE_CHANNEL, obstacle.y + obstacle.height + OBSTACLE_CHANNEL]));
  }

  const xs = uniqueSortedNumbers(xValues);
  const ys = uniqueSortedNumbers(yValues);
  if (xs.length * ys.length > MAX_GRID_POINTS) return null;

  const points = new Map<string, RoutingPoint>();
  for (const x of xs) {
    for (const y of ys) {
      const point = { x, y };
      if (!pointInsideAnyRect(point, blockingObstacles)) {
        points.set(pointKey(point), point);
      }
    }
  }

  for (const point of [source, sourceExit, targetEntry, target]) {
    points.set(pointKey(point), point);
  }

  const path = findShortestOrthogonalPath(source, target, points, xs, ys, blockingObstacles);
  if (!path) return simplifyOrthogonalPath(buildFallbackOrthogonalPath(source, sourceExit, targetEntry, target, sourcePosition, targetPosition));
  return simplifyOrthogonalPath(path);
}

export function orthogonalPath(points: RoutingPoint[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${roundCoord(point.x)} ${roundCoord(point.y)}`).join(" ");
}

export function getOrthogonalLabelPosition(points: RoutingPoint[]): RoutingPoint {
  if (points.length < 2) return points[0] ?? { x: 0, y: 0 };
  const segments = [];
  let totalLength = 0;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const length = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
    segments.push({ from, to, length });
    totalLength += length;
  }
  let distance = totalLength / 2;
  for (const segment of segments) {
    if (distance > segment.length) {
      distance -= segment.length;
      continue;
    }
    const directionX = Math.sign(segment.to.x - segment.from.x);
    const directionY = Math.sign(segment.to.y - segment.from.y);
    return {
      x: segment.from.x + directionX * distance,
      y: segment.from.y + directionY * distance
    };
  }
  return points[Math.floor(points.length / 2)];
}

function findShortestOrthogonalPath(source: RoutingPoint, target: RoutingPoint, points: Map<string, RoutingPoint>, xs: number[], ys: number[], obstacles: RoutingRect[]): RoutingPoint[] | null {
  const startKey = pointKey(source);
  const targetKey = pointKey(target);
  const queue: Array<{ key: string; cost: number; direction: "h" | "v" | null }> = [{ key: startKey, cost: 0, direction: null }];
  const costs = new Map<string, number>([[stateKey(startKey, null), 0]]);
  const previous = new Map<string, { state: string }>();
  let bestTargetState: string | null = null;
  let bestTargetCost = Number.POSITIVE_INFINITY;

  while (queue.length) {
    queue.sort((left, right) => left.cost - right.cost);
    const current = queue.shift();
    if (!current) break;
    const currentState = stateKey(current.key, current.direction);
    if ((costs.get(currentState) ?? Number.POSITIVE_INFINITY) < current.cost) continue;
    if (current.key === targetKey && current.cost < bestTargetCost) {
      bestTargetCost = current.cost;
      bestTargetState = currentState;
      continue;
    }
    const point = points.get(current.key);
    if (!point) continue;
    for (const neighbor of orthogonalNeighbors(point, points, xs, ys)) {
      if (segmentIntersectsAnyRect(point, neighbor.point, obstacles)) continue;
      const turnCost = current.direction && current.direction !== neighbor.direction ? TURN_PENALTY : 0;
      const nextCost = current.cost + manhattanDistance(point, neighbor.point) + turnCost;
      const nextState = stateKey(neighbor.key, neighbor.direction);
      if (nextCost >= (costs.get(nextState) ?? Number.POSITIVE_INFINITY)) continue;
      costs.set(nextState, nextCost);
      previous.set(nextState, { state: currentState });
      queue.push({ key: neighbor.key, cost: nextCost, direction: neighbor.direction });
    }
  }

  if (!bestTargetState) return null;
  const path: RoutingPoint[] = [];
  let currentState: string | undefined = bestTargetState;
  while (currentState) {
    const key = currentState.split("|")[0];
    const point = points.get(key);
    if (point) path.unshift(point);
    currentState = previous.get(currentState)?.state;
  }
  return path.length >= 2 ? path : null;
}

function orthogonalNeighbors(point: RoutingPoint, points: Map<string, RoutingPoint>, xs: number[], ys: number[]) {
  const neighbors: Array<{ key: string; point: RoutingPoint; direction: "h" | "v" }> = [];
  const xIndex = xs.findIndex((x) => nearlyEqual(x, point.x));
  const yIndex = ys.findIndex((y) => nearlyEqual(y, point.y));
  for (const nextXIndex of [xIndex - 1, xIndex + 1]) {
    if (nextXIndex < 0 || nextXIndex >= xs.length) continue;
    const neighbor = { x: xs[nextXIndex], y: point.y };
    const key = pointKey(neighbor);
    const existing = points.get(key);
    if (existing) neighbors.push({ key, point: existing, direction: "h" });
  }
  for (const nextYIndex of [yIndex - 1, yIndex + 1]) {
    if (nextYIndex < 0 || nextYIndex >= ys.length) continue;
    const neighbor = { x: point.x, y: ys[nextYIndex] };
    const key = pointKey(neighbor);
    const existing = points.get(key);
    if (existing) neighbors.push({ key, point: existing, direction: "v" });
  }
  return neighbors;
}

function simplifyOrthogonalPath(points: RoutingPoint[]): RoutingPoint[] {
  const simplified: RoutingPoint[] = [];
  for (const point of points) {
    const previous = simplified[simplified.length - 1];
    const beforePrevious = simplified[simplified.length - 2];
    if (previous && nearlyEqual(previous.x, point.x) && nearlyEqual(previous.y, point.y)) continue;
    if (
      beforePrevious &&
      previous &&
      ((nearlyEqual(beforePrevious.x, previous.x) && nearlyEqual(previous.x, point.x)) ||
        (nearlyEqual(beforePrevious.y, previous.y) && nearlyEqual(previous.y, point.y)))
    ) {
      simplified[simplified.length - 1] = point;
      continue;
    }
    simplified.push(point);
  }
  return simplified;
}

function offsetFromHandle(point: RoutingPoint, position: Position, offset: number): RoutingPoint {
  if (position === Position.Left) return { x: point.x - offset, y: point.y };
  if (position === Position.Right) return { x: point.x + offset, y: point.y };
  if (position === Position.Top) return { x: point.x, y: point.y - offset };
  return { x: point.x, y: point.y + offset };
}

function buildFallbackOrthogonalPath(source: RoutingPoint, sourceExit: RoutingPoint, targetEntry: RoutingPoint, target: RoutingPoint, sourcePosition: Position, targetPosition: Position): RoutingPoint[] {
  const sourceIsHorizontal = sourcePosition === Position.Left || sourcePosition === Position.Right;
  const targetIsHorizontal = targetPosition === Position.Left || targetPosition === Position.Right;
  if (sourceIsHorizontal && targetIsHorizontal) {
    const midX = (sourceExit.x + targetEntry.x) / 2;
    return [source, sourceExit, { x: midX, y: sourceExit.y }, { x: midX, y: targetEntry.y }, targetEntry, target];
  }
  if (!sourceIsHorizontal && !targetIsHorizontal) {
    const midY = (sourceExit.y + targetEntry.y) / 2;
    return [source, sourceExit, { x: sourceExit.x, y: midY }, { x: targetEntry.x, y: midY }, targetEntry, target];
  }
  return [source, sourceExit, { x: targetEntry.x, y: sourceExit.y }, targetEntry, target];
}

function segmentIntersectsAnyRect(from: RoutingPoint, to: RoutingPoint, obstacles: RoutingRect[]): boolean {
  return obstacles.some((obstacle) => segmentIntersectsRect(from, to, obstacle));
}

function segmentIntersectsRect(from: RoutingPoint, to: RoutingPoint, rect: RoutingRect): boolean {
  const rectRight = rect.x + rect.width;
  const rectBottom = rect.y + rect.height;
  if (nearlyEqual(from.y, to.y)) {
    const y = from.y;
    if (y <= rect.y + EPSILON || y >= rectBottom - EPSILON) return false;
    return rangesOverlap(Math.min(from.x, to.x), Math.max(from.x, to.x), rect.x + EPSILON, rectRight - EPSILON);
  }
  if (nearlyEqual(from.x, to.x)) {
    const x = from.x;
    if (x <= rect.x + EPSILON || x >= rectRight - EPSILON) return false;
    return rangesOverlap(Math.min(from.y, to.y), Math.max(from.y, to.y), rect.y + EPSILON, rectBottom - EPSILON);
  }
  return false;
}

function pointInsideAnyRect(point: RoutingPoint, obstacles: RoutingRect[]): boolean {
  return obstacles.some((obstacle) => {
    const right = obstacle.x + obstacle.width;
    const bottom = obstacle.y + obstacle.height;
    return point.x > obstacle.x + EPSILON && point.x < right - EPSILON && point.y > obstacle.y + EPSILON && point.y < bottom - EPSILON;
  });
}

function expandRect(rect: RoutingRect, amount: number): RoutingRect {
  return {
    ...rect,
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2
  };
}

function uniqueSortedNumbers(values: number[]): number[] {
  return [...new Set(values.map(roundCoord))].sort((left, right) => left - right);
}

function pointKey(point: RoutingPoint): string {
  return `${roundCoord(point.x)},${roundCoord(point.y)}`;
}

function stateKey(key: string, direction: "h" | "v" | null): string {
  return `${key}|${direction ?? "start"}`;
}

function roundCoord(value: number): number {
  return Math.round(value * 10) / 10;
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < EPSILON;
}

function rangesOverlap(leftStart: number, leftEnd: number, rightStart: number, rightEnd: number): boolean {
  return Math.max(leftStart, rightStart) < Math.min(leftEnd, rightEnd) - EPSILON;
}

function manhattanDistance(left: RoutingPoint, right: RoutingPoint): number {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}
