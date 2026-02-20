"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { countryCodes } from "@/data/countries";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-800/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-white/20 focus:ring-1 focus:ring-white/20";

const labelClass = "mb-1.5 ml-1 block text-xs font-medium text-zinc-400";

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  placeholder?: string;
}

export function CountrySelect({
  value,
  onChange,
  label,
  placeholder = "Select country",
}: CountrySelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? countryCodes.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase().includes(query.toLowerCase())
      )
    : countryCodes;

  const displayValue = value
    ? countryCodes.find((c) => c.code === value)?.name ?? value
    : "";

  const selectCountry = useCallback(
    (country: (typeof countryCodes)[0]) => {
      onChange(country.code);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange]
  );

  return (
    <div className="space-y-1.5">
      {label && <label className={labelClass}>{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen && query ? query : displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={placeholder}
          className={inputClass}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      {isOpen && filtered.length > 0 && (
        <ul
          className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl"
          role="listbox"
        >
          {filtered.map((c) => (
            <li
              key={c.code}
              role="option"
              onClick={() => selectCountry(c)}
              onMouseDown={(e) => e.preventDefault()}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 hover:text-white ${
                value === c.code ? "bg-white/5 text-white" : "text-zinc-300"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
