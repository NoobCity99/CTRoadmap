import type { AppVersion, Atlas, AtlasImportPreview, DebugEvent, ExportFormat, ExportResult, HealthResult, IconUploadResult, UpdateAdvisory, UpdateSettings, UpdateState } from "../types/atlas";

interface ApiRequestOptions {
  method?: string;
  json?: unknown;
  formData?: FormData;
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

export async function saveAtlas(atlas: Atlas): Promise<Atlas> {
  return requestJson<Atlas>("/api/atlas", { method: "PUT", json: atlas });
}

export async function loadHealth(): Promise<HealthResult> {
  return requestJson<HealthResult>("/api/health");
}

export async function loadAppVersion(): Promise<AppVersion> {
  return requestJson<AppVersion>("/api/app/version");
}

export async function loadUpdateAdvisory(): Promise<UpdateAdvisory> {
  return requestJson<UpdateAdvisory>("/api/app/update");
}

export async function saveUpdateSettings(settings: UpdateSettings): Promise<UpdateState> {
  return requestJson<UpdateState>("/api/app/update/settings", { method: "PUT", json: settings });
}

export async function generateExport(format: ExportFormat): Promise<ExportResult> {
  return requestJson<ExportResult>(`/api/export/${format}`, { method: "POST" });
}

export async function loadBackendDebugLog(): Promise<DebugEvent[]> {
  const payload = await requestJson<{ events?: DebugEvent[] }>("/api/debug/log");
  return payload.events ?? [];
}

export async function clearBackendDebugLog(): Promise<void> {
  await requestVoid("/api/debug/log/clear", { method: "POST" });
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

export async function uploadTileIcon(file: File): Promise<IconUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return requestJson<IconUploadResult>("/api/assets/icons", { method: "POST", formData });
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

async function requestJson<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await request(url, options);
  return response.json() as Promise<T>;
}

async function requestVoid(url: string, options: ApiRequestOptions = {}): Promise<void> {
  await request(url, options);
}

async function request(url: string, options: ApiRequestOptions): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, toRequestInit(options));
  } catch (error) {
    throw new ApiError({
      status: 0,
      statusText: "Network Error",
      url,
      message: errorToMessage(error)
    });
  }

  if (!response.ok) {
    throw await createApiError(response, url);
  }

  return response;
}

function toRequestInit({ method = "GET", json, formData }: ApiRequestOptions): RequestInit {
  if (json !== undefined && formData !== undefined) {
    throw new Error("API requests cannot send both JSON and FormData bodies.");
  }

  if (json !== undefined) {
    return {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    };
  }

  if (formData !== undefined) {
    return {
      method,
      body: formData
    };
  }

  return { method };
}

async function createApiError(response: Response, url: string): Promise<ApiError> {
  const text = await response.text().catch(() => "");
  const message = errorMessageFromBody(text) || response.statusText || `Request failed with status ${response.status}`;
  return new ApiError({
    status: response.status,
    statusText: response.statusText,
    url,
    message
  });
}

function errorMessageFromBody(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (isRecord(parsed) && "detail" in parsed) {
      return detailToMessage(parsed.detail);
    }
  } catch {
    // Plain text response bodies are already useful user-facing messages.
  }

  return trimmed;
}

function detailToMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map(detailItemToMessage).filter(Boolean).join("\n");
  }
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
