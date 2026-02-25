"use client";

import { useEffect } from "react";
import { registerOnUnauthorized } from "@/lib/authHandlers";
import { useProfileStore } from "@/store/useProfileStore";
import { logout } from "@/services/authService";

/**
 * Registers 401 handler: clears auth state and redirects to signin.
 * Must call logout API first to clear the session cookie, otherwise middleware
 * will redirect back to /profile and cause an infinite loop.
 */
export function AuthGuardProvider({ children }: { children: React.ReactNode }) {
  const clearProfile = useProfileStore((s) => s.clearProfile);

  useEffect(() => {
    const unregister = registerOnUnauthorized(async () => {
      clearProfile();
      if (typeof window === "undefined") return;
      // Clear any auth-related localStorage keys (future-proof)
      ["token", "auth_token", "access_token", "refresh_token", "session_token"].forEach(
        (key) => localStorage.removeItem(key)
      );
      // Call logout API to clear HttpOnly session cookie - prevents redirect loop
      // (middleware sees cookie and sends user back to /profile otherwise)
      try {
        await logout();
      } catch {
        // Ignore - cookie may already be invalid
      }
      const path = window.location.pathname;
      const params = new URLSearchParams();
      params.set("session_expired", "1");
      if (path && path !== "/signin") params.set("from", path);
      const signinUrl = `/signin?${params.toString()}`;
      window.location.href = signinUrl;
    });
    return unregister;
  }, [clearProfile]);

  return <>{children}</>;
}
