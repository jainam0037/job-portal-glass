"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

type Tab = "account" | "security";

const inputElite =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-white/20 focus:ring-1 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [emailStep, setEmailStep] = useState<"input" | "otp">("input");
  const [deleteStep, setDeleteStep] = useState<"input" | "otp">("input");
  const [passwordStep, setPasswordStep] = useState<"input" | "otp">("input");
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

                <form
                  id="change-email-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (emailStep === "input") {
                      setEmailStep("otp");
                      console.log("Send Verification Codes clicked");
                    } else {
                      console.log("Verify & Save Email submitted");
                    }
                  }}
                  className="mt-8 space-y-5"
                >
                  {/* Step 1: Email inputs only */}
                  {(emailStep === "input" || emailStep === "otp") && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="current-email" className="block text-sm font-medium text-zinc-400">
                          Current Email
                        </label>
                        <input
                          id="current-email"
                          type="email"
                          placeholder="you@example.com"
                          disabled={emailStep === "otp"}
                          readOnly={emailStep === "otp"}
                          aria-readonly={emailStep === "otp"}
                          className={inputElite}
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
                          disabled={emailStep === "otp"}
                          readOnly={emailStep === "otp"}
                          aria-readonly={emailStep === "otp"}
                          className={inputElite}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: OTP fields (revealed after "Send Verification Codes") */}
                  {emailStep === "otp" && (
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
                          className={inputElite}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      form="change-email-form"
                      suppressHydrationWarning
                      className="h-12 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
                    >
                      {emailStep === "input"
                        ? "Send Verification Codes"
                        : "Verify & Save Email"}
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

                <form
                  id="delete-account-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (deleteStep === "input") {
                      setDeleteStep("otp");
                      console.log("Request Deletion clicked");
                    } else {
                      setShowDeleteConfirm(true);
                    }
                  }}
                  className="mt-8 space-y-5"
                >
                  {/* Step 1: Email & Password only */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="delete-email" className="block text-sm font-medium text-zinc-400">
                        Email
                      </label>
                      <input
                        id="delete-email"
                        type="email"
                        placeholder="Confirm your email"
                        disabled={deleteStep === "otp"}
                        readOnly={deleteStep === "otp"}
                        aria-readonly={deleteStep === "otp"}
                        className={inputElite}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="delete-password" className="block text-sm font-medium text-zinc-400">
                        Password
                      </label>
                      <input
                        id="delete-password"
                        type="password"
                        placeholder="Enter your password"
                        disabled={deleteStep === "otp"}
                        aria-readonly={deleteStep === "otp"}
                        className={inputElite}
                      />
                    </div>
                  </div>

                  {/* Step 2: OTP revealed after "Request Deletion" */}
                  {deleteStep === "otp" && (
                    <div className="space-y-2">
                      <label htmlFor="delete-otp" className="block text-sm font-medium text-zinc-400">
                        OTP
                      </label>
                      <input
                        id="delete-otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        className={inputElite}
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      form="delete-account-form"
                      suppressHydrationWarning
                      className="h-12 rounded-xl border border-red-500/20 bg-red-500/10 px-6 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                    >
                      {deleteStep === "input"
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
              {/* Change Password - Progressive Disclosure */}
              <div className="mb-12 rounded-3xl bg-white/[0.02] p-8">
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  Change Password
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Update your password to keep your account secure.
                </p>

                <form
                  id="change-password-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (passwordStep === "input") {
                      setPasswordStep("otp");
                      console.log("Request OTP clicked (password)");
                    } else {
                      console.log("Update Password submitted");
                    }
                  }}
                  className="mt-8 space-y-5"
                >
                  {(passwordStep === "input" || passwordStep === "otp") && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="current-password" className="block text-sm font-medium text-zinc-400">
                          Current Password
                        </label>
                        <input
                          id="current-password"
                          type="password"
                          placeholder="Enter current password"
                          disabled={passwordStep === "otp"}
                          aria-readonly={passwordStep === "otp"}
                          className={inputElite}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="new-password" className="block text-sm font-medium text-zinc-400">
                          New Password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password (min 8 characters)"
                          disabled={passwordStep === "otp"}
                          aria-readonly={passwordStep === "otp"}
                          className={inputElite}
                        />
                      </div>
                    </div>
                  )}

                  {passwordStep === "otp" && (
                    <div className="space-y-2">
                      <label htmlFor="password-otp" className="block text-sm font-medium text-zinc-400">
                        OTP
                      </label>
                      <input
                        id="password-otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        className={inputElite}
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      suppressHydrationWarning
                      className="h-12 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
                    >
                      {passwordStep === "input"
                        ? "Request OTP"
                        : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Phone Number - Progressive Disclosure */}
              <div className="rounded-3xl bg-white/[0.02] p-8">
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  Phone Number
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Add or update your phone number for account recovery.
                </p>

                <form
                  id="phone-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (phoneStep === "input") {
                      setPhoneStep("otp");
                      console.log("Request OTP clicked (phone)");
                    } else {
                      console.log("Verify & Save Phone submitted");
                    }
                  }}
                  className="mt-8 space-y-5"
                >
                  {(phoneStep === "input" || phoneStep === "otp") && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-zinc-400">
                          Phone Number (E.164 format)
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+919876543210"
                          disabled={phoneStep === "otp"}
                          readOnly={phoneStep === "otp"}
                          aria-readonly={phoneStep === "otp"}
                          className={inputElite}
                        />
                      </div>
                    </div>
                  )}

                  {phoneStep === "otp" && (
                    <div className="space-y-2">
                      <label htmlFor="phone-otp" className="block text-sm font-medium text-zinc-400">
                        OTP
                      </label>
                      <input
                        id="phone-otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        className={inputElite}
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      suppressHydrationWarning
                      className="h-12 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
                    >
                      {phoneStep === "input"
                        ? "Request OTP"
                        : "Verify & Save Phone"}
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
          onClick={() => setShowDeleteConfirm(false)}
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
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                suppressHydrationWarning
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  console.log("Delete Account confirmed and submitted");
                }}
                suppressHydrationWarning
                className="rounded-xl border border-red-500/30 bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
