"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/useProfileStore";
import { logout as authLogout } from "@/services/authService";
import Link from "next/link";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";

function getInitials(name: string, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    }
    return name[0].toUpperCase();
  }
  if (email?.trim()) {
    return email[0].toUpperCase();
  }
  return "U";
}

interface UserDropdownProps {
  /** When "right", menu opens to the right (e.g. in left sidebar). Default "left" for top navbars. */
  placement?: "left" | "right";
}

export function UserDropdown({ placement = "left" }: UserDropdownProps = {}) {
  const router = useRouter();
  const user = useProfileStore((s) => s.user);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        open &&
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleLogout = async () => {
    setLogoutError(null);
    setIsLoggingOut(true);
    try {
      await authLogout();
      clearProfile();
      setOpen(false);
      router.push("/signin");
    } catch (err) {
      setLogoutError(err instanceof Error ? err.message : "Failed to sign out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = getInitials(user?.name ?? "", user?.email ?? "");
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (open && triggerRef.current && typeof document !== "undefined") {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 280; // approx. height of menu
      const gap = 16;
      if (placement === "right") {
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpward = spaceBelow < menuHeight && rect.top > spaceBelow;
        setMenuStyle({
          position: "fixed",
          left: rect.right + gap,
          ...(openUpward
            ? { bottom: window.innerHeight - rect.bottom }
            : { top: rect.top }),
          zIndex: 9999,
          maxHeight: "calc(100vh - 2rem)",
          overflowY: "auto",
        });
      } else {
        setMenuStyle({
          position: "fixed",
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
          zIndex: 9999,
          maxHeight: "calc(100vh - 2rem)",
          overflowY: "auto",
        });
      }
    }
  }, [open, placement]);

  const dropdownMenu = open ? (
    <div
      ref={menuRef}
      className="w-64 shrink-0 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/95 py-2 shadow-xl backdrop-blur-sm"
      role="menu"
      style={menuStyle}
    >
          <div className="px-4 pb-2">
            <p className="text-xs text-zinc-500">Signed in as</p>
            {user?.name && (
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
            )}
            <p className="truncate text-xs text-zinc-400">
              {user?.email || "No email"}
            </p>
          </div>
          <div className="my-2 border-t border-zinc-800" />

          <div className="px-1">
            <Link
              href="/profile"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-800/80 hover:text-white"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-800/80 hover:text-white"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-zinc-800/80 hover:text-white"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <HelpCircle className="h-4 w-4" />
              Contact support
            </button>
            <div className="my-1 border-t border-zinc-800" />
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>

          {logoutError && (
            <div className="px-4 py-2">
              <p className="text-xs text-red-400">{logoutError}</p>
            </div>
          )}
        </div>
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-500/90 text-xs font-semibold text-white ring-2 ring-[#09090b] shadow-lg transition-colors hover:bg-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
        suppressHydrationWarning
      >
        {user?.profile_img ? (
          <img
            src={user.profile_img}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </button>
      {typeof document !== "undefined" && createPortal(dropdownMenu, document.body)}
    </>
  );
}
