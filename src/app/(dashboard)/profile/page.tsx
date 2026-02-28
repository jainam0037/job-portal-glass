"use client";

import { useState, useCallback, useEffect } from "react";
import { ProfileHero } from "@/features/profile/components/ProfileHero";
import { ProfileMetadataSidebar } from "@/features/profile/components/ProfileMetadataSidebar";
import { EditProfileModal } from "@/features/profile/components/EditProfileModal";
import { AddWorkModal } from "@/features/profile/components/AddWorkModal";
import { AddEducationModal } from "@/features/profile/components/AddEducationModal";
import { ExperienceTimeline } from "@/features/profile/components/ExperienceTimeline";
import { EducationTimeline } from "@/features/profile/components/EducationTimeline";
import { WorkPreferencesCard } from "@/features/profile/components/WorkPreferencesCard";
import { useProfileStore } from "@/store/useProfileStore";
import { userService } from "@/services/userService";
import { isApiSuccess, getApiErrorMessage } from "@/lib/validations/api";
import type { WorkItem, EducationItem } from "@/lib/validations/user";

type Tab = "experience" | "education" | "preferences";

/** Skeleton for profile hero + sidebar while initial fetch runs */
function ProfilePageSkeleton() {
  return (
    <div className="px-4 pb-16 pt-8 animate-pulse">
      <div className="mx-auto max-w-6xl">
        {/* Hero skeleton */}
        <div className="w-full border-b border-zinc-800 pb-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div className="h-24 w-24 rounded-full bg-zinc-800" />
              <div className="flex flex-col items-center gap-2 md:items-start">
                <div className="h-6 w-40 rounded bg-zinc-800" />
                <div className="h-4 w-32 rounded bg-zinc-800/80" />
                <div className="h-4 w-48 rounded bg-zinc-800/60" />
              </div>
            </div>
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="h-10 w-48 rounded bg-zinc-800/60" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-zinc-800/40" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-32 rounded-xl bg-zinc-800/40" />
            <div className="h-40 rounded-xl bg-zinc-800/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("experience");
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const user = useProfileStore((s) => s.user);
  const isFetching = useProfileStore((s) => s.isFetching);
  const fetchUser = useProfileStore((s) => s.fetchUser);
  const removeWorkLocal = useProfileStore((s) => s.removeWorkLocal);
  const removeEducationLocal = useProfileStore((s) => s.removeEducationLocal);
  const experience = user?.experience ?? [];
  const education = user?.education ?? [];

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleDeleteWork = useCallback(
    async (item: WorkItem) => {
      if (!item.id) return;
      if (!window.confirm(`Delete "${item.name}" from your experience?`)) return;
      setDeleteError(null);
      const res = await userService.deleteWork(item.id);
      if (isApiSuccess(res)) {
        removeWorkLocal(item.id);
      } else {
        setDeleteError(getApiErrorMessage(res.data));
      }
    },
    [removeWorkLocal]
  );

  const handleDeleteEducation = useCallback(
    async (item: EducationItem) => {
      if (!item.id) return;
      const label = item.college || "this education";
      if (!window.confirm(`Delete "${label}" from your education?`)) return;
      setDeleteError(null);
      const res = await userService.deleteEducation(item.id);
      if (isApiSuccess(res)) {
        removeEducationLocal(item.id);
      } else {
        setDeleteError(getApiErrorMessage(res.data));
      }
    },
    [removeEducationLocal]
  );

  if (!user && isFetching) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="px-4 pb-16 pt-8">
      <div className="mx-auto max-w-6xl">
        <ProfileHero />

        {/* Grid: 2/3 main + 1/3 sidebar */}
        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Left Column - Main Feed */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Premium underline tabs */}
            <div className="-mb-px flex gap-8 border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("experience")}
                suppressHydrationWarning
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "experience"
                    ? "-mb-px border-b-2 border-white text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Experience
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("education")}
                suppressHydrationWarning
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "education"
                    ? "-mb-px border-b-2 border-white text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Education
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                suppressHydrationWarning
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "preferences"
                    ? "-mb-px border-b-2 border-white text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Work Preferences
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "experience" && (
              <div className="mt-6">
                {deleteError && (
                  <p className="mb-4 text-sm text-red-400">{deleteError}</p>
                )}
                <ExperienceTimeline
                  items={experience}
                  onAddClick={() => {
                    setEditingWork(null);
                    setIsAddWorkOpen(true);
                  }}
                  onEditClick={(item) => {
                    setEditingWork(item);
                    setIsAddWorkOpen(true);
                  }}
                  onDeleteClick={handleDeleteWork}
                />
              </div>
            )}
            {activeTab === "education" && (
              <div className="mt-6">
                {deleteError && (
                  <p className="mb-4 text-sm text-red-400">{deleteError}</p>
                )}
                <EducationTimeline
                  items={education}
                  onAddClick={() => {
                    setEditingEducation(null);
                    setIsAddEducationOpen(true);
                  }}
                  onEditClick={(item) => {
                    setEditingEducation(item);
                    setIsAddEducationOpen(true);
                  }}
                  onDeleteClick={handleDeleteEducation}
                />
              </div>
            )}
            {activeTab === "preferences" && (
              <div className="mt-6">
                <WorkPreferencesCard />
              </div>
            )}
          </div>

          {/* Right Column - Glassmorphic Cards */}
          <div className="flex flex-col gap-6">
            <ProfileMetadataSidebar />
          </div>
        </div>
      </div>
      <EditProfileModal />
      <AddWorkModal
        isOpen={isAddWorkOpen}
        onClose={() => {
          setIsAddWorkOpen(false);
          setEditingWork(null);
        }}
        initialItem={editingWork}
      />
      <AddEducationModal
        isOpen={isAddEducationOpen}
        onClose={() => {
          setIsAddEducationOpen(false);
          setEditingEducation(null);
        }}
        initialItem={editingEducation}
      />
    </div>
  );
}
