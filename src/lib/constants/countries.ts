/**
 * Country dictionary for location inputs. Label (display) + value (ISO 3166-1 alpha-2).
 * Backend expects 2-character ISO codes (e.g. country_residence: "IN").
 */
export interface CountryOption {
  label: string;
  value: string;
}

export const COUNTRIES: CountryOption[] = [
  { label: "Afghanistan", value: "AF" },
  { label: "Australia", value: "AU" },
  { label: "Austria", value: "AT" },
  { label: "Bangladesh", value: "BD" },
  { label: "Belgium", value: "BE" },
  { label: "Brazil", value: "BR" },
  { label: "Canada", value: "CA" },
  { label: "Chile", value: "CL" },
  { label: "China", value: "CN" },
  { label: "Colombia", value: "CO" },
  { label: "Czech Republic", value: "CZ" },
  { label: "Denmark", value: "DK" },
  { label: "Egypt", value: "EG" },
  { label: "Finland", value: "FI" },
  { label: "France", value: "FR" },
  { label: "Germany", value: "DE" },
  { label: "Greece", value: "GR" },
  { label: "Hong Kong", value: "HK" },
  { label: "Hungary", value: "HU" },
  { label: "India", value: "IN" },
  { label: "Indonesia", value: "ID" },
  { label: "Ireland", value: "IE" },
  { label: "Israel", value: "IL" },
  { label: "Italy", value: "IT" },
  { label: "Japan", value: "JP" },
  { label: "Kenya", value: "KE" },
  { label: "Malaysia", value: "MY" },
  { label: "Mexico", value: "MX" },
  { label: "Netherlands", value: "NL" },
  { label: "New Zealand", value: "NZ" },
  { label: "Nigeria", value: "NG" },
  { label: "Norway", value: "NO" },
  { label: "Pakistan", value: "PK" },
  { label: "Philippines", value: "PH" },
  { label: "Poland", value: "PL" },
  { label: "Portugal", value: "PT" },
  { label: "Romania", value: "RO" },
  { label: "Russia", value: "RU" },
  { label: "Saudi Arabia", value: "SA" },
  { label: "Singapore", value: "SG" },
  { label: "South Africa", value: "ZA" },
  { label: "South Korea", value: "KR" },
  { label: "Spain", value: "ES" },
  { label: "Sweden", value: "SE" },
  { label: "Switzerland", value: "CH" },
  { label: "Taiwan", value: "TW" },
  { label: "Thailand", value: "TH" },
  { label: "Turkey", value: "TR" },
  { label: "Ukraine", value: "UA" },
  { label: "United Arab Emirates", value: "AE" },
  { label: "United Kingdom", value: "GB" },
  { label: "United States", value: "US" },
  { label: "Vietnam", value: "VN" },
];

/** Get country label by ISO code. */
export function getCountryLabel(isoCode: string | undefined): string {
  if (!isoCode) return "";
  return COUNTRIES.find((c) => c.value === isoCode)?.label ?? isoCode;
}

/** Normalize country to ISO 2-letter code. Accepts full name or ISO code. */
export function getCountryCode(labelOrCode: string | undefined): string {
  if (!labelOrCode?.trim()) return "";
  const trimmed = labelOrCode.trim();
  const byValue = COUNTRIES.find((c) => c.value === trimmed);
  if (byValue) return byValue.value;
  const byLabel = COUNTRIES.find((c) => c.label.toLowerCase() === trimmed.toLowerCase());
  return byLabel?.value ?? trimmed;
}
