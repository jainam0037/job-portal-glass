"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { userService } from "@/services/userService";
import { useProfileStore } from "@/store/useProfileStore";
import { isApiSuccess, getApiErrorMessage } from "@/lib/validations/api";
import type { EducationItem } from "@/lib/validations/user";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-800/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-white/20 focus:ring-1 focus:ring-white/20";

const labelClass = "mb-1.5 ml-1 block text-xs font-medium text-zinc-400";

interface AddEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided, modal operates in edit mode */
  initialItem?: EducationItem | null;
}

const initialForm = {
  college: "",
  degree: "",
  major: "",
  CGPA: "" as string | number,
  start_date: null as string | null,
  graduation_date: null as string | null,
  isCurrent: false,
};

export function AddEducationModal({ isOpen, onClose, initialItem }: AddEducationModalProps) {
  const addEducationLocal = useProfileStore((s) => s.addEducationLocal);
  const updateEducationLocal = useProfileStore((s) => s.updateEducationLocal);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initialItem?.id);

  useEffect(() => {
    if (isOpen && initialItem) {
      setForm({
        college: initialItem.college ?? "",
        degree: initialItem.degree ?? "",
        major: initialItem.major ?? "",
        CGPA: initialItem.CGPA ?? "",
        start_date: initialItem.start_date ?? null,
        graduation_date: initialItem.graduation_date ?? null,
        isCurrent: !initialItem.graduation_date,
      });
    } else if (!isOpen) {
      setForm(initialForm);
    }
  }, [isOpen, initialItem]);

  const handleClose = useCallback(() => {
    setForm(initialForm);
    setError(null);
    onClose();
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const graduationDate = form.isCurrent
      ? undefined
      : form.graduation_date ?? undefined;

    const cgpaNum = form.CGPA === "" ? undefined : parseFloat(String(form.CGPA));
    if (form.CGPA !== "" && (isNaN(cgpaNum!) || cgpaNum! < 0 || cgpaNum! > 10)) {
      setError("CGPA must be between 0 and 10");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      educations: {
        college: form.college.trim() || undefined,
        degree: form.degree.trim() || undefined,
        major: form.major.trim() || undefined,
        CGPA: cgpaNum,
        start_date: form.start_date || undefined,
        ...(graduationDate && { graduation_date: graduationDate }),
      },
    };

    if (isEdit && initialItem?.id) {
      const res = await userService.updateEducation({
        educations: {
          ...payload.educations,
          id: initialItem.id,
        },
      } as Parameters<typeof userService.updateEducation>[0]);
      if (isApiSuccess(res)) {
        updateEducationLocal({
          ...res.data,
          id: res.data.id,
          college: res.data.college,
          degree: res.data.degree,
          major: res.data.major,
          CGPA: res.data.CGPA,
          start_date: res.data.start_date,
          graduation_date: res.data.graduation_date,
        });
        handleClose();
      } else {
        setError(getApiErrorMessage(res.data));
      }
    } else {
      const res = await userService.addEducation(
        payload as Parameters<typeof userService.addEducation>[0]
      );
      if (isApiSuccess(res)) {
        const created: EducationItem = {
          ...res.data,
          id: res.data.id,
          college: res.data.college,
          degree: res.data.degree,
          major: res.data.major,
          CGPA: res.data.CGPA,
          start_date: res.data.start_date,
          graduation_date: res.data.graduation_date,
        };
        addEducationLocal(created);
        handleClose();
      } else {
        setError(getApiErrorMessage(res.data));
      }
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="mx-4 flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? "Edit Education" : "Add Education"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-5">
            {/* Row 1: College / University (col-span-2) */}
            <div className="col-span-2">
              <label className={labelClass}>College / University</label>
              <input
                type="text"
                value={form.college}
                onChange={(e) =>
                  setForm((f) => ({ ...f, college: e.target.value }))
                }
                placeholder="e.g. MIT, Stanford"
                className={inputClass}
              />
            </div>

            {/* Row 2: Degree, Major */}
            <div>
              <label className={labelClass}>Degree</label>
              <input
                type="text"
                value={form.degree}
                onChange={(e) =>
                  setForm((f) => ({ ...f, degree: e.target.value }))
                }
                placeholder="e.g. B.Tech, MBA"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Major</label>
              <input
                type="text"
                value={form.major}
                onChange={(e) =>
                  setForm((f) => ({ ...f, major: e.target.value }))
                }
                placeholder="e.g. Computer Science"
                className={inputClass}
              />
            </div>

            {/* Row 3: CGPA (col-span-2) */}
            <div className="col-span-2">
              <label className={labelClass}>CGPA (0–10)</label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.01}
                value={form.CGPA}
                onChange={(e) =>
                  setForm((f) => ({ ...f, CGPA: e.target.value }))
                }
                placeholder="e.g. 8.5"
                className={inputClass}
              />
            </div>

            {/* Row 4: Start Date (col-1), Graduation Date + Checkbox (col-2) */}
            <div>
              <MonthYearPicker
                label="Start Date"
                value={form.start_date}
                onChange={(v) => setForm((f) => ({ ...f, start_date: v }))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="text-xs font-medium text-zinc-400">
                  Graduation Date
                </label>
                <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isCurrent: e.target.checked,
                        graduation_date: e.target.checked ? null : f.graduation_date,
                      }))
                    }
                    className="rounded border-white/10 bg-zinc-800/50 accent-white"
                  />
                  Current student
                </label>
              </div>
              {!form.isCurrent && (
                <MonthYearPicker
                  value={form.graduation_date}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, graduation_date: v }))
                  }
                />
              )}
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-4 border-t border-white/5 p-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-white px-8 py-3 text-sm font-medium text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all hover:bg-zinc-200 disabled:opacity-60"
            >
              {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Education"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
