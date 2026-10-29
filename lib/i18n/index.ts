import type { Locale } from "./config";
import { en, type Dict } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

export type { Dict };
const dicts: Record<Locale, Dict> = { en, ar };
export const getDictionary = (l: Locale): Dict => dicts[l];

/** Replace {placeholders}: fmt("{n} results", { n: 3 }). */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
