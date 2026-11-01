"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dict } from "@/lib/i18n";

/**
 * The root layout only ships the CORE dictionary namespaces to the browser (keeps every page's HTML small).
 * Routes whose client components need more (home, property detail, admin, journal…) wrap their content in
 * <DictScope ns={{ home: d.home }}> — `useApp().t` then includes those namespaces.
 */
export const ExtraDictContext = createContext<Partial<Dict> | null>(null);

export function DictScope({ ns, children }: { ns: Partial<Dict>; children: ReactNode }) {
  const parent = useContext(ExtraDictContext);
  return <ExtraDictContext.Provider value={parent ? { ...parent, ...ns } : ns}>{children}</ExtraDictContext.Provider>;
}
