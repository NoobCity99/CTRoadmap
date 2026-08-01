import type { AppVersion, Atlas, AtlasImportPreview, DebugEvent, ExportFormat, ExportResult, HealthResult } from "../types/atlas";

interface ApiRequestOptions {
  method?: string;
  json?: unknown;
}

interface ApiErrorOptions {
  message: string;
  status: number;
  statusText: string;
  url: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;

  constructor({ message, status, statusText, url }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.url = url;
  }
}

export async function loadAtlas(): Promise<Atlas> {
  return requestJson<Atlas>("/api/atlas");
}

export async function loadDemoAtlas(): Promise<Atlas> {
  return requestJson<Atlas>("/api/atlas/demo");
}

export async function saveAtlas(atlas: Atlas): Promise<Atlas> {
  return requestJson<Atlas>("/api/atlas", { method: "PUT", json: atlas });
}

export async function loadHealth(): Promise<HealthResult> {
  return requestJson<HealthResult>("/api/health");
}

export async function loadAppVersion(): Promise<AppVersion> {
  return requestJson<AppVersion>("/api/app/version");
}

export async function generateExport(format: ExportFormat): Promise<ExportResult> {
  return requestJson<ExportResult>(`/api/export/${format}`, { method: "POST" });
}

export async function loadBackendDebugLog(): Promise<DebugEvent[]> {
  const payload = await requestJson<{ events?: DebugEvent[] }>("/api/debug/log");
  return payload.events ?? [];
}

export async function clearBackendDebugLog(): Promise<void> {
  await request("/api/debug/log/clear", { method: "POST" });
}

export function downloadExport(format: ExportFormat): void {
  window.location.href = `/api/export/${format}/download`;
}

export async function readAtlasFile(file: File): Promise<Atlas> {
  const text = await file.text();
  return JSON.parse(text) as Atlas;
}

export async function previewAtlasImport(atlas: Atlas): Promise<AtlasImportPreview> {
  return requestJson<AtlasImportPreview>("/api/atlas/preview", { method: "POST", json: atlas });
}

export function downloadAtlasJson(atlas: Atlas): void {
  const blob = new Blob([JSON.stringify(atlas, null, 2), "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "atlas.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function requestJson<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await request(url, options);
  return response.json() as Promise<T>;
}

async function request(url: string, { method = "GET", json }: ApiRequestOptions = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      ...(json === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(json)
          })
    });
  } catch (error) {
    throw new ApiError({ status: 0, statusText: "Network Error", url, message: errorToMessage(error) });
  }

  if (!response.ok) throw await createApiError(response, url);
  return response;
}

async function createApiError(response: Response, url: string): Promise<ApiError> {
  const text = await response.text().catch(() => "");
  const message = errorMessageFromBody(text) || response.statusText || `Request failed with status ${response.status}`;
  return new ApiError({ status: response.status, statusText: response.statusText, url, message });
}

function errorMessageFromBody(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (isRecord(parsed) && "detail" in parsed) return detailToMessage(parsed.detail);
  } catch {
    // Plain text response bodies are already suitable for display.
  }
  return trimmed;
}

function detailToMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(detailItemToMessage).filter(Boolean).join("\n");
  return detailItemToMessage(detail);
}

function detailItemToMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (!isRecord(detail)) return safeStringify(detail);
  const message = typeof detail.msg === "string" ? detail.msg : safeStringify(detail);
  const location = Array.isArray(detail.loc) ? detail.loc.map(String).join(".") : "";
  return location ? `${location}: ${message}` : message;
}

function safeStringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function errorToMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
