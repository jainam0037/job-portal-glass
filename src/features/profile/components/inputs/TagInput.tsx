"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function TagInput({ value, onChange, placeholder = "Add...", label }: TagInputProps) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInputVal("");
      }
    },
    [value, onChange]
  );

  const removeTag = useCallback(
    (idx: number) => {
      onChange(value.filter((_, i) => i !== idx));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(inputVal);
      } else if (e.key === "Backspace" && !inputVal && value.length > 0) {
        removeTag(value.length - 1);
      }
    },
    [inputVal, value, addTag, removeTag]
  );

  const handleBlur = useCallback(() => {
    if (inputVal.trim()) addTag(inputVal);
  }, [inputVal, addTag]);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-400">{label}</label>
      )}
      <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500">
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] pl-2.5 pr-1 py-1 text-xs text-zinc-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="rounded p-0.5 text-zinc-500 hover:bg-white/10 hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 border-none bg-transparent py-1.5 text-sm text-white placeholder:text-zinc-500 outline-none"
        />
      </div>
    </div>
  );
}
