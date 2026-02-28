"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { WhatsAppInviteModal } from "@/components/WhatsAppInviteModal";

export function WelcomeModalTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcomeModal(true);
      router.replace(pathname ?? "/profile", { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return (
    <WhatsAppInviteModal
      isOpen={showWelcomeModal}
      onClose={() => setShowWelcomeModal(false)}
    />
  );
}
