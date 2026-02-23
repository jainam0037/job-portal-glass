"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Eye, FileText, Trash2, Code, Pencil, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { userService } from "@/services/userService";
import { isApiSuccess, getApiErrorMessage } from "@/lib/validations/api";

const cardBase = "rounded-2xl border border-white/10 bg-white/[0.02] p-6";

function formatRelativeTime(timestamp: number): string {
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 2592000) return `${Math.floor(sec / 86400)}d ago`;
  return `${Math.floor(sec / 2592000)}mo ago`;
}

export function ProfileMetadataSidebar() {
  const { user, setUserResume, setEditing } = useProfileStore();
  const [isUploading, setIsUploading] = useState(false);
  const [resumeToast, setResumeToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const resume = user?.resume ? { url: user.resume, name: "Resume", uploadedAt: Date.now() } : null;

  const RESUME_ACCEPT = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  } as const;

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setResumeToast({ type, message });
    setTimeout(() => setResumeToast(null), 4000);
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setResumeToast(null);
      setIsUploading(true);
      try {
        const res = await userService.uploadResume(file);
        if (isApiSuccess(res)) {
          const url = typeof res.data === "object" && res.data && "url" in res.data
            ? (res.data as { url: string }).url
            : typeof res.data === "string"
              ? res.data
              : null;
          setUserResume(url);
          showToast("success", "Resume uploaded successfully.");
        } else {
          showToast("error", getApiErrorMessage(res.data));
        }
      } catch (err) {
        showToast("error", err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    },
    [setUserResume, showToast]
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const first = fileRejections[0];
    const msg = first?.errors?.[0]?.message ?? "Invalid file. Use PDF or Word, max 5MB.";
    setResumeToast({ type: "error", message: msg });
    setTimeout(() => setResumeToast(null), 4000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: RESUME_ACCEPT,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: !!resume || isUploading,
  });

  const handleDeleteResume = useCallback(async () => {
    if (resume?.url && resume.url.startsWith("blob:")) URL.revokeObjectURL(resume.url);
    setResumeToast(null);
    const res = await userService.deleteResume();
    if (isApiSuccess(res)) {
      setUserResume(null);
    } else {
      setResumeToast({ type: "error", message: getApiErrorMessage(res.data) });
      setTimeout(() => setResumeToast(null), 4000);
    }
  }, [resume?.url, setUserResume]);

  const skills = user?.skills ?? [];
  const languages = user?.languages ?? [];

  return (
    <aside className="flex flex-col gap-6">
      {/* Card A: Resume Dropzone */}
      <div className={cardBase}>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
          <FileText className="h-4 w-4" />
          Resume
        </h3>
        {resumeToast && (
          <div
            className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
              resumeToast.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
            role="alert"
          >
            {resumeToast.message}
          </div>
        )}
        {resume ? (
          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20">
              <FileText className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm font-medium text-white underline-offset-2 hover:text-indigo-300 hover:underline"
              >
                {resume.name}
              </a>
              <p className="mt-0.5 text-xs text-zinc-500">
                Updated {formatRelativeTime(resume.uploadedAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-indigo-400"
                aria-label="Preview resume"
              >
                <Eye className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={handleDeleteResume}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-red-400"
                aria-label="Delete resume"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
              {...getRootProps()}
              className={`flex min-h-[100px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-all ${
                isUploading
                  ? "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-70"
                  : isDragActive
                    ? "cursor-pointer border-indigo-500 bg-indigo-500/10"
                    : "cursor-pointer border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                  <p className="mt-2 text-sm font-medium text-zinc-400">Uploading...</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-400">
                    {isDragActive ? "Drop here..." : "Drop Resume"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    PDF or Word (.doc, .docx) — max 5MB
                  </p>
                </>
              )}
            </div>
        )}
      </div>

      {/* Card B: Skills & Languages */}
      <div className={cardBase}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Code className="h-4 w-4" />
            Skills & Languages
          </div>
          <button
            type="button"
            onClick={() => setEditing(true, "skills")}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Edit skills and languages"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Top Skills
            </h4>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={`${skill}-${i}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">No skills added</p>
            )}
          </div>
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Languages
            </h4>
            {languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, i) => (
                  <span
                    key={`${lang}-${i}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:text-white"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">No languages added</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
