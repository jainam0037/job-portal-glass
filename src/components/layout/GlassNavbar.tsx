"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MessageCircleMore } from "lucide-react";

import { GlassButton } from "../ui/GlassButton";
import { UserDropdown } from "../ui/UserDropdown";
// import { NotificationsDropdown } from "./NotificationsDropdown";
import { useProfileStore } from "@/store/useProfileStore";

export function GlassNavbar() {
  const user = useProfileStore((s) => s.user);
  const isLoggedIn = !!user?.email?.trim();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-50"
          onClick={close}
        >
          JobGlass
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-200">
            <Link
              href="/jobs"
              className="transition-colors hover:text-white"
            >
              Jobs
            </Link>
            <Link
              href="https://wa.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-emerald-300"
            >
              <MessageCircleMore className="h-4 w-4" />
              <span>Community</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* <NotificationsDropdown /> */}
                <UserDropdown />
              </>
            ) : (
              <>
                <Link href="/signin">
                  <GlassButton className="px-4 py-2 text-sm">
                    Sign In
                  </GlassButton>
                </Link>
                <Link href="/signup">
                  <GlassButton className="bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300/90 hover:text-black">
                    Sign Up
                  </GlassButton>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-200 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden"
          onClick={toggle}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-black/70 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex flex-col gap-4 px-4 pb-4 pt-3 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 text-sm font-medium text-zinc-200">
              <Link
                href="/jobs"
                className="py-1 transition-colors hover:text-white"
                onClick={close}
              >
                Jobs
              </Link>
              <Link
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-1 transition-colors hover:text-emerald-300"
                onClick={close}
              >
                <MessageCircleMore className="h-4 w-4" />
                <span>Community (Whatsapp)</span>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {isLoggedIn ? (
                <div className="flex items-center justify-end gap-2 px-2" onClick={close}>
                  {/* <NotificationsDropdown /> */}
                  <UserDropdown />
                </div>
              ) : (
                <>
                  <Link href="/signin" onClick={close}>
                    <GlassButton className="w-full justify-center text-sm">
                      Sign In
                    </GlassButton>
                  </Link>
                  <Link href="/signup" onClick={close}>
                    <GlassButton className="w-full justify-center bg-emerald-400/90 text-sm font-semibold text-black hover:bg-emerald-300/90 hover:text-black">
                      Sign Up
                    </GlassButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

