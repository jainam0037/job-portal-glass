"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_LINK = "https://chat.whatsapp.com/KsqJj2X3Ogy7trjj5TyLSR";

interface WhatsAppInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppInviteModal({ isOpen, onClose }: WhatsAppInviteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div
        className="mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glassmorphism content */}
        <div className="p-8">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 ring-2 ring-emerald-400/30">
            <MessageCircle className="h-9 w-9 text-emerald-400" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h2
            id="whatsapp-modal-title"
            className="text-center text-2xl font-bold tracking-tight text-white"
          >
            Welcome! Join our Community
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-center text-sm leading-relaxed text-zinc-400">
            Connect with fellow developers, get job alerts, and share opportunities in our exclusive
            WhatsApp group. It&apos;s free and only takes a second.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-[#20bd5a] hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={2} />
              Join via WhatsApp
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-6 py-3 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
