"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { fetchProperties } from "@/lib/api/client";
import { useAsync } from "@/lib/hooks";
import { useApp } from "@/components/providers/AppProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Arrow } from "@/components/ui/Arrow";
import { formatDate } from "@/lib/i18n/format";

export function SavedProperties() {
  const { t, href, favorites } = useApp();
  const { data, loading, error } = useAsync(`fav:${favorites.join(",")}`, (s) => (favorites.length ? fetchProperties({ ids: favorites, pageSize: 100 }, s) : Promise.resolve(null)));
  if (!favorites.length) {
    return (
      <div className="wrap pb-20"><div className="grid gap-4 border border-dashed border-line p-12 text-center">
        <p className="display h-md">{t.saved.empty}</p><p className="text-soft">{t.saved.emptyHint}</p>
        <Link href={href("/properties")} className="btn btn-primary justify-self-center">{t.nav.listings}<Arrow /></Link>
      </div></div>
    );
  }
  if (error) return <div role="alert" className="wrap pb-20">{t.common.error}</div>;
  return (
    <div className="wrap pb-20">
      {loading && !data && <div className="h-64 animate-pulse bg-paper2" aria-busy="true" />}
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        {data?.items.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}

export function SavedSearches() {
  const { t, lang, href, searches, deleteSearch } = useApp();
  if (!searches.length) {
    return (
      <div className="wrap pb-20"><div className="grid gap-4 border border-dashed border-line p-12 text-center">
        <p className="display h-md">{t.saved.searchesEmpty}</p><p className="text-soft">{t.saved.searchesEmptyHint}</p>
        <Link href={href("/properties")} className="btn btn-primary justify-self-center">{t.nav.listings}<Arrow /></Link>
      </div></div>
    );
  }
  return (
    <div className="wrap pb-20">
      <ul className="grid border-t border-line">
        {searches.map((s, i) => {
          const base = s.purpose === "sale" ? "/buy" : s.purpose === "rent" ? "/rent" : "/properties";
          const params = new URLSearchParams(s.query);
          params.delete("purpose");
          const qs = s.purpose ? params.toString() : s.query;
          return (
            <li key={s.id} className="grid gap-3 border-b border-line py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
              <span className="numeral text-4xl text-copper num">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p className="display h-sm">{s.name}</p>
                <p className="annot truncate">{decodeURIComponent(s.query).replace(/&/g, " · ") || "—"}</p>
                <p className="annot">{t.saved.savedOn.replace("{date}", formatDate(s.createdAt, lang))}</p>
              </div>
              <div className="flex gap-2">
                <Link href={href(`${base}${qs ? `?${qs}` : ""}`)} className="btn btn-sm btn-primary">{t.saved.openSearch}<Arrow /></Link>
                <button type="button" className="btn btn-sm" onClick={() => deleteSearch(s.id)} aria-label={`${t.saved.delete}: ${s.name}`}><Trash2 size={14} />{t.saved.delete}</button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="annot mt-4">{t.saved.alertsNote}</p>
    </div>
  );
}
