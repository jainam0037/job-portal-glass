"use client";

import { Pencil } from "lucide-react";
import { getCountryLabel } from "@/lib/constants/countries";
import { useProfileStore } from "@/store/useProfileStore";

const cardBase = "mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6";

function CardHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label={`Edit ${title}`}
          suppressHydrationWarning
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function DataCell({
  label,
  value,
  isEmpty,
}: {
  label: string;
  value: string;
  isEmpty: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className={isEmpty ? "mt-1 text-sm text-zinc-500" : "mt-1 text-sm text-white"}>
        {value}
      </p>
    </div>
  );
}

export function ProfileOverview() {
  const { user, setEditing } = useProfileStore();

  const residence = [
    user?.city_residence,
    user?.state_residence,
    user?.country_residence ? getCountryLabel(user.country_residence) : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const residenceDisplay = residence || "Not specified";
  const residenceEmpty = !residence;

  const timezoneDisplay = user?.timezone || "Not specified";
  const timezoneEmpty = !user?.timezone;

  const workLocation = [
    user?.work_city,
    user?.work_state,
    user?.work_country ? getCountryLabel(user.work_country) : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  const workLocationDisplay = workLocation || "Open to anywhere";
  const workLocationEmpty = !workLocation;

  const workAuthValue =
    user?.legally_authorised_to_work === true
      ? "Authorized"
      : user?.legally_authorised_to_work === false
        ? "Requires Sponsorship"
        : "Not specified";
  const workAuthEmpty = user?.legally_authorised_to_work == null;

  const timeCommitmentDisplay =
    user?.time_commitment_per_week != null
      ? `${user.time_commitment_per_week} hrs/week`
      : "Not specified";
  const timeCommitmentEmpty = user?.time_commitment_per_week == null;

  const fullTimeCompDisplay =
    user?.min_compensation_full_time != null
      ? `$${user.min_compensation_full_time.toLocaleString()}/yr`
      : "Not specified";
  const fullTimeCompEmpty = user?.min_compensation_full_time == null;

  const partTimeCompDisplay =
    user?.min_compensation_part_time != null
      ? `$${user.min_compensation_part_time}/hr`
      : "Not specified";
  const partTimeCompEmpty = user?.min_compensation_part_time == null;

  const skills = user?.skills ?? [];
  const languages = user?.languages ?? [];

  return (
    <div className="space-y-6">
      {/* Location & Authorization */}
      <div className={cardBase}>
        <CardHeader title="Location & Authorization" onEdit={() => setEditing(true)} />
        <div className="grid grid-cols-2 gap-6">
          <DataCell
            label="Residence"
            value={residenceDisplay}
            isEmpty={residenceEmpty}
          />
          <DataCell
            label="Timezone"
            value={timezoneDisplay}
            isEmpty={timezoneEmpty}
          />
          <DataCell
            label="Preferred Work Location"
            value={workLocationDisplay}
            isEmpty={workLocationEmpty}
          />
          <DataCell
            label="Work Authorization"
            value={workAuthValue}
            isEmpty={workAuthEmpty}
          />
        </div>
      </div>

      {/* Work Preferences */}
      <div className={cardBase}>
        <CardHeader title="Work Preferences" onEdit={() => setEditing(true)} />
        <div className="grid grid-cols-2 gap-6">
          <DataCell
            label="Time Commitment"
            value={timeCommitmentDisplay}
            isEmpty={timeCommitmentEmpty}
          />
          <DataCell
            label="Full-Time Comp"
            value={fullTimeCompDisplay}
            isEmpty={fullTimeCompEmpty}
          />
          <DataCell
            label="Part-Time Comp"
            value={partTimeCompDisplay}
            isEmpty={partTimeCompEmpty}
          />
        </div>
      </div>

      {/* Skills & Languages */}
      <div className={cardBase}>
        <CardHeader title="Skills & Languages" onEdit={() => setEditing(true)} />
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Skills
            </p>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={`${skill}-${i}`}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No skills added yet</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Languages
            </p>
            {languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, i) => (
                  <span
                    key={`${lang}-${i}`}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm text-white"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No languages added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
