import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { fmt, getDictionary } from "@/lib/i18n";
import { formatMoney, formatNumber } from "@/lib/i18n/format";
import { href, tr, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";

const C = 2 * Math.PI * 44;

/** M — Spaces taking shape: developments as drawing sheets with explicit build status. */
export function SpacesTakingShape({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.home2.shape;
  const items = data.developments.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section id="spaces-taking-shape" aria-labelledby="shape-h" className="section bg-paper2">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div id="shape-h"><SectionHead num={s.num} eyebrow={s.eyebrow} title={s.title} intro={s.intro} /></div>
          <Link href={href(lang, "/developments")} className="btn">{s.all}<Arrow /></Link>
        </div>

        <div className="mt-14 grid gap-14 md:mt-20 md:gap-24">
          {items.map((d, i) => {
            const hood = data.neighborhoods.find((n) => n.slug === d.neighborhood);
            const img = d.images[0];
            const flip = i % 2 === 1;
            return (
              <Reveal key={d.slug}>
                <article className="reveal group relative grid gap-8 border border-line bg-surface p-4 md:grid-cols-12 md:gap-10 md:p-8">
                  <div className={`relative aspect-[4/3] overflow-hidden md:col-span-6 md:aspect-auto md:min-h-[420px] ${flip ? "md:order-2" : ""}`}>
                    {img && <AtlasImage src={img.src} alt={tr(img.alt, lang)} fill sizes="(min-width:768px) 50vw, 100vw" className="img-hover object-cover" />}
                    <span className="annot absolute start-3 top-3 bg-paper px-2 py-1 !text-ink">{s.status}: {t.labels.completion[d.status]}</span>
                  </div>

                  <div className="grid content-between gap-8 md:col-span-6">
                    <div>
                      <p className="annot">{tr(d.developer, lang)}{hood ? ` · ${tr(hood.name, lang)}` : ""}</p>
                      <h3 className="display h-md mt-1 text-balance"><Link href={href(lang, `/developments/${d.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(d.name, lang)}</Link></h3>
                      <p className="mt-2 text-soft">{tr(d.tagline, lang)}</p>
                    </div>

                    <div className="grid grid-cols-[auto_1fr] items-center gap-6">
                      <div className="relative size-28" role="img" aria-label={fmt(s.progressSample, { n: formatNumber(d.progress, lang) })}>
                        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
                          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--line)" strokeWidth="4" />
                          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--copper)" strokeWidth="4" strokeDasharray={`${(d.progress / 100) * C} ${C}`} />
                        </svg>
                        <span className="numeral absolute inset-0 grid place-items-center text-3xl">{formatNumber(d.progress, lang)}<span className="text-base">%</span></span>
                      </div>
                      <dl className="grid gap-2 text-sm">
                        <div className="flex justify-between gap-4 border-b border-line pb-1.5"><dt className="text-mute">{s.progress}</dt><dd className="num">{fmt(s.progressSample, { n: formatNumber(d.progress, lang) })}</dd></div>
                        <div className="flex justify-between gap-4 border-b border-line pb-1.5"><dt className="text-mute">{s.quarter}</dt><dd className="num">{d.completionQuarter}</dd></div>
                        <div className="flex justify-between gap-4 border-b border-line pb-1.5"><dt className="text-mute">{s.units}</dt><dd className="num">{fmt(s.unitsSample, { a: formatNumber(d.unitsAvailable, lang), n: formatNumber(d.units, lang) })}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-mute">{s.from}</dt><dd className="num font-semibold">{formatMoney(d.priceFrom, lang, d.currency, { compact: true })}</dd></div>
                      </dl>
                    </div>

                    <div>
                      <p className="annot mb-3">{s.phases}</p>
                      <ol className="grid gap-2">
                        {d.phases.map((ph) => (
                          <li key={ph.date + ph.label.en} className={`flex items-center gap-3 text-sm ${ph.done ? "" : "text-mute"}`}>
                            {ph.done ? <Check size={16} aria-hidden className="text-forest" /> : <Circle size={14} aria-hidden />}
                            <span className="flex-1">{tr(ph.label, lang)}</span>
                            <span className="annot">{ph.date} · {ph.done ? s.done : s.upcoming}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <span className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold">{s.view}<Arrow /></span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="annot mt-10">{s.sample}</p>
      </div>
    </section>
  );
}
