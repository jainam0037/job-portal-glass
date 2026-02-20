"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, FileText, Search, Trash2, X } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { TOP_SKILLS } from "@/data/skillsList";
import { useProfileStore } from "@/store/useProfileStore";

function formatRelativeTime(timestamp: number): string {
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 2592000) return `${Math.floor(sec / 86400)}d ago`;
  return `${Math.floor(sec / 2592000)}mo ago`;
}

export function ProfileSidebar() {
  const { user, setUserResume, setUserPreferences } = useProfileStore();

  const [skillInput, setSkillInput] = useState("");
  const [resumeError, setResumeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resume = user?.resume ? { url: user.resume, name: "Resume", uploadedAt: Date.now() } : null;

  const RESUME_ACCEPT = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      [".docx"],
  } as const;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setResumeError(null);
      const file = acceptedFiles[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setUserResume(url);
      }
    },
    [setUserResume]
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const first = fileRejections[0];
    if (first?.errors?.[0]) {
      const { code, message } = first.errors[0];
      if (code === "file-invalid-type") {
        setResumeError("Please upload only PDF or Word (.doc, .docx) files.");
      } else if (code === "file-too-large") {
        setResumeError("File is too large. Maximum size is 5MB.");
      } else {
        setResumeError(message);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    onFileDialogOpen: () => setResumeError(null),
    onDragEnter: () => setResumeError(null),
    accept: RESUME_ACCEPT,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: !!resume,
  });

  const handleDeleteResume = useCallback(() => {
    if (resume?.url && resume.url.startsWith("blob:")) URL.revokeObjectURL(resume.url);
    setUserResume(null);
  }, [resume?.url, setUserResume]);

  const skills = user?.skills ?? [];
  const skillsSet = useMemo(
    () => new Set(skills.map((s) => s.trim().toLowerCase())),
    [skills]
  );

  const autocompleteMatches = useMemo(() => {
    const q = skillInput.trim().toLowerCase();
    if (!q) return [];
    const filtered = TOP_SKILLS.filter(
      (s) =>
        s.toLowerCase().includes(q) &&
        !skillsSet.has(s.toLowerCase())
    );
    // Prioritize "starts with" over "contains"
    const startsWith = filtered.filter((s) =>
      s.toLowerCase().startsWith(q)
    );
    const contains = filtered.filter((s) =>
      !s.toLowerCase().startsWith(q)
    );
    return [...startsWith, ...contains].slice(0, 8);
  }, [skillInput, skillsSet]);

  const addSkill = useCallback(
    (skill: string) => {
      const current = user?.skills ?? [];
      if (current.some((s) => s.trim().toLowerCase() === skill.trim().toLowerCase()))
        return;
      setUserPreferences({ skills: [...current, skill.trim()] });
      setSkillInput("");
      inputRef.current?.focus();
    },
    [user?.skills, setUserPreferences]
  );

  const handleInputSubmit = useCallback(() => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    const match = autocompleteMatches[0];
    const toAdd = match && match.toLowerCase().startsWith(trimmed.toLowerCase())
      ? match
      : trimmed;
    addSkill(toAdd);
  }, [skillInput, autocompleteMatches, addSkill]);

  const removeSkill = useCallback(
    (index: number) => {
      const current = user?.skills ?? [];
      setUserPreferences({
        skills: current.filter((_, i) => i !== index),
      });
    },
    [user?.skills, setUserPreferences]
  );

  const skillsCount = skills.filter((s) => s?.trim()).length;

  return (
    <aside className="space-y-6">
      {/* Resume Widget */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Resume</h3>
        {resume ? (
          <div className="flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20">
              <FileText className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm font-medium text-white underline-offset-2 hover:underline hover:text-indigo-300"
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
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-indigo-400"
                aria-label="Preview resume"
              >
                <Eye className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={handleDeleteResume}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-red-400"
                aria-label="Delete resume"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-all ${
              isDragActive
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-sm font-medium text-zinc-400">
              {isDragActive ? "Drop here..." : "Drop Resume"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              PDF or Word (.doc, .docx) — max 5MB
            </p>
            {resumeError && (
              <p className="mt-3 text-xs text-red-400" role="alert">
                {resumeError}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Skills (Global Autocomplete) */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Skills</h3>
        <div className="space-y-4">
          {/* Active skills (top) */}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {skills.map((skill, i) => (
                <motion.span
                  key={`${skill}-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="group flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white transition-all hover:border-zinc-500"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="rounded-full p-0.5 text-zinc-400 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Input with autocomplete (middle) */}
          <div className="relative">
            <GlassInput
              ref={inputRef}
              icon={<Search className="h-4 w-4" />}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleInputSubmit();
                }
              }}
              placeholder="Add a skill (e.g. Python)..."
              className="text-sm"
            />
            {skillInput.trim() && (
              <div
                className="absolute top-full left-0 right-0 z-10 mt-1 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
                role="listbox"
              >
                {autocompleteMatches.length > 0 ? (
                  <ul className="max-h-48 overflow-auto">
                    {autocompleteMatches.map((skill) => (
                      <li key={skill} role="option">
                        <button
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="flex w-full items-center px-4 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                        >
                          {skill}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-3 text-xs text-zinc-500">
                    No matches — press <kbd className="rounded bg-zinc-700 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> to add &quot;{skillInput.trim()}&quot; as a custom skill
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-500">
            {skillsCount < 5
              ? "Add 5+ skills to stand out"
              : "Looking great! ✓"}
          </p>
        </div>
      </section>
    </aside>
  );
}
