import type { AppVersion, Atlas, AtlasImportPreview, DebugEvent, ExportFormat, ExportResult, HealthResult, UpdateAdvisory, UpdateSettings, UpdateState } from "../types/atlas";

export async function loadAtlas(): Promise<Atlas> {
  const response = await fetch("/api/atlas");
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function saveAtlas(atlas: Atlas): Promise<Atlas> {
  const response = await fetch("/api/atlas", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(atlas)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function loadHealth(): Promise<HealthResult> {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function loadAppVersion(): Promise<AppVersion> {
  const response = await fetch("/api/app/version");
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function loadUpdateAdvisory(): Promise<UpdateAdvisory> {
  const response = await fetch("/api/app/update");
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function saveUpdateSettings(settings: UpdateSettings): Promise<UpdateState> {
  const response = await fetch("/api/app/update/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(settings)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function generateExport(format: ExportFormat): Promise<ExportResult> {
  const response = await fetch(`/api/export/${format}`, {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function loadBackendDebugLog(): Promise<DebugEvent[]> {
  const response = await fetch("/api/debug/log");
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const payload = (await response.json()) as { events?: DebugEvent[] };
  return payload.events ?? [];
}

export async function clearBackendDebugLog(): Promise<void> {
  const response = await fetch("/api/debug/log/clear", {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export function downloadExport(format: ExportFormat): void {
  window.location.href = `/api/export/${format}/download`;
}

export async function readAtlasFile(file: File): Promise<Atlas> {
  const text = await file.text();
  return JSON.parse(text) as Atlas;
}

export async function previewAtlasImport(atlas: Atlas): Promise<AtlasImportPreview> {
  const response = await fetch("/api/atlas/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(atlas)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export function downloadAtlasJson(atlas: Atlas): void {
  const blob = new Blob([JSON.stringify(atlas, null, 2), "\n"], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "atlas.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
