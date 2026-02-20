"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  ImagePlus,
  Mail,
  Linkedin,
  MapPin,
  PencilLine,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { getCountryLabel } from "@/lib/constants/countries";
import { useProfileStore } from "@/store/useProfileStore";
import { userService } from "@/services/userService";
import { isApiSuccess, getApiErrorMessage } from "@/lib/validations/api";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Helpers defined at module level (never undefined)
function formatUrl(url: string): string {
  if (!url) return "";
  const cleaned = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (cleaned.includes("linkedin.com")) {
    const match = cleaned.match(/linkedin\.com\/in\/([^/?#]+)/);
    return match ? match[1] : cleaned;
  }
  if (cleaned.includes("github.com")) {
    const match = cleaned.match(/github\.com\/([^/?#]+)/);
    return match ? match[1] : cleaned;
  }
  return cleaned.replace(/\/$/, "");
}

/**
 * Smart email truncation: keeps full local part (before @) and truncates domain if needed.
 * e.g. "jainam@example.com" stays full; "longemail@verylongdomain.com" → "longemail@verylon..."
 */
function formatEmailDisplay(email: string, maxLength = 24): string {
  if (!email || email.length <= maxLength) return email;
  const atIdx = email.indexOf("@");
  if (atIdx === -1) return email.slice(0, maxLength - 3) + "...";
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);
  const spaceForDomain = maxLength - local.length - 3; // -3 for @ and ...
  if (spaceForDomain < 4) return local + "@...";
  return local + "@" + domain.slice(0, spaceForDomain) + "...";
}

const FALLBACK_BY_KEY: Record<string, string> = {
  email: "Add email",
  linkedin: "Add LinkedIn",
  github: "Add GitHub",
  phone: "Add phone number",
};

type ContactKey = "email" | "linkedin";
const contactConfig: { id: string; key: ContactKey; icon: typeof Mail; iconColor: string; getHref: (v: string) => string }[] = [
  { id: "email", key: "email", icon: Mail, iconColor: "text-rose-500", getHref: (v) => `mailto:${v || ""}` },
  { id: "linkedin", key: "linkedin", icon: Linkedin, iconColor: "text-blue-500", getHref: (v) => (v && v.startsWith("http") ? v : `https://${v || ""}`) },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHero() {
  const { user, setEditing, setUserProfileImage } = useProfileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [profileToast, setProfileToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(target)) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [avatarMenuOpen]);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setProfileToast({ type, message });
    setTimeout(() => setProfileToast(null), 4000);
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        showToast("error", "Please upload a PNG or JPEG image. GIFs are not supported.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        showToast("error", "Image must be under 5MB.");
        return;
      }

      setProfileToast(null);
      setIsUploading(true);
      try {
        const res = await userService.uploadProfileImage(file);
        if (isApiSuccess(res)) {
          const url = typeof res.data === "object" && res.data && "profile" in res.data
            ? (res.data as { profile: string }).profile
            : typeof res.data === "string"
              ? res.data
              : null;
          if (url) {
            setUserProfileImage(url);
            showToast("success", "Profile photo updated.");
          } else {
            showToast("error", "Invalid response from server.");
          }
        } else {
          showToast("error", getApiErrorMessage(res.data));
        }
      } catch (err) {
        showToast("error", err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    },
    [setUserProfileImage, showToast]
  );

  const handleDeleteProfile = useCallback(async () => {
    if (!user?.profile_img) return;
    setProfileToast(null);
    setIsDeleting(true);
    try {
      const res = await userService.deleteProfileImage();
      if (isApiSuccess(res)) {
        setUserProfileImage(null);
        showToast("success", "Profile photo removed.");
      } else {
        showToast("error", getApiErrorMessage(res.data));
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to remove photo.");
    } finally {
      setIsDeleting(false);
    }
  }, [user?.profile_img, setUserProfileImage, showToast]);

  const contactItems = contactConfig.map(({ id, key, icon, iconColor, getHref }) => {
    const value = user ? ((user[key] as string) ?? "") : "";
    const isUrl = key === "linkedin";
    const isEmail = key === "email";
    const hasValue = Boolean(value?.trim());
    const displayLabel = hasValue
      ? (isUrl ? formatUrl(value) : isEmail ? formatEmailDisplay(value) : value)
      : (FALLBACK_BY_KEY[key] ?? "");
    return {
      id,
      icon,
      iconColor,
      label: displayLabel,
      isPlaceholder: !hasValue,
      fullLabel: value,
      href: getHref(value),
    };
  });

  const headline = user?.experience?.[0]?.role ?? "Add your current role";
  const locationParts = [
    user?.city_residence,
    user?.state_residence,
    user?.country_residence ? getCountryLabel(user.country_residence) : undefined,
  ].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : "Add your location";
  const hasResume = Boolean(user?.resume);

  const isBusy = isUploading || isDeleting;

  return (
    <div className="w-full border-b border-zinc-800 pb-8">
      {profileToast && (
        <div
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            profileToast.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
          role="alert"
        >
          {profileToast.message}
        </div>
      )}
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageUpload}
            />
            <div
              className={`relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl font-bold text-white ${
                isBusy ? "pointer-events-none opacity-80" : ""
              }`}
              onClick={() => {
                if (user?.profile_img && !isBusy) setIsViewingPhoto(true);
              }}
              role={user?.profile_img ? "button" : undefined}
            >
              {user?.profile_img ? (
                <img
                  src={user.profile_img}
                  alt={user?.name ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(user?.name ?? "U")
              )}
              {isBusy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
              )}
            </div>
            <div ref={avatarMenuRef} className="absolute -bottom-1 -right-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isBusy) setAvatarMenuOpen((prev) => !prev);
                }}
                disabled={isBusy}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 shadow-lg transition-all duration-200 hover:bg-zinc-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Change photo"
                aria-expanded={avatarMenuOpen}
                aria-haspopup="true"
              >
                <Camera className="h-4 w-4" />
              </button>
              {avatarMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    role="menuitem"
                  >
                    <ImagePlus className="h-4 w-4 shrink-0" />
                    Upload new photo
                  </button>
                  {user?.profile_img && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarMenuOpen(false);
                        handleDeleteProfile();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      role="menuitem"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      Remove photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <h1 className="text-4xl font-bold text-white">{user?.name || "Add your name"}</h1>
              <BadgeCheck className="h-8 w-8 shrink-0 text-blue-500" />
              {hasResume && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resume Uploaded
                </span>
              )}
            </div>
            <p className="mt-1 text-xl font-medium text-zinc-400">
              {headline}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{location}</span>
            </div>

            {/* Contact Grid */}
            <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
              {contactItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-zinc-300 transition-all duration-200 hover:bg-white/5 hover:text-white"
                >
                  {(() => {
                    const it = item as { icon: typeof Mail; iconColor: string };
                    const Icon = it.icon;
                    return (
                      <Icon
                        className={`h-5 w-5 shrink-0 ${it.iconColor}`}
                      />
                    );
                  })()}
                  <span
                    className={`max-w-full truncate group-hover:text-white ${item.isPlaceholder ? "opacity-50 text-zinc-500" : ""}`}
                    title={item.isPlaceholder ? undefined : item.fullLabel}
                  >
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <GlassButton
          onClick={() => setEditing(true)}
          className="shrink-0 border-zinc-600 bg-transparent py-2.5 px-4 text-sm font-medium text-zinc-300 backdrop-blur-none shadow-none hover:border-zinc-500 hover:bg-zinc-800/50 hover:text-white active:shadow-none"
        >
          <span className="flex items-center gap-2">
            <PencilLine className="h-4 w-4" />
            Edit Profile
          </span>
        </GlassButton>
      </div>

      {isViewingPhoto && user?.profile_img && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setIsViewingPhoto(false)}
        >
          <button
            className="absolute top-6 right-6 p-2 text-white/50 transition-colors hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsViewingPhoto(false);
            }}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={user.profile_img}
            alt="Profile Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
