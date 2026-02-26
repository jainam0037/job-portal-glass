"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { countryCodes } from "@/data/countries";

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

interface SmartPhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
}

export function SmartPhoneInput({
  value = "",
  onChange,
  countryCode = "+91",
  onCountryCodeChange,
  ...props
}: SmartPhoneInputProps) {
  const [formattedValue, setFormattedValue] = useState(formatPhoneNumber(value));
  const [selectedCode, setSelectedCode] = useState(countryCode);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFormattedValue(formatPhoneNumber(value));
  }, [value]);

  useEffect(() => {
    setSelectedCode(countryCode);
  }, [countryCode]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCountry =
    countryCodes.find((c) => c.dial_code === selectedCode) ?? countryCodes[0];

  const filteredCountries = searchQuery.trim()
    ? countryCodes.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.dial_code.includes(searchQuery)
      )
    : countryCodes;

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhoneNumber(raw);
    setFormattedValue(formatted);
    onChange?.(formatted.replace(/\s/g, ""));
  };

  const handleSelectCountry = (country: (typeof countryCodes)[0]) => {
    setSelectedCode(country.dial_code);
    onCountryCodeChange?.(country.dial_code);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="flex w-full gap-2">
      {/* Country Dropdown */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex min-w-[100px] items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors hover:border-zinc-700 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
        >
          <span>{selectedCountry.flag}</span>
          <span>{selectedCountry.dial_code}</span>
          <ChevronDown
            className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
            {/* Search */}
            <div className="sticky top-0 border-b border-zinc-800 bg-zinc-900 p-2">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5">
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={`${country.code}-${country.dial_code}`}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-800 ${
                      country.dial_code === selectedCode
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-300"
                    }`}
                  >
                    <span>{country.flag}</span>
                    <span>{country.dial_code}</span>
                    <span className="truncate">{country.name}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-center text-sm text-zinc-500">
                  No countries found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <GlassInput
        type="tel"
        value={formattedValue}
        onChange={handleNumberChange}
        placeholder="98765 43210"
        className="flex-1"
        maxLength={11}
        {...props}
      />
    </div>
  );
}
