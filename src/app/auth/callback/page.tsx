"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * OAuth callback page. When Google/LinkedIn redirects back with ?code=...,
 * the backend's redirect_uri is typically configured to point here or to its own API.
 *
 * If redirect_uri points to this page: we forward the code to the backend.
 * If redirect_uri points to the backend: the user never hits this page.
 *
 * For now: if we have ?code=, redirect to the backend callback with the same query string
 * so the backend can exchange the code and set cookies. Adjust per your backend's flow.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      return;
    }

    if (code) {
      // Forward to backend callback. Backend must handle GET /auth/google/callback?code=...
      // If your backend expects a different flow, update this.
      window.location.href = `${API_BASE}/auth/google/callback?${searchParams.toString()}`;
      return;
    }

    // No code - redirect to signin
    router.replace("/signin");
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Sign in was cancelled or failed.</p>
          <a href="/signin" className="mt-4 inline-block text-blue-400 hover:underline">
            Back to Sign In
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
        <p className="mt-4 text-zinc-400">Completing sign in…</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            <p className="mt-4 text-zinc-400">Completing sign in…</p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
