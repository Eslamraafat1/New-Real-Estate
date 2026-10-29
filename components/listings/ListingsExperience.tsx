"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Bookmark, LayoutGrid, List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import type { Neighborhood, PropertyQuery, Purpose, SortKey } from "@/lib/api/types";
import { fetchProperties } from "@/lib/api/client";
import { activeFilterKeys, parseQuery, serializeQuery } from "@/lib/search";
import { useAsync, useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import { useApp } from "@/components/providers/AppProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Modal } from "@/components/ui/Modal";
import { FilterPanel } from "./FilterPanel";
import { AtlasWorkspace } from "./AtlasWorkspace";

type View = "grid" | "list" | "map";
const PAGE = 12;
const SORTS: SortKey[] = ["relevance", "newest", "price-asc", "price-desc"];

/**
 * The listings engine behind /properties, /buy, /rent and /map.
 * All state lives in the URL (shareable searches); every control changes the query sent to /api/properties.
 */
export function ListingsExperience({ areas, lockPurpose, variant = "listings" }: { areas: Neighborhood[]; lockPurpose?: Purpose; variant?: "listings" | "explorer" }) {
  const { t, lang, searches, saveSearch } = useApp();
  const f = useFormat();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const spKey = sp.toString();
  const parsed = parseQuery(sp);
  const query: PropertyQuery = { ...parsed, purpose: lockPurpose ?? parsed.purpose };
  const view = ((sp.get("view") as View | null) ?? (variant === "explorer" ? "map" : "grid")) as View;
  const pages = Math.max(1, parsed.page ?? 1);
  const explorer = variant === "explorer";

  const [selectedId, setSelectedId] = useState<string | null>(sp.get("select"));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [reload, setReload] = useState(0);

  const update = (patch: Partial<PropertyQuery>, nextView?: View) => {
    const next: PropertyQuery = { ...query, ...patch };
    if (!("page" in patch)) next.page = undefined;
    const params = serializeQuery(lockPurpose ? { ...next, purpose: undefined } : next);
    const v = nextView ?? sp.get("view");
    if (v) params.set("view", v);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const needAll = view === "map" || explorer;
  const apiQuery: PropertyQuery = { ...query, page: 1, pageSize: needAll ? 100 : pages * PAGE };
  const key = serializeQuery(apiQuery).toString();
  const { data, loading, error } = useAsync(key, (signal) => fetchProperties(apiQuery, signal), reload);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const filterKeys = activeFilterKeys(query);
  const clearAll = () => {
    setResetKey((n) => n + 1);
    const params = new URLSearchParams();
    const v = sp.get("view");
    if (v) params.set("view", v);
    if (lockPurpose === undefined && query.purpose) params.set("purpose", query.purpose);
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  /* ---------- active-filter chips ---------- */
  const chips = useMemo(() => {
    const c: { id: string; label: string; remove: () => void }[] = [];
    const num = (n: number) => f.num(n);
    if (query.q) c.push({ id: "q", label: `“${query.q}”`, remove: () => { setResetKey((n) => n + 1); update({ q: undefined }); } });
    if (query.neighborhood) { const a = areas.find((x) => x.slug === query.neighborhood); c.push({ id: "n", label: a ? tr(a.name, lang) : query.neighborhood, remove: () => update({ neighborhood: undefined }) }); }
    query.types?.forEach((x) => c.push({ id: `t${x}`, label: t.labels.type[x], remove: () => update({ types: query.types!.filter((y) => y !== x) }) }));
    query.styles?.forEach((x) => c.push({ id: `s${x}`, label: t.labels.style[x], remove: () => update({ styles: query.styles!.filter((y) => y !== x) }) }));
    if (query.minPrice !== undefined) c.push({ id: "minp", label: `${t.listings.minPrice}: ${num(query.minPrice)}`, remove: () => { setResetKey((n) => n + 1); update({ minPrice: undefined }); } });
    if (query.maxPrice !== undefined) c.push({ id: "maxp", label: `${t.listings.maxPrice}: ${num(query.maxPrice)}`, remove: () => { setResetKey((n) => n + 1); update({ maxPrice: undefined }); } });
    if (query.beds !== undefined) c.push({ id: "b", label: `${t.listings.bedrooms}: ${fmt(t.listings.bedsPlus, { n: num(query.beds) })}`, remove: () => update({ beds: undefined }) });
    if (query.baths !== undefined) c.push({ id: "ba", label: `${t.listings.bathrooms}: ${fmt(t.listings.bedsPlus, { n: num(query.baths) })}`, remove: () => update({ baths: undefined }) });
    if (query.minArea !== undefined) c.push({ id: "mina", label: `${t.listings.minArea}: ${num(query.minArea)}`, remove: () => { setResetKey((n) => n + 1); update({ minArea: undefined }); } });
    if (query.maxArea !== undefined) c.push({ id: "maxa", label: `${t.listings.maxArea}: ${num(query.maxArea)}`, remove: () => { setResetKey((n) => n + 1); update({ maxArea: undefined }); } });
    if (query.furnished) c.push({ id: "fu", label: t.labels.furnished[query.furnished], remove: () => update({ furnished: undefined }) });
    if (query.completion) c.push({ id: "co", label: t.labels.completion[query.completion], remove: () => update({ completion: undefined }) });
    query.amenities?.forEach((x) => c.push({ id: `a${x}`, label: t.labels.amenity[x], remove: () => update({ amenities: query.amenities!.filter((y) => y !== x) }) }));
    if (query.developmentId) c.push({ id: "dev", label: query.developmentId, remove: () => update({ developmentId: undefined }) });
    if (query.featured) c.push({ id: "feat", label: t.common.featured, remove: () => update({ featured: undefined }) });
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spKey, lang, areas, lockPurpose]);

  const doSave = () => {
    const params = serializeQuery({ ...query, page: undefined });
    saveSearch(saveName.trim() || `${t.listings.title} ${searches.length + 1}`, params.toString(), query.purpose);
    setSaveOpen(false);
    setSaveName("");
  };

  /* ---------- toolbar ---------- */
  const toolbar = (
    <div className={`flex flex-wrap items-center gap-2 ${explorer ? "border-b border-line bg-paper px-3 py-2" : ""}`}>
      <button type="button" className={`btn btn-sm ${explorer ? "" : "lg:hidden"}`} onClick={() => setFiltersOpen(true)}>
        <SlidersHorizontal size={15} />{t.listings.filters}{filterKeys.length > 0 && <span className="num grid h-5 min-w-5 place-items-center bg-copper px-1 text-[10px] text-white">{f.num(filterKeys.length)}</span>}
      </button>
      <p className="num text-sm text-soft" role="status" aria-live="polite">
        {loading && !data ? t.common.loading : total === 1 ? t.listings.resultsOne : fmt(t.listings.resultsCount, { n: f.num(total) })}
      </p>
      <div className="ms-auto flex flex-wrap items-center gap-2">
        {!lockPurpose && explorer && (
          <div className="flex" role="group" aria-label={t.listings.purpose}>
            {([undefined, "sale", "rent"] as (Purpose | undefined)[]).map((p) => <button key={p ?? "a"} type="button" className="chip" aria-pressed={query.purpose === p} onClick={() => update({ purpose: p })}>{p ? t.labels.purpose[p === "sale" ? "saleShort" : "rentShort"] : t.common.all}</button>)}
          </div>
        )}
        {!explorer && (
          <label className="flex items-center gap-2 text-sm"><span className="sr-only">{t.listings.sortBy}</span>
            <select className="field !min-h-9 !py-1" value={query.sort ?? "relevance"} onChange={(e) => update({ sort: e.target.value as SortKey })}>
              {SORTS.map((s) => <option key={s} value={s}>{t.labels.sort[s]}</option>)}
            </select>
          </label>
        )}
        <button type="button" className="btn btn-sm" onClick={() => setSaveOpen(true)}><Bookmark size={15} /><span className={explorer ? "sr-only xl:not-sr-only" : "hidden sm:inline"}>{t.listings.saveSearch}</span></button>
        {!explorer && (
          <div className="flex" role="group" aria-label={t.listings.view}>
            {([["grid", LayoutGrid, t.listings.grid], ["list", List, t.listings.list], ["map", MapIcon, t.listings.map]] as const).map(([v, Icon, label]) => (
              <button key={v} type="button" className="icon-btn icon-btn-sm" aria-pressed={view === v} aria-label={label} title={label} onClick={() => update({}, v)}><Icon size={16} /></button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const chipRow = (chips.length > 0 || filterKeys.length > 0) && (
    <div className={`flex flex-wrap items-center gap-2 ${explorer ? "border-b border-line bg-paper px-3 py-2" : "mt-3"}`} aria-label={t.listings.activeFilters}>
      {chips.map((c) => (
        <span key={c.id} className="chip" data-active="true">{c.label}<button type="button" aria-label={`${t.common.clear}: ${c.label}`} onClick={c.remove} className="grid place-items-center"><X size={13} /></button></span>
      ))}
      <button type="button" className="annot underline underline-offset-4" onClick={clearAll}>{t.listings.clearAll}</button>
    </div>
  );

  /* ---------- results ---------- */
  let results: React.ReactNode;
  if (error) {
    results = (
      <div role="alert" className="grid gap-3 border border-line bg-surface p-8 text-center">
        <p className="display h-sm">{t.listings.errorTitle}</p>
        <p className="text-soft">{t.common.error}</p>
        <button type="button" className="btn justify-self-center" onClick={() => setReload((n) => n + 1)}>{t.common.retry}</button>
      </div>
    );
  } else if (loading && !data) {
    results = (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label={t.common.loading}>
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="grid gap-3"><div className="aspect-[4/3] animate-pulse bg-paper2" /><div className="h-4 w-2/3 animate-pulse bg-paper2" /><div className="h-4 w-1/3 animate-pulse bg-paper2" /></div>)}
      </div>
    );
  } else if (!items.length) {
    results = (
      <div className="grid gap-4 border border-dashed border-line p-10 text-center">
        <p className="display h-md">{t.listings.empty}</p>
        <p className="text-soft">{t.listings.emptyHint}</p>
        {(filterKeys.length > 0) && <button type="button" className="btn justify-self-center" onClick={clearAll}>{t.listings.clearAll}</button>}
      </div>
    );
  } else if (view === "list") {
    results = <div className={`grid gap-5 ${loading ? "opacity-60" : ""}`}>{items.map((p, i) => <PropertyCard key={p.id} p={p} variant="row" priority={i < 2} />)}</div>;
  } else {
    results = (
      <div className={`grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
        {items.map((p, i) => i % 7 === 0 && items.length > 3 ? (
          <PropertyCard key={p.id} p={p} variant="wide" priority={i < 2} className="sm:col-span-2" sizes="(min-width:1280px) 60vw, 100vw" />
        ) : (
          <PropertyCard key={p.id} p={p} priority={i < 3} />
        ))}
      </div>
    );
  }

  const loadMore = !needAll && data && items.length < total && (
    <div className="mt-10 grid justify-items-center gap-3">
      <p className="annot num">{fmt(t.listings.showing, { a: f.num(items.length), b: f.num(total) })}</p>
      <button type="button" className="btn" disabled={loading} onClick={() => update({ page: pages + 1 })}>{loading ? t.common.loading : t.listings.loadMore}</button>
    </div>
  );

  const filtersModal = (
    <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t.listings.fullscreenFilters} fullscreen className="md:!h-auto md:!max-h-[92dvh] md:!w-[min(92vw,560px)] md:border md:border-line">
      <div className="p-5">
        <FilterPanel query={query} onChange={(p) => update(p)} areas={areas} resetKey={resetKey} hidePurpose={!!lockPurpose} />
      </div>
      <div className="safe-b sticky bottom-0 flex gap-2 border-t border-line bg-paper p-4">
        <button type="button" className="btn" onClick={clearAll}>{t.listings.clearAll}</button>
        <button type="button" className="btn btn-primary flex-1" onClick={() => setFiltersOpen(false)}>{fmt(t.listings.showResults, { n: f.num(total) })}</button>
      </div>
    </Modal>
  );

  const saveModal = (
    <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title={t.listings.saveSearch}>
      <form className="grid gap-4 p-5" onSubmit={(e) => { e.preventDefault(); doSave(); }}>
        <label className="label">{t.listings.searchName}<input className="field mt-1.5 font-normal normal-case tracking-normal" value={saveName} onChange={(e) => setSaveName(e.target.value)} autoFocus /></label>
        <p className="annot">{t.saved.alertsNote}</p>
        <button className="btn btn-primary justify-self-start">{t.listings.saveSearch}</button>
      </form>
    </Modal>
  );

  if (explorer) {
    return (
      <div className="flex h-[calc(100dvh-var(--header-h))] min-h-[560px] flex-col">
        {toolbar}
        {chipRow}
        <AtlasWorkspace className="min-h-0 flex-1" items={items} areas={areas} selectedId={selectedId} onSelect={setSelectedId} loading={loading} />
        {filtersModal}
        {saveModal}
      </div>
    );
  }

  return (
    <div className="wrap grid gap-8 pb-16 lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="hidden self-start lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:block lg:max-h-[calc(100dvh-var(--header-h)-32px)] lg:overflow-auto lg:pe-3" aria-label={t.listings.filters}>
        <div className="mb-4 flex items-center justify-between"><h2 className="label !mb-0">{t.listings.filters}</h2>{filterKeys.length > 0 && <button type="button" className="annot underline underline-offset-4" onClick={clearAll}>{t.listings.clearAll}</button>}</div>
        <FilterPanel query={query} onChange={(p) => update(p)} areas={areas} resetKey={resetKey} hidePurpose={!!lockPurpose} />
      </aside>
      <div className="min-w-0">
        {toolbar}
        {chipRow}
        <div className="mt-6">
          {view === "map" && !error ? (
            <div className="h-[75dvh] min-h-[520px] border border-line">
              <AtlasWorkspace className="h-full" items={items} areas={areas} selectedId={selectedId} onSelect={setSelectedId} loading={loading} />
            </div>
          ) : results}
          {view !== "map" && loadMore}
        </div>
      </div>
      {filtersModal}
      {saveModal}
    </div>
  );
}
