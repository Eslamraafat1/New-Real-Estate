"use client";

import Link from "next/link";
import { useId, useState, type KeyboardEvent } from "react";
import type { Neighborhood } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { MapView, type MapMarker } from "@/components/atlas/MapView";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { useFormat } from "@/lib/hooks";
import { fmt } from "@/lib/i18n";
import { tr } from "@/lib/i18n/config";

type Key = "walkability" | "greenery" | "nightlife" | "quiet";
const KEYS: Key[] = ["walkability", "greenery", "nightlife", "quiet"];

export function FindNeighborhoodTabs({ neighborhoods, markers, counts }: {
  neighborhoods: Neighborhood[];
  markers: Record<string, MapMarker[]>;
  counts: Record<string, number>;
}) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const s = t.home2.hood;
  const uid = useId();
  const [slug, setSlug] = useState(neighborhoods[0]?.slug);
  const n = neighborhoods.find((x) => x.slug === slug) ?? neighborhoods[0];
  if (!n) return null;
  const idx = neighborhoods.indexOf(n);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const rtl = lang === "ar" && (e.key === "ArrowRight" || e.key === "ArrowLeft") ? -1 : 1;
    const next = neighborhoods[(idx + dir * rtl + neighborhoods.length) % neighborhoods.length];
    setSlug(next.slug);
    document.getElementById(`${uid}-tab-${next.slug}`)?.focus();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div role="tablist" aria-label={s.tabs} className="flex flex-wrap gap-2 lg:col-span-3 lg:flex-col lg:gap-0 lg:border-t lg:border-line">
        {neighborhoods.map((x, i) => {
          const on = x.slug === n.slug;
          return (
            <button
              key={x.slug}
              id={`${uid}-tab-${x.slug}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setSlug(x.slug)}
              onKeyDown={onKey}
              className={`flex items-baseline gap-3 px-3 py-2 text-start transition-colors lg:border-b lg:border-line lg:py-3.5 ${on ? "bg-ink text-paper" : "border border-line hover:bg-paper2 lg:border-x-0 lg:border-t-0"}`}
            >
              <span className="annot !text-inherit opacity-70">{String(i + 1).padStart(2, "0")}</span>
              <span className="display h-sm !text-[1.1rem]">{tr(x.name, lang)}</span>
            </button>
          );
        })}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${n.slug}`} tabIndex={0} className="grid gap-8 lg:col-span-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-6">
          <div className="relative aspect-[16/9] overflow-hidden bg-paper2">
            <AtlasImage key={n.slug} src={n.image.src} alt={tr(n.image.alt, lang)} fill sizes="(min-width:1024px) 35vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="annot">{tr(n.tagline, lang)}</p>
            <h3 className="display h-md">{tr(n.name, lang)}</h3>
            <p className="mt-3 text-soft text-pretty">{tr(n.description, lang)}</p>
          </div>
          <div>
            <p className="annot mb-2">{s.character}</p>
            <ul className="flex flex-wrap gap-2">
              {n.character.map((c) => <li key={c.en} className="chip cursor-default">{tr(c, lang)}</li>)}
            </ul>
          </div>
        </div>

        <div className="grid content-start gap-6">
          <div className="relative h-64 overflow-hidden border border-line sm:h-72" aria-label={s.mapLabel}>
            <MapView markers={markers[n.slug] ?? []} areas={neighborhoods} activeArea={n.slug} interactive={false} controls={false} cluster={false} className="h-full w-full" />
          </div>

          <div className="border border-dashed border-line p-4">
            <p className="annot mb-3 !text-copper">{s.indicators} · {s.sampleLabel}</p>
            <ul className="grid gap-2.5">
              {KEYS.map((k) => (
                <li key={k} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm">
                  <span className="text-soft">{s[k]}</span>
                  <span className="h-1.5 bg-line-soft" aria-hidden><span className="block h-full bg-forest" style={{ width: `${n.sample[k] * 10}%` }} /></span>
                  <span className="num text-mute">{fmt(s.outOf, { n: f.num(n.sample[k]) })}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-3 text-sm">
              <span className="text-soft">{s.avgPrice} <span className="annot">({t.common.sample})</span></span>
              <span className="num font-semibold">{f.money(n.sampleAvgPricePerM2, "USD", { compact: false })}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={href(`/neighborhoods/${n.slug}`)} className="btn">{s.profile}<Arrow /></Link>
            <Link href={`${href("/properties")}?neighborhood=${n.slug}`} className="btn btn-primary">{s.listings}{counts[n.slug] ? ` (${f.num(counts[n.slug])})` : ""}<Arrow /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
