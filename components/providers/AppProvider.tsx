"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { dirOf, href as hrefFor, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n";
import { ExtraDictContext } from "./DictScope";
import { compareStore, favoritesStore, searchesStore, themeStore, type SavedSearch } from "@/lib/store";

type ThemePref = "light" | "dark" | "system";

interface AppCtx {
  lang: Locale;
  dir: "ltr" | "rtl";
  t: Dict;
  /** Locale-prefixed internal path. */
  href: (path?: string) => string;
  themePref: ThemePref;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark", origin?: { x: number; y: number }) => void;
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  compare: string[];
  inCompare: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  searches: SavedSearch[];
  saveSearch: (name: string, query: string, purpose?: string) => void;
  deleteSearch: (id: string) => void;
  toast: (msg: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

const subscribeDark = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function AppProvider({ lang, dict, children }: { lang: Locale; dict: Dict; children: ReactNode }) {
  const themePref = themeStore.useStore();
  const systemDark = useSyncExternalStore(subscribeDark, () => window.matchMedia("(prefers-color-scheme: dark)").matches, () => false);
  const theme: "light" | "dark" = themePref === "system" ? (systemDark ? "dark" : "light") : themePref;

  const favorites = favoritesStore.useStore();
  const compare = compareStore.useStore();
  const searches = searchesStore.useStore();
  const [toastMsg, setToastMsg] = useState<{ id: number; msg: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Reflect the resolved theme on <html>. The inline script in the layout sets the first paint.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toast = useCallback((msg: string) => {
    setToastMsg({ id: Date.now(), msg });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const setTheme = useCallback((next: "light" | "dark", origin?: { x: number; y: number }) => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      // "Nightfall": a controlled lighting transition — colours ease over ~0.9s while a warm light sweeps from the toggle.
      root.classList.add("theme-fade");
      const veil = document.createElement("div");
      veil.className = "nightfall";
      if (origin) {
        veil.style.setProperty("--nx", `${(origin.x / window.innerWidth) * 100}%`);
        veil.style.setProperty("--ny", `${(origin.y / window.innerHeight) * 100}%`);
      }
      veil.setAttribute("aria-hidden", "true");
      if (next === "dark") document.body.appendChild(veil);
      window.setTimeout(() => { root.classList.remove("theme-fade"); veil.remove(); }, 1150);
    }
    themeStore.set(next);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const has = favoritesStore.get().includes(id);
    favoritesStore.set((f) => (has ? f.filter((x) => x !== id) : [...f, id]));
    toast(has ? dict.common.save + " ✕" : dict.common.saved + " ✓");
  }, [toast, dict]);

  const toggleCompare = useCallback((id: string) => {
    const cur = compareStore.get();
    if (cur.includes(id)) compareStore.set(cur.filter((x) => x !== id));
    else if (cur.length >= 3) toast(dict.compare.limit);
    else compareStore.set([...cur, id]);
  }, [toast, dict]);

  const value = useMemo<AppCtx>(() => ({
    lang, dir: dirOf(lang), t: dict,
    href: (p = "/") => hrefFor(lang, p),
    themePref, theme, setTheme,
    favorites, isFavorite: (id) => favorites.includes(id), toggleFavorite,
    compare, inCompare: (id) => compare.includes(id), toggleCompare, clearCompare: () => compareStore.set([]),
    searches,
    saveSearch: (name, query, purpose) =>
      searchesStore.set((s) => [{ id: `s-${Date.now()}`, name, query, purpose, createdAt: new Date().toISOString() }, ...s]),
    deleteSearch: (id) => searchesStore.set((s) => s.filter((x) => x.id !== id)),
    toast,
  }), [lang, dict, themePref, theme, setTheme, favorites, toggleFavorite, compare, toggleCompare, searches, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-20 z-[120] flex justify-center px-4 md:bottom-8">
        {toastMsg && (
          <div key={toastMsg.id} className="annot !text-paper bg-ink px-4 py-3 shadow-lg" style={{ color: "var(--paper)" }}>
            {toastMsg.msg}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  const extra = useContext(ExtraDictContext);
  const merged = useMemo(() => (c && extra ? { ...c, t: { ...c.t, ...extra } as Dict } : c), [c, extra]);
  if (!merged) throw new Error("useApp must be used inside <AppProvider>");
  return merged;
}
export const useT = () => useApp().t;
