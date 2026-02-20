"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <GlassButton
        className="size-9 p-0 bg-transparent border-none shadow-none backdrop-blur-none hover:bg-white/10 active:shadow-none"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 text-zinc-500" />
      </GlassButton>
    );
  }

  const isDark = theme === "dark";

  return (
    <GlassButton
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group size-9 p-0 bg-transparent border-none shadow-none backdrop-blur-none hover:bg-white/10 active:shadow-none"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
      ) : (
        <Moon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
      )}
    </GlassButton>
  );
}
