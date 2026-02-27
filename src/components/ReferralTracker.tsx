"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function ReferralTrackerInner() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref && typeof window !== "undefined") {
      localStorage.setItem("adzzat_referred_by", ref);
      console.log("✅ Referral code saved:", ref);
    }
  }, [ref]);

  return null;
}

export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerInner />
    </Suspense>
  );
}
