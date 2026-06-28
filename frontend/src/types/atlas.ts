export type TileType =
  | "node"
  | "service"
  | "container"
  | "drive"
  | "mount"
  | "script"
  | "config"
  | "secret_ref"
  | "flow"
  | "url"
  | "check"
  | "note";

export type LinkType =
  | "contains"
  | "runs"
  | "hosts"
  | "calls"
  | "controls"
  | "depends_on"
  | "uses_storage"
  | "mounted_at"
  | "backs_up_to"
  | "requires_key"
  | "requires_config"
  | "exposes_url"
  | "validates_with"
  | "fails_if"
  | "documents"
  | "related_to";

export type LayoutTemplate = "canvas_topology" | "layered_hierarchy";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Tile {
  id: string;
  type: TileType;
  title: string;
  parent?: string | null;
  position: Position;
  size?: Size | null;
  fields: Record<string, unknown>;
  notes?: string;
  tags?: string[];
}

export interface Link {
  id: string;
  from: string;
  to: string;
  type: LinkType;
  label?: string;
  notes?: string;
  directional?: boolean;
}

export interface View {
  id: string;
  title: string;
  description: string;
  visible_types: TileType[];
  visible_links: LinkType[];
  camera: {
    x: number;
    y: number;
    zoom: number;
  };
  layout_template: LayoutTemplate;
}

export interface Atlas {
  version: string;
  metadata: {
    name: string;
    description: string;
    updated_at: string | null;
  };
  tiles: Tile[];
  links: Link[];
  views: View[];
}

export type Selection =
  | { kind: "tile"; id: string }
  | { kind: "link"; id: string }
  | null;
