"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useProfileStore } from "@/store/useProfileStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchUser = useProfileStore((s) => s.fetchUser);
  const isFetching = useProfileStore((s) => s.isFetching);
  const user = useProfileStore((s) => s.user);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
