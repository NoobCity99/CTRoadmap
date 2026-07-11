import {
  Activity,
  Archive,
  Box,
  Boxes,
  Cable,
  CircleHelp,
  CircuitBoard,
  Cloud,
  CloudCog,
  Cog,
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
  Squirrel,
  SquareTerminal,
  Unplug,
  Webhook,
  Wifi,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tile, TileIconRef, UploadedIconAsset, UploadedTileIconRef } from "../types/atlas";

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
    return <img alt={alt} onError={onUploadedError} src={iconRef.url} />;
  }

  const Icon = iconRef?.kind === "lucide" && isLucideIconName(iconRef.name) ? LUCIDE_ICON_COMPONENTS[iconRef.name] : Fallback;
  return <Icon size={size} strokeWidth={strokeWidth} />;
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
