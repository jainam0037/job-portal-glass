/**
 * User API schemas - strictly aligned with backend contract.
 * Base: /api/v1/user
 * Quirks: Dates YYYY-MM, educations (plural), CGPA (uppercase)
 */

import { z } from "zod";

// ─── Reusable patterns ─────────────────────────────────────────────────────

/** YYYY-MM date format (e.g. 2024-01) */
export const dateYYYYMMSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Date must be YYYY-MM");

/** E.164 phone format (e.g. +918787878783) */
export const e164PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Phone must be E.164 format");

/** ISO country code (2 chars: US, IN, GB) */
export const isoCountrySchema = z
  .string()
  .length(2, "Country must be 2-char ISO code");

/** Valid URL */
export const urlSchema = z.string().url();

// ─── Location (POST /user/location) ─────────────────────────────────────────

export const locationSchema = z.object({
  country_residence: isoCountrySchema.optional(),
  state_residence: z.string().optional(),
  city_residence: z.string().optional(),
  work_country: isoCountrySchema.optional(),
  work_state: z.string().optional(),
  work_city: z.string().optional(),
  legally_authorised_to_work: z.boolean().optional(),
  timezone: z.string().optional(), // e.g. ASIA/KOLKATA
});

export type Location = z.infer<typeof locationSchema>;

// ─── Preference (POST /user/preference) ────────────────────────────────────

export const preferenceSchema = z.object({
  time_commitment_per_week: z.number().optional(),
  timezone: z.string().optional(),
  min_compensation_full_time: z.number().optional(), // per year
  min_compensation_part_time: z.number().optional(), // per hour
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type Preference = z.infer<typeof preferenceSchema>;

// ─── Info (POST /user/info) ───────────────────────────────────────────────

export const infoSchema = z.object({
  first_name: z.string().min(1, "First name must not be empty"),
  last_name: z.string().min(1, "Last name must not be empty"),
  phone: e164PhoneSchema.optional(),
  linkedin: urlSchema.optional(),
  links: z.array(urlSchema).optional(),
});

export type Info = z.infer<typeof infoSchema>;

// ─── Work / Experience (POST /user/work, PUT /user/work) ───────────────────

export const workItemSchema = z.object({
  id: z.string().optional(), // required for PUT
  category: z.enum(["WORK", "PROJECT"]),
  name: z.string(), // company or project title
  role: z.string().optional(),
  city: z.string().optional(),
  country: isoCountrySchema.optional(),
  description: z.string(),
  start_date: dateYYYYMMSchema,
  end_date: dateYYYYMMSchema,
});

export type WorkItem = z.infer<typeof workItemSchema>;

/** Payload for POST /user/work - key is "work" */
export const createWorkPayloadSchema = z.object({
  work: workItemSchema.omit({ id: true }),
});

/** Payload for PUT /user/work - key is "work", id required */
export const updateWorkPayloadSchema = z.object({
  work: workItemSchema.extend({ id: z.string() }),
});

export type CreateWorkPayload = z.infer<typeof createWorkPayloadSchema>;
export type UpdateWorkPayload = z.infer<typeof updateWorkPayloadSchema>;

// ─── Education (POST /user/education, PUT /user/education) ──────────────────

export const educationItemSchema = z.object({
  id: z.string().optional(), // required for PUT
  college: z.string().optional(),
  degree: z.string().optional(),
  major: z.string().optional(),
  CGPA: z.number().optional(), // uppercase per API
  start_date: dateYYYYMMSchema.optional(),
  graduation_date: dateYYYYMMSchema.optional(),
});

export type EducationItem = z.infer<typeof educationItemSchema>;

/** Payload for POST /user/education - key is "educations" (plural) */
export const createEducationPayloadSchema = z.object({
  educations: educationItemSchema.omit({ id: true }),
});

/** Payload for PUT /user/education - key is "educations", id required */
export const updateEducationPayloadSchema = z.object({
  educations: educationItemSchema.extend({ id: z.string() }),
});

export type CreateEducationPayload = z.infer<typeof createEducationPayloadSchema>;
export type UpdateEducationPayload = z.infer<typeof updateEducationPayloadSchema>;

// ─── Full User (GET /user response) ────────────────────────────────────────

/** Raw backend may return _id; we normalize to id. first_name/last_name → name. */
export const userSchema = z.object({
  id: z.string().optional(), // normalized from _id or id
  _id: z.string().optional(), // raw from backend (MongoDB)
  name: z.string().optional(), // computed: first_name + last_name
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email(),
  profile_img: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  links: z.array(z.string()).optional(),
  resume: z.string().nullable().optional(),
  // Location
  country_residence: z.string().nullable().optional(),
  state_residence: z.string().nullable().optional(),
  city_residence: z.string().nullable().optional(),
  work_country: z.string().nullable().optional(),
  work_state: z.string().nullable().optional(),
  work_city: z.string().nullable().optional(),
  legally_authorised_to_work: z.boolean().nullable().optional(),
  timezone: z.string().nullable().optional(),
  // Preferences
  time_commitment_per_week: z.number().nullable().optional(),
  min_compensation_full_time: z.number().nullable().optional(),
  min_compensation_part_time: z.number().nullable().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  // Nested arrays from GET /user
  education: z.array(educationItemSchema).optional(),
  experience: z.array(workItemSchema).optional(),
  // Onboarding: backend may use is_onboarded, is_onboarding_completed, or similar
  is_onboarded: z.boolean().optional(),
});

export type User = z.infer<typeof userSchema>;

/** GET /user response envelope */
export const getUserResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: userSchema,
  }),
});

export type GetUserResponse = z.infer<typeof getUserResponseSchema>;

/** Get display name from user (first_name + last_name, or fallback to name) */
export function getDisplayName(user: { name?: string; first_name?: string; last_name?: string } | null): string {
  if (!user) return "";
  const fromFirstLast = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  if (fromFirstLast) return fromFirstLast;
  return user.name ?? "";
}

/** Normalize raw backend user to frontend shape. Ensures id, name, and is_onboarded are set. */
export function normalizeUser(raw: Record<string, unknown>): User {
  const first = (raw.first_name as string) ?? "";
  const last = (raw.last_name as string) ?? "";
  const name = (`${first} ${last}`.trim() || (raw.name as string)) ?? "";
  const id = (raw.id as string) ?? (raw._id as string) ?? "";
  // Infer onboarding: backend flag, or has education (completed step 2+)
  const education = raw.education as unknown[] | undefined;
  const isOnboarded =
    raw.is_onboarded === true ||
    raw.is_onboarding_completed === true ||
    (Array.isArray(education) && education.length > 0);

  return {
    ...raw,
    id: id || "unknown",
    name: name || "User",
    first_name: first || undefined,
    last_name: last || undefined,
    _id: (raw._id as string) ?? undefined,
    is_onboarded: isOnboarded,
  } as User;
}

/**
 * Split a single "Full Name" string into first_name and last_name.
 * first_name: everything before the first space.
 * last_name: everything after the first space (or empty if no space).
 */
export function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const trimmed = (fullName ?? "").trim();
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx === -1) {
    return { first_name: trimmed, last_name: "" };
  }
  return {
    first_name: trimmed.slice(0, spaceIdx),
    last_name: trimmed.slice(spaceIdx + 1).trim(),
  };
}

/** POST /user/profile response – upload profile image returns profile_img URL */
export const uploadProfileImageResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    profile_img: z.string().url(),
  }),
});

export type UploadProfileImageResponse = z.infer<typeof uploadProfileImageResponseSchema>;
