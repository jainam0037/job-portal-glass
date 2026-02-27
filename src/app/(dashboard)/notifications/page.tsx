"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { userService, type Notification } from "@/services/userService";
import { isApiSuccess, getApiErrorMessage } from "@/lib/validations/api";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateStr;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchNotifications() {
      setIsLoading(true);
      setError(null);
      const res = await userService.getNotifications();
      if (cancelled) return;
      if (isApiSuccess(res)) {
        setNotifications(res.data.notifications ?? []);
      } else {
        setError(getApiErrorMessage(res.data));
      }
      setIsLoading(false);
    }
    fetchNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 pb-16 pt-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-2 text-zinc-400">Stay updated on your job activity.</p>
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pb-16 pt-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-2 text-zinc-400">Stay updated on your job activity.</p>
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-16 pt-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="mt-2 text-zinc-400">Stay updated on your job activity.</p>

        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] py-16 backdrop-blur-xl"
          >
            <BellOff className="h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-400">No notifications yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              When you get job updates or activity, they&apos;ll show up here.
            </p>
          </motion.div>
        ) : (
          <ul className="mt-8 space-y-3">
            {notifications.map((n, i) => (
              <motion.li
                key={n._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
                  <Bell className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{n.title}</p>
                  {n.description && (
                    <p className="mt-1 text-sm text-zinc-400">{n.description}</p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatDate(n.date)}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
