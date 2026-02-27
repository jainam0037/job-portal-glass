"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useProfileStore } from "@/store/useProfileStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const fetchUser = useProfileStore((s) => s.fetchUser);
  const isFetching = useProfileStore((s) => s.isFetching);
  const user = useProfileStore((s) => s.user);

  const isOnboardingPage = pathname === "/onboarding";

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Onboarding redirect: if already onboarded and on onboarding page, go to profile.
  // Onboarding is optional - we no longer force non-onboarded users to /onboarding.
  useEffect(() => {
    if (isFetching || !user) return;
    if (user.is_onboarded === true && isOnboardingPage) {
      router.replace("/profile");
    }
  }, [user, isFetching, isOnboardingPage, router]);

  // Onboarding: full-width, no sidebar. Other routes: sidebar + main content.
  if (isOnboardingPage) {
    return (
      <div className="min-h-screen bg-black text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="ml-[88px] min-h-screen flex-1 overflow-y-auto">
        {isFetching && !user ? (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
