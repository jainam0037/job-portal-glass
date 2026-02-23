"use client";

import { useState, useCallback } from "react";
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

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("experience");
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const user = useProfileStore((s) => s.user);
  const removeWorkLocal = useProfileStore((s) => s.removeWorkLocal);
  const removeEducationLocal = useProfileStore((s) => s.removeEducationLocal);
  const experience = user?.experience ?? [];
  const education = user?.education ?? [];

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
