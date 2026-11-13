import { ApiErrorPayload, ApiResponse } from "@/types/api";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

// In production, default to same-origin relative proxy "/api" to eliminate CORS completely.
// In local development, falls back to "http://localhost:5000/api" if not specified.
const API_BASE_URL =
  RAW_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "/api"
    : "http://localhost:5000/api");

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly errors?: Array<{ field?: string; message: string }>;

  constructor(
    status: number,
    message: string,
    options?: {
      code?: string;
      details?: Record<string, unknown>;
      errors?: Array<{ field?: string; message: string }>;
    }
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
    this.errors = options?.errors;
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorizedCallback = handler;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | undefined | null>;
  skipUnauthorizedRedirect?: boolean;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined | null>): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, base);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, params, headers, skipUnauthorizedRedirect, ...rest } = options;

  const url = buildUrl(path, params);

  const response = await fetch(url, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | ApiErrorPayload
    | null;

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorizedRedirect && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }

    const errPayload = payload as ApiErrorPayload | null;
    throw new ApiClientError(
      response.status,
      errPayload?.message || `Request failed with status ${response.status}`,
      {
        code: errPayload?.code,
        details: errPayload?.details,
        errors: errPayload?.errors,
      }
    );
  }

  if (!payload || !("success" in payload)) {
    throw new ApiClientError(response.status, "Invalid response from server");
  }

  return payload as ApiResponse<T>;
}

