"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Link2, MessageCircle } from "lucide-react";

interface Step {
  icon: React.ReactNode;
  text: React.ReactNode;
}

export interface ReferralCardProps {
  badgeText: string;
  title: string;
  description: string;
  steps: Step[];
  referralLink: string;
}

export const ReferralCard = ({
  badgeText,
  title,
  description,
  steps,
  referralLink,
}: ReferralCardProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `I just skipped the line on Adzzat Jobs. Use my VIP link to build your endpoint: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-1 shadow-2xl"
    >
      {/* Ambient Background Glows */}
      <div className="relative h-full w-full rounded-[1.4rem] border border-white/5 bg-zinc-950/50 p-6 backdrop-blur-xl sm:p-10">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          >
            {badgeText}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3 bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base"
          >
            {description}
          </motion.p>
        </div>

        {/* Interactive Steps Section */}
        <div className="mb-10 space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group flex items-center gap-5 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-white/5 hover:bg-white/[0.02]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors duration-300 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                {step.icon}
              </div>
              <p className="text-sm font-medium text-zinc-300 transition-colors duration-300 group-hover:text-white">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Link & Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border border-white/10 bg-black/40 p-2 sm:p-3"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="group flex h-12 flex-grow items-center gap-3 rounded-xl border border-transparent bg-zinc-900/50 px-4 transition-all hover:border-white/10 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50">
              <Link2 className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-zinc-300" />
              <input
                readOnly
                value={referralLink}
                className="w-full bg-transparent font-mono text-sm text-zinc-300 outline-none selection:bg-blue-500/30"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="group relative flex h-12 w-32 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:shadow-md active:scale-95 sm:flex-none"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 text-green-400"
                    >
                      <Check className="h-4 w-4" /> Copied
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" /> Copy
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={handleWhatsApp}
                className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#25D366]/20 bg-[#25D366]/10 px-6 text-sm font-semibold text-[#25D366] transition-all duration-300 hover:border-[#25D366]/50 hover:bg-[#25D366]/20 hover:shadow-[0_0_20px_rgba(37,211,102,0.15)] active:scale-95 sm:flex-none"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
