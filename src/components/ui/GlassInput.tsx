"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

export interface GlassInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  icon?: React.ReactNode;
  prefixText?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  (
    { className = "", type = "text", icon, prefixText, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const hasIcon = Boolean(icon);
    const hasPrefix = Boolean(prefixText);

    const wrapperClasses = [
      "relative flex w-full items-center rounded-xl",
      "bg-zinc-900 border border-zinc-800",
      "transition-all duration-200 ease-out",
      "focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500",
    ]
      .filter(Boolean)
      .join(" ");

    const inputClasses = [
      "min-w-0 py-2.5 text-sm",
      "bg-transparent text-white placeholder:text-zinc-500",
      "outline-none border-none",
      "transition-all duration-200 ease-out",
      "w-full",
      hasPrefix ? "flex-1 pl-0" : hasIcon ? "pl-11" : "px-4",
      isPassword ? "pr-10" : "pr-4",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const renderInput = () => (
      <input
        ref={ref}
        type={inputType}
        className={inputClasses}
        suppressHydrationWarning
        {...props}
      />
    );

    const content = (
      <>
        {hasIcon && (
          <span className="pointer-events-none flex shrink-0 items-center pl-3 pr-2.5 text-zinc-500">
            {icon}
          </span>
        )}
        {hasPrefix ? (
          <>
            <span
              className={`shrink-0 text-zinc-500 select-none text-sm ${hasIcon ? "pl-2" : "pl-3"}`}
            >
              {prefixText}
            </span>
            {renderInput()}
          </>
        ) : (
          renderInput()
        )}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </>
    );

    if (hasIcon || hasPrefix || isPassword) {
      return (
        <div className={wrapperClasses}>
          {content}
        </div>
      );
    }

    const simpleInputClasses = [
      "w-full rounded-xl px-4 py-2.5 text-sm",
      "bg-zinc-900 border border-zinc-800",
      "text-white placeholder:text-zinc-500",
      "outline-none",
      "transition-all duration-200 ease-out",
      "focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500",
      "focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <input
        ref={ref}
        type={type}
        className={simpleInputClasses}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);

GlassInput.displayName = "GlassInput";
