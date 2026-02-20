"use client";

import { Briefcase, FolderKanban, MapPin, Pencil, Trash2 } from "lucide-react";
import { countryCodes } from "@/data/countries";
import type { WorkItem } from "@/lib/validations/user";

function formatDate(yyyymm: string) {
  const [y, m] = yyyymm.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[parseInt(m ?? "1", 10) - 1];
  return `${monthName} ${y}`;
}

/** Show "Present" when end_date is null/undefined or is the current month (current role) */
function formatDateRange(startDate: string, endDate?: string | null): string {
  const start = formatDate(startDate);
  if (!endDate) return `${start} – Present`;
  const now = new Date();
  const currentYyyymm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (endDate === currentYyyymm) return `${start} – Present`;
  return `${start} – ${formatDate(endDate)}`;
}

function getCountryName(code: string): string {
  return countryCodes.find((c) => c.code === code)?.name ?? code;
}

interface ExperienceTimelineProps {
  items: WorkItem[];
  onAddClick: () => void;
  onEditClick?: (item: WorkItem) => void;
  onDeleteClick?: (item: WorkItem) => void;
}

export function ExperienceTimeline({
  items,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: ExperienceTimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Timeline</h3>
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-white/5 hover:text-indigo-300"
        >
          <span className="text-lg">+</span>
          Add Experience
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-zinc-500">No experience added yet.</p>
          <button
            type="button"
            onClick={onAddClick}
            className="mt-3 text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            + Add your first experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id ?? item.name}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    item.category === "WORK"
                      ? "bg-blue-500/20"
                      : "bg-indigo-500/20"
                  }`}
                >
                  {item.category === "WORK" ? (
                    <Briefcase className="h-5 w-5 text-blue-400" />
                  ) : (
                    <FolderKanban className="h-5 w-5 text-indigo-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  {item.role && (
                    <p className="mt-0.5 text-sm text-zinc-400">{item.role}</p>
                  )}
                  {(item.city || item.country) && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {[
                        item.city,
                        item.country ? getCountryName(item.country) : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDateRange(item.start_date, item.end_date)}
                  </p>
                  {item.description && (
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
                {(onEditClick || onDeleteClick) && (
                  <div className="flex shrink-0 items-center gap-1">
                    {onEditClick && (
                      <button
                        type="button"
                        onClick={() => onEditClick(item)}
                        disabled={!item.id}
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Edit"
                        title={!item.id ? "Save to enable edit" : "Edit"}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {onDeleteClick && (
                      <button
                        type="button"
                        onClick={() => onDeleteClick(item)}
                        disabled={!item.id}
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Delete"
                        title={!item.id ? "Save to enable delete" : "Delete"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
