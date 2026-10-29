"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { MapView, type MapMarker } from "@/components/atlas/MapView";
import { PropertyCard } from "@/components/property/PropertyCard";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { useFormat } from "@/lib/hooks";
import { tr, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import type { HomeData } from "../types";
import { ContourBg } from "./ContourBg";

export function CityFloorPlan({ data }: { data: HomeData; lang: Locale }) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const h = t.home.city;
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of data.properties) m.set(p.neighborhood, (m.get(p.neighborhood) ?? 0) + 1);
    return m;
  }, [data.properties]);
  const [slug, setSlug] = useState<string | null>(() => [...data.neighborhoods].sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0))[0]?.slug ?? null);
  const hood = data.neighborhoods.find((n) => n.slug === slug) ?? null;
  const listings = useMemo(() => data.properties.filter((p) => p.neighborhood === slug), [data.properties, slug]);
  const [selected, setSelected] = useState<string | null>(null);
  const markers = useMemo<MapMarker[]>(
    () => listings.map((p) => ({ id: p.id, x: p.geo.x, y: p.geo.y, label: f.money(p.price, p.currency, { compact: true }), title: tr(p.title, lang) })),
    [listings, f, lang],
  );

  const indicators = hood
    ? ([
        ["walkability", h.walkability],
        ["greenery", h.greenery],
        ["nightlife", h.nightlife],
        ["quiet", h.quiet],
      ] as const)
    : [];

  return (
    <section id="city" aria-labelledby="city-title" className="relative overflow-hidden border-t border-line">
      <ContourBg seed={2} rings={14} cx={500} cy={300} className="opacity-40" />
      <div className="wrap section relative grid gap-12">
        <SectionHead num="F / 06" eyebrow={h.eyebrow} title={<span id="city-title">{h.title}</span>} intro={h.intro} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,6fr)_minmax(0,3.4fr)] lg:gap-10">
          {/* index of neighborhoods */}
          <nav aria-label={h.areas} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:grid lg:content-start lg:overflow-visible lg:px-0">
            {data.neighborhoods.map((n, i) => {
              const on = n.slug === slug;
              return (
                <button
                  key={n.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => { setSlug(n.slug); setSelected(null); }}
                  className={`group flex shrink-0 items-baseline gap-3 border-b border-line px-1 py-3 text-start transition-colors lg:py-4 ${on ? "text-copper" : "text-ink hover:text-copper"}`}
                >
                  <span className="annot !text-current">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`display h-sm ${on ? "" : "opacity-80"}`}>{tr(n.name, lang)}</span>
                  <span className="annot ms-auto !text-current">{f.num(counts.get(n.slug) ?? 0)}</span>
                </button>
              );
            })}
          </nav>

          <div className="relative h-[52vh] min-h-[360px] border border-line bg-surface lg:h-[640px]">
            <MapView
              className="h-full w-full"
              markers={markers}
              areas={data.neighborhoods}
              activeArea={slug}
              onArea={(s) => { setSlug(s); setSelected(null); }}
              selectedId={selected}
              onSelect={setSelected}
              label={h.mapLabel}
            />
          </div>

          {/* neighborhood detail */}
          <div className="grid content-start gap-6" aria-live="polite">
            {hood ? (
              <>
                <div>
                  <p className="annot !text-copper">{fmt(h.listingsCount, { n: f.num(listings.length) })}</p>
                  <h3 className="display h-md mt-1 text-balance">{tr(hood.name, lang)}</h3>
                  <p className="mt-2 text-soft">{tr(hood.tagline, lang)}</p>
                </div>

                <div className="grid gap-3 border-y border-line py-5">
                  <p className="annot">{h.sampleNote}</p>
                  {indicators.map(([k, label]) => (
                    <div key={k} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm">
                      <span>{label}</span>
                      <span className="relative h-px bg-line" aria-hidden>
                        <span className="absolute inset-y-[-2px] start-0 bg-copper" style={{ width: `${hood.sample[k] * 10}%` }} />
                      </span>
                      <span className="num annot text-end !text-ink">{f.num(hood.sample[k])}/10</span>
                    </div>
                  ))}
                  <p className="text-sm text-soft">
                    {h.avgPrice}: <span className="num font-semibold text-ink">{f.money(hood.sampleAvgPricePerM2, undefined, { compact: true })}</span> / {lang === "ar" ? "م²" : "m²"} <span className="annot">({h.sample})</span>
                  </p>
                </div>

                <div className="grid gap-2">
                  {listings.slice(0, 3).map((p) => (
                    <PropertyCard key={p.id} p={p} variant="compact" selected={selected === p.id} onSelect={setSelected} />
                  ))}
                  {listings.length === 0 && <p className="text-sm text-soft">{h.none}</p>}
                </div>
                <Link href={href(`/properties?neighborhood=${hood.slug}`)} className="btn justify-self-start">{h.seeAll}<Arrow /></Link>
              </>
            ) : (
              <p className="annot">{h.pick}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
