"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { DEFAULT_CURRENCY, formatArea, formatDate, formatMoney, formatNumber } from "@/lib/i18n/format";

/** Locale-aware formatters bound to the active language. */
export function useFormat() {
  const { lang } = useApp();
  return useMemo(
    () => ({
      money: (n: number, currency: string = DEFAULT_CURRENCY, o?: { compact?: boolean; decimals?: number }) => formatMoney(n, lang, currency, o),
      num: (n: number, o?: Intl.NumberFormatOptions) => formatNumber(n, lang, o),
      area: (n: number) => formatArea(n, lang),
      date: (iso: string) => formatDate(iso, lang),
    }),
    [lang],
  );
}

/** Media-query hook that is hydration-safe (false on the server). */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

interface AsyncState<T> { key: string; data?: T; error?: unknown }

/**
 * Keyed async loader: `loading` is derived (state.key !== key), so there is no synchronous
 * setState in the effect. Aborts stale requests.
 */
export function useAsync<T>(key: string, fn: (signal: AbortSignal) => Promise<T>, reloadToken = 0, initial?: { key: string; data: T }) {
  // `initial` lets a server-rendered first result seed the state so the first view needs no client fetch.
  const [state, setState] = useState<AsyncState<T>>(() => (initial ? { key: `${initial.key}#0`, data: initial.data } : { key: "" }));
  const seeded = useRef(initial ? `${initial.key}#0` : null);
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });
  const full = `${key}#${reloadToken}`;
  useEffect(() => {
    if (seeded.current === full) { seeded.current = null; return; }
    const ac = new AbortController();
    fnRef.current(ac.signal).then(
      (data) => { if (!ac.signal.aborted) setState({ key: full, data }); },
      (error) => { if (!ac.signal.aborted) setState({ key: full, error }); },
    );
    return () => ac.abort();
  }, [full]);
  const fresh = state.key === full;
  return {
    loading: !fresh,
    data: state.data,
    error: fresh ? state.error : undefined,
  };
}
