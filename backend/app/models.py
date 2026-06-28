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
    fields: dict[str, Any] = Field(default_factory=dict)
    notes: str = ""
    tags: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def reject_secret_values(self) -> "Tile":
        if self.type == "secret_ref":
            if self.fields.get("stores_secret_value") is True:
                raise ValueError("secret_ref tiles cannot store secret values")
            scan_for_secret_values(self.fields)
        return self


class Link(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    from_: str = Field(alias="from", min_length=1)
    to: str = Field(min_length=1)
    type: LinkType
    label: str = ""
    notes: str = ""
    directional: bool = True


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
        if not self.views:
            self.views = default_views()
        return self


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


def default_views() -> list[View]:
    return [
        View(
            id="physical",
            title="Physical",
            description="Hardware, cabling, drives, and mounts",
            visible_types=["node", "drive", "mount"],
            visible_links=["contains", "mounted_at", "runs", "hosts", "related_to"],
            layout_template="layered_hierarchy",
        ),
        View(
            id="services",
            title="Services",
            description="Applications, daemons, and containers",
            visible_types=["node", "service", "container", "url", "check"],
            visible_links=["runs", "hosts", "depends_on", "exposes_url", "validates_with"],
        ),
        View(
            id="storage",
            title="Storage",
            description="Storage devices and paths",
            visible_types=["node", "drive", "mount", "service", "container"],
            visible_links=["uses_storage", "mounted_at", "backs_up_to", "contains"],
        ),
        View(
            id="security",
            title="Security",
            description="Secret references, configs, and access dependencies",
            visible_types=["node", "script", "config", "secret_ref", "flow", "check"],
            visible_links=["requires_key", "requires_config", "validates_with", "fails_if"],
        ),
        View(
            id="flows",
            title="Flows",
            description="Operational functions and process flows",
            visible_types=["flow", "script", "service", "url", "check", "secret_ref", "config"],
            visible_links=["calls", "controls", "requires_key", "requires_config", "fails_if"],
            layout_template="layered_hierarchy",
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
