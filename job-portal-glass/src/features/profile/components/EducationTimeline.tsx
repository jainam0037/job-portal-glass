"use client";

import { GraduationCap, Pencil, Trash2 } from "lucide-react";
import type { EducationItem } from "@/lib/validations/user";

function formatDate(yyyymm: string) {
  const [y, m] = yyyymm.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[parseInt(m ?? "1", 10) - 1];
  return `${monthName} ${y}`;
}

/** Format education date range. graduation_date null/undefined = "Present" (current student) */
function formatEducationDateRange(
  startDate?: string | null,
  graduationDate?: string | null
): string {
  if (!startDate && !graduationDate) return "";
  const start = startDate ? formatDate(startDate) : "";
  const end = graduationDate ? formatDate(graduationDate) : "Present";
  return start ? `${start} – ${end}` : end;
}

interface EducationTimelineProps {
  items: EducationItem[];
  onAddClick: () => void;
  onEditClick?: (item: EducationItem) => void;
  onDeleteClick?: (item: EducationItem) => void;
}

export function EducationTimeline({
  items,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: EducationTimelineProps) {
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
          Add Education
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-zinc-500">No education added yet.</p>
          <button
            type="button"
            onClick={onAddClick}
            className="mt-3 text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            + Add your first education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id ?? item.college}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                  <GraduationCap className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {item.college || "Unknown College"}
                  </p>
                  {(item.degree || item.major) && (
                    <p className="mt-0.5 text-sm text-zinc-400">
                      {[item.degree, item.major].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  {item.CGPA != null && (
                    <p className="mt-1 text-xs text-zinc-500">CGPA: {item.CGPA}</p>
                  )}
                  {(item.start_date || item.graduation_date !== undefined) && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatEducationDateRange(item.start_date, item.graduation_date)}
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
