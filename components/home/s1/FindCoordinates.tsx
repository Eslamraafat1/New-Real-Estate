"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { useFormat } from "@/lib/hooks";
import { tr, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import { PROPERTY_TYPES, type Purpose, type PropertyType } from "@/lib/api/types";
import { serializeQuery } from "@/lib/search";
import type { HomeData } from "../types";
import { ContourBg } from "./ContourBg";

/** Sensible demo budget steps per purpose (sample catalogue: sale 0.5M-6.8M, rent 1.4k-9.5k / month). */
const STEPS: Record<Purpose, number[]> = {
  sale: [500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000, 8_000_000],
  rent: [1_000, 1_500, 2_000, 3_000, 4_000, 6_000, 8_000, 12_000],
};

export function FindCoordinates({ data }: { data: HomeData; lang: Locale }) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const router = useRouter();
  const [purpose, setPurpose] = useState<Purpose>("sale");
  const [hood, setHood] = useState("");
  const [type, setType] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of data.properties) if (p.purpose === purpose) m.set(p.neighborhood, (m.get(p.neighborhood) ?? 0) + 1);
    return m;
  }, [data.properties, purpose]);
  const total = useMemo(() => [...counts.values()].reduce((a, b) => a + b, 0), [counts]);

  const steps = STEPS[purpose];
  const currency = data.properties.find((p) => p.purpose === purpose)?.currency;
  const money = (n: number) => f.money(n, currency, { compact: true });

  const switchPurpose = (p: Purpose) => { setPurpose(p); setMin(""); setMax(""); };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = serializeQuery({
      purpose,
      neighborhood: hood || undefined,
      types: type ? [type as PropertyType] : undefined,
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
    });
    router.push(`${href("/properties")}?${q.toString()}`);
  };

  const h = t.home.coordinates;
  return (
    <section id="coordinates" tabIndex={-1} aria-labelledby="coordinates-title" className="relative scroll-mt-20 overflow-hidden outline-none">
      <ContourBg seed={5} rings={10} cx={820} cy={420} className="opacity-60" />
      <div className="wrap section relative grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal className="grid content-start gap-8">
          <div className="reveal">
            <SectionHead num="B / 02" eyebrow={h.eyebrow} title={<span id="coordinates-title">{h.title}</span>} intro={h.intro} />
          </div>
          <dl className="reveal grid gap-1 border-s border-line ps-4 text-ink" style={{ transitionDelay: "120ms" }} aria-hidden>
            <dt className="annot">{h.gridLabel}</dt>
            <dd className="annot !text-ink">{fmt(h.sample, { n: f.num(total) })}</dd>
            <dd className="annot">{h.demoPlane} · 0 — 1000</dd>
          </dl>
        </Reveal>

        <form onSubmit={onSubmit} action={href("/properties")} method="get" className="grid gap-6 border border-line bg-surface p-5 shadow-[var(--shadow)] sm:p-8" aria-label={h.formLabel}>
          <fieldset className="grid gap-2">
            <legend className="label">{t.listings.purpose}</legend>
            <div className="grid grid-cols-2 border border-ink" role="radiogroup">
              {(["sale", "rent"] as const).map((p) => (
                <label key={p} className={`flex min-h-12 cursor-pointer items-center justify-center text-sm font-semibold tracking-wide transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--copper)] ${purpose === p ? "bg-ink text-paper" : "hover:bg-paper2"}`}>
                  <input type="radio" name="purpose" value={p} checked={purpose === p} onChange={() => switchPurpose(p)} className="sr-only" />
                  {p === "sale" ? t.labels.purpose.saleShort : t.labels.purpose.rentShort}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="fc-hood" className="label">{t.listings.location}</label>
              <select id="fc-hood" name="neighborhood" className="field" value={hood} onChange={(e) => setHood(e.target.value)}>
                <option value="">{t.listings.anyLocation} ({f.num(total)})</option>
                {data.neighborhoods.map((n) => (
                  <option key={n.slug} value={n.slug}>{tr(n.name, lang)} ({f.num(counts.get(n.slug) ?? 0)})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fc-type" className="label">{t.listings.propertyType}</label>
              <select id="fc-type" name="type" className="field" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">{t.common.any}</option>
                {PROPERTY_TYPES.map((k) => <option key={k} value={k}>{t.labels.type[k]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="fc-min" className="label">{t.listings.minPrice}{purpose === "rent" ? ` ${t.common.perMonth}` : ""}</label>
              <select id="fc-min" name="minPrice" className="field num" value={min} onChange={(e) => setMin(e.target.value)}>
                <option value="">{t.common.any}</option>
                {steps.filter((s) => !max || s < Number(max)).map((s) => <option key={s} value={s}>{money(s)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="fc-max" className="label">{t.listings.maxPrice}{purpose === "rent" ? ` ${t.common.perMonth}` : ""}</label>
              <select id="fc-max" name="maxPrice" className="field num" value={max} onChange={(e) => setMax(e.target.value)}>
                <option value="">{t.common.any}</option>
                {steps.filter((s) => !min || s > Number(min)).map((s) => <option key={s} value={s}>{money(s)}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <p className="annot max-w-[30ch]">{h.note}</p>
            <button type="submit" className="btn btn-primary min-h-[52px]">
              <Search size={16} aria-hidden />
              {h.submit}
              <Arrow />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
