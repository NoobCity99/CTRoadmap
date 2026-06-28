import {
  Box,
  CircleHelp,
  Container,
  Database,
  FileCog,
  Folder,
  Globe,
  KeyRound,
  Network,
  Play,
  Server,
  ShieldCheck,
  SquareTerminal
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LinkType, TileType } from "../types/atlas";

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
  node: { role: "", hostname: "", ip: "", os: "", purpose: "" },
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
  flow: { trigger: "", purpose: "" },
  url: { url: "", protocol: "", purpose: "" },
  check: { command: "", expected_result: "", execution_enabled: false },
  note: { text: "" }
};

export const BRAND_ICON = Network;
