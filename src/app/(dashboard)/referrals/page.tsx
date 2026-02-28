"use client";

import { motion } from "framer-motion";
import { User, Star, Zap, Shield, Gem, Crown, Users } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { ReferralCard } from "@/components/ui/ReferralCard";

const REFERRAL_TIERS = [
  { name: "Member", threshold: 0, color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20", dot: "bg-zinc-400", icon: User },
  { name: "Silver", threshold: 5, color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/20", dot: "bg-slate-300", icon: Star },
  { name: "Gold", threshold: 50, color: "text-[#E8B923]", bg: "bg-[#E8B923]/10", border: "border-[#E8B923]/20", dot: "bg-[#E8B923]", icon: Zap },
  { name: "Platinum", threshold: 250, color: "text-[#E5E4E2]", bg: "bg-[#E5E4E2]/10", border: "border-[#E5E4E2]/20", dot: "bg-[#E5E4E2]", icon: Shield },
  { name: "Diamond", threshold: 1000, color: "text-[#9D4EDD]", bg: "bg-[#9D4EDD]/10", border: "border-[#9D4EDD]/20", dot: "bg-[#9D4EDD]", icon: Gem },
  { name: "Apex", threshold: 5000, color: "text-[#FF0054]", bg: "bg-[#FF0054]/10", border: "border-[#FF0054]/20", dot: "bg-[#FF0054]", icon: Crown },
];

export default function ReferralsPage() {
  const user = useProfileStore((s) => s.user);
  const referralCount = (user as { referral_count?: number } | null)?.referral_count ?? 0;
  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${user?._id ?? ""}`;

  const count = referralCount || 0;
  const currentTierIndex = [...REFERRAL_TIERS]
    .reverse()
    .findIndex((t) => count >= t.threshold);
  const currentTier =
    REFERRAL_TIERS[REFERRAL_TIERS.length - 1 - currentTierIndex] ?? REFERRAL_TIERS[0];
  const nextTier = REFERRAL_TIERS[REFERRAL_TIERS.length - currentTierIndex] ?? null;

  const progressPercentage = nextTier
    ? Math.min((count / nextTier.threshold) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl p-6 sm:p-10">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            Status & Referrals
          </h1>
          <p className="text-zinc-400">Track your invites and unlock priority ranking.</p>
        </div>

        {/* Neon Progress Bar Card */}
        <div className="mb-10 rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 shadow-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-300">
                <span className="font-bold text-white">{count}</span> /{" "}
                {nextTier ? nextTier.threshold : "MAX"} Referrals
              </span>
              <span
                className={`ml-3 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold ${currentTier.color}`}
              >
                {currentTier.name} Status
              </span>
            </div>
            <span className="text-sm font-medium text-blue-400">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-white/5 bg-zinc-900">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            {nextTier ? (
              <>
                Unlock{" "}
                <strong className={nextTier.color}>{nextTier.name} Status</strong> to boost your
                priority ranking.
              </>
            ) : (
              "You have reached the highest referral tier!"
            )}
          </p>
        </div>

        {/* Status Roadmap */}
        <div className="mb-12">
          <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-zinc-500 sm:text-left">
            Status Roadmap
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {REFERRAL_TIERS.map((tier) => {
              const isUnlocked = count >= tier.threshold;
              const isNext = nextTier && nextTier.name === tier.name;
              const isCurrentHighest = currentTier.name === tier.name;
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-300 ${
                    isCurrentHighest
                      ? `${tier.bg} ${tier.border} shadow-[0_0_20px_rgba(255,255,255,0.05)] ring-2 ring-white/20`
                      : isUnlocked
                        ? `${tier.bg} ${tier.border} opacity-50 hover:opacity-100`
                        : isNext
                          ? "animate-pulse border-white/20 bg-white/5 shadow-lg"
                          : "border-white/5 bg-zinc-900/20 opacity-40 grayscale-[70%]"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                      isUnlocked ? "bg-white/5" : "bg-black/50 border border-white/5"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${isUnlocked || isNext ? tier.color : "text-zinc-600"}`}
                    />
                  </div>
                  <span
                    className={`text-sm font-bold tracking-wide ${
                      isCurrentHighest ? tier.color : isUnlocked || isNext ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {tier.name}
                  </span>
                  <span className="mt-1 text-xs font-medium text-zinc-500">
                    {tier.threshold > 0 ? `${tier.threshold} Ref` : "Base"}
                  </span>
                  {isUnlocked && (
                    <div
                      className={`absolute top-3 right-3 flex h-3 w-3 items-center justify-center rounded-full border ${tier.bg} ${tier.border}`}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full ${tier.dot}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Referral Card */}
        <div className="flex justify-center">
          <ReferralCard
            badgeText="🚀 Beta Access Program"
            title="Skip the waitlist. Get queried faster."
            description="Engineering teams query top profiles first. Invite friends to boost your visibility and unlock Silver Status."
            referralLink={inviteLink}
            steps={[
              {
                icon: <Zap className="h-4 w-4" />,
                text: "Share your VIP invite link with a fellow engineer.",
              },
              {
                icon: <Crown className="h-4 w-4" />,
                text: "They instantly skip the waitlist when they join.",
              },
              {
                icon: <Users className="h-4 w-4" />,
                text: "You both get +1 towards Silver Status and priority ranking.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
