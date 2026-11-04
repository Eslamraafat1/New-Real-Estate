import type { Locale } from "./config";

export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "USD";
const nl = (l: Locale) => (l === "ar" ? "ar-EG" : "en-US");

export function formatNumber(n: number, l: Locale, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(nl(l), opts).format(n);
}
export function formatMoney(
  n: number,
  l: Locale,
  currency: string = DEFAULT_CURRENCY,
  opts?: { compact?: boolean; decimals?: number },
) {
  // minimumFractionDigits is set explicitly: with only maximumFractionDigits the
  // engines disagree on the currency default (Node 22 renders "$500.0K", current
  // Chromium "$500K"), which made server and client HTML differ (React #418).
  return new Intl.NumberFormat(nl(l), {
    style: "currency",
    currency,
    notation: opts?.compact ? "compact" : "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: opts?.decimals ?? (opts?.compact ? 1 : 0),
  }).format(n);
}
// Fixed time zone so a date renders the same on the server and in any visitor time zone.
export function formatDate(iso: string, l: Locale) {
  return new Intl.DateTimeFormat(nl(l), { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
}
export const AREA_UNIT: Record<Locale, string> = { en: "m²", ar: "م²" };
export const formatArea = (n: number, l: Locale) => `${formatNumber(n, l)} ${AREA_UNIT[l]}`;
