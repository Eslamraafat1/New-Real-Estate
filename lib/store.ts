import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed external store. Server snapshot is always `initial`
 * so hydration is stable; the persisted value appears right after hydration.
 */
export function createStore<T>(key: string, initial: T) {
  let cache: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) cache = JSON.parse(raw) as T;
      } catch {
        /* storage unavailable (private mode etc.) — keep in-memory value */
      }
      window.addEventListener("storage", (e) => {
        if (e.key !== key) return;
        try { cache = e.newValue ? (JSON.parse(e.newValue) as T) : initial; } catch { cache = initial; }
        listeners.forEach((l) => l());
      });
    }
    return cache;
  };

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };

  const set = (next: T | ((prev: T) => T)) => {
    const value = typeof next === "function" ? (next as (p: T) => T)(read()) : next;
    cache = value;
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
    listeners.forEach((l) => l());
  };

  const useStore = (): T => useSyncExternalStore(subscribe, read, () => initial);
  return { useStore, set, get: read };
}

export interface SavedSearch { id: string; name: string; query: string; purpose?: string; createdAt: string }

export const favoritesStore = createStore<string[]>("atlas-favorites", []);
export const compareStore = createStore<string[]>("atlas-compare", []);
export const searchesStore = createStore<SavedSearch[]>("atlas-searches", []);
export const themeStore = createStore<"light" | "dark" | "system">("atlas-theme", "system");
