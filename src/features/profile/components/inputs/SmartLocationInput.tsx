"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";

const MOCK_LOCATIONS = [
  "Seattle, WA, USA",
  "San Francisco, CA, USA",
  "New York, NY, USA",
  "Los Angeles, CA, USA",
  "Austin, TX, USA",
  "Boston, MA, USA",
  "Chicago, IL, USA",
  "Denver, CO, USA",
  "Miami, FL, USA",
  "Washington DC, USA",
  "San Diego, CA, USA",
  "Philadelphia, PA, USA",
  "Atlanta, GA, USA",
  "London, UK",
  "Manchester, UK",
  "Berlin, Germany",
  "Munich, Germany",
  "Hamburg, Germany",
  "Frankfurt, Germany",
  "Amsterdam, Netherlands",
  "Paris, France",
  "Lyon, France",
  "Dublin, Ireland",
  "Stockholm, Sweden",
  "Zurich, Switzerland",
  "Geneva, Switzerland",
  "Vienna, Austria",
  "Copenhagen, Denmark",
  "Helsinki, Finland",
  "Oslo, Norway",
  "Warsaw, Poland",
  "Barcelona, Spain",
  "Madrid, Spain",
  "Lisbon, Portugal",
  "Milan, Italy",
  "Rome, Italy",
  "Mumbai, India",
  "Mumbai, Maharashtra, India",
  "Bangalore, Karnataka, India",
  "Hyderabad, Telangana, India",
  "Delhi, India",
  "Chennai, Tamil Nadu, India",
  "Pune, Maharashtra, India",
  "Gurgaon, Haryana, India",
  "Noida, Uttar Pradesh, India",
  "Tokyo, Japan",
  "Osaka, Japan",
  "Yokohama, Japan",
  "Singapore",
  "Hong Kong",
  "Shanghai, China",
  "Beijing, China",
  "Shenzhen, China",
  "Seoul, South Korea",
  "Busan, South Korea",
  "Sydney, Australia",
  "Melbourne, Australia",
  "Tel Aviv, Israel",
  "Dubai, UAE",
  "Abu Dhabi, UAE",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Montreal, Canada",
  "São Paulo, Brazil",
  "Rio de Janeiro, Brazil",
  "Mexico City, Mexico",
];

interface SmartLocationInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

export function SmartLocationInput({
  value = "",
  onChange,
  ...props
}: SmartLocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = inputValue.trim().length >= 2
    ? MOCK_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    onChange?.(v);
    setIsOpen(true);
  };

  const handleSelect = (location: string) => {
    setInputValue(location);
    onChange?.(location);
    setIsOpen(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "<mark class='bg-indigo-500/30 text-white rounded'>$1</mark>");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <GlassInput
        icon={<MapPin className="h-5 w-5" />}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="e.g. Mumbai, India"
        autoComplete="off"
        {...props}
      />
      {isOpen && inputValue.trim().length >= 2 && (
        <ul
          className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl"
          role="listbox"
        >
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location) => (
              <li
                key={location}
                role="option"
                onClick={() => handleSelect(location)}
                className="cursor-pointer px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(location, inputValue),
                  }}
                />
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-sm text-zinc-500">
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
