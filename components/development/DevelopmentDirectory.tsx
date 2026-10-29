"use client";

import Link from "next/link";
import { useState } from "react";
import type { Completion, Development } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import { ProgressBar, StatusBadge } from "./DevelopmentBits";

type Filter = "all" | Completion;

/** Editorial directory of (sample) developments with client-side status filter chips. */
export function DevelopmentDirectory({ items }: { items: Development[] }) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const d = t.property.dev;
  const [filter, setFilter] = useState<Filter>("all");
  const list = filter === "all" ? items : items.filter((x) => x.status === filter);
  const chips: [Filter, string][] = [["all", d.filterAll], ["ready", d.statusReady], ["under-construction", d.statusUnder], ["off-plan", d.statusOff]];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        <div role="group" aria-label={d.filterLabel} className="flex flex-wrap gap-2">
          {chips.map(([k, label]) => (
            <button key={k} type="button" className="chip min-h-[44px]" aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}</button>
          ))}
        </div>
        <p className="annot annot-ar-ok" aria-live="polite">{list.length === 1 ? d.countOne : fmt(d.count, { n: f.num(list.length) })}</p>
      </div>

      {list.length === 0 && <p className="py-16 text-soft">{d.empty}</p>}

      <ol className="grid gap-20 py-16 md:gap-28">
        {list.map((dev, i) => {
          const flip = i % 2 === 1;
          const cover = dev.images[0];
          return (
            <li key={dev.slug}>
              <Reveal as="article" className="group relative grid items-center gap-8 md:grid-cols-12">
                <div className={`relative overflow-hidden bg-paper2 md:col-span-7 ${flip ? "md:order-2" : ""}`}>
                  <div className="relative aspect-[4/3]">
                    {cover && <AtlasImage src={cover.src} alt={tr(cover.alt, lang)} fill priority={i === 0} sizes="(min-width: 768px) 58vw, 100vw" className="img-hover object-cover" />}
                  </div>
                  <span className="annot annot-ar-ok absolute start-3 top-3 bg-paper/90 px-2 py-1 !text-ink">{t.common.sample}</span>
                </div>
                <div className={`grid gap-5 md:col-span-5 ${flip ? "md:order-1" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <StatusBadge status={dev.status} />
                    <span aria-hidden className="numeral num text-7xl text-[var(--line)]">{f.num(i + 1, { minimumIntegerDigits: 2 })}</span>
                  </div>
                  <h2 className="display h-md">
                    <Link href={href(`/developments/${dev.slug}`)} className="after:absolute after:inset-0">{tr(dev.name, lang)}</Link>
                  </h2>
                  <p className="text-soft">{tr(dev.tagline, lang)}</p>
                  {dev.status !== "ready" && <ProgressBar value={dev.progress} />}
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 text-sm">
                    <div><dt className="annot annot-ar-ok">{d.completion}</dt><dd className="num mt-1">{dev.completionQuarter}</dd></div>
                    <div><dt className="annot annot-ar-ok">{d.priceFrom}</dt><dd className="num mt-1">{f.money(dev.priceFrom, dev.currency, { compact: true })}</dd></div>
                    <div><dt className="annot annot-ar-ok">{d.units}</dt><dd className="num mt-1">{fmt(d.unitsAvailable, { n: f.num(dev.unitsAvailable), total: f.num(dev.units) })}</dd></div>
                    <div><dt className="annot annot-ar-ok">{d.developer}</dt><dd className="mt-1">{tr(dev.developer, lang)}</dd></div>
                  </dl>
                  <span className="btn btn-sm justify-self-start">{d.openProject}<Arrow /></span>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
