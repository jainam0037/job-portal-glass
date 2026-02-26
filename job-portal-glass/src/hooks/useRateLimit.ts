"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULT_COOLDOWN = 60;

/**
 * Hook for UI-level rate limiting. Tracks cooldown state and countdown timer.
 * Use when catching 429 from auth forms.
 */
export function useRateLimit() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const triggerRateLimit = useCallback((seconds = DEFAULT_COOLDOWN) => {
    setIsRateLimited(true);
    setCooldownSeconds(seconds);
  }, []);

  useEffect(() => {
    if (!isRateLimited || cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRateLimited, cooldownSeconds]);

  return { isRateLimited, cooldownSeconds, triggerRateLimit };
}
