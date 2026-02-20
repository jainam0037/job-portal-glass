import { create } from "zustand";
import { isApiSuccess, getApiErrorMessage } from "@/lib/validations/api";
import type {
  User,
  WorkItem,
  EducationItem,
  Location,
  Preference,
  Info,
} from "@/lib/validations/user";
import { userService } from "@/services/userService";

export type EditingSection = "profile" | "skills" | "work-preferences" | null;

interface ProfileState {
  user: User | null;
  isFetching: boolean;
  error: string | null;
  isEditing: boolean;
  editingSection: EditingSection;

  // Async
  fetchUser: () => Promise<void>;

  setEditing: (open: boolean, section?: EditingSection) => void;

  // Sync (optimistic updates after component API calls)
  setUserInfo: (info: Info) => void;
  setUserLocation: (location: Location) => void;
  setUserPreferences: (preferences: Preference) => void;
  setUserProfileImage: (url: string | null) => void;
  setUserResume: (url: string | null) => void;
  addWorkLocal: (work: WorkItem) => void;
  updateWorkLocal: (work: WorkItem) => void;
  removeWorkLocal: (id: string) => void;
  addEducationLocal: (edu: EducationItem) => void;
  updateEducationLocal: (edu: EducationItem) => void;
  removeEducationLocal: (id: string) => void;
  clearProfile: () => void;

  /** Set minimal user after auth (name, email) until fetchUser runs */
  setUserFromAuth: (data: { name: string; email: string }) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  isFetching: false,
  error: null,
  isEditing: false,
  editingSection: null,

  setEditing: (open, section) =>
    set({
      isEditing: open,
      editingSection: open ? (section ?? "profile") : null,
    }),

  fetchUser: async () => {
    set({ isFetching: true, error: null });
    const res = await userService.getUser();
    if (isApiSuccess(res)) {
      const user = res.data.user;
      // Normalize _id → id (MongoDB/backend often returns _id)
      const experience = (user.experience ?? []).map((w) => ({
        ...w,
        id: w.id ?? (w as unknown as { _id?: string })._id ?? String(Math.random()),
      }));
      const education = (user.education ?? []).map((e) => ({
        ...e,
        id: e.id ?? (e as unknown as { _id?: string })._id ?? String(Math.random()),
      }));
      set({
        user: { ...user, experience, education },
        error: null,
      });
    } else {
      set({ error: getApiErrorMessage(res.data), user: null });
    }
    set({ isFetching: false });
  },

  setUserInfo: (info) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, ...info } });
  },

  setUserLocation: (location) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, ...location } });
  },

  setUserPreferences: (preferences) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, ...preferences } });
  },

  setUserProfileImage: (url) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, profile_img: url } });
  },

  setUserResume: (url) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, resume: url } });
  },

  addWorkLocal: (work) => {
    const { user } = get();
    if (!user) return;
    const experience = user.experience ?? [];
    set({ user: { ...user, experience: [...experience, work] } });
  },

  updateWorkLocal: (work) => {
    const { user } = get();
    if (!user || !work.id) return;
    const experience = user.experience ?? [];
    set({
      user: {
        ...user,
        experience: experience.map((w) => (w.id === work.id ? work : w)),
      },
    });
  },

  removeWorkLocal: (id) => {
    const { user } = get();
    if (!user) return;
    const experience = (user.experience ?? []).filter((w) => w.id !== id);
    set({ user: { ...user, experience } });
  },

  addEducationLocal: (edu) => {
    const { user } = get();
    if (!user) return;
    const education = user.education ?? [];
    set({ user: { ...user, education: [...education, edu] } });
  },

  updateEducationLocal: (edu) => {
    const { user } = get();
    if (!user || !edu.id) return;
    const education = user.education ?? [];
    set({
      user: {
        ...user,
        education: education.map((e) => (e.id === edu.id ? edu : e)),
      },
    });
  },

  removeEducationLocal: (id) => {
    const { user } = get();
    if (!user) return;
    const education = (user.education ?? []).filter((e) => e.id !== id);
    set({ user: { ...user, education } });
  },

  clearProfile: () => {
    set({ user: null, error: null, isEditing: false, editingSection: null });
  },

  setUserFromAuth: (data) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, name: data.name, email: data.email } });
    } else {
      set({
        user: {
          id: "temp",
          name: data.name,
          email: data.email,
        } as User,
      });
    }
  },
}));

// Re-export types for consumers
export type { User, WorkItem, EducationItem, Location, Preference, Info };
