"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Mail, Hash, Lock } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { AuthLayout } from "@/features/auth";
import { reqEmailOtp, verifyForgot } from "@/services/authService";

const RESEND_COOLDOWN_SEC = 30;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== "reset" || resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, resendTimer]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(null);
    setIsLoading(true);
    try {
      await reqEmailOtp(trimmed, "forget password");
      setEmail(trimmed);
      setStep("reset");
      setResendTimer(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      await reqEmailOtp(email, "forget password");
      setResendTimer(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !otp.trim() || !newPassword.trim()) return;
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await verifyForgot({
        email: trimmedEmail,
        otp: otp.trim(),
        new_password: newPassword,
      });
      showToast("Password reset successful. Please login.");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {step === "request"
              ? "Enter your email to receive a recovery code."
              : "Enter the OTP sent to your email and choose a new password."}
          </p>
        </div>

        {toast && (
          <div
            className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400"
            role="status"
          >
            <Check className="h-4 w-4 shrink-0" />
            {toast}
          </div>
        )}

        {error && (
          <div
            className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            role="alert"
          >
            {error}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-400">
                Email
              </label>
              <GlassInput
                id="email"
                type="email"
                icon={<Mail className="h-4 w-4" />}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed border-none transition-all"
              suppressHydrationWarning
            >
              {isLoading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <span className="min-w-0 flex-1">
                ✅ OTP sent to <span className="font-semibold text-emerald-200">{email}</span>. Please check your inbox.
              </span>
              <button
                type="button"
                onClick={() => setStep("request")}
                className="shrink-0 cursor-pointer text-xs underline hover:text-emerald-300"
                suppressHydrationWarning
              >
                Change
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="otp" className="text-sm font-medium text-zinc-400">
                OTP
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
                disabled={isLoading}
              />
              <div className="mt-1">
                {resendTimer > 0 ? (
                  <span className="text-xs text-zinc-500">
                    Resend code in {String(Math.floor(resendTimer / 60)).padStart(2, "0")}:{String(resendTimer % 60).padStart(2, "0")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    suppressHydrationWarning
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-sm font-medium text-zinc-400">
                New Password
              </label>
              <GlassInput
                id="newPassword"
                type="password"
                icon={<Lock className="h-4 w-4" />}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed border-none transition-all"
              suppressHydrationWarning
            >
              {isLoading ? "Resetting…" : "Set New Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center">
          <Link
            href="/signin"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
