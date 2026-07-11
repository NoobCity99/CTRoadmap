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
  | "iot_device"
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

export type LayoutTemplate = "canvas_topology" | "layered_hierarchy" | "handbook";
export type ExportFormat = "markdown" | "yaml" | "mermaid";
export type ThemePaletteId = "cyber" | "aurora" | "ember" | "blueprint" | "nes";
export type CanvasBackgroundId = "grid" | "hex" | "circuit" | "blueprint" | "pcb_board" | "nes_grid" | "lt_draft_grid";
export type DebugSeverity = "info" | "warning" | "error";
export type LinkSourcePort = "out" | "child";
export type LinkTargetPort = "in" | "parent";
export type Lifecycle = "live" | "planned";
export type AppMode = "live" | "planning";
export type DeploymentType = "docker" | "linux_desktop" | "windows_desktop";
export type ReleaseChannel = "beta" | "stable";
export type UpdateStatus = "available" | "current" | "disabled" | "failed" | "unknown";

export interface FlowStep {
  order: number;
  from: string;
  to: string;
  action: string;
}

export interface FlowFields extends Record<string, unknown> {
  trigger: string;
  purpose: string;
  steps: FlowStep[];
}

export interface CheckFields extends Record<string, unknown> {
  command: string;
  expected_result: string;
  execution_enabled: false;
}

export interface UploadedTileIconRef {
  kind: "uploaded";
  id?: string;
  filename: string;
  url: string;
  media_type?: string;
}

export interface LucideTileIconRef {
  kind: "lucide";
  id: string;
  name: string;
}

export type TileIconRef = UploadedTileIconRef | LucideTileIconRef;

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
  lifecycle?: Lifecycle;
  fields: Record<string, unknown>;
  notes?: string;
  tags?: string[];
}

export interface Link {
  id: string;
  from: string;
  to: string;
  type: LinkType;
  from_port?: LinkSourcePort | null;
  to_port?: LinkTargetPort | null;
  lifecycle?: Lifecycle;
  label?: string;
  notes?: string;
  directional?: boolean;
}

export interface TileStack {
  id: string;
  stack_kind?: "sibling_type" | "mount_children";
  parent_id: string;
  tile_type: TileType;
  member_ids: string[];
  representative_id: string;
  name: string;
  name_is_custom?: boolean;
}

export interface Family {
  id: string;
  title: string;
  description: string;
  member_tile_ids: string[];
  position: Position;
  size: Size;
  order: number;
  color?: string | null;
  tag?: string | null;
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
  stacks?: TileStack[];
  families?: Family[];
}

export interface ExportResult {
  format: ExportFormat;
  filename: string;
  download_url: string;
  generated_at: string;
}

export interface AtlasImportPreview {
  valid: boolean;
  tiles: number;
  links: number;
  views: number;
  families: number;
  warnings: string[];
  errors: string[];
}

export interface IconUploadResult extends UploadedTileIconRef {
  id: string;
}

export interface UploadedIconAsset extends UploadedTileIconRef {
  id: string;
}

export interface IconAssetListResult {
  icons: UploadedIconAsset[];
}

export interface HealthResult {
  status: string;
  app: string;
}

export interface AuthStatus {
  passcode_configured: boolean;
  authenticated: boolean;
  session_expires_at: string | null;
}

export interface AppVersion {
  deployment_type: DeploymentType;
  channel: ReleaseChannel;
  current_version: string;
  build_sha: string;
  build_date: string;
}

export interface UpdateTarget {
  update_command?: string | null;
  release_notes_url?: string | null;
  download_url?: string | null;
  sha256?: string | null;
  notes?: string;
}

export interface UpdateState {
  last_checked_at: string | null;
  last_result: UpdateStatus;
  latest_seen_version: string | null;
  target?: UpdateTarget | null;
  last_error?: string | null;
  update_checks_enabled: boolean;
  check_interval_hours: number;
}

export interface UpdateAdvisory extends AppVersion {
  status: UpdateStatus;
  state: UpdateState;
  latest_version: string | null;
  manifest_url: string;
  target?: UpdateTarget | null;
  error?: string | null;
}

export interface UpdateSettings {
  update_checks_enabled: boolean;
  check_interval_hours: number;
}

export interface DebugEvent {
  id: string;
  timestamp: string;
  source: "frontend" | "backend";
  severity: DebugSeverity;
  action: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface AtlasWarning {
  id: string;
  severity: "warning" | "error";
  message: string;
  targetKind: "tile" | "link" | "atlas";
  targetId?: string;
}

export type Selection =
  | { kind: "tile"; id: string }
  | { kind: "link"; id: string }
  | { kind: "stack"; id: string }
  | { kind: "family"; id: string }
  | null;
