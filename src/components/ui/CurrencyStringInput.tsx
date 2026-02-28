"use client";

import { useCallback, useEffect, useState } from "react";
import { CURRENCIES } from "@/lib/constants/data";

export function parseCurrencyString(value: string): { currency: string; amount: string } {
  if (!value?.trim()) return { currency: "USD", amount: "" };
  const parts = value.trim().split(/\s+/);
  if (parts.length >= 2 && CURRENCIES.includes(parts[0] as (typeof CURRENCIES)[number])) {
    return { currency: parts[0], amount: parts.slice(1).join("").replace(/,/g, "") };
  }
  if (parts.length === 1) {
    const maybeCurrency = parts[0];
    if (CURRENCIES.includes(maybeCurrency as (typeof CURRENCIES)[number])) {
      return { currency: maybeCurrency, amount: "" };
    }
    return { currency: "USD", amount: parts[0].replace(/,/g, "") };
  }
  return { currency: "USD", amount: parts.join("").replace(/,/g, "") };
}

interface CurrencyStringInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function CurrencyStringInput({
  value,
  onChange,
  placeholder = "0",
  label,
}: CurrencyStringInputProps) {
  const parsed = parseCurrencyString(value);
  const [localCurrency, setLocalCurrency] = useState(parsed.currency);
  const [localAmount, setLocalAmount] = useState(parsed.amount);

  useEffect(() => {
    const { currency, amount } = parseCurrencyString(value);
    setLocalCurrency(currency);
    setLocalAmount(amount);
  }, [value]);

  const emitChange = useCallback(
    (currency: string, amount: string) => {
      const combined = amount ? `${currency} ${amount}` : `${currency}`;
      onChange(combined.trim());
    },
    [onChange]
  );

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setLocalCurrency(newCurrency);
    emitChange(newCurrency, localAmount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setLocalAmount(raw);
    emitChange(localCurrency, raw);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-400">{label}</label>
      )}
      <div className="flex gap-2">
        <select
          value={localCurrency}
          onChange={handleCurrencyChange}
          className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          inputMode="numeric"
          value={localAmount}
          onChange={handleAmountChange}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
        />
      </div>
    </div>
  );
}
