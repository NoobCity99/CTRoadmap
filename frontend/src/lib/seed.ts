import type { Atlas } from "../types/atlas";

export function createSeedAtlas(): Atlas {
  return {
    version: "0.1",
    metadata: {
      name: "CTRoadmap",
      description: "Local infrastructure atlas",
      updated_at: null
    },
    tiles: [
      {
        id: "node_coffee1",
        type: "node",
        title: "coffee1",
        parent: null,
        position: { x: 160, y: 140 },
        size: { width: 280, height: 180 },
        fields: {
          role: "Main Server",
          hostname: "coffee1",
          ip: "10.0.0.10",
          os: "Ubuntu Server 22.04 LTS",
          purpose: "Hosts Docker, Nextcloud, Samba, and backups."
        },
        notes: "Primary server that hosts core services, file storage, and backups.",
        tags: ["production", "main", "docker", "storage"]
      },
      {
        id: "service_docker",
        type: "service",
        title: "Docker",
        parent: "node_coffee1",
        position: { x: 190, y: 340 },
        fields: { role: "Container runtime", status: "running", purpose: "Runs app containers." },
        tags: ["runtime"]
      },
      {
        id: "container_nextcloud",
        type: "container",
        title: "Nextcloud",
        parent: "service_docker",
        position: { x: 190, y: 500 },
        fields: { image: "nextcloud-aio", compose_service: "nextcloud", port: "8080" },
        tags: ["files", "web"]
      },
      {
        id: "drive_nextcloud_data",
        type: "drive",
        title: "Nextcloud Data Drive",
        parent: "node_coffee1",
        position: { x: 520, y: 500 },
        fields: { capacity: "2 TB", filesystem: "ext4", purpose: "Nextcloud data storage." },
        tags: ["storage"]
      },
      {
        id: "node_dispatch1",
        type: "node",
        title: "dispatch1",
        parent: null,
        position: { x: 600, y: 160 },
        fields: {
          role: "Control Node",
          hostname: "dispatch1",
          os: "Android Termux",
          purpose: "Hosts control dashboard and wake/sleep functions."
        },
        tags: ["control"]
      },
      {
        id: "flow_sleep_coffee1",
        type: "flow",
        title: "Sleep coffee1",
        parent: "node_dispatch1",
        position: { x: 640, y: 360 },
        fields: { trigger: "Dashboard button", purpose: "Safely suspend coffee1." },
        tags: ["flow"]
      },
      {
        id: "secret_sleep_key",
        type: "secret_ref",
        title: "SSH Key Ref",
        parent: "node_dispatch1",
        position: { x: 900, y: 360 },
        fields: {
          host: "dispatch1",
          path: "$HOME/.ssh/ctdc_coffee1_sleep",
          purpose: "Allows dispatch1 to trigger coffee1 safe sleep command.",
          allowed_command: "/usr/local/sbin/ctdc-safe-suspend",
          stores_secret_value: false
        },
        tags: ["security"]
      },
      {
        id: "url_nextcloud",
        type: "url",
        title: "Nextcloud URL",
        parent: null,
        position: { x: 300, y: 700 },
        fields: { url: "https://cloud.coffee1.lan", protocol: "HTTPS" },
        tags: ["web"]
      },
      {
        id: "check_ping_coffee1",
        type: "check",
        title: "Ping coffee1",
        parent: null,
        position: { x: 640, y: 700 },
        fields: {
          command: "ping coffee1",
          expected_result: "coffee1 responds",
          execution_enabled: false
        },
        tags: ["check"]
      }
    ],
    links: [
      { id: "link_coffee1_docker", from: "node_coffee1", to: "service_docker", type: "contains", label: "contains", directional: true },
      { id: "link_docker_nextcloud", from: "service_docker", to: "container_nextcloud", type: "contains", label: "contains", directional: true },
      { id: "link_nextcloud_storage", from: "container_nextcloud", to: "drive_nextcloud_data", type: "uses_storage", label: "uses storage", directional: true },
      { id: "link_nextcloud_url", from: "container_nextcloud", to: "url_nextcloud", type: "exposes_url", label: "exposes url", directional: true },
      { id: "link_dispatch_sleep", from: "node_dispatch1", to: "flow_sleep_coffee1", type: "controls", label: "controls", directional: true },
      { id: "link_sleep_key", from: "flow_sleep_coffee1", to: "secret_sleep_key", type: "requires_key", label: "requires key", directional: true },
      { id: "link_ping_coffee1", from: "check_ping_coffee1", to: "node_coffee1", type: "validates_with", label: "validates", directional: true }
    ],
    views: [
      {
        id: "physical",
        title: "Physical",
        description: "Hardware, cabling, drives, and mounts",
        visible_types: ["node", "drive", "mount"],
        visible_links: ["contains", "mounted_at", "runs", "hosts", "related_to"],
        camera: { x: 0, y: 0, zoom: 1 },
        layout_template: "layered_hierarchy"
      },
      {
        id: "services",
        title: "Services",
        description: "Applications, daemons, and containers",
        visible_types: ["node", "service", "container", "url", "check"],
        visible_links: ["runs", "hosts", "depends_on", "exposes_url", "validates_with"],
        camera: { x: 0, y: 0, zoom: 1 },
        layout_template: "canvas_topology"
      },
      {
        id: "storage",
        title: "Storage",
        description: "Storage devices and paths",
        visible_types: ["node", "drive", "mount", "service", "container"],
        visible_links: ["uses_storage", "mounted_at", "backs_up_to", "contains"],
        camera: { x: 0, y: 0, zoom: 1 },
        layout_template: "canvas_topology"
      },
      {
        id: "security",
        title: "Security",
        description: "Secret references, configs, and access dependencies",
        visible_types: ["node", "script", "config", "secret_ref", "flow", "check"],
        visible_links: ["requires_key", "requires_config", "validates_with", "fails_if"],
        camera: { x: 0, y: 0, zoom: 1 },
        layout_template: "canvas_topology"
      },
      {
        id: "flows",
        title: "Flows",
        description: "Operational functions and process flows",
        visible_types: ["flow", "script", "service", "url", "check", "secret_ref", "config"],
        visible_links: ["calls", "controls", "requires_key", "requires_config", "fails_if"],
        camera: { x: 0, y: 0, zoom: 1 },
        layout_template: "layered_hierarchy"
      },
      {
        id: "everything",
        title: "Everything",
        description: "All atlas objects and relationships",
        visible_types: [],
        visible_links: [],
        camera: { x: 0, y: 0, zoom: 1 },
        layout_template: "canvas_topology"
      }
    ]
  };
}
