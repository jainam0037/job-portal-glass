"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, User as UserIcon, Briefcase, Globe, Shield, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { CreatablePillInput } from "@/components/ui/CreatablePillInput";
import { CurrencyStringInput } from "@/components/ui/CurrencyStringInput";
import {
  LocationGrid,
  type LocationGridValue,
} from "@/features/profile/components/inputs/LocationGrid";
import { getCountryCode } from "@/lib/constants/countries";
import { SUGGESTED_SKILLS, SUGGESTED_LANGUAGES } from "@/lib/constants/data";
import { parseCurrencyString } from "@/components/ui/CurrencyStringInput";
import { SearchableTimezoneSelect } from "@/components/ui/SearchableTimezoneSelect";
import { useProfileStore, type User, type EditingSection } from "@/store/useProfileStore";
import { userService } from "@/services/userService";
import { isApiSuccess, getApiErrorMessage } from "@/lib/validations/api";

function stripLinkedInPrefix(url: string): string {
  return url
    ?.replace(/^https?:\/\//, "")
    .replace(/^linkedin\.com\/in\/?/, "")
    .replace(/\/$/, "") ?? "";
}

function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Partial<T>;
}

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  residence: LocationGridValue;
  linkedin: string;
};

type SkillsFormData = {
  skills: string[];
  languages: string[];
};

type WorkPrefsFormData = {
  workLocation: LocationGridValue;
  timezone: string;
  timeCommitment: string;
  compensation: string;
  workAuth: "authorized" | "sponsorship" | "unspecified";
};

function userToFormData(user: User | null): FormData {
  if (!user) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      headline: "",
      residence: { country: "", state: "", city: "" },
      linkedin: "",
    };
  }
  const headline = user.experience?.[0]?.role ?? "";
  const nameParts = (user.name ?? "").trim().split(/\s+/);
  const fallbackFirst = nameParts[0] ?? "";
  const fallbackLast = nameParts.slice(1).join(" ") ?? "";
  return {
    firstName: user.first_name ?? fallbackFirst,
    lastName: user.last_name ?? fallbackLast,
    email: user.email ?? "",
    headline,
    residence: {
      country: getCountryCode(user.country_residence ?? ""),
      state: user.state_residence ?? "",
      city: user.city_residence ?? "",
    },
    linkedin: user.linkedin ?? "",
  };
}

function userToSkillsFormData(user: User | null): SkillsFormData {
  return {
    skills: user?.skills ?? [],
    languages: user?.languages ?? [],
  };
}

function userToWorkPrefsFormData(user: User | null): WorkPrefsFormData {
  const auth = user?.legally_authorised_to_work;
  let workAuth: WorkPrefsFormData["workAuth"] = "unspecified";
  if (auth === true) workAuth = "authorized";
  if (auth === false) workAuth = "sponsorship";

  const amt = user?.min_compensation_full_time;
  const compensationStr =
    amt != null ? `USD ${amt}` : "";

  return {
    workLocation: {
      country: getCountryCode(user?.work_country ?? ""),
      state: user?.work_state ?? "",
      city: user?.work_city ?? "",
    },
    timezone: user?.timezone ?? "",
    timeCommitment: user?.time_commitment_per_week?.toString() ?? "",
    compensation: compensationStr,
    workAuth,
  };
}

const TABS: { id: EditingSection; label: string }[] = [
  { id: "profile", label: "Basic" },
  { id: "skills", label: "Skills & Languages" },
  { id: "work-preferences", label: "Work Preferences" },
];

export function EditProfileModal() {
  const {
    user,
    isEditing,
    editingSection,
    setEditing,
    setUserInfo,
    setUserLocation,
    setUserPreferences,
  } = useProfileStore();

  const [activeTab, setActiveTab] = useState<EditingSection>(editingSection ?? "profile");
  const [formData, setFormData] = useState<FormData>(userToFormData(user));
  const [skillsFormData, setSkillsFormData] = useState<SkillsFormData>(userToSkillsFormData(user));
  const [workPrefsFormData, setWorkPrefsFormData] = useState<WorkPrefsFormData>(
    userToWorkPrefsFormData(user)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const initialRefs = useRef<{
    form: FormData | null;
    skills: SkillsFormData | null;
    workPrefs: WorkPrefsFormData | null;
  }>({ form: null, skills: null, workPrefs: null });

  useEffect(() => {
    if (isEditing && editingSection) {
      setActiveTab(editingSection);
    }
  }, [isEditing, editingSection]);

  useEffect(() => {
    if (isEditing) {
      const form = userToFormData(user);
      const skills = userToSkillsFormData(user);
      const workPrefs = userToWorkPrefsFormData(user);
      setFormData(form);
      setSkillsFormData(skills);
      setWorkPrefsFormData(workPrefs);
      initialRefs.current = { form: { ...form }, skills: { ...skills }, workPrefs: { ...workPrefs } };
    } else {
      initialRefs.current = { form: null, skills: null, workPrefs: null };
    }
  }, [isEditing, user]);

  const hasChanges = useCallback(() => {
    const { form, skills, workPrefs } = initialRefs.current;
    if (!form && !skills && !workPrefs) return false;

    const formChanged =
      form &&
      (form.firstName !== formData.firstName ||
        form.lastName !== formData.lastName ||
        form.headline !== formData.headline ||
        form.linkedin !== formData.linkedin ||
        form.residence.country !== formData.residence.country ||
        form.residence.state !== formData.residence.state ||
        form.residence.city !== formData.residence.city);

    const skillsChanged =
      skills &&
      (JSON.stringify(skills.skills) !== JSON.stringify(skillsFormData.skills) ||
        JSON.stringify(skills.languages) !== JSON.stringify(skillsFormData.languages));

    const workPrefsChanged =
      workPrefs &&
      (workPrefs.workLocation.country !== workPrefsFormData.workLocation.country ||
        workPrefs.workLocation.state !== workPrefsFormData.workLocation.state ||
        workPrefs.workLocation.city !== workPrefsFormData.workLocation.city ||
        workPrefs.timezone !== workPrefsFormData.timezone ||
        workPrefs.timeCommitment !== workPrefsFormData.timeCommitment ||
        workPrefs.compensation !== workPrefsFormData.compensation ||
        workPrefs.workAuth !== workPrefsFormData.workAuth);

    return Boolean(formChanged || skillsChanged || workPrefsChanged);
  }, [formData, skillsFormData, workPrefsFormData]);

  const handleClose = useCallback(() => {
    if (!hasChanges()) {
      setEditing(false);
      return;
    }
    if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
      setEditing(false);
    }
  }, [hasChanges, setEditing]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaveError(null);
      setIsSubmitting(true);

      try {
        switch (activeTab) {
          case "profile": {
            // Basic tab: ONLY /info and /location — never /preference
            const linkedinVal = formData.linkedin?.trim();
            const linkedinUrl = linkedinVal
              ? (linkedinVal.startsWith("http")
                  ? linkedinVal
                  : `https://linkedin.com/in/${stripLinkedInPrefix(linkedinVal)}`)
              : undefined;

            const infoPayload = {
              first_name: formData.firstName.trim() || (user?.first_name ?? ""),
              last_name: formData.lastName.trim() || (user?.last_name ?? ""),
              linkedin: linkedinUrl,
              links: (user?.links ?? []) as string[],
            };

            const residenceCountryIso = getCountryCode(formData.residence.country);
            const locationPayload = stripEmpty({
              country_residence: residenceCountryIso || undefined,
              state_residence: formData.residence.state?.trim() || undefined,
              city_residence: formData.residence.city?.trim() || undefined,
            });

            const infoRes = await userService.updateInfo(infoPayload);
            if (!isApiSuccess(infoRes)) {
              setSaveError(getApiErrorMessage(infoRes.data));
              return;
            }
            setUserInfo(infoPayload);

            if (Object.keys(locationPayload).length > 0) {
              const locationRes = await userService.updateLocation(locationPayload);
              if (!isApiSuccess(locationRes)) {
                setSaveError(getApiErrorMessage(locationRes.data));
                return;
              }
              setUserLocation(locationPayload);
            }

            if (formData.headline && user?.experience?.[0]) {
              const exp = { ...user.experience[0], role: formData.headline };
              useProfileStore.getState().updateWorkLocal(exp);
            } else if (formData.headline && !user?.experience?.length) {
              useProfileStore.getState().addWorkLocal({
                category: "WORK",
                name: "Current Role",
                role: formData.headline,
                description: "",
                start_date: "2024-01",
                end_date: "2024-12",
              });
            }
            break;
          }

          case "skills": {
            // Skills tab: ONLY /preference (skills + languages)
            const preferencePayload = {
              skills: skillsFormData.skills,
              languages: skillsFormData.languages,
            };
            const res = await userService.updatePreferences(
              preferencePayload as Parameters<typeof userService.updatePreferences>[0]
            );
            if (!isApiSuccess(res)) {
              setSaveError(getApiErrorMessage(res.data));
              return;
            }
            setUserPreferences(preferencePayload as Parameters<typeof setUserPreferences>[0]);
            break;
          }

          case "work-preferences": {
            // Work Preferences tab: /location (work) + /preference — explicit payload from state
            // State binding: workLocation.country -> work_country (ISO), workLocation.state -> work_state, etc.
            const work_country = getCountryCode(workPrefsFormData.workLocation.country) || undefined;
            const work_state = workPrefsFormData.workLocation.state?.trim() || undefined;
            const work_city = workPrefsFormData.workLocation.city?.trim() || undefined;
            const timezone = workPrefsFormData.timezone?.trim() || undefined;
            const hours_per_week = workPrefsFormData.timeCommitment?.trim();
            const hoursNum = hours_per_week ? Number(hours_per_week) : undefined;
            const { amount } = parseCurrencyString(workPrefsFormData.compensation);
            const min_compensation = amount ? Number(amount) : undefined;
            const work_permit =
              workPrefsFormData.workAuth === "unspecified"
                ? undefined
                : workPrefsFormData.workAuth === "authorized";

            const locationPayload = stripEmpty({
              work_country: work_country || undefined,
              work_state,
              work_city,
              timezone,
              legally_authorised_to_work: work_permit,
            });

            const preferencePayload = stripEmpty({
              time_commitment_per_week: hoursNum != null && !isNaN(hoursNum) && hoursNum >= 1 ? hoursNum : undefined,
              min_compensation_full_time: min_compensation != null && !isNaN(min_compensation) ? min_compensation : undefined,
              timezone: timezone || undefined,
            });

            const hasLocationFields = Object.keys(locationPayload).length > 0;
            const hasPreferenceFields = Object.keys(preferencePayload).length > 0;

            if (!hasLocationFields && !hasPreferenceFields) {
              setSaveError("Please fill in at least one field to save.");
              return;
            }

            if (hasLocationFields) {
              const locationRes = await userService.updateLocation(locationPayload);
              if (!isApiSuccess(locationRes)) {
                setSaveError(getApiErrorMessage(locationRes.data));
                return;
              }
              setUserLocation(locationPayload);
            }
            if (hasPreferenceFields) {
              const prefRes = await userService.updatePreferences(
                preferencePayload as Parameters<typeof userService.updatePreferences>[0]
              );
              if (!isApiSuccess(prefRes)) {
                setSaveError(getApiErrorMessage(prefRes.data));
                return;
              }
              setUserPreferences(preferencePayload as Parameters<typeof setUserPreferences>[0]);
            }
            break;
          }

          default:
            setSaveError("Unknown tab.");
            return;
        }

        setEditing(false);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save profile.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      activeTab,
      formData,
      skillsFormData,
      workPrefsFormData,
      user,
      setUserInfo,
      setUserLocation,
      setUserPreferences,
      setEditing,
    ]
  );

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (!isEditing) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-zinc-800 px-6">
          <nav className="flex gap-6" aria-label="Edit sections">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "border-white text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {saveError && (
          <div
            className="mx-6 mt-4 shrink-0 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            role="alert"
          >
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "profile" && (
          <div>
            <div className="space-y-6 p-6">
              {/* Row 1: First Name | Last Name side-by-side */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="block text-sm font-medium text-zinc-400">
                    First Name
                  </label>
                  <GlassInput
                    id="firstName"
                    icon={<UserIcon className="h-5 w-5" />}
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="block text-sm font-medium text-zinc-400">
                    Last Name
                  </label>
                  <GlassInput
                    id="lastName"
                    icon={<UserIcon className="h-5 w-5" />}
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Row 2: Email full width */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                  Email
                </label>
                <GlassInput
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full cursor-not-allowed opacity-75"
                  placeholder="you@example.com"
                />
              </div>

              {/* Row 3: Headline */}
              <div className="space-y-1.5">
                <label htmlFor="headline" className="block text-sm font-medium text-zinc-400">
                  Headline
                </label>
                <GlassInput
                  id="headline"
                  icon={<Briefcase className="h-5 w-5" />}
                  value={formData.headline}
                  onChange={handleChange("headline")}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              {/* Row 4: Location */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-400">
                  Location
                </label>
                <LocationGrid
                  type="residence"
                  value={formData.residence}
                  onChange={(v) => setFormData((prev) => ({ ...prev, residence: v }))}
                />
              </div>

              {/* Row 5: LinkedIn */}
              <div className="space-y-1.5">
                <label htmlFor="linkedin" className="block text-sm font-medium text-zinc-400">
                  LinkedIn
                </label>
                <GlassInput
                  id="linkedin"
                  prefixText="linkedin.com/in/"
                  value={stripLinkedInPrefix(formData.linkedin)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedin: e.target.value
                        ? `https://linkedin.com/in/${e.target.value}`
                        : "",
                    }))
                  }
                  placeholder="username"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div>
            <div className="space-y-6 p-6">
              <CreatablePillInput
                label="Skills"
                suggestions={SUGGESTED_SKILLS}
                value={skillsFormData.skills}
                onChange={(skills) => setSkillsFormData((prev) => ({ ...prev, skills }))}
                placeholder="e.g. React, TypeScript"
                maxLimit={12}
              />
              <CreatablePillInput
                label="Languages"
                suggestions={SUGGESTED_LANGUAGES}
                value={skillsFormData.languages}
                onChange={(languages) => setSkillsFormData((prev) => ({ ...prev, languages }))}
                placeholder="e.g. English, Hindi"
                maxLimit={7}
              />
            </div>
          </div>
        )}

        {activeTab === "work-preferences" && (
          <div>
            <div className="space-y-4 p-6">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Globe className="h-4 w-4" />
                  Preferred work location
                </label>
                <LocationGrid
                  type="work"
                  value={workPrefsFormData.workLocation}
                  onChange={(v) =>
                    setWorkPrefsFormData((prev) => ({ ...prev, workLocation: v }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SearchableTimezoneSelect
                  label="Timezone"
                  value={workPrefsFormData.timezone}
                  onChange={(v) =>
                    setWorkPrefsFormData((prev) => ({ ...prev, timezone: v }))
                  }
                  placeholder="Search timezone..."
                />
                <div className="space-y-1.5">
                  <label htmlFor="timeCommitment" className="text-sm font-medium text-zinc-400">
                    Hours per week <span className="text-zinc-500 font-normal">(optional)</span>
                  </label>
                  <GlassInput
                    id="timeCommitment"
                    type="number"
                    min={0}
                    max={168}
                    step={1}
                    value={workPrefsFormData.timeCommitment}
                    onChange={(e) =>
                      setWorkPrefsFormData((prev) => ({ ...prev, timeCommitment: e.target.value }))
                    }
                    placeholder="e.g. 40"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <CurrencyStringInput
                  label="Min. compensation (full-time, per year)"
                  value={workPrefsFormData.compensation}
                  onChange={(v) =>
                    setWorkPrefsFormData((prev) => ({ ...prev, compensation: v }))
                  }
                  placeholder="e.g. 120000"
                />
              </div>
              <div>
                <div className="mb-2 ml-1 flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <Shield className="h-3.5 w-3.5" />
                  Are you permitted to work in the selected country?
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() =>
                      setWorkPrefsFormData((prev) => ({ ...prev, workAuth: "authorized" }))
                    }
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      workPrefsFormData.workAuth === "authorized"
                        ? "border-white/20 bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/20"
                        : "border-white/5 bg-zinc-800/20 text-zinc-400 hover:border-white/10 hover:bg-zinc-800/40 hover:text-zinc-200"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkPrefsFormData((prev) => ({ ...prev, workAuth: "sponsorship" }))
                    }
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      workPrefsFormData.workAuth === "sponsorship"
                        ? "border-white/20 bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/20"
                        : "border-white/5 bg-zinc-800/20 text-zinc-400 hover:border-white/10 hover:bg-zinc-800/40 hover:text-zinc-200"
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    Need Sponsorship
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkPrefsFormData((prev) => ({ ...prev, workAuth: "unspecified" }))
                    }
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      workPrefsFormData.workAuth === "unspecified"
                        ? "border-white/20 bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/20"
                        : "border-white/5 bg-zinc-800/20 text-zinc-400 hover:border-white/10 hover:bg-zinc-800/40 hover:text-zinc-200"
                    }`}
                  >
                    <MinusCircle className="h-4 w-4" />
                    Prefer not to say
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        <ModalFooter onClose={handleClose} isSubmitting={isSubmitting} />
        </form>
      </div>
    </div>
  );
}

function ModalFooter({
  onClose,
  isSubmitting,
}: {
  onClose: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="flex shrink-0 justify-end gap-3 border-t border-zinc-800 px-6 py-4">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <GlassButton
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-500 hover:to-indigo-500 border-none backdrop-blur-none shadow-none active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Saving…" : "Save Changes"}
      </GlassButton>
    </div>
  );
}
