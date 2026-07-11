import {
  Squirrel,
  Archive,
  Activity,
  Box,
  Boxes,
  Cable,
  CircleHelp,
  CircuitBoard,
  Cog,
  Cloud,
  CloudCog,
  Container,
  Cpu,
  Database,
  DatabaseBackup,
  FileCog,
  FlameKindling,
  Folder,
  GitCompare,
  Globe,
  HardDrive,
  KeyRound,
  Laptop,
  MonitorCog,
  Network,
  Package,
  Pizza,
  Play,
  Plug,
  Printer,
  RadioTower,
  Rocket,
  Router,
  SatelliteDish,
  SendToBack,
  Server,
  ServerCog,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  SquareTerminal,
  Unplug,
  Webhook,
  Wifi,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createElement } from "react";
import type { LinkType, Tile, TileIconRef, TileType, UploadedIconAsset, UploadedTileIconRef } from "../types/atlas";

export const TILE_TYPES: TileType[] = [
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
  "note"
];

export const LINK_TYPES: LinkType[] = [
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
  "related_to"
];

export const TILE_TYPE_CONFIG = {
  node: { label: "Node", icon: Server, color: "#38a3ff" },
  service: { label: "Service", icon: Box, color: "#55d7ff" },
  container: { label: "Container", icon: Container, color: "#25b8ff" },
  drive: { label: "Drive", icon: Database, color: "#77df7a" },
  mount: { label: "Mount", icon: Folder, color: "#8fe6b3" },
  script: { label: "Script", icon: SquareTerminal, color: "#a77cff" },
  config: { label: "Config", icon: FileCog, color: "#a4b8ff" },
  secret_ref: { label: "Secret Ref", icon: KeyRound, color: "#b77cff" },
  flow: { label: "Flow", icon: Play, color: "#ffca45" },
  iot_device: { label: "IOT Device", icon: Router, color: "#ff9f2f" },
  url: { label: "URL", icon: Globe, color: "#4fdfff" },
  check: { label: "Check", icon: ShieldCheck, color: "#7ce071" },
  note: { label: "Note", icon: CircleHelp, color: "#cbd5e1" }
} as const satisfies Record<TileType, { label: string; icon: LucideIcon; color: string }>;

export const LINK_COLOR: Record<LinkType, string> = {
  contains: "#38a3ff",
  runs: "#55d7ff",
  hosts: "#55d7ff",
  calls: "#a77cff",
  controls: "#ffca45",
  depends_on: "#f7f7ff",
  uses_storage: "#77df7a",
  mounted_at: "#8fe6b3",
  backs_up_to: "#58d68d",
  requires_key: "#b77cff",
  requires_config: "#a4b8ff",
  exposes_url: "#4fdfff",
  validates_with: "#7ce071",
  fails_if: "#ff6b6b",
  documents: "#cbd5e1",
  related_to: "#94a3b8"
};

export const DEFAULT_FIELDS: Record<TileType, Record<string, unknown>> = {
  node: { role: "", hostname: "", ip: "", os: "", purpose: "", primary_node: false },
  service: { role: "", status: "", port: "", purpose: "" },
  container: { image: "", compose_service: "", port: "", purpose: "" },
  drive: { capacity: "", filesystem: "", device: "", purpose: "" },
  mount: { path: "", source: "", options: "" },
  script: { path: "", language: "", purpose: "" },
  config: { path: "", purpose: "", owner: "" },
  secret_ref: {
    host: "",
    path: "",
    purpose: "",
    allowed_command: "",
    stores_secret_value: false
  },
  flow: { trigger: "", purpose: "", steps: [] },
  iot_device: { ip: "", protocol: "", model: "", purpose: "" },
  url: { url: "", protocol: "", purpose: "" },
  check: { command: "", expected_result: "", execution_enabled: false },
  note: { text: "" }
};

export const BRAND_ICON = Network;

export const UPLOADED_ICON_PREFIX = "uploaded:";
export const LUCIDE_ICON_PREFIX = "lucide:";

export interface LucideIconOption {
  id: string;
  name: string;
  label: string;
  Icon: LucideIcon;
}

const LUCIDE_ICON_COMPONENTS = {
  Squirrel,
  Activity,
  Archive,
  Box,
  Boxes,
  Cable,
  CircleHelp,
  CircuitBoard,
  Cog,
  Cloud,
  CloudCog,
  Container,
  Cpu,
  Database,
  DatabaseBackup,
  FileCog,
  FlameKindling,
  Folder,
  GitCompare,
  Globe,
  HardDrive,
  KeyRound,
  Laptop,
  MonitorCog,
  Network,
  Package,
  Pizza,
  Play,
  Plug,
  Printer,
  RadioTower,
  Rocket,
  Router,
  SatelliteDish,
  SendToBack,
  Server,
  ServerCog,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  SquareTerminal,
  Unplug,
  Webhook,
  Wifi,
  Workflow
} as const satisfies Record<string, LucideIcon>;

export const LUCIDE_ICON_OPTIONS: LucideIconOption[] = Object.entries(LUCIDE_ICON_COMPONENTS).map(([name, Icon]) => ({
  id: lucideIconId(name),
  name,
  label: labelFromIconName(name),
  Icon
}));

export function uploadedIconId(filename: string): string {
  return `${UPLOADED_ICON_PREFIX}${filename}`;
}

export function lucideIconId(name: string): string {
  return `${LUCIDE_ICON_PREFIX}${name}`;
}

export function normalizeTileIconRef(tile: Tile): TileIconRef | null {
  const iconRef = tile.fields?.icon_ref;
  if (!isRecord(iconRef)) return null;

  if (iconRef.kind === "uploaded" && typeof iconRef.filename === "string" && typeof iconRef.url === "string") {
    return {
      kind: "uploaded",
      id: uploadedIconId(iconRef.filename),
      filename: iconRef.filename,
      url: iconRef.url,
      media_type: typeof iconRef.media_type === "string" ? iconRef.media_type : undefined
    };
  }

  if (iconRef.kind === "lucide") {
    const name = resolveLucideName(iconRef);
    if (!name) return null;
    return {
      kind: "lucide",
      id: lucideIconId(name),
      name
    };
  }

  return null;
}

export function uploadedAssetToIconRef(asset: UploadedIconAsset): UploadedIconAsset {
  return {
    kind: "uploaded",
    id: uploadedIconId(asset.filename),
    filename: asset.filename,
    url: asset.url,
    media_type: asset.media_type
  };
}

export function uploadedResultToIconRef(uploaded: UploadedTileIconRef): UploadedIconAsset {
  return {
    kind: "uploaded",
    id: uploadedIconId(uploaded.filename),
    filename: uploaded.filename,
    url: uploaded.url,
    media_type: uploaded.media_type
  };
}

export function lucideNameToIconRef(name: string): TileIconRef | null {
  if (!isLucideIconName(name)) return null;
  return {
    kind: "lucide",
    id: lucideIconId(name),
    name
  };
}

export function iconRefLabel(iconRef: TileIconRef | null, defaultLabel: string): string {
  if (!iconRef) return `Default ${defaultLabel}`;
  if (iconRef.kind === "uploaded") return iconRef.filename;
  return labelFromIconName(iconRef.name);
}

export function TileIconGlyph({
  alt = "",
  fallback: Fallback,
  forceFallback = false,
  iconRef,
  onUploadedError,
  size,
  strokeWidth
}: {
  alt?: string;
  fallback: LucideIcon;
  forceFallback?: boolean;
  iconRef: TileIconRef | null;
  onUploadedError?: () => void;
  size: number;
  strokeWidth?: number;
}) {
  if (iconRef?.kind === "uploaded" && !forceFallback) {
    return createElement("img", { alt, onError: onUploadedError ? () => onUploadedError() : undefined, src: iconRef.url });
  }

  const Icon = iconRef?.kind === "lucide" && isLucideIconName(iconRef.name) ? LUCIDE_ICON_COMPONENTS[iconRef.name] : Fallback;
  return createElement(Icon, { size, strokeWidth });
}

function resolveLucideName(iconRef: Record<string, unknown>): keyof typeof LUCIDE_ICON_COMPONENTS | null {
  if (typeof iconRef.name === "string" && isLucideIconName(iconRef.name)) return iconRef.name;
  if (typeof iconRef.id !== "string" || !iconRef.id.startsWith(LUCIDE_ICON_PREFIX)) return null;
  const name = iconRef.id.slice(LUCIDE_ICON_PREFIX.length);
  return isLucideIconName(name) ? name : null;
}

function isLucideIconName(name: string): name is keyof typeof LUCIDE_ICON_COMPONENTS {
  return name in LUCIDE_ICON_COMPONENTS;
}

function labelFromIconName(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
