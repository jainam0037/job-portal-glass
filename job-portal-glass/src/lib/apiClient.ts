/**
 * Generic API fetch wrapper.
 * - Prepends /api/v1 to all endpoints
 * - Sends credentials (JWT cookies) with every request
 * - Sets Content-Type: application/json unless body is FormData
 * - Returns ApiResponse<T> or standard ApiError on network failure
 */

import type { ApiError, ApiResponse } from "@/lib/validations/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

function buildUrl(endpoint: string): string {
  const base = API_BASE.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

function isFormData(body: unknown): body is FormData {
  return body instanceof FormData;
}

/** Options for apiFetch - body can be FormData or a JSON-serializable object */
type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export async function apiFetch<T>(
  endpoint: string,
  options?: ApiFetchOptions
): Promise<ApiResponse<T>> {
  const url = buildUrl(endpoint);
  const { body, headers: customHeaders, ...rest } = options ?? {};

  const headers = new Headers(customHeaders);

  // Omit Content-Type for FormData so browser sets multipart boundary
  if (!isFormData(body)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers,
    body: isFormData(body) ? body : body ? JSON.stringify(body) : undefined,
  };

  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      const text = await res.text();
      return {
        success: false,
        data: {
          error:
            res.ok
              ? "Server returned non-JSON response"
              : `Request failed (${res.status}). ${text.slice(0, 80)}${text.length > 80 ? "…" : ""}`,
        },
      } as ApiError;
    }

    const json = await res.json().catch(() => null);
    if (json === null) {
      return {
        success: false,
        data: { error: "Invalid JSON response from server" },
      } as ApiError;
    }

    if (!res.ok) {
      const apiError = json as { success?: boolean; data?: { error?: unknown } };
      return {
        success: false,
        data: {
          error:
            apiError?.data?.error ??
            `Request failed with status ${res.status}`,
        },
      } as ApiError;
    }

    return json as ApiResponse<T>;
  } catch (err) {
    return {
      success: false,
      data: {
        error:
          err instanceof Error ? err.message : "Network request failed",
      },
    } as ApiError;
  }
}
