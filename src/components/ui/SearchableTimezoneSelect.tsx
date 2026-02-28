"use client";

import { useCallback, useRef, useState } from "react";
import { TIMEZONES } from "@/lib/constants/data";

interface SearchableTimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function SearchableTimezoneSelect({
  value,
  onChange,
  label,
  placeholder = "Search timezone...",
}: SearchableTimezoneSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? TIMEZONES.filter((tz) =>
        tz.toLowerCase().replace(/_/g, " ").includes(query.toLowerCase().replace(/_/g, " "))
      )
    : ["", ...TIMEZONES];

  const showDropdown = isOpen && filtered.length > 0;

  const selectTimezone = useCallback(
    (tz: string) => {
      onChange(tz);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange]
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-400">{label}</label>
      )}
      <div ref={containerRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen && query ? query : (value ? value.replace(/_/g, " ") : "")}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
        />
        {showDropdown && (
          <ul
            className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-lg"
            role="listbox"
          >
            {filtered.map((tz) => (
              <li
                key={tz || "__empty__"}
                role="option"
                onClick={() => selectTimezone(tz)}
                onMouseDown={(e) => e.preventDefault()}
                className={`cursor-pointer px-4 py-2.5 text-sm hover:bg-white/5 hover:text-white ${
                  value === tz ? "bg-white/5 text-white" : "text-zinc-300"
                }`}
              >
                {tz ? tz.replace(/_/g, " ") : "Not specified"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
