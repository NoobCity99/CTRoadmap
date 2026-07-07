from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Literal, get_args

import yaml

from .models import Atlas, Link, Tile, TileType
from .storage import EXPORTS_DIR, ensure_directories


ExportFormat = Literal["markdown", "yaml", "mermaid"]

EXPORT_FILES: dict[ExportFormat, str] = {
    "markdown": "CTRoadmap-Atlas.md",
    "yaml": "atlas.yaml",
    "mermaid": "atlas.mmd",
}

EXPORT_MEDIA_TYPES: dict[ExportFormat, str] = {
    "markdown": "text/markdown; charset=utf-8",
    "yaml": "application/x-yaml; charset=utf-8",
    "mermaid": "text/plain; charset=utf-8",
}


def export_path(format_: ExportFormat) -> Path:
    return EXPORTS_DIR / EXPORT_FILES[format_]


def write_export(format_: ExportFormat, atlas: Atlas) -> Path:
    ensure_directories()
    path = export_path(format_)
    if format_ == "markdown":
        content = render_markdown(atlas)
    elif format_ == "yaml":
        content = render_yaml(atlas)
    else:
        content = render_mermaid(atlas)
    path.write_text(content, encoding="utf-8")
    return path


def render_markdown(atlas: Atlas) -> str:
    tile_by_id = {tile.id: tile for tile in atlas.tiles}
    children_by_parent: dict[str, list[Tile]] = {}
    links_by_tile: dict[str, list[Link]] = {}

    for tile in atlas.tiles:
        if tile.parent:
            children_by_parent.setdefault(tile.parent, []).append(tile)

    for link in atlas.links:
        links_by_tile.setdefault(link.from_, []).append(link)
        links_by_tile.setdefault(link.to, []).append(link)

    lines = [
        "# CTRoadmap Atlas",
        "",
        atlas.metadata.description or "Local infrastructure atlas",
        "",
        "## Metadata",
        "",
        f"- Version: {atlas.version}",
        f"- Name: {atlas.metadata.name}",
        f"- Updated At: {atlas.metadata.updated_at or 'Not saved'}",
        f"- Tiles: {len(atlas.tiles)}",
        f"- Relationships: {len(atlas.links)}",
        f"- Layers: {len(atlas.views)}",
        f"- Families: {len(atlas.families)}",
        f"- Stacks: {len(atlas.stacks)}",
        "",
    ]

    for tile_type in get_args(TileType):
        tiles = [tile for tile in atlas.tiles if tile.type == tile_type]
        if not tiles:
            continue
        lines.extend([f"## {section_title(tile_type)}", ""])
        for tile in sorted(tiles, key=lambda item: item.title.lower()):
            parent = tile_by_id.get(tile.parent) if tile.parent else None
            lifecycle = resolve_lifecycle(tile)
            lines.extend([f"### {tile.title}", "", f"- ID: `{tile.id}`", f"- Type: `{tile.type}`", f"- Lifecycle: `{lifecycle}`"])
            if parent:
                lines.append(f"- Parent: {parent.title}")
            if tile.tags:
                lines.append(f"- Tags: {', '.join(tile.tags)}")
            if tile.notes:
                lines.extend(["", "#### Notes", "", tile.notes])
            if tile.fields:
                lines.extend(["", "#### Fields", ""])
                for key, value in tile.fields.items():
                    lines.append(f"- {key}: {format_markdown_value(value)}")
            children = children_by_parent.get(tile.id, [])
            if children:
                lines.extend(["", "#### Children", ""])
                for child in sorted(children, key=lambda item: item.title.lower()):
                    lines.append(f"- {child.title} (`{child.type}`)")
            related_links = links_by_tile.get(tile.id, [])
            if related_links:
                lines.extend(["", "#### Relationships", ""])
                for link in related_links:
                    lines.append(f"- {describe_link(link, tile_by_id)}")
            lines.append("")

    flow_tiles = [tile for tile in atlas.tiles if tile.type == "flow"]
    if flow_tiles:
        lines.extend(["## Flow Details", ""])
        for flow_tile in sorted(flow_tiles, key=lambda item: item.title.lower()):
            lines.extend(render_flow_markdown(flow_tile, atlas.links, tile_by_id))

    lines.extend(["## Relationships", ""])
    if atlas.links:
        for link in atlas.links:
            lines.append(f"- {describe_link(link, tile_by_id)}")
    else:
        lines.append("No relationships recorded.")

    lines.extend(["", "## Layers", ""])
    for view in atlas.views:
        lines.extend(
            [
                f"### {view.title}",
                "",
                f"- ID: `{view.id}`",
                f"- Template: `{view.layout_template}`",
                f"- Visible Tile Types: {', '.join(view.visible_types) if view.visible_types else 'All'}",
                f"- Visible Relationship Types: {', '.join(view.visible_links) if view.visible_links else 'All'}",
                "",
            ]
        )
        if view.description:
            lines.extend([view.description, ""])

    if atlas.families:
        lines.extend(["## Families", ""])
        for family in sorted(atlas.families, key=lambda item: (item.order, item.title.lower())):
            members = [tile_by_id.get(member_id) for member_id in family.member_tile_ids]
            member_tiles = [member for member in members if member]
            lines.extend(
                [
                    f"### {family.title}",
                    "",
                    f"- ID: `{family.id}`",
                    f"- Order: {family.order}",
                    f"- Members: {len(member_tiles)}",
                ]
            )
            if family.tag:
                lines.append(f"- Tag: {family.tag}")
            if family.color:
                lines.append(f"- Color: `{family.color}`")
            if family.description:
                lines.extend(["", family.description])
            if member_tiles:
                lines.extend(["", "#### Member Tiles", ""])
                for member in sorted(member_tiles, key=lambda item: item.title.lower()):
                    lines.append(f"- {member.title} (`{member.type}`)")
            lines.append("")

    if atlas.stacks:
        lines.extend(["## Visual Stacks", ""])
        for stack in atlas.stacks:
            parent = tile_by_id.get(stack.parent_id)
            representative = tile_by_id.get(stack.representative_id)
            members = [tile_by_id.get(member_id) for member_id in stack.member_ids]
            member_titles = [member.title for member in members if member]
            stack_type = "Mixed mounted items" if stack.stack_kind == "mount_children" else f"`{stack.tile_type}`"
            lines.extend(
                [
                    f"### {stack.name}",
                    "",
                    f"- ID: `{stack.id}`",
                    f"- Kind: `{stack.stack_kind}`",
                    f"- Parent: {parent.title if parent else stack.parent_id}",
                    f"- Tile Type: {stack_type}",
                    f"- Representative: {representative.title if representative else stack.representative_id}",
                    f"- Members: {', '.join(member_titles) if member_titles else 'None'}",
                    "",
                ]
            )

    return "\n".join(lines).rstrip() + "\n"


def render_yaml(atlas: Atlas) -> str:
    return yaml.safe_dump(atlas.model_dump(by_alias=True, mode="json", exclude_none=True), sort_keys=False, allow_unicode=True)


def render_mermaid(atlas: Atlas) -> str:
    node_ids = mermaid_node_ids(atlas.tiles)
    lines = ["flowchart LR"]
    if not atlas.tiles:
        lines.append('    empty["No tiles"]')
        return "\n".join(lines) + "\n"

    for tile in atlas.tiles:
        title = f"{tile.title} (planned)" if resolve_lifecycle(tile) == "planned" else tile.title
        lines.append(f'    {node_ids[tile.id]}["{escape_mermaid(title)}"]')

    for link in atlas.links:
        source = node_ids.get(link.from_)
        target = node_ids.get(link.to)
        if not source or not target:
            continue
        label_text = link.label or link.type
        if resolve_lifecycle(link) == "planned":
            label_text = f"{label_text} (planned)"
        label = escape_mermaid(label_text)
        connector = "-->" if link.directional else "---"
        lines.append(f'    {source} {connector}|"{label}"| {target}')

    return "\n".join(lines) + "\n"


def section_title(tile_type: str) -> str:
    return tile_type.replace("_", " ").title() + "s"


def format_markdown_value(value: object) -> str:
    if isinstance(value, (dict, list)):
        return "`" + json.dumps(value, ensure_ascii=False) + "`"
    if value is None:
        return ""
    return str(value)


def describe_link(link: Link, tile_by_id: dict[str, Tile]) -> str:
    source = tile_by_id.get(link.from_)
    target = tile_by_id.get(link.to)
    source_title = source.title if source else link.from_
    target_title = target.title if target else link.to
    label = link.label or link.type.replace("_", " ")
    arrow = "->" if link.directional else "--"
    route = f" [{resolve_source_port(link)} -> {resolve_target_port(link)}]"
    lifecycle = f" `{resolve_lifecycle(link)}`"
    return f"{source_title} {arrow} {target_title}: {label} (`{link.type}`){route}{lifecycle}"


def resolve_lifecycle(item: Tile | Link) -> str:
    return getattr(item, "lifecycle", "live") or "live"


def resolve_source_port(link: Link) -> str:
    return link.from_port or ("child" if link.type == "contains" else "out")


def resolve_target_port(link: Link) -> str:
    return link.to_port or ("parent" if link.type == "contains" else "in")


def render_flow_markdown(flow_tile: Tile, links: list[Link], tile_by_id: dict[str, Tile]) -> list[str]:
    lines = [f"### Flow: {flow_tile.title}", ""]
    trigger = flow_tile.fields.get("trigger")
    purpose = flow_tile.fields.get("purpose")
    if trigger:
        lines.extend(["#### Trigger", "", str(trigger), ""])
    if purpose:
        lines.extend(["#### Purpose", "", str(purpose), ""])

    steps = normalized_flow_steps(flow_tile)
    lines.extend(["#### Steps", ""])
    if steps:
        for step in steps:
            source = tile_by_id.get(str(step.get("from", "")))
            target = tile_by_id.get(str(step.get("to", "")))
            source_title = source.title if source else str(step.get("from", ""))
            target_title = target.title if target else str(step.get("to", ""))
            lines.append(f"{step['order']}. {source_title} -> {target_title}: {step['action']}")
    else:
        lines.append("No ordered steps recorded.")
    lines.append("")

    dependency_links = related_links(flow_tile.id, links, {"depends_on", "requires_key", "requires_config"})
    validation_links = related_links(flow_tile.id, links, {"validates_with"})
    failure_links = related_links(flow_tile.id, links, {"fails_if"})

    lines.extend(render_related_group("Dependencies", dependency_links, tile_by_id))
    lines.extend(render_related_group("Validation Checks", validation_links, tile_by_id))
    lines.extend(render_related_group("Failure Points", failure_links, tile_by_id))
    return lines


def normalized_flow_steps(flow_tile: Tile) -> list[dict[str, object]]:
    steps = flow_tile.fields.get("steps", [])
    if not isinstance(steps, list):
        return []
    normalized = [step for step in steps if isinstance(step, dict)]
    return sorted(normalized, key=lambda step: int(step.get("order", 0) or 0))


def related_links(tile_id: str, links: list[Link], link_types: set[str]) -> list[Link]:
    return [link for link in links if link.type in link_types and (link.from_ == tile_id or link.to == tile_id)]


def render_related_group(title: str, links: list[Link], tile_by_id: dict[str, Tile]) -> list[str]:
    lines = [f"#### {title}", ""]
    if not links:
        lines.extend(["None recorded.", ""])
        return lines
    for link in links:
        lines.append(f"- {describe_link(link, tile_by_id)}")
    lines.append("")
    return lines


def mermaid_node_ids(tiles: list[Tile]) -> dict[str, str]:
    result: dict[str, str] = {}
    used: set[str] = set()
    for tile in tiles:
        base = re.sub(r"[^a-zA-Z0-9_]", "_", tile.id).strip("_") or "tile"
        if base[0].isdigit():
            base = f"tile_{base}"
        candidate = base
        index = 2
        while candidate in used:
            candidate = f"{base}_{index}"
            index += 1
        used.add(candidate)
        result[tile.id] = candidate
    return result


def escape_mermaid(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")
