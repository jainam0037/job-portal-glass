"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ButtonHTMLAttributes } from "react";

export interface GlassButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassButton({
  children,
  className = "",
  onClick,
  ...rest
}: GlassButtonProps) {
  return (
    <motion.button
      type="button"
      suppressHydrationWarning
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={[
        "relative overflow-hidden rounded-xl px-5 py-2.5 font-medium",
        "bg-white/10 backdrop-blur-[20px]",
        "border border-white/20",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        "text-zinc-100 transition-colors duration-200",
        "hover:bg-white/15 hover:border-white/25",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        "active:shadow-[inset_0_1px_1px_0_rgba(0,0,0,0.08)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
