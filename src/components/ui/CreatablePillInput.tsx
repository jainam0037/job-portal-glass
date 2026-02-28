"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface CreatablePillInputProps {
  suggestions: readonly string[] | string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxLimit?: number;
  label?: string;
}

export function CreatablePillInput({
  suggestions,
  value,
  onChange,
  placeholder = "Add...",
  maxLimit = 20,
  label,
}: CreatablePillInputProps) {
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const atLimit = value.length >= maxLimit;
  const suggestionList = [...new Set(Array.isArray(suggestions) ? [...suggestions] : [...suggestions])];

  const filtered = inputVal.trim()
    ? suggestionList.filter((s) =>
        s.toLowerCase().includes(inputVal.trim().toLowerCase())
      )
    : suggestionList;
  const displayList = filtered.slice(0, 12);

  const addItem = useCallback(
    (item: string) => {
      const trimmed = item.trim();
      if (!trimmed || value.includes(trimmed)) return;
      if (value.length >= maxLimit) return;
      onChange([...value, trimmed]);
      setInputVal("");
      setIsOpen(false);
    },
    [value, maxLimit, onChange]
  );

  const removeItem = useCallback(
    (idx: number) => {
      onChange(value.filter((_, i) => i !== idx));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (displayList.length > 0) {
          addItem(displayList[highlightedIndex] ?? displayList[0]);
        } else {
          addItem(inputVal);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (displayList.length > 0) {
          setHighlightedIndex((i) => (i + 1) % displayList.length);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (displayList.length > 0) {
          setHighlightedIndex((i) => (i - 1 + displayList.length) % displayList.length);
        }
      } else if (e.key === "Backspace" && !inputVal && value.length > 0) {
        removeItem(value.length - 1);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [inputVal, value, displayList, highlightedIndex, addItem, removeItem]
  );

  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  }, []);

  const handleFocus = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (!atLimit) setIsOpen(true);
  }, [atLimit]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [inputVal]);

  useEffect(() => {
    setHighlightedIndex((i) => Math.min(i, Math.max(0, displayList.length - 1)));
  }, [displayList.length]);

  useEffect(() => {
    const option = document.getElementById(`creatable-option-${highlightedIndex}`);
    option?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedIndex]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updateRect = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDropdownRect({
            top: rect.bottom + 4,
            left: rect.left,
            width: Math.max(rect.width, 200),
          });
        }
      };
      updateRect();
      window.addEventListener("scroll", updateRect, true);
      window.addEventListener("resize", updateRect);
      return () => {
        window.removeEventListener("scroll", updateRect, true);
        window.removeEventListener("resize", updateRect);
      };
    } else {
      setDropdownRect(null);
    }
  }, [isOpen]);

  useEffect(
    () => () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    },
    []
  );

  const handleSuggestionMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-400">{label}</label>
      )}
      <div
        ref={containerRef}
        className="relative flex min-h-[42px] flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500"
      >
        {value.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] pl-2.5 pr-1 py-1 text-xs text-zinc-300"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="rounded p-0.5 text-zinc-500 hover:bg-white/10 hover:text-white"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            if (!atLimit) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={atLimit}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 border-none bg-transparent py-1.5 text-sm text-white placeholder:text-zinc-500 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        {isOpen && !atLimit && displayList.length > 0 && dropdownRect && typeof document !== "undefined" &&
          createPortal(
            <ul
              className="fixed z-[9999] max-h-48 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl"
              role="listbox"
              aria-activedescendant={displayList[highlightedIndex] ? `creatable-option-${highlightedIndex}` : undefined}
              style={{
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
              }}
            >
              {displayList.map((s, idx) => (
                <li
                  key={s}
                  id={`creatable-option-${idx}`}
                  role="option"
                  aria-selected={idx === highlightedIndex}
                  onClick={() => addItem(s)}
                  onMouseDown={handleSuggestionMouseDown}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                    idx === highlightedIndex
                      ? "bg-white/10 text-white"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {s}
                </li>
              ))}
            </ul>,
            document.body
          )}
      </div>
      {atLimit && (
        <p className="text-xs text-zinc-500">Maximum limit reached</p>
      )}
    </div>
  );
}
