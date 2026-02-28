"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, UserPlus, Trophy, Sparkles } from "lucide-react";

// Temporary mock data for UI testing
const MOCK_NOTIFICATIONS = [
  {
    _id: "1",
    title: "New VIP Referral! 🎉",
    description: "Rohit just joined using your link. You earned +1 towards Silver Status.",
    date: new Date().toISOString(),
    read: false,
    icon: UserPlus,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    _id: "2",
    title: "Status Unlocked",
    description: "You reached Silver Status! Your profile is now prioritized in search queries.",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true,
    icon: Trophy,
    color: "text-slate-300",
    bg: "bg-slate-300/10",
  },
];

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-80 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 p-1 shadow-2xl backdrop-blur-xl sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                Notifications <Sparkles className="h-4 w-4 text-blue-400" />
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  Mark all read
                </button>
              )}
            </div>
            {/* Notification List */}
            <div className="max-h-[25rem] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="mb-2 h-8 w-8 text-zinc-600" />
                  <p className="text-sm text-zinc-400">You&apos;re all caught up!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification._id}
                        className={`group relative flex gap-4 rounded-xl p-3 transition-all hover:bg-white/5 ${
                          !notification.read ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r-full bg-blue-500" />
                        )}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 ${notification.bg} ${notification.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p
                            className={`text-sm ${
                              !notification.read ? "font-semibold text-zinc-200" : "font-medium text-zinc-400"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
