import type { Atlas, DebugEvent, DebugSeverity } from "../types/atlas";

const SECRET_MARKERS = ["secret", "password", "token", "key", "credential"];
let fallbackDebugIdCounter = 0;

export function createFrontendDebugEvent(
  action: string,
  message: string,
  severity: DebugSeverity = "info",
  context: Record<string, unknown> = {}
): DebugEvent {
  return {
    id: createDebugEventId(),
    timestamp: new Date().toISOString(),
    source: "frontend",
    severity,
    action,
    message,
    context: sanitizeDebugContext(context)
  };
}

function createDebugEventId(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi?.getRandomValues === "function") {
    const values = new Uint32Array(4);
    cryptoApi.getRandomValues(values);
    return `debug_${Array.from(values)
      .map((value) => value.toString(16).padStart(8, "0"))
      .join("")}`;
  }

  fallbackDebugIdCounter += 1;
  return `debug_${Date.now().toString(36)}_${fallbackDebugIdCounter.toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function sanitizeDebugContext(context: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    const normalized = key.toLowerCase().replace(/[-\s]/g, "_");
    if (SECRET_MARKERS.some((marker) => normalized.includes(marker))) {
      safe[key] = "[redacted]";
    } else if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
      safe[key] = value;
    } else if (Array.isArray(value)) {
      safe[key] = { count: value.length };
    } else if (typeof value === "object") {
      safe[key] = "[object summary omitted]";
    } else {
      safe[key] = String(value);
    }
  }
  return safe;
}

export function atlasSummary(atlas: Atlas): Record<string, unknown> {
  return {
    version: atlas.version,
    tiles: atlas.tiles.length,
    links: atlas.links.length,
    views: atlas.views.length,
    metadata_name: atlas.metadata.name
  };
}

export function downloadDebugLog(events: DebugEvent[], metadata: Record<string, unknown>): void {
  const payload = {
    exported_at: new Date().toISOString(),
    metadata: sanitizeDebugContext(metadata),
    events
  };
  const blob = new Blob([JSON.stringify(payload, null, 2), "\n"], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ctroadmap-debug-log.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
