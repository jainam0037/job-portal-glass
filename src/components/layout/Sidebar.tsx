"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  User,
  Bot,
  Bell,
  Settings,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { UserDropdown } from "@/components/ui/UserDropdown";

const pillBase =
  "flex w-[72px] h-[60px] flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-200 cursor-pointer relative group overflow-hidden";

function SidebarLink({
  href,
  icon: Icon,
  label,
  isActive,
  disabled,
  badge,
}: {
  href?: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  badge?: React.ReactNode | null;
}) {
  const inner = (
    <>
      <div className="relative flex items-center justify-center">
        <Icon className="size-5" />
        {badge}
      </div>
      <span className="min-w-0 w-full truncate text-center text-[9px] font-semibold uppercase">
        {label}
      </span>
    </>
  );

  const defaultClasses =
    "text-zinc-500 hover:text-zinc-100 hover:bg-white/5";
  const activeClasses =
    "bg-white/[0.08] text-white shadow-[inset_0px_1px_1px_rgba(255,255,255,0.1)]";
  const disabledClasses = "opacity-60 cursor-not-allowed";

  const className = [
    pillBase,
    disabled ? disabledClasses : isActive ? activeClasses : defaultClasses,
  ]
    .filter(Boolean)
    .join(" ");

  if (disabled) {
    return (
      <div className={className} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link href={href!} className={className}>
      {inner}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hide-scrollbar fixed left-0 top-0 z-50 flex h-screen w-[88px] flex-col items-center overflow-y-auto border-r border-white/[0.05] bg-[#09090b] py-6">
      {/* Logo */}
      <div className="mb-8 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20" />

      {/* Core Links */}
      <div className="flex flex-col items-center gap-1">
        <SidebarLink
          href="/jobs"
          icon={Briefcase}
          label="Jobs"
          isActive={pathname === "/jobs"}
        />
        <SidebarLink
          href="/profile"
          icon={User}
          label="Profile"
          isActive={pathname === "/profile"}
        />
        {/* Phase 2 Referral System - disabled for Phase 1
        <SidebarLink
          href="/referrals"
          icon={Gift}
          label="Referrals"
          isActive={pathname === "/referrals"}
        />
        */}
      </div>

      {/* Divider */}
      <div className="my-4 h-px w-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Coming Soon Group */}
      <div className="flex flex-col items-center gap-1 [&>.coming-soon-item]:cursor-not-allowed">
        <div className="coming-soon-item relative">
          <div className="opacity-60">
            <SidebarLink icon={Bot} label="Agent" disabled />
          </div>
          <span className="absolute -top-1.5 right-2 z-10 rounded-full bg-teal-400 px-1.5 py-0.5 text-[8px] font-bold text-[#09090b] shadow-sm ring-4 ring-[#09090b]">
            Beta
          </span>
        </div>
      </div>

      {/* Utilities - Bottom */}
      <div className="mt-auto flex flex-col items-center gap-1">
        {/* Phase 2 Referral System - disabled for Phase 1
        <SidebarLink
          href="/notifications"
          icon={Bell}
          label="Alerts"
          isActive={pathname === "/notifications"}
        />
        */}
        <SidebarLink
          href="/settings"
          icon={Settings}
          label="Settings"
          isActive={pathname === "/settings"}
        />
        <div className="mt-4">
          <UserDropdown placement="right" />
        </div>
      </div>
    </aside>
  );
}
