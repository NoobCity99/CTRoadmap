import { TILE_TYPES } from "./constants";
import type { Atlas, AtlasWarning, Tile } from "../types/atlas";


export function validateAtlasWarnings(atlas: Atlas): AtlasWarning[] {
  const warnings: AtlasWarning[] = [];
  const tileIds = new Set(atlas.tiles.map((tile) => tile.id));
  const linkIds = new Set<string>();
  const connectedTileIds = new Set<string>();

  if (!atlas.tiles.length) {
    warnings.push({
      id: "atlas_empty",
      severity: "warning",
      message: "Atlas has no tiles yet.",
      targetKind: "atlas"
    });
  }

  for (const tile of atlas.tiles) {
    warnings.push(...validateTile(tile));
    if (tile.parent && !tileIds.has(tile.parent)) {
      warnings.push({
        id: `tile_${tile.id}_missing_parent`,
        severity: "error",
        message: `${tile.title || tile.id} references missing parent ${tile.parent}.`,
        targetKind: "tile",
        targetId: tile.id
      });
    }
  }

  for (const link of atlas.links) {
    connectedTileIds.add(link.from);
    connectedTileIds.add(link.to);
    if (linkIds.has(link.id)) {
      warnings.push({
        id: `link_${link.id}_duplicate`,
        severity: "error",
        message: `Duplicate relationship ID ${link.id}.`,
        targetKind: "link",
        targetId: link.id
      });
    }
    linkIds.add(link.id);
    if (!tileIds.has(link.from)) {
      warnings.push({
        id: `link_${link.id}_missing_source`,
        severity: "error",
        message: `${link.id} references missing source tile ${link.from}.`,
        targetKind: "link",
        targetId: link.id
      });
    }
    if (!tileIds.has(link.to)) {
      warnings.push({
        id: `link_${link.id}_missing_target`,
        severity: "error",
        message: `${link.id} references missing target tile ${link.to}.`,
        targetKind: "link",
        targetId: link.id
      });
    }
  }

  for (const tile of atlas.tiles) {
    if (tile.type === "flow") {
      warnings.push(...validateFlowTile(tile, tileIds));
    }
    if (tile.type === "check") {
      warnings.push(...validateCheckTile(tile, connectedTileIds));
    }
  }

  return warnings;
}


function validateTile(tile: Tile): AtlasWarning[] {
  const warnings: AtlasWarning[] = [];
  if (!tile.id.trim()) {
    warnings.push({
      id: "tile_missing_id",
      severity: "error",
      message: "A tile is missing its required ID.",
      targetKind: "tile"
    });
  }
  if (!tile.title.trim()) {
    warnings.push({
      id: `tile_${tile.id}_missing_title`,
      severity: "error",
      message: `${tile.id} is missing a title.`,
      targetKind: "tile",
      targetId: tile.id
    });
  }
  if (!TILE_TYPES.includes(tile.type)) {
    warnings.push({
      id: `tile_${tile.id}_invalid_type`,
      severity: "error",
      message: `${tile.title || tile.id} has an invalid tile type.`,
      targetKind: "tile",
      targetId: tile.id
    });
  }
  if (!tile.position || !Number.isFinite(tile.position.x) || !Number.isFinite(tile.position.y)) {
    warnings.push({
      id: `tile_${tile.id}_missing_position`,
      severity: "error",
      message: `${tile.title || tile.id} is missing a valid canvas position.`,
      targetKind: "tile",
      targetId: tile.id
    });
  }
  if (!tile.fields || typeof tile.fields !== "object") {
    warnings.push({
      id: `tile_${tile.id}_missing_fields`,
      severity: "error",
      message: `${tile.title || tile.id} is missing its fields object.`,
      targetKind: "tile",
      targetId: tile.id
    });
  }
  return warnings;
}

function validateFlowTile(tile: Tile, tileIds: Set<string>): AtlasWarning[] {
  const warnings: AtlasWarning[] = [];
  const steps = Array.isArray(tile.fields.steps) ? tile.fields.steps : [];
  if (!steps.length) {
    warnings.push({
      id: `flow_${tile.id}_no_steps`,
      severity: "warning",
      message: `${tile.title || tile.id} has no flow steps.`,
      targetKind: "tile",
      targetId: tile.id
    });
    return warnings;
  }
  for (const rawStep of steps) {
    if (!rawStep || typeof rawStep !== "object") {
      warnings.push({
        id: `flow_${tile.id}_invalid_step`,
        severity: "error",
        message: `${tile.title || tile.id} has an invalid flow step.`,
        targetKind: "tile",
        targetId: tile.id
      });
      continue;
    }
    const step = rawStep as Record<string, unknown>;
    const order = Number(step.order);
    const source = String(step.from ?? "");
    const target = String(step.to ?? "");
    const action = String(step.action ?? "");
    if (!source || !tileIds.has(source)) {
      warnings.push({
        id: `flow_${tile.id}_step_${order}_missing_source`,
        severity: "error",
        message: `${tile.title || tile.id} step ${order || "?"} references a missing source tile.`,
        targetKind: "tile",
        targetId: tile.id
      });
    }
    if (!target || !tileIds.has(target)) {
      warnings.push({
        id: `flow_${tile.id}_step_${order}_missing_target`,
        severity: "error",
        message: `${tile.title || tile.id} step ${order || "?"} references a missing target tile.`,
        targetKind: "tile",
        targetId: tile.id
      });
    }
    if (!action.trim()) {
      warnings.push({
        id: `flow_${tile.id}_step_${order}_missing_action`,
        severity: "error",
        message: `${tile.title || tile.id} step ${order || "?"} is missing an action.`,
        targetKind: "tile",
        targetId: tile.id
      });
    }
  }
  return warnings;
}

function validateCheckTile(tile: Tile, connectedTileIds: Set<string>): AtlasWarning[] {
  const warnings: AtlasWarning[] = [];
  if (!String(tile.fields.command ?? "").trim()) {
    warnings.push({
      id: `check_${tile.id}_missing_command`,
      severity: "warning",
      message: `${tile.title || tile.id} is missing a documented check command.`,
      targetKind: "tile",
      targetId: tile.id
    });
  }
  if (!String(tile.fields.expected_result ?? "").trim()) {
    warnings.push({
      id: `check_${tile.id}_missing_expected_result`,
      severity: "warning",
      message: `${tile.title || tile.id} is missing an expected result.`,
      targetKind: "tile",
      targetId: tile.id
    });
  }
  if (isTruthyExecutionFlag(tile.fields.execution_enabled)) {
    warnings.push({
      id: `check_${tile.id}_execution_enabled`,
      severity: "error",
      message: `${tile.title || tile.id} cannot enable command execution.`,
      targetKind: "tile",
      targetId: tile.id
    });
  }
  if (!connectedTileIds.has(tile.id)) {
    warnings.push({
      id: `check_${tile.id}_not_connected`,
      severity: "warning",
      message: `${tile.title || tile.id} is not linked to anything yet.`,
      targetKind: "tile",
      targetId: tile.id
    });
  }
  return warnings;
}

function isTruthyExecutionFlag(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") {
    return ["true", "1", "yes", "on", "enabled"].includes(value.trim().toLowerCase());
  }
  return false;
}
