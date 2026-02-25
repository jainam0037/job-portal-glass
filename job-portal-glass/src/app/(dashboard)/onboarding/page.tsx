"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileUp, MessageCircle, GraduationCap, Briefcase, Trash2, Plus, CheckCircle } from "lucide-react";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { userService } from "@/services/userService";
import { useProfileStore } from "@/store/useProfileStore";
import { isApiSuccess, getApiErrorMessage, type ApiError } from "@/lib/validations/api";

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-white/20 focus:ring-1 focus:ring-white/20";

const textareaClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-white/20 focus:ring-1 focus:ring-white/20 resize-none";

const labelClass = "mb-2 block text-sm font-medium text-zinc-400";

type EducationEntry = {
  college: string;
  degree: string;
  major: string;
  CGPA: string;
  start_date: string | null;
  graduation_date: string | null;
};

type ExperienceEntry = {
  category: "WORK";
  name: string;
  role: string;
  city: string;
  country: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  isCurrent: boolean;
};

const IIT_WHATSAPP_LINK = "https://chat.whatsapp.com/L7ZEuoTB1k51v5kDWgvZwS";
const DEFAULT_WHATSAPP_LINK = "https://chat.whatsapp.com/KsqJj2X3Ogy7trjj5TyLSR";

const initialEducationEntry = (): EducationEntry => ({
  college: "",
  degree: "",
  major: "",
  CGPA: "",
  start_date: null,
  graduation_date: null,
});

const initialExperienceEntry = (): ExperienceEntry => ({
  category: "WORK",
  name: "",
  role: "",
  city: "",
  country: "",
  description: "",
  start_date: null,
  end_date: null,
  isCurrent: false,
});

export default function OnboardingPage() {
  const router = useRouter();
  const setOnboardingComplete = useProfileStore((s) => s.setOnboardingComplete);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [educationList, setEducationList] = useState<EducationEntry[]>([
    initialEducationEntry(),
  ]);
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf" || dropped?.name?.toLowerCase().endsWith(".pdf")) {
      setFile(dropped);
      setError(null);
    } else {
      setError("Please upload a PDF file.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type === "application/pdf" || selected.name?.toLowerCase().endsWith(".pdf")) {
        setFile(selected);
        setError(null);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  };

  const handleUploadAndContinue = async () => {
    if (file) {
      setError(null);
      setIsLoading(true);
      try {
        const res = await userService.uploadResume(file);
        if (isApiSuccess(res)) {
          setStep(2);
        } else {
          setError(getApiErrorMessage(res.data));
        }
      } catch {
        setError("Failed to upload resume.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Please select a PDF file to upload.");
    }
  };

  const handleSkipResume = () => {
    setError(null);
    setStep(2);
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string | null) => {
    setEducationList((prev) =>
      prev.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (index: number) => {
    if (educationList.length <= 1) return;
    setEducationList((prev) => prev.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducationList((prev) => [...prev, initialEducationEntry()]);
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string | null | boolean) => {
    setExperienceList((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExperience = (index: number) => {
    setExperienceList((prev) => prev.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperienceList((prev) => [...prev, initialExperienceEntry()]);
  };

  const handleSaveAndContinue = async () => {
    for (let i = 0; i < educationList.length; i++) {
      const { college, degree, graduation_date } = educationList[i];
      if (!college.trim()) {
        setError(`Please fill in College/University for education ${i + 1}.`);
        return;
      }
      if (!degree.trim()) {
        setError(`Please fill in Degree for education ${i + 1}.`);
        return;
      }
      if (!graduation_date) {
        setError(`Please select Graduation Date for education ${i + 1}.`);
        return;
      }
      const cgpa = educationList[i].CGPA.trim();
      if (cgpa) {
        const cgpaNum = parseFloat(cgpa);
        if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
          setError(`CGPA must be between 0 and 10 for education ${i + 1}.`);
          return;
        }
      }
    }

    for (let i = 0; i < experienceList.length; i++) {
      const { name, start_date, end_date, isCurrent } = experienceList[i];
      if (!name.trim()) {
        setError(`Please fill in Company Name for experience ${i + 1}, or remove it.`);
        return;
      }
      if (!start_date) {
        setError(`Please select Start Date for experience ${i + 1}.`);
        return;
      }
      if (!isCurrent && !end_date) {
        setError(`Please select End Date for experience ${i + 1}, or check "Current role".`);
        return;
      }
    }

    setError(null);
    setIsLoading(true);

    try {
      const eduPromises = educationList.map((edu) => {
        const cgpaNum = edu.CGPA.trim() ? parseFloat(edu.CGPA) : undefined;
        if (edu.CGPA.trim() && (isNaN(cgpaNum!) || cgpaNum! < 0 || cgpaNum! > 10)) {
          throw new Error("Invalid CGPA");
        }
        return userService.addEducation({
          educations: {
            college: edu.college.trim() || undefined,
            degree: edu.degree.trim() || undefined,
            major: edu.major.trim() || undefined,
            CGPA: cgpaNum,
            start_date: edu.start_date || undefined,
            graduation_date: edu.graduation_date || undefined,
          },
        });
      });

      const eduResults = await Promise.all(eduPromises);
      const failedEdu = eduResults.find((r) => !isApiSuccess(r));
      if (failedEdu) {
        setError(getApiErrorMessage((failedEdu as ApiError).data));
        setIsLoading(false);
        return;
      }

      const workPromises = experienceList.map((exp) => {
        let endDate: string;
        if (exp.isCurrent) {
          const now = new Date();
          endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        } else {
          endDate = exp.end_date!;
        }
        return userService.addWork({
          work: {
            category: "WORK",
            name: exp.name.trim(),
            role: exp.role.trim() || undefined,
            city: exp.city.trim() || undefined,
            country: exp.country.trim() || undefined,
            description: exp.description.trim() || "",
            start_date: exp.start_date!,
            end_date: endDate,
          },
        });
      });

      const workResults = await Promise.all(workPromises);
      const failedWork = workResults.find((r) => !isApiSuccess(r));
      if (failedWork) {
        setError(getApiErrorMessage((failedWork as ApiError).data));
        setIsLoading(false);
        return;
      }

      setStep(3);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    setOnboardingComplete();
    router.push("/profile");
  };

  const isIIT = educationList.some((edu) =>
    /iit|indian\s*institute\s*of\s*technology/i.test(edu.college.trim())
  );

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Visual Stepper */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">
              Step {step} of 4
            </span>
            <div className="h-1.5 flex-1 max-w-[200px] ml-4 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-300 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Resume */}
        {step === 1 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="rounded-2xl bg-white/5 p-4">
                <FileUp className="h-10 w-10 text-zinc-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-white">
              Upload Your Resume
            </h1>
            <p className="mt-2 text-center text-sm text-zinc-400">
              Help us personalize your experience. PDF only.
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-colors ${
                isDragging
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-white/20 bg-white/[0.02] hover:border-white/30"
              }`}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer text-center">
                {file ? (
                  <p className="text-sm text-emerald-400 font-medium">{file.name}</p>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Drag & drop your PDF here, or click to browse
                  </p>
                )}
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleUploadAndContinue}
                disabled={isLoading}
                className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Uploading…" : "Upload & Continue"}
              </button>
              <button
                type="button"
                onClick={handleSkipResume}
                disabled={isLoading}
                className="w-full rounded-xl py-3 text-sm text-zinc-500 transition hover:text-zinc-300"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Education & Experience */}
        {step === 2 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="rounded-2xl bg-white/5 p-4">
                <GraduationCap className="h-10 w-10 text-zinc-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-white">
              Education & Experience
            </h1>
            <p className="mt-2 text-center text-sm text-zinc-400">
              Tell us about your background. Education is required.
            </p>

            <div className="mt-8 space-y-8 max-h-[60vh] overflow-y-auto pr-1">
              {/* Education Section */}
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education (Required)
                </h3>
                <div className="space-y-4">
                  {educationList.map((edu, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <span className="text-xs font-medium text-zinc-500">
                          Education {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          disabled={educationList.length <= 1}
                          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                          aria-label="Remove education"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className={labelClass}>College / University *</label>
                          <input
                            type="text"
                            placeholder="e.g. IIT Bombay"
                            value={edu.college}
                            onChange={(e) => updateEducation(index, "college", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Degree *</label>
                          <input
                            type="text"
                            placeholder="e.g. B.Tech"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Major</label>
                          <input
                            type="text"
                            placeholder="e.g. Computer Science"
                            value={edu.major}
                            onChange={(e) => updateEducation(index, "major", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>CGPA (0–10)</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 8.5"
                            value={edu.CGPA}
                            onChange={(e) => updateEducation(index, "CGPA", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <MonthYearPicker
                            label="Start Date"
                            value={edu.start_date}
                            onChange={(v) => updateEducation(index, "start_date", v)}
                          />
                        </div>
                        <div>
                          <MonthYearPicker
                            label="Graduation Date *"
                            value={edu.graduation_date}
                            onChange={(v) => updateEducation(index, "graduation_date", v)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addEducation}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/30 hover:text-zinc-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Education
                </button>
              </div>

              {/* Experience Section */}
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience (Optional)
                </h3>
                <div className="space-y-4">
                  {experienceList.map((exp, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <span className="text-xs font-medium text-zinc-500">
                          Experience {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-500/20 hover:text-red-400"
                          aria-label="Remove experience"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className={labelClass}>Company Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Google"
                            value={exp.name}
                            onChange={(e) => updateExperience(index, "name", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Role</label>
                          <input
                            type="text"
                            placeholder="e.g. Software Engineer"
                            value={exp.role}
                            onChange={(e) => updateExperience(index, "role", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>City</label>
                          <input
                            type="text"
                            placeholder="e.g. Bangalore"
                            value={exp.city}
                            onChange={(e) => updateExperience(index, "city", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <CountrySelect
                            label="Country"
                            value={exp.country}
                            onChange={(v) => updateExperience(index, "country", v)}
                            placeholder="e.g. IN, US"
                          />
                        </div>
                        <div>
                          <MonthYearPicker
                            label="Start Date *"
                            value={exp.start_date}
                            onChange={(v) => updateExperience(index, "start_date", v)}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className={labelClass}>End Date *</label>
                            <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.isCurrent}
                                onChange={(e) =>
                                  updateExperience(index, "isCurrent", e.target.checked)
                                }
                                className="rounded border-white/10 bg-zinc-800/50 accent-white"
                              />
                              Current role
                            </label>
                          </div>
                          {!exp.isCurrent && (
                            <MonthYearPicker
                              value={exp.end_date}
                              onChange={(v) => updateExperience(index, "end_date", v)}
                            />
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className={labelClass}>Description</label>
                          <textarea
                            placeholder="What did you do?"
                            value={exp.description}
                            onChange={(e) =>
                              updateExperience(index, "description", e.target.value)
                            }
                            rows={3}
                            className={textareaClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/30 hover:text-zinc-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Experience
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={isLoading}
              className="mt-8 w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving…" : "Save & Continue"}
            </button>
          </div>
        )}

        {/* Step 3: WhatsApp Community Invite */}
        {step === 3 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="rounded-2xl bg-emerald-500/20 p-4 ring-2 ring-emerald-400/30">
                <MessageCircle className="h-10 w-10 text-emerald-400" />
              </div>
            </div>

            {isIIT ? (
              <>
                <h1 className="text-2xl font-bold text-center text-white">
                  Exclusive IIT Community
                </h1>
                <p className="mt-2 text-center text-sm text-zinc-400">
                  Join fellow IITians for job alerts, referrals, and networking.
                </p>
                <a
                  href={IIT_WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setStep(4)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-[#20bd5a]"
                >
                  <MessageCircle className="h-5 w-5" strokeWidth={2} />
                  Join IIT Community
                </a>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-center text-white">
                  Join Our Community
                </h1>
                <p className="mt-2 text-center text-sm text-zinc-400">
                  Connect with developers, get job alerts, and share opportunities.
                </p>
                <a
                  href={DEFAULT_WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setStep(4)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-[#20bd5a]"
                >
                  <MessageCircle className="h-5 w-5" strokeWidth={2} />
                  Join via WhatsApp
                </a>
              </>
            )}

          </div>
        )}

        {/* Step 4: Success / Celebration */}
        {step === 4 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="rounded-2xl bg-emerald-500/20 p-4 ring-2 ring-emerald-400/30">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-white">
              You&apos;re all set!
            </h1>
            <p className="mt-2 text-center text-sm text-zinc-400">
              Your profile has been built and you are ready to explore exclusive opportunities.
            </p>
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="mt-8 w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
