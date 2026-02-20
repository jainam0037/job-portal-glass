"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1980 + 1 }, (_, i) =>
  String(currentYear - i)
);

interface MonthYearPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  disabled?: boolean;
}

export function MonthYearPicker({
  value,
  onChange,
  label,
  disabled = false,
}: MonthYearPickerProps) {
  const [month, setMonth] = useState(value?.split("-")[1] ?? "");
  const [year, setYear] = useState(value?.split("-")[0] ?? "");

  useEffect(() => {
    const [y, m] = value?.split("-") ?? ["", ""];
    setYear(y);
    setMonth(m);
  }, [value]);

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    if (year && newMonth) onChange(`${year}-${newMonth}`);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    if (newYear && month) onChange(`${newYear}-${month}`);
  };

  const selectClass =
    "flex-1 bg-transparent text-white text-sm px-3 py-3 outline-none appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 [&>option]:bg-zinc-900 [&>option]:text-white";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="mb-1.5 ml-1 block text-xs font-medium text-zinc-400">
          {label}
        </label>
      )}
      <div className="flex items-center overflow-hidden rounded-xl border border-white/10 bg-zinc-800/30 transition-all outline-none focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/20">
        <select
          value={month ?? ""}
          onChange={(e) => handleMonthChange(e.target.value)}
          disabled={disabled}
          className={selectClass}
        >
          <option value="" disabled>
            Month
          </option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <div className="h-5 w-px shrink-0 bg-white/10" />
        <select
          value={year ?? ""}
          onChange={(e) => handleYearChange(e.target.value)}
          disabled={disabled}
          className={selectClass}
        >
          <option value="" disabled>
            Year
          </option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none mr-3 h-4 w-4 shrink-0 text-zinc-500" />
      </div>
    </div>
  );
}
