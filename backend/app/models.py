from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


TileType = Literal[
    "node",
    "service",
    "container",
    "drive",
    "mount",
    "script",
    "config",
    "secret_ref",
    "flow",
    "iot_device",
    "url",
    "check",
    "note",
]

LinkType = Literal[
    "contains",
    "runs",
    "hosts",
    "calls",
    "controls",
    "depends_on",
    "uses_storage",
    "mounted_at",
    "backs_up_to",
    "requires_key",
    "requires_config",
    "exposes_url",
    "validates_with",
    "fails_if",
    "documents",
    "related_to",
]

LayoutTemplate = Literal["canvas_topology", "layered_hierarchy"]
LinkSourcePort = Literal["out", "child"]
LinkTargetPort = Literal["in", "parent"]
Lifecycle = Literal["live", "planned"]
StackKind = Literal["sibling_type", "mount_children"]


class Position(BaseModel):
    x: float = 0
    y: float = 0


class Size(BaseModel):
    width: float = 220
    height: float = 120


class Metadata(BaseModel):
    name: str = "CTRoadmap"
    description: str = "Local infrastructure atlas"
    updated_at: str | None = None


class Tile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    type: TileType
    title: str = Field(min_length=1)
    parent: str | None = None
    position: Position = Field(default_factory=Position)
    size: Size | None = None
    lifecycle: Lifecycle = "live"
    fields: dict[str, Any] = Field(default_factory=dict)
    notes: str = ""
    tags: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_type_specific_fields(self) -> "Tile":
        if self.type == "secret_ref":
            if self.fields.get("stores_secret_value") is True:
                raise ValueError("secret_ref tiles cannot store secret values")
            scan_for_secret_values(self.fields)
        if self.type == "check" and is_truthy_execution_flag(self.fields.get("execution_enabled")):
            raise ValueError("check tiles cannot enable command execution")
        if self.type == "flow":
            validate_flow_steps_shape(self.fields.get("steps", []), self.id)
        return self


class Link(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    from_: str = Field(alias="from", min_length=1)
    to: str = Field(min_length=1)
    type: LinkType
    from_port: LinkSourcePort | None = None
    to_port: LinkTargetPort | None = None
    lifecycle: Lifecycle = "live"
    label: str = ""
    notes: str = ""
    directional: bool = True


class Stack(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    stack_kind: StackKind = "sibling_type"
    parent_id: str = Field(min_length=1)
    tile_type: TileType
    member_ids: list[str] = Field(default_factory=list)
    representative_id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    name_is_custom: bool = False


class Family(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    description: str = ""
    member_tile_ids: list[str] = Field(default_factory=list)
    position: Position = Field(default_factory=Position)
    size: Size = Field(default_factory=lambda: Size(width=360, height=240))
    order: int = 0
    color: str | None = None
    tag: str | None = None


class ViewCamera(BaseModel):
    x: float = 0
    y: float = 0
    zoom: float = 1


class View(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    description: str = ""
    visible_types: list[TileType] = Field(default_factory=list)
    visible_links: list[LinkType] = Field(default_factory=list)
    camera: ViewCamera = Field(default_factory=ViewCamera)
    layout_template: LayoutTemplate = "canvas_topology"


class Atlas(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str = "0.1"
    metadata: Metadata = Field(default_factory=Metadata)
    tiles: list[Tile] = Field(default_factory=list)
    links: list[Link] = Field(default_factory=list)
    views: list[View] = Field(default_factory=list)
    stacks: list[Stack] = Field(default_factory=list)
    families: list[Family] = Field(default_factory=list)

    @field_validator("tiles")
    @classmethod
    def tile_ids_unique(cls, tiles: list[Tile]) -> list[Tile]:
        ids = [tile.id for tile in tiles]
        if len(ids) != len(set(ids)):
            raise ValueError("tile ids must be unique")
        return tiles

    @field_validator("links")
    @classmethod
    def link_ids_unique(cls, links: list[Link]) -> list[Link]:
        ids = [link.id for link in links]
        if len(ids) != len(set(ids)):
            raise ValueError("link ids must be unique")
        return links

    @model_validator(mode="after")
    def validate_references(self) -> "Atlas":
        tile_ids = {tile.id for tile in self.tiles}
        tile_by_id = {tile.id: tile for tile in self.tiles}
        parent_by_id = {tile.id: tile.parent for tile in self.tiles}
        for tile in self.tiles:
            if tile.parent and tile.parent not in tile_ids:
                raise ValueError(f"tile {tile.id} references missing parent {tile.parent}")
            seen: set[str] = set()
            parent = tile.parent
            while parent:
                if parent == tile.id or parent in seen:
                    raise ValueError(f"tile {tile.id} has a circular parent relationship")
                seen.add(parent)
                parent = parent_by_id.get(parent)
        for link in self.links:
            if link.from_ not in tile_ids:
                raise ValueError(f"link {link.id} references missing source {link.from_}")
            if link.to not in tile_ids:
                raise ValueError(f"link {link.id} references missing target {link.to}")
        for tile in self.tiles:
            if tile.type == "flow":
                validate_flow_steps_references(tile.fields.get("steps", []), tile.id, tile_ids)
        self.stacks = normalize_stacks(self.stacks, tile_by_id)
        self.families = normalize_families(self.families, tile_ids)
        if not self.views:
            self.views = default_views()
        return self


def normalize_families(families: list[Family], tile_ids: set[str]) -> list[Family]:
    normalized: list[Family] = []
    used_ids: set[str] = set()
    for family in sorted(families, key=lambda item: item.order):
        family_id = unique_family_id(family.id, used_ids)
        used_ids.add(family_id)
        member_ids: list[str] = []
        seen_members: set[str] = set()
        for member_id in family.member_tile_ids:
            if member_id not in tile_ids or member_id in seen_members:
                continue
            member_ids.append(member_id)
            seen_members.add(member_id)
        normalized.append(
            Family(
                id=family_id,
                title=family.title,
                description=family.description,
                member_tile_ids=member_ids,
                position=family.position,
                size=Size(width=max(family.size.width, 120), height=max(family.size.height, 90)),
                order=family.order,
                color=family.color,
                tag=family.tag,
            )
        )
    return normalized


def unique_family_id(family_id: str, used_ids: set[str]) -> str:
    candidate = family_id
    index = 2
    while candidate in used_ids:
        candidate = f"{family_id}_{index}"
        index += 1
    return candidate


def normalize_stacks(stacks: list[Stack], tile_by_id: dict[str, Tile]) -> list[Stack]:
    normalized: list[Stack] = []
    used_ids: set[str] = set()
    for stack in stacks:
        parent = tile_by_id.get(stack.parent_id)
        if not parent:
            continue
        if stack.stack_kind == "mount_children":
            if parent.type != "mount" or stack.representative_id != stack.parent_id:
                continue
            member_ids = []
            seen_members = set()
            for member_id in stack.member_ids:
                member = tile_by_id.get(member_id)
                if not member or member.parent != stack.parent_id or member_id in seen_members:
                    continue
                member_ids.append(member_id)
                seen_members.add(member_id)
            if len(member_ids) < 2:
                continue
            stack_id = unique_stack_id(stack.id, used_ids)
            used_ids.add(stack_id)
            default_name = default_mount_stack_name(len(member_ids))
            normalized.append(
                Stack(
                    id=stack_id,
                    stack_kind=stack.stack_kind,
                    parent_id=stack.parent_id,
                    tile_type="mount",
                    member_ids=member_ids,
                    representative_id=stack.parent_id,
                    name=stack.name if stack.name_is_custom else default_name,
                    name_is_custom=stack.name_is_custom,
                )
            )
            continue
        member_ids: list[str] = []
        seen_members: set[str] = set()
        for member_id in stack.member_ids:
            member = tile_by_id.get(member_id)
            if not member or member.parent != stack.parent_id or member.type != stack.tile_type or member_id in seen_members:
                continue
            member_ids.append(member_id)
            seen_members.add(member_id)
        if len(member_ids) < 2:
            continue
        representative_id = stack.representative_id if stack.representative_id in seen_members else member_ids[0]
        stack_id = unique_stack_id(stack.id, used_ids)
        used_ids.add(stack_id)
        default_name = default_stack_name(len(member_ids), stack.tile_type)
        normalized.append(
            Stack(
                id=stack_id,
                stack_kind=stack.stack_kind,
                parent_id=stack.parent_id,
                tile_type=stack.tile_type,
                member_ids=member_ids,
                representative_id=representative_id,
                name=stack.name if stack.name_is_custom else default_name,
                name_is_custom=stack.name_is_custom,
            )
        )
    return normalized


def unique_stack_id(stack_id: str, used_ids: set[str]) -> str:
    candidate = stack_id
    index = 2
    while candidate in used_ids:
        candidate = f"{stack_id}_{index}"
        index += 1
    return candidate


def default_stack_name(count: int, tile_type: str) -> str:
    label = tile_type.replace("_", " ").title()
    suffix = "" if label.endswith("s") else "s"
    return f"{count} {label}{suffix}"


def default_mount_stack_name(count: int) -> str:
    return f"{count} Mounted Items"


SENSITIVE_FIELD_NAMES = {
    "password",
    "passwd",
    "passphrase",
    "token",
    "api_key",
    "apikey",
    "private_key",
    "secret",
    "secret_value",
    "credential",
}


def scan_for_secret_values(value: Any, path: str = "fields") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = key.lower().replace("-", "_").strip()
            if normalized in SENSITIVE_FIELD_NAMES and child not in (None, "", False):
                raise ValueError(f"secret_ref cannot store raw secret field {path}.{key}")
            scan_for_secret_values(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            scan_for_secret_values(child, f"{path}[{index}]")


def validate_flow_steps_shape(value: Any, tile_id: str) -> None:
    if value in (None, ""):
        return
    if not isinstance(value, list):
        raise ValueError(f"flow tile {tile_id} fields.steps must be a list")
    seen_orders: set[int] = set()
    for index, step in enumerate(value):
        if not isinstance(step, dict):
            raise ValueError(f"flow tile {tile_id} step {index + 1} must be an object")
        order = step.get("order")
        if not isinstance(order, int) or order < 1:
            raise ValueError(f"flow tile {tile_id} step {index + 1} must have a positive integer order")
        if order in seen_orders:
            raise ValueError(f"flow tile {tile_id} has duplicate flow step order {order}")
        seen_orders.add(order)
        if not str(step.get("from", "")).strip():
            raise ValueError(f"flow tile {tile_id} step {order} must have a source tile")
        if not str(step.get("to", "")).strip():
            raise ValueError(f"flow tile {tile_id} step {order} must have a target tile")
        if not str(step.get("action", "")).strip():
            raise ValueError(f"flow tile {tile_id} step {order} must have an action")


def validate_flow_steps_references(value: Any, tile_id: str, tile_ids: set[str]) -> None:
    if not isinstance(value, list):
        return
    for step in value:
        if not isinstance(step, dict):
            continue
        order = step.get("order", "?")
        source = str(step.get("from", "")).strip()
        target = str(step.get("to", "")).strip()
        if source not in tile_ids:
            raise ValueError(f"flow tile {tile_id} step {order} references missing source tile {source}")
        if target not in tile_ids:
            raise ValueError(f"flow tile {tile_id} step {order} references missing target tile {target}")


def is_truthy_execution_flag(value: Any) -> bool:
    if value is True:
        return True
    if isinstance(value, str):
        return value.strip().lower() in {"true", "1", "yes", "on", "enabled"}
    return False


def default_views() -> list[View]:
    return [
        View(
            id="hardware",
            title="Hardware",
            description="Physical nodes, drives, and IoT devices",
            visible_types=["node", "drive", "iot_device"],
            visible_links=[],
            layout_template="canvas_topology",
        ),
        View(
            id="software",
            title="Software",
            description="Services, containers, and URLs",
            visible_types=["service", "container", "url"],
            visible_links=[],
            layout_template="canvas_topology",
        ),
        View(
            id="infrastructure",
            title="Infrastructure",
            description="Scripts, secrets, configs, notes, mounts, flows, and checks",
            visible_types=["script", "secret_ref", "config", "note", "mount", "flow", "check"],
            visible_links=[],
            layout_template="canvas_topology",
        ),
        View(
            id="everything",
            title="Everything",
            description="All atlas objects and relationships",
            visible_types=[],
            visible_links=[],
        ),
    ]


def empty_atlas() -> Atlas:
    return Atlas(views=default_views())
