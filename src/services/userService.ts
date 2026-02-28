/**
 * User API service - strictly aligned with backend contract.
 * Base: /api/v1/user
 */

import { apiFetch } from "@/lib/apiClient";
import {
  type CreateEducationPayload,
  type CreateWorkPayload,
  type Info,
  type Location,
  type Preference,
  type UpdateEducationPayload,
  type UpdateWorkPayload,
  type User,
} from "@/lib/validations/user";

/** GET /user - full user with education and experience */
export async function getUser() {
  return apiFetch<{ user: User }>("/user");
}

/** POST /user/info - first_name, last_name, linkedin, links */
export async function updateInfo(data: Info) {
  return apiFetch<{ info: Info }>("/user/info", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
}

/** POST /user/location - residence, work location, timezone */
export async function updateLocation(data: Location) {
  return apiFetch<{ location: Location }>("/user/location", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
}

/** POST /user/preference - skills, compensation, languages */
export async function updatePreferences(data: Preference) {
  return apiFetch<{ preferences: Preference }>("/user/preference", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
}

/** POST /user/work/ - create work/experience */
export async function addWork(data: CreateWorkPayload) {
  return apiFetch<WorkResponse>("/user/work/", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
}

/** PUT /user/work - update work/experience */
export async function updateWork(data: UpdateWorkPayload) {
  return apiFetch<WorkResponse>("/user/work", {
    method: "PUT",
    body: data as Record<string, unknown>,
  });
}

/** DELETE /user/work/:id */
export async function deleteWork(id: string) {
  return apiFetch<{ message: string }>(`/user/work/${id}`, {
    method: "DELETE",
  });
}

/** POST /user/education - create education */
export async function addEducation(data: CreateEducationPayload) {
  return apiFetch<EducationResponse>("/user/education", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
}

/** PUT /user/education - update education */
export async function updateEducation(data: UpdateEducationPayload) {
  return apiFetch<EducationResponse>("/user/education", {
    method: "PUT",
    body: data as Record<string, unknown>,
  });
}

/** DELETE /user/educations/:id - note plural "educations" */
export async function deleteEducation(id: string) {
  return apiFetch<{ message: string }>(`/user/educations/${id}`, {
    method: "DELETE",
  });
}

/** POST /user/resume - upload resume (FormData) */
export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);
  return apiFetch<{ url: string }>("/user/resume", {
    method: "POST",
    body: formData,
  });
}

/** DELETE /user/resume */
export async function deleteResume() {
  return apiFetch<{ message: string }>("/user/resume", {
    method: "DELETE",
  });
}

/** POST /user/profile - upload profile image (FormData). Returns { profile_img: string }. */
export async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("profile", file);
  return apiFetch<{ profile_img: string }>("/user/profile", {
    method: "POST",
    body: formData,
  });
}

/** DELETE /user/profile */
export async function deleteProfileImage() {
  return apiFetch<{ message: string }>("/user/profile", {
    method: "DELETE",
  });
}

/** GET /user/notifications – list of user notifications (auth required) */
export interface Notification {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
}

export async function getNotifications() {
  return apiFetch<{ notifications: Notification[] }>("/user/notifications");
}

// Response types per API contract
interface WorkResponse {
  id: string;
  category: "WORK" | "PROJECT";
  name: string;
  role?: string;
  city?: string;
  country?: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface EducationResponse {
  id: string;
  college?: string;
  degree?: string;
  major?: string;
  CGPA?: number;
  start_date?: string;
  graduation_date?: string;
}

export const userService = {
  getUser,
  updateInfo,
  updateLocation,
  updatePreferences,
  addWork,
  updateWork,
  deleteWork,
  addEducation,
  updateEducation,
  deleteEducation,
  uploadResume,
  deleteResume,
  uploadProfileImage,
  deleteProfileImage,
  getNotifications,
};
