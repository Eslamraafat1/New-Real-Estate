"use client";

import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { HomeData } from "./types";

/**
 * The homepage catalog is serialized ONCE (here) instead of once per client section — the HTML payload drops
 * by several hundred KB. Sections keep their `{ data, lang }` signature through `withHomeData`.
 */
const Ctx = createContext<HomeData | null>(null);

export function HomeDataProvider({ data, children }: { data: HomeData; children: ReactNode }) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function withHomeData(C: ComponentType<{ data: HomeData; lang: Locale }>) {
  return function WithHomeData({ lang }: { data?: HomeData; lang: Locale }) {
    const data = useContext(Ctx);
    if (!data) throw new Error("HomeDataProvider is missing");
    return <C data={data} lang={lang} />;
  };
}
