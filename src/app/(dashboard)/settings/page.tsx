"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { changeEmail, changePassword, changePhone, deleteAccount, reqEmailOtp } from "@/services/authService";
import { useProfileStore } from "@/store/useProfileStore";
import { SmartPhoneInput } from "@/features/profile/components/inputs/SmartPhoneInput";

type Tab = "account" | "security";

const inputElite =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-white/20 focus:ring-1 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed";

export default function SettingsPage() {
  const router = useRouter();
  const user = useProfileStore((s) => s.user);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const setUserInfo = useProfileStore((s) => s.setUserInfo);

  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [otpOldEmail, setOtpOldEmail] = useState("");
  const [otpNewEmail, setOtpNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailToast, setEmailToast] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setCurrentEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) setDeleteEmail(user.email);
  }, [user?.email]);

  const [deleteStep, setDeleteStep] = useState<"input" | "otp">("input");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteOtpLoading, setDeleteOtpLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [deleteFieldErrors, setDeleteFieldErrors] = useState<{
    email?: string;
    password?: string;
    otp?: string;
  }>({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordOtpLoading, setPasswordOtpLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{
    old_password?: string;
    new_password?: string;
    otp?: string;
  }>({});
  const [phoneDialCode, setPhoneDialCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneToast, setPhoneToast] = useState<string | null>(null);

  const formattedPhone = phoneDialCode + phoneNumber.replace(/\s+/g, "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const p = user?.phone;
    if (p && typeof p === "string" && p.startsWith("+")) {
      const match = p.match(/^(\+\d{1,4})(\d+)$/);
      if (match) {
        setPhoneDialCode(match[1]);
        setPhoneNumber(match[2].replace(/\D/g, ""));
      }
    }
  }, [user?.phone]);

  return (
    <div className="pb-16">
      <div className="mt-12 flex w-full max-w-6xl items-start gap-16 pl-10 pr-6">
        {/* Sticky Left Navigation (macOS System Settings style) */}
        <nav className="sticky top-24 w-64 shrink-0">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              suppressHydrationWarning
              className={`rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                activeTab === "account"
                  ? "bg-white/10 font-medium text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              suppressHydrationWarning
              className={`rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                activeTab === "security"
                  ? "bg-white/10 font-medium text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Security
            </button>
          </div>
        </nav>

        {/* Right Column - Content */}
        <main className="min-w-0 flex-1">
          {activeTab === "account" && (
            <>
              {/* Change Email - Progressive Disclosure */}
              <div className="rounded-3xl bg-white/[0.02] p-8">
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  Change Email
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Transfer all your data and account-related communications to a new email address.
                </p>

                {emailToast && (
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                    {emailToast}
                  </div>
                )}
                {emailError && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {emailError}
                  </div>
                )}

                <form
                  id="change-email-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setEmailError(null);
                    setEmailLoading(true);
                    try {
                      await changeEmail({
                        old_email: currentEmail.trim(),
                        new_email: newEmail.trim(),
                        otp_old_email: otpOldEmail,
                        otp_new_email: otpNewEmail,
                      });
                      clearProfile();
                      setEmailToast("Email updated! Please log in again.");
                      setTimeout(() => setEmailToast(null), 3000);
                      router.push("/signin");
                    } catch (err) {
                      setEmailError(err instanceof Error ? err.message : "Failed to change email.");
                    } finally {
                      setEmailLoading(false);
                    }
                  }}
                  className="mt-8 space-y-5"
                >
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="current-email" className="block text-sm font-medium text-zinc-400">
                        Current Email
                      </label>
                      <input
                        id="current-email"
                        type="email"
                        placeholder="you@example.com"
                        value={currentEmail}
                        readOnly
                        aria-readonly
                        className={inputElite}
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="new-email" className="block text-sm font-medium text-zinc-400">
                        New Email
                      </label>
                      <input
                        id="new-email"
                        type="email"
                        placeholder="new@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className={inputElite}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="otp-current-email" className="block text-sm font-medium text-zinc-400">
                          OTP (Current Email)
                        </label>
                        <input
                          id="otp-current-email"
                          type="text"
                          inputMode="numeric"
                          placeholder="000000"
                          maxLength={6}
                          value={otpOldEmail}
                          onChange={(e) => setOtpOldEmail(e.target.value.replace(/\D/g, ""))}
                          className={inputElite}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="otp-new-email" className="block text-sm font-medium text-zinc-400">
                          OTP (New Email)
                        </label>
                        <input
                          id="otp-new-email"
                          type="text"
                          inputMode="numeric"
                          placeholder="000000"
                          maxLength={6}
                          value={otpNewEmail}
                          onChange={(e) => setOtpNewEmail(e.target.value.replace(/\D/g, ""))}
                          className={inputElite}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const old = currentEmail.trim();
                        const neu = newEmail.trim();
                        if (!old || !neu) {
                          setEmailError("Please enter both current and new email.");
                          return;
                        }
                        if (old === neu) {
                          setEmailError("New email must be different from current email.");
                          return;
                        }
                        setEmailError(null);
                        setEmailLoading(true);
                        try {
                          await Promise.all([
                            reqEmailOtp(old, "change email"),
                            reqEmailOtp(neu, "change email"),
                          ]);
                          setEmailToast("Codes sent to both emails!");
                          setTimeout(() => setEmailToast(null), 4000);
                        } catch (err) {
                          setEmailError(err instanceof Error ? err.message : "Failed to send codes.");
                        } finally {
                          setEmailLoading(false);
                        }
                      }}
                      disabled={emailLoading}
                      className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailLoading ? "Sending…" : "Send Verification Codes"}
                    </button>
                    <button
                      type="submit"
                      form="change-email-form"
                      disabled={
                        emailLoading ||
                        otpOldEmail.length !== 6 ||
                        otpNewEmail.length !== 6
                      }
                      className="h-12 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailLoading ? "Verifying…" : "Verify & Save Email"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Delete Account - Danger Zone with Progressive Disclosure */}
              <div className="mt-12 rounded-3xl border border-red-500/10 bg-red-500/[0.02] p-8">
                <h2 className="flex items-center gap-2 text-2xl font-medium tracking-tight text-white">
                  <Trash2 className="h-6 w-6 text-red-400" />
                  Delete Account
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                {deleteToast && (
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                    {deleteToast}
                  </div>
                )}
                {deleteError && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {deleteError}
                  </div>
                )}

                <form
                  id="delete-account-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (deleteStep === "input") {
                      setDeleteError(null);
                      setDeleteFieldErrors({});
                      if (!deleteEmail.trim()) {
                        setDeleteFieldErrors({ email: "Email is required." });
                        return;
                      }
                      if (!deletePassword || deletePassword.length < 8) {
                        setDeleteFieldErrors({ password: "Password must be at least 8 characters." });
                        return;
                      }
                      setDeleteOtpLoading(true);
                      try {
                        await reqEmailOtp(deleteEmail.trim(), "delete account");
                        setDeleteStep("otp");
                        setDeleteToast("OTP sent to email");
                        setTimeout(() => setDeleteToast(null), 4000);
                      } catch (err) {
                        setDeleteError(err instanceof Error ? err.message : "Failed to send OTP.");
                      } finally {
                        setDeleteOtpLoading(false);
                      }
                    } else {
                      setShowDeleteConfirm(true);
                    }
                  }}
                  className="mt-8 space-y-5"
                >
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="delete-email" className="block text-sm font-medium text-zinc-400">
                        Email
                      </label>
                      <input
                        id="delete-email"
                        type="email"
                        placeholder="Confirm your email"
                        value={deleteEmail}
                        onChange={(e) => {
                          setDeleteEmail(e.target.value);
                          setDeleteFieldErrors((p) => ({ ...p, email: undefined }));
                          setDeleteError(null);
                        }}
                        disabled={deleteOtpLoading}
                        readOnly={deleteStep === "otp"}
                        aria-readonly={deleteStep === "otp"}
                        className={inputElite}
                        suppressHydrationWarning
                      />
                      {deleteFieldErrors.email && (
                        <p className="text-sm text-red-400">{deleteFieldErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="delete-password" className="block text-sm font-medium text-zinc-400">
                        Password
                      </label>
                      <input
                        id="delete-password"
                        type="password"
                        placeholder="Enter your password (min 8 characters)"
                        value={deletePassword}
                        onChange={(e) => {
                          setDeletePassword(e.target.value);
                          setDeleteFieldErrors((p) => ({ ...p, password: undefined }));
                          setDeleteError(null);
                        }}
                        disabled={deleteOtpLoading}
                        minLength={8}
                        className={inputElite}
                        suppressHydrationWarning
                      />
                      {deleteFieldErrors.password && (
                        <p className="text-sm text-red-400">{deleteFieldErrors.password}</p>
                      )}
                    </div>
                  </div>

                  {deleteStep === "otp" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label htmlFor="delete-otp" className="block text-sm font-medium text-zinc-400">
                          OTP (6 digits)
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!deleteEmail.trim()) return;
                            setDeleteOtpLoading(true);
                            setDeleteError(null);
                            setDeleteFieldErrors((p) => ({ ...p, otp: undefined }));
                            try {
                              await reqEmailOtp(deleteEmail.trim(), "delete account");
                              setDeleteToast("OTP sent to email");
                              setTimeout(() => setDeleteToast(null), 4000);
                            } catch (err) {
                              setDeleteError(err instanceof Error ? err.message : "Failed to send OTP.");
                            } finally {
                              setDeleteOtpLoading(false);
                            }
                          }}
                          disabled={deleteOtpLoading || deleteLoading}
                          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteOtpLoading ? "Sending…" : "Send OTP"}
                        </button>
                      </div>
                      <input
                        id="delete-otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="000000"
                        maxLength={6}
                        value={deleteOtp}
                        onChange={(e) => {
                          setDeleteOtp(e.target.value.replace(/\D/g, ""));
                          setDeleteFieldErrors((p) => ({ ...p, otp: undefined }));
                          setDeleteError(null);
                        }}
                        disabled={deleteLoading}
                        className={inputElite}
                        suppressHydrationWarning
                      />
                      {deleteFieldErrors.otp && (
                        <p className="text-sm text-red-400">{deleteFieldErrors.otp}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      form="delete-account-form"
                      disabled={deleteOtpLoading || deleteLoading}
                      suppressHydrationWarning
                      className="h-12 rounded-xl border border-red-500/20 bg-red-500/10 px-6 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteOtpLoading
                        ? "Sending…"
                        : deleteStep === "input"
                          ? "Request Deletion"
                          : "Delete Account"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <>
              {/* Change Password */}
              <div className="mb-12 rounded-3xl bg-white/[0.02] p-8">
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  Change Password
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Update your password to keep your account secure. An OTP will be sent to your email.
                </p>

                {passwordToast && (
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                    {passwordToast}
                  </div>
                )}
                {passwordError && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {passwordError}
                  </div>
                )}

                <form
                  id="change-password-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPasswordError(null);
                    setPasswordFieldErrors({});
                    if (!oldPassword.trim()) {
                      setPasswordFieldErrors({ old_password: "Current password is required." });
                      return;
                    }
                    if (!newPassword.trim()) {
                      setPasswordFieldErrors({ new_password: "New password is required." });
                      return;
                    }
                    if (newPassword.length < 8) {
                      setPasswordFieldErrors({ new_password: "New password must be at least 8 characters." });
                      return;
                    }
                    if (!passwordOtp || passwordOtp.length !== 6) {
                      setPasswordFieldErrors({ otp: "OTP must be 6 digits." });
                      return;
                    }
                    setPasswordLoading(true);
                    try {
                      const res = await changePassword({
                        old_password: oldPassword,
                        new_password: newPassword,
                        otp: passwordOtp,
                      });
                      if (res.success) {
                        setPasswordToast("Password updated successfully. Please log in again.");
                        setTimeout(() => setPasswordToast(null), 3000);
                        clearProfile();
                        router.push("/signin");
                      } else {
                        const err = res.data.error;
                        if (typeof err === "string") {
                          if (err.toLowerCase().includes("wrong password") || err.toLowerCase().includes("incorrect password")) {
                            setPasswordFieldErrors({ old_password: err });
                          } else if (err.toLowerCase().includes("invalid otp") || err.toLowerCase().includes("otp")) {
                            setPasswordFieldErrors({ otp: err });
                          } else if (err.toLowerCase().includes("same") || err.toLowerCase().includes("old and new")) {
                            setPasswordFieldErrors({ new_password: err });
                          } else {
                            setPasswordError(err);
                          }
                        } else if (err && typeof err === "object") {
                          const fieldErrs: { old_password?: string; new_password?: string; otp?: string } = {};
                          for (const [k, v] of Object.entries(err)) {
                            const msg = Array.isArray(v) ? v.join(", ") : String(v);
                            if (k === "old_password") fieldErrs.old_password = msg;
                            else if (k === "new_password") fieldErrs.new_password = msg;
                            else if (k === "otp") fieldErrs.otp = msg;
                          }
                          if (Object.keys(fieldErrs).length > 0) {
                            setPasswordFieldErrors(fieldErrs);
                          } else {
                            setPasswordError(Object.values(err).join(". "));
                          }
                        } else {
                          setPasswordError("Failed to update password.");
                        }
                      }
                    } catch (err) {
                      setPasswordError(err instanceof Error ? err.message : "Failed to update password.");
                    } finally {
                      setPasswordLoading(false);
                    }
                  }}
                  className="mt-8 space-y-5"
                >
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="current-password" className="block text-sm font-medium text-zinc-400">
                        Current Password
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        value={oldPassword}
                        onChange={(e) => {
                          setOldPassword(e.target.value);
                          setPasswordFieldErrors((p) => ({ ...p, old_password: undefined }));
                        }}
                        disabled={passwordLoading}
                        className={inputElite}
                      />
                      {passwordFieldErrors.old_password && (
                        <p className="text-sm text-red-400">{passwordFieldErrors.old_password}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="block text-sm font-medium text-zinc-400">
                        New Password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password (min 8 characters)"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordFieldErrors((p) => ({ ...p, new_password: undefined }));
                        }}
                        disabled={passwordLoading}
                        minLength={8}
                        className={inputElite}
                      />
                      {passwordFieldErrors.new_password && (
                        <p className="text-sm text-red-400">{passwordFieldErrors.new_password}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label htmlFor="password-otp" className="block text-sm font-medium text-zinc-400">
                          OTP (6 digits)
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user?.email) return;
                            setPasswordOtpLoading(true);
                            setPasswordError(null);
                            setPasswordFieldErrors((p) => ({ ...p, otp: undefined }));
                            try {
                              await reqEmailOtp(user.email, "change password");
                              setPasswordToast("OTP sent to email");
                              setTimeout(() => setPasswordToast(null), 4000);
                            } catch (err) {
                              setPasswordError(err instanceof Error ? err.message : "Failed to send OTP.");
                            } finally {
                              setPasswordOtpLoading(false);
                            }
                          }}
                          disabled={passwordOtpLoading || passwordLoading}
                          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {passwordOtpLoading ? "Sending…" : "Send OTP"}
                        </button>
                      </div>
                      <input
                        id="password-otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="000000"
                        maxLength={6}
                        value={passwordOtp}
                        onChange={(e) => {
                          setPasswordOtp(e.target.value.replace(/\D/g, ""));
                          setPasswordFieldErrors((p) => ({ ...p, otp: undefined }));
                        }}
                        disabled={passwordLoading}
                        className={inputElite}
                      />
                      {passwordFieldErrors.otp && (
                        <p className="text-sm text-red-400">{passwordFieldErrors.otp}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      form="change-password-form"
                      disabled={passwordLoading}
                      suppressHydrationWarning
                      className="h-12 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? "Updating…" : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Phone Number - 1-step direct save via auth/change_phone */}
              <div className="rounded-3xl bg-white/[0.02] p-8">
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  Phone Number
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Add or update your phone number. Select your country code and enter digits only.
                </p>

                {phoneToast && (
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                    {phoneToast}
                  </div>
                )}
                {phoneError && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {phoneError}
                  </div>
                )}

                <form
                  id="phone-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPhoneError(null);
                    const digits = phoneNumber.replace(/\D/g, "");
                    if (!digits || digits.length < 6) {
                      setPhoneError("Please enter a valid phone number (at least 6 digits).");
                      return;
                    }
                    setPhoneLoading(true);
                    try {
                      await changePhone({
                        phone: formattedPhone,
                        otp: 123456,
                      });
                      setUserInfo({
                        first_name: user?.first_name ?? user?.name?.split(" ")[0] ?? "",
                        last_name: user?.last_name ?? user?.name?.split(" ").slice(1).join(" ") ?? "",
                        phone: formattedPhone,
                        linkedin: user?.linkedin ?? undefined,
                        links: user?.links ?? [],
                      });
                      setPhoneToast("Phone number saved.");
                      setTimeout(() => setPhoneToast(null), 3000);
                    } catch (err) {
                      setPhoneError(err instanceof Error ? err.message : "Failed to save phone.");
                    } finally {
                      setPhoneLoading(false);
                    }
                  }}
                  className="mt-8 space-y-5"
                >
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-400">
                      Phone Number
                    </label>
                    <SmartPhoneInput
                      id="phone"
                      value={phoneNumber}
                      onChange={(v) => {
                        setPhoneNumber(v);
                        setPhoneError(null);
                      }}
                      countryCode={phoneDialCode}
                      onCountryCodeChange={(c) => {
                        setPhoneDialCode(c);
                        setPhoneError(null);
                      }}
                      placeholder="98765 43210"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      form="phone-form"
                      disabled={phoneLoading}
                      suppressHydrationWarning
                      className="h-12 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {phoneLoading ? "Saving…" : "Save Phone"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => !deleteLoading && setShowDeleteConfirm(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              This cannot be undone. All your data will be permanently removed.
            </p>
            {deleteError && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {deleteError}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                suppressHydrationWarning
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setDeleteError(null);
                  setDeleteFieldErrors({});
                  if (!deleteOtp || deleteOtp.length !== 6) {
                    setDeleteFieldErrors({ otp: "OTP must be 6 digits." });
                    return;
                  }
                  setDeleteLoading(true);
                  try {
                    const res = await deleteAccount({
                      email: deleteEmail.trim(),
                      password: deletePassword,
                      otp: deleteOtp,
                    });
                    if (res.success) {
                      setShowDeleteConfirm(false);
                      setDeleteToast("Account deleted successfully.");
                      setTimeout(() => setDeleteToast(null), 2000);
                      clearProfile();
                      router.push("/");
                    } else {
                      const err = res.data.error;
                      if (typeof err === "string") {
                        if (err.toLowerCase().includes("email") || err.toLowerCase().includes("exist")) {
                          setDeleteFieldErrors({ email: err });
                        } else if (err.toLowerCase().includes("password") || err.toLowerCase().includes("wrong")) {
                          setDeleteFieldErrors({ password: err });
                        } else if (err.toLowerCase().includes("otp") || err.toLowerCase().includes("invalid")) {
                          setDeleteFieldErrors({ otp: err });
                        } else {
                          setDeleteError(err);
                        }
                      } else if (err && typeof err === "object") {
                        const fieldErrs: { email?: string; password?: string; otp?: string } = {};
                        for (const [k, v] of Object.entries(err)) {
                          const msg = Array.isArray(v) ? v.join(", ") : String(v);
                          if (k === "email") fieldErrs.email = msg;
                          else if (k === "password") fieldErrs.password = msg;
                          else if (k === "otp") fieldErrs.otp = msg;
                        }
                        if (Object.keys(fieldErrs).length > 0) {
                          setDeleteFieldErrors(fieldErrs);
                          setDeleteError(Object.values(fieldErrs).filter(Boolean).join(". "));
                        } else {
                          setDeleteError(Object.values(err).join(". "));
                        }
                      } else {
                        setDeleteError("Failed to delete account.");
                      }
                    }
                  } catch (err) {
                    setDeleteError(err instanceof Error ? err.message : "Failed to delete account.");
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
                suppressHydrationWarning
                className="rounded-xl border border-red-500/30 bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
