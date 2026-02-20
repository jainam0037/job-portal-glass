"use client";

import { useState } from "react";
import { Linkedin } from "lucide-react";
import { getSocialLink, type SocialProvider } from "@/services/authService";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SocialButtons() {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocialClick = async (provider: SocialProvider) => {
    setError(null);
    setLoadingProvider(provider);
    try {
      const url = await getSocialLink(provider);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start social login.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleSocialClick("google")}
          disabled={!!loadingProvider}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gray-100 border border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
          suppressHydrationWarning
        >
          <GoogleIcon className="h-5 w-5 shrink-0" />
          <span>
            {loadingProvider === "google" ? "Redirecting…" : "Continue with Google"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialClick("linkedin")}
          disabled={!!loadingProvider}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0077b5] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#006097] disabled:opacity-60 disabled:cursor-not-allowed"
          suppressHydrationWarning
        >
          <Linkedin className="h-4 w-4 shrink-0" strokeWidth={2} stroke="currentColor" fill="none" />
          <span>
            {loadingProvider === "linkedin" ? "Redirecting…" : "Continue with LinkedIn"}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="px-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Or continue with email
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
}
