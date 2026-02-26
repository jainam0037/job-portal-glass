"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassInput } from "@/components/ui/GlassInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { signin, RateLimitError } from "@/services/authService";
import { useProfileStore } from "@/store/useProfileStore";
import { useRateLimit } from "@/hooks/useRateLimit";

export default function SigninPage() {
  const router = useRouter();
  const setUserFromAuth = useProfileStore((s) => s.setUserFromAuth);
  const { isRateLimited, cooldownSeconds, triggerRateLimit } = useRateLimit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signin({ email: email.trim(), password });
      setUserFromAuth({
        email: email.trim(),
        first_name: email.trim().split("@")[0] || "User",
        last_name: "",
      });
      router.push("/profile");
    } catch (err) {
      if (err instanceof RateLimitError) {
        triggerRateLimit(err.retryAfter ?? 60);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 pb-16 pt-24 relative overflow-hidden">
      <div className="fixed top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <section className="mx-auto mt-20 w-full max-w-md relative z-10">
        <div className="rounded-2xl border border-zinc-800 bg-[#111111] p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in to access your profile.
            </p>
          </div>

          <div className="mb-6">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-400">
                Email
              </label>
              <GlassInput
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isRateLimited}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-400">
                Password
              </label>
              <GlassInput
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isRateLimited}
              />
            </div>

            <Link
              href="/forgot-password"
              className="block text-right text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Forgot Password?
            </Link>

            <button
              type="submit"
              disabled={isLoading || isRateLimited}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed border-none transition-all"
              suppressHydrationWarning
            >
              {isRateLimited
                ? `Try again in ${cooldownSeconds}s…`
                : isLoading
                  ? "Signing in…"
                  : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
