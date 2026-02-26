"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRIES, getCountryLabel } from "@/lib/constants/countries";

export type LocationGridType = "residence" | "work";

export interface LocationGridValue {
  country: string;
  state: string;
  city: string;
}

const inputStyles =
  "w-full rounded-xl border border-white/10 bg-zinc-800/30 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-1 focus:ring-white/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-800/20";

interface LocationGridProps {
  type: LocationGridType;
  value: LocationGridValue;
  onChange: (v: LocationGridValue) => void;
  label?: string;
}

export function LocationGrid({
  type,
  value,
  onChange,
  label,
}: LocationGridProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const displayLabel = label ?? (type === "residence" ? "Location" : "Preferred work location");
  const countryLabel = getCountryLabel(value.country) || "Select country";

  const filtered = query.trim()
    ? COUNTRIES.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    : [{ label: "Select country", value: "" }, ...COUNTRIES];

  const selectCountry = useCallback(
    (iso: string) => {
      const prevCountry = value.country;
      onChange({
        ...value,
        country: iso,
        state: prevCountry === iso ? value.state : "",
        city: prevCountry === iso ? value.city : "",
      });
      setQuery("");
      setIsOpen(false);
    },
    [value, onChange]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="mb-1 text-xs font-medium text-zinc-400 ml-1">
          {displayLabel}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((p) => !p)}
          className={`${inputStyles} flex w-full items-center justify-between text-left`}
        >
          <span className={value.country ? "text-white" : "text-zinc-500"}>
            {countryLabel}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
            <div className="sticky top-0 border-b border-zinc-800 bg-zinc-900 p-2">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5">
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                  autoFocus
                />
              </div>
            </div>
            <ul className="max-h-48 overflow-y-auto py-1" role="listbox">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <li
                    key={c.value || "__empty__"}
                    role="option"
                    onClick={() => selectCountry(c.value)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-white ${
                      value.country === c.value ? "bg-white/5 text-white" : "text-zinc-300"
                    }`}
                  >
                    {c.label}
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-sm text-zinc-500">
                  No countries found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400 ml-1">
            State / Province
          </label>
          <input
            type="text"
            value={value.state}
            onChange={(e) => {
              const newState = e.target.value;
              onChange({
                ...value,
                state: newState,
                city: newState.trim() ? value.city : "",
              });
            }}
            placeholder="e.g. Maharashtra"
            className={inputStyles}
            disabled={!value.country}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400 ml-1">
            City
          </label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="e.g. Mumbai"
            className={inputStyles}
            disabled={!value.state}
          />
        </div>
      </div>
    </div>
  );
}
