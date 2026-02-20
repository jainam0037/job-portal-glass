"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Briefcase, FolderKanban } from "lucide-react";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { userService } from "@/services/userService";
import { useProfileStore } from "@/store/useProfileStore";
import { isApiSuccess, getApiErrorMessage } from "@/lib/validations/api";
import type { WorkItem } from "@/lib/validations/user";

type Category = "WORK" | "PROJECT";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-800/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-white/20 focus:ring-1 focus:ring-white/20";

const labelClass = "mb-1.5 ml-1 block text-xs font-medium text-zinc-400";

interface AddWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided, modal operates in edit mode */
  initialItem?: WorkItem | null;
}

const initialForm = {
  category: "WORK" as Category,
  name: "",
  role: "",
  city: "",
  country: "",
  start_date: null as string | null,
  end_date: null as string | null,
  description: "",
  isCurrent: false,
};

export function AddWorkModal({ isOpen, onClose, initialItem }: AddWorkModalProps) {
  const addWorkLocal = useProfileStore((s) => s.addWorkLocal);
  const updateWorkLocal = useProfileStore((s) => s.updateWorkLocal);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initialItem?.id);

  useEffect(() => {
    if (isOpen && initialItem) {
      const now = new Date();
      const currentYyyymm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      setForm({
        category: (initialItem.category as Category) ?? "WORK",
        name: initialItem.name ?? "",
        role: initialItem.role ?? "",
        city: initialItem.city ?? "",
        country: initialItem.country ?? "",
        start_date: initialItem.start_date ?? null,
        end_date: initialItem.end_date ?? null,
        description: initialItem.description ?? "",
        isCurrent: !initialItem.end_date || initialItem.end_date === currentYyyymm,
      });
    }
  }, [isOpen, initialItem]);

  const handleClose = useCallback(() => {
    setForm(initialForm);
    setError(null);
    onClose();
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Company or project name is required");
      return;
    }
    if (!form.start_date) {
      setError("Start date is required");
      return;
    }
    let endDate: string;
    if (form.isCurrent) {
      const now = new Date();
      endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    } else {
      if (!form.end_date) {
        setError("End date is required (or check 'I currently work here')");
        return;
      }
      endDate = form.end_date;
    }

    setIsSubmitting(true);
    setError(null);

    const workPayload = {
      category: form.category,
      name: form.name.trim(),
      role: form.role.trim() || undefined,
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
      description: form.description.trim() || "",
      start_date: form.start_date,
      end_date: endDate,
    };

    if (isEdit && initialItem?.id) {
      const res = await userService.updateWork({
        work: { ...workPayload, id: initialItem.id },
      } as Parameters<typeof userService.updateWork>[0]);
      if (isApiSuccess(res)) {
        updateWorkLocal({
          ...res.data,
          id: res.data.id,
          category: res.data.category,
          name: res.data.name,
          role: res.data.role,
          city: res.data.city,
          country: res.data.country,
          description: res.data.description,
          start_date: res.data.start_date,
          end_date: res.data.end_date ?? "",
        });
        handleClose();
      } else {
        setError(getApiErrorMessage(res.data));
      }
    } else {
      const res = await userService.addWork({
        work: workPayload,
      } as Parameters<typeof userService.addWork>[0]);
      if (isApiSuccess(res)) {
        const created: WorkItem = {
          ...res.data,
          id: res.data.id,
          category: res.data.category,
          name: res.data.name,
          role: res.data.role,
          city: res.data.city,
          country: res.data.country,
          description: res.data.description,
          start_date: res.data.start_date,
          end_date: res.data.end_date ?? undefined,
        };
        addWorkLocal(created);
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
            {isEdit ? "Edit Experience" : "Add Experience"}
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
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {/* Work / Project segmented control */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-zinc-800/50 p-1">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: "WORK" }))}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                  form.category === "WORK"
                    ? "rounded-md bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Work
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: "PROJECT" }))}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                  form.category === "PROJECT"
                    ? "rounded-md bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FolderKanban className="h-4 w-4" />
                Project
              </button>
            </div>
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-2 gap-5">
            {/* Row 1: Company Name (col-span-2) */}
            <div className="col-span-2">
              <label className={labelClass}>
                {form.category === "WORK" ? "Company" : "Project"} Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={
                  form.category === "WORK"
                    ? "e.g. Acme Corp"
                    : "e.g. Personal Portfolio"
                }
                required
                className={inputClass}
              />
            </div>

            {/* Row 2: Role, City */}
            <div>
              <label className={labelClass}>Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Senior Engineer"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="e.g. San Francisco"
                className={inputClass}
              />
            </div>

            {/* Row 3: Country, Start Date */}
            <div>
              <CountrySelect
                label="Country"
                value={form.country}
                onChange={(v) => setForm((f) => ({ ...f, country: v }))}
                placeholder="Select country"
              />
            </div>
            <div>
              <MonthYearPicker
                label="Start Date"
                value={form.start_date}
                onChange={(v) => setForm((f) => ({ ...f, start_date: v }))}
              />
            </div>

            {/* Row 4: End Date (aligned with Start Date) */}
            <div />
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="text-xs font-medium text-zinc-400">
                  End Date
                </label>
                <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isCurrent: e.target.checked,
                        end_date: e.target.checked ? null : f.end_date,
                      }))
                  }
                    className="rounded border-white/10 bg-zinc-800/50 accent-white"
                  />
                  Current role
                </label>
              </div>
              {!form.isCurrent && (
                <MonthYearPicker
                  value={form.end_date}
                  onChange={(v) => setForm((f) => ({ ...f, end_date: v }))}
                />
              )}
            </div>

            {/* Description (col-span-2) */}
            <div className="col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What did you do?"
                maxLength={1000}
                rows={5}
                className={`h-32 w-full resize-none ${inputClass}`}
              />
              <p className="mt-1 text-xs text-zinc-500">
                {form.description.length}/1000
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-white/5 p-6">
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
              className="rounded-xl bg-white px-8 py-3 font-medium text-black shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 disabled:opacity-60"
            >
              {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Experience"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
