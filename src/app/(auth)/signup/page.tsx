"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Hash, User, Lock, ArrowLeft } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { reqEmailOtp, signup, RateLimitError } from "@/services/authService";
import { useProfileStore } from "@/store/useProfileStore";
import { useRateLimit } from "@/hooks/useRateLimit";

export default function SignupPage() {
  const router = useRouter();
  const setUserFromAuth = useProfileStore((s) => s.setUserFromAuth);
  const { isRateLimited, cooldownSeconds, triggerRateLimit } = useRateLimit();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(null);
    setIsLoading(true);
    try {
      await reqEmailOtp(trimmed, "signup");
      setEmail(trimmed);
      setStep(2);
    } catch (err) {
      if (err instanceof RateLimitError) {
        triggerRateLimit(err.retryAfter ?? 60);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedEmail || !trimmedFirstName || !trimmedLastName || !password || !otp || otp.length !== 6) {
      setError("Please fill all fields. OTP must be 6 digits.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      // Phase 2 Referral System - disabled for Phase 1
      // const referredBy = typeof window !== "undefined" ? localStorage.getItem("adzzat_referred_by") : null;
      const payload = {
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        email: trimmedEmail,
        password,
        otp,
        // ...(referredBy ? { referred_by: referredBy } : {}),
      };
      await signup(payload);
      // if (typeof window !== "undefined") {
      //   localStorage.removeItem("adzzat_referred_by");
      // }
      setUserFromAuth({
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        email: trimmedEmail,
      });
      router.push("/onboarding");
    } catch (err) {
      if (err instanceof RateLimitError) {
        triggerRateLimit(err.retryAfter ?? 60);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 pb-16 pt-24 flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <section className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {step === 1
                ? "Enter your email to receive a verification code."
                : "Enter the OTP and complete your profile."}
            </p>
          </div>

          <div className="mb-8">
            <SocialButtons />
          </div>

          {error && (
            <div
              className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-zinc-300 ml-1">
                  Email
                </label>
                <GlassInput
                  id="email"
                  name="email"
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isRateLimited}
                  className="bg-black/40 border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || isRateLimited}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {isRateLimited
                  ? `Try again in ${cooldownSeconds}s…`
                  : isLoading
                    ? "Sending…"
                    : "Verify Email"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="space-y-5">
              {/* Email + Back */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                <span className="min-w-0 flex-1">
                  ✅ Code sent to <span className="font-semibold text-emerald-200">{email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex shrink-0 items-center gap-1 text-xs underline hover:text-emerald-300"
                  suppressHydrationWarning
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change
                </button>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="otp" className="text-sm font-semibold text-zinc-300 ml-1">
                  OTP (6 digits)
                </label>
                <GlassInput
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  icon={<Hash className="h-4 w-4" />}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={isLoading || isRateLimited}
                  className="bg-black/40 border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-sm font-semibold text-zinc-300 ml-1">
                    First Name
                  </label>
                  <GlassInput
                    id="firstName"
                    name="firstName"
                    icon={<User className="h-4 w-4" />}
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading || isRateLimited}
                    className="bg-black/40 border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-sm font-semibold text-zinc-300 ml-1">
                    Last Name
                  </label>
                  <GlassInput
                    id="lastName"
                    name="lastName"
                    icon={<User className="h-4 w-4" />}
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading || isRateLimited}
                    className="bg-black/40 border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-zinc-300 ml-1">
                  Password (min 8 chars)
                </label>
                <GlassInput
                  id="password"
                  name="password"
                  type="password"
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isRateLimited}
                  minLength={8}
                  className="bg-black/40 border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isRateLimited}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {isRateLimited
                  ? `Try again in ${cooldownSeconds}s…`
                  : isLoading
                    ? "Creating…"
                    : "Create Account"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-white hover:text-blue-400 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
