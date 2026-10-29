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
  return new Intl.NumberFormat(nl(l), {
    style: "currency",
    currency,
    notation: opts?.compact ? "compact" : "standard",
    maximumFractionDigits: opts?.decimals ?? (opts?.compact ? 1 : 0),
  }).format(n);
}
export function formatDate(iso: string, l: Locale) {
  return new Intl.DateTimeFormat(nl(l), { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}
export const AREA_UNIT: Record<Locale, string> = { en: "m²", ar: "م²" };
export const formatArea = (n: number, l: Locale) => `${formatNumber(n, l)} ${AREA_UNIT[l]}`;
