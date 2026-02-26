export interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

/**
 * Top 15 tech hubs. Structure allows easy extension to full ~200 country list.
 */
export const countryCodes: CountryCode[] = [
  { code: "IN", name: "India", dial_code: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial_code: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial_code: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dial_code: "+1", flag: "🇨🇦" },
  { code: "DE", name: "Germany", dial_code: "+49", flag: "🇩🇪" },
  { code: "AU", name: "Australia", dial_code: "+61", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", dial_code: "+65", flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", dial_code: "+971", flag: "🇦🇪" },
  { code: "FR", name: "France", dial_code: "+33", flag: "🇫🇷" },
  { code: "JP", name: "Japan", dial_code: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dial_code: "+86", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", dial_code: "+55", flag: "🇧🇷" },
  { code: "NL", name: "Netherlands", dial_code: "+31", flag: "🇳🇱" },
  { code: "IE", name: "Ireland", dial_code: "+353", flag: "🇮🇪" },
  { code: "KR", name: "South Korea", dial_code: "+82", flag: "🇰🇷" },
];

/**
 * Get the flag emoji for a given dial code (e.g. "+91" -> "🇮🇳").
 * Returns the first match when multiple countries share a dial code (e.g. US/CA both +1).
 */
export function getCountryFlag(dialCode: string): string | undefined {
  const normalized = dialCode.startsWith("+") ? dialCode : `+${dialCode}`;
  return countryCodes.find((c) => c.dial_code === normalized)?.flag;
}
