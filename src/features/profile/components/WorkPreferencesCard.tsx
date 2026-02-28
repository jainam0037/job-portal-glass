"use client";

import { Globe, MapPin, Clock, Banknote, Shield, Pencil } from "lucide-react";
import { getCountryLabel } from "@/lib/constants/countries";
import { useProfileStore } from "@/store/useProfileStore";

const cardBase = "rounded-2xl border border-white/10 bg-white/[0.02] p-6";

export function WorkPreferencesCard() {
  const { user, setEditing } = useProfileStore();

  const residence = [
    user?.city_residence,
    user?.state_residence,
    user?.country_residence ? getCountryLabel(user.country_residence) : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const workLocation = [
    user?.work_city,
    user?.work_state,
    user?.work_country ? getCountryLabel(user.work_country) : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const timezone = user?.timezone;
  const timeCommitment = user?.time_commitment_per_week;
  const compFullTime = user?.min_compensation_full_time;
  const workAuth = user?.legally_authorised_to_work;
  const workAuthDisplay =
    workAuth !== undefined
      ? workAuth
        ? "Yes, permitted to work"
        : "No, requires sponsorship"
      : "Not specified";
  const workAuthEmpty = workAuth === undefined;

  return (
    <div className={cardBase}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Globe className="h-4 w-4" />
          Work Preferences
        </div>
        <button
          type="button"
          onClick={() => setEditing(true, "work-preferences")}
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Edit work preferences"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1">
        <div className="group flex cursor-default items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-blue-500/10">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-blue-400" />
          <span className={`transition-colors group-hover:text-blue-200 ${residence ? "text-zinc-300" : "text-zinc-600"}`}>
            {residence || "Location not set"}
          </span>
        </div>
        <div className="group flex cursor-default items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-emerald-500/10">
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-emerald-400" />
          <span className={`transition-colors group-hover:text-emerald-200 ${workLocation ? "text-zinc-300" : "text-zinc-600"}`}>
            Preferred: {workLocation || "Open to anywhere"}
          </span>
        </div>
        <div className="group flex cursor-default items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-amber-500/10">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-amber-400" />
          <span className={`transition-colors group-hover:text-amber-200 ${timeCommitment != null || timezone ? "text-zinc-300" : "text-zinc-600"}`}>
            {[timeCommitment != null && `${timeCommitment} hrs/week`, timezone].filter(Boolean).join(" • ") || "Not specified"}
          </span>
        </div>
        <div className="group flex cursor-default items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-yellow-500/10">
          <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-yellow-400" />
          <span className={`transition-colors group-hover:text-yellow-200 ${compFullTime != null ? "text-zinc-300" : "text-zinc-600"}`}>
            {compFullTime != null ? `$${compFullTime.toLocaleString()}/yr` : "Not specified"}
          </span>
        </div>
        <div className="group flex cursor-default items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-violet-500/10">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-violet-400" />
          <span className={`transition-colors group-hover:text-violet-200 ${!workAuthEmpty ? "text-zinc-300" : "text-zinc-600"}`}>
            {workAuthDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}
