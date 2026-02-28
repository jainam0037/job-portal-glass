/**
 * Auth Service – Strictly typed API layer for authentication.
 * Base URL: /api/v1 (use env NEXT_PUBLIC_API_URL or relative proxy).
 * All responses follow: { success: boolean; data: T | { error: string | object } }
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";


export interface ApiResponse<T> {
  success: boolean;
  data: T | { error: string | Record<string, unknown> };
}

/** Thrown when API returns 429 Too Many Requests. Components can catch and show cooldown UI. */
export class RateLimitError extends Error {
  constructor(
    message = "Too many attempts. Please try again in a few minutes.",
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

/** Extract error message from API response. Handles string or object (e.g. { email: "invalid" }). */
function getErrorMessage(data: { error?: string | Record<string, unknown> }): string {
  const err = data.error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const parts = Object.entries(err).map(([k, v]) => (Array.isArray(v) ? v.join(", ") : String(v)));
    return parts.length ? parts.join(". ") : "An error occurred";
  }
  return "An error occurred";
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 429) {
    let retryAfter = 60;
    const header = res.headers.get("Retry-After");
    if (header) {
      const parsed = parseInt(header, 10);
      if (!isNaN(parsed)) retryAfter = parsed;
    }
    throw new RateLimitError("Too many attempts. Please try again in a few minutes.", retryAfter);
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success) {
    const msg = getErrorMessage((json.data || {}) as { error?: string | Record<string, unknown> });
    throw new Error(msg);
  }
  return json.data as T;
}

/** Backend expects: "signup" | "forget password" | "change email" | "delete account" | "change password" */
export type OtpOption =
  | "signup"
  | "forget password"
  | "change email"
  | "delete account"
  | "change password";

/** POST /auth/req_email_otp – Request OTP. Sends { email, option } per backend Zod schema. */
export async function reqEmailOtp(email: string, option?: string): Promise<void> {
  const payload = {
    email,
    reason: option || "signup",
  };
  const res = await fetch(`${API_BASE}/auth/req_email_otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await handleResponse<unknown>(res);
}

/** Alias for reqEmailOtp. */
export const requestOtp = reqEmailOtp;

export interface SignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  otp: string;
  referred_by?: string;
}

/** POST /auth/signup – Complete signup with OTP. Returns user + cookies (logged in). */
export async function signup(payload: SignupPayload): Promise<unknown> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      otp: String(payload.otp),
    }),
    credentials: "include",
  });
  return handleResponse<unknown>(res);
}

export interface SigninPayload {
  email: string;
  password: string;
}

/** POST /auth/login – Sign in. Returns user + sets session_token cookie. */
export async function signin(payload: SigninPayload): Promise<unknown> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse<unknown>(res);
}

export interface ForgotPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
}

/** POST /auth/forgot_password – Finalize forgot password with OTP. */
export async function verifyForgot(payload: ForgotPasswordPayload): Promise<unknown> {
  const res = await fetch(`${API_BASE}/auth/forgot_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, otp: String(payload.otp) }),
    credentials: "include",
  });
  return handleResponse<unknown>(res);
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  otp: string;
}

/** POST /auth/change_password – Change password. Destroys session; user must re-login. */
export async function changePassword(payload: ChangePasswordPayload): Promise<{ success: true; data: unknown } | { success: false; data: { error?: string | Record<string, unknown> } }> {
  const res = await fetch(`${API_BASE}/auth/change_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      old_password: payload.old_password,
      new_password: payload.new_password,
      otp: String(payload.otp),
    }),
    credentials: "include",
  });
  const json = await res.json();
  if (res.ok && json.success) {
    return { success: true, data: json.data };
  }
  return { success: false, data: (json.data || {}) as { error?: string | Record<string, unknown> } };
}

export type SocialProvider = "google" | "linkedin";

/** POST /auth/logout – Sign out. Clears session cookie. */
export async function logout(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await handleResponse<{ message: string }>(res);
  return data as { message: string };
}

export interface ChangeEmailPayload {
  old_email: string;
  new_email: string;
  otp_old_email: string;
  otp_new_email: string;
}

/** POST /auth/change_email – Change email. Destroys session; user must re-login. */
export async function changeEmail(payload: ChangeEmailPayload): Promise<unknown> {
  const res = await fetch(`${API_BASE}/auth/change_email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      old_email: payload.old_email,
      new_email: payload.new_email,
      otp_old_email: String(payload.otp_old_email),
      otp_new_email: String(payload.otp_new_email),
    }),
    credentials: "include",
  });
  return handleResponse<unknown>(res);
}

export interface DeleteAccountPayload {
  email: string;
  password: string;
  otp: string;
}

/** DELETE /auth/delete_account – Permanently delete account. Logs out on success. */
export async function deleteAccount(payload: DeleteAccountPayload): Promise<{ success: true; data: { message: string } } | { success: false; data: { error?: string | Record<string, unknown> } }> {
  const res = await fetch(`${API_BASE}/auth/delete_account`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      otp: String(payload.otp),
    }),
    credentials: "include",
  });
  const json = await res.json();
  if (res.ok && json.success) {
    return { success: true, data: json.data as { message: string } };
  }
  return { success: false, data: (json.data || {}) as { error?: string | Record<string, unknown> } };
}

/** POST /auth/req_phone_otp – Request OTP for phone change. Payload: { phone } */
export async function reqPhoneOtp(phone: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/req_phone_otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
    credentials: "include",
  });
  await handleResponse<unknown>(res);
}

export interface ChangePhonePayload {
  phone: string;
  otp: string | number;
}

/** POST /auth/change_phone – Change phone with OTP. */
export async function changePhone(payload: ChangePhonePayload): Promise<unknown> {
  const res = await fetch(`${API_BASE}/auth/change_phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: payload.phone,
      otp: typeof payload.otp === "number" ? payload.otp : Number(payload.otp),
    }),
    credentials: "include",
  });
  return handleResponse<unknown>(res);
}

/** GET /auth/google or /auth/linkedin – Get redirect URL for social login. */
export async function getSocialLink(provider: SocialProvider): Promise<string> {
  const path = provider === "google" ? "/auth/google" : "/auth/linkedin";
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const data = await handleResponse<{ url: string }>(res);
  return (data as { url: string }).url;
}
