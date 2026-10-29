export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const dirOf = (l: Locale): "ltr" | "rtl" => (l === "ar" ? "rtl" : "ltr");
export const isLocale = (s: string): s is Locale =>
  (locales as readonly string[]).includes(s);

/** Bilingual content field. Backends supply both languages as separate fields. */
export type L = { en: string; ar: string };
export const tr = (v: L | undefined | null, l: Locale): string =>
  v ? v[l] || v.en : "";

/** Prefix an internal path with the active locale. */
export const href = (lang: Locale, path = "/"): string =>
  `/${lang}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;
