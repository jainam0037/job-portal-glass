/**
 * Global API types - strictly aligned with backend contract.
 * Base URL: /api/v1
 * All responses: { success: boolean, data: T | { error: ... } }
 */

/** Success response envelope */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** Error response envelope - error can be string or field-level object */
export interface ApiError {
  success: false;
  data: {
    error: string | Record<string, string | string[]>;
  };
}

/** Generic API response - union of success and error */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Type guard: check if response is success */
export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccess<T> {
  return res.success === true;
}

/** Type guard: check if response is error */
export function isApiError<T>(res: ApiResponse<T>): res is ApiError {
  return res.success === false;
}

/** Extract error message from API error (handles string or object) */
export function getApiErrorMessage(data: ApiError["data"]): string {
  const err = data.error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const parts = Object.entries(err).map(([k, v]) =>
      Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${String(v)}`
    );
    return parts.length ? parts.join(". ") : "An error occurred";
  }
  return "An error occurred";
}
