import type { CSSProperties } from "react";
import Link from "next/link";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHead } from "@/components/ui/SectionHead";
import { CountUp } from "@/components/fx/CountUp";
import { fmt, getDictionary } from "@/lib/i18n";
import { formatMoney, formatNumber } from "@/lib/i18n/format";
import { href, tr, type Locale } from "@/lib/i18n/config";
import { InView } from "./fx-b/InView";
import { ProgressTower } from "./fx-b/ProgressTower";
import type { HomeData } from "../types";

/** M — Spaces taking shape: each development as a rising progress tower, a survey ruler and a curtain-revealed photograph. */
export function SpacesTakingShape({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.home2.shape;
  const x = t.home3.shape;
  const items = data.developments.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section id="spaces-taking-shape" aria-labelledby="shape-h" className="section overflow-x-clip bg-paper2">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div id="shape-h"><SectionHead num={s.num} eyebrow={s.eyebrow} title={s.title} intro={s.intro} /></div>
          <Link href={href(lang, "/developments")} className="btn w-fit">{s.all}<Arrow /></Link>
        </div>

        <div className="mt-16 grid gap-24 md:mt-24 md:gap-40">
          {items.map((d, i) => {
            const hood = data.neighborhoods.find((n) => n.slug === d.neighborhood);
            const img = d.images[0];
            const flip = i % 2 === 1;
            const ready = d.status === "ready";
            const pct = formatNumber(d.progress, lang);
            return (
              <InView key={d.slug} as="article" threshold={0.25} className="relative">
                {/* index ghost */}
                <span aria-hidden className="numeral pointer-events-none absolute -top-10 end-0 select-none text-[clamp(7rem,24vw,20rem)] text-ink/[0.045]">{String(i + 1).padStart(2, "0")}</span>

                <header className="fxb-rise relative max-w-3xl">
                  <p className="annot">{tr(d.developer, lang)}{hood ? ` · ${tr(hood.name, lang)}` : ""}</p>
                  <h3 className="display h-lg mt-2 text-balance">{tr(d.name, lang)}</h3>
                  <p className="mt-3 max-w-[52ch] text-soft text-pretty">{tr(d.tagline, lang)}</p>
                  <p className="mt-5 inline-flex items-center gap-3 border-y border-line py-2 pe-4">
                    <span aria-hidden className={`size-2.5 ${ready ? "bg-forest" : "bg-copper"} ${ready ? "" : "animate-pulse"}`} />
                    <span className="annot !text-ink">{s.status}: {t.labels.completion[d.status]}</span>
                  </p>
                </header>

                <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                  {/* photograph, curtain-revealed */}
                  <div className={`md:col-span-2 lg:col-span-5 ${flip ? "lg:order-3" : ""}`} style={{ "--d": "150ms" } as CSSProperties}>
                    <div className="fxb-curtain relative aspect-[4/3] w-full overflow-hidden lg:aspect-[4/5]">
                      <div className="absolute inset-0">
                        {img && <AtlasImage src={img.src} alt={tr(img.alt, lang)} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />}
                      </div>
                    </div>
                  </div>

                  {/* tower + giant numeral */}
                  <div className={`flex items-end gap-4 sm:gap-8 lg:col-span-4 lg:items-end ${flip ? "lg:order-2" : ""}`} role="img" aria-label={fmt(s.progressSample, { n: pct })}>
                    <div className="w-[34%] max-w-[9.5rem] shrink-0 sm:w-[30%] lg:w-[44%] lg:max-w-none">
                      <ProgressTower slug={d.slug} progress={d.progress} />
                      <p className="annot mt-2 !text-[0.6rem]">{x.ground}</p>
                    </div>
                    <div className="min-w-0 pb-6" aria-hidden>
                      <p dir="ltr" className="numeral flex items-baseline text-[clamp(4.5rem,15vw,7.5rem)] text-copper lg:text-[clamp(4.5rem,8vw,8.5rem)]">
                        <CountUp to={d.progress} /><span className="text-[0.4em]">%</span>
                      </p>
                      <p className="annot mt-2">{x.built} · {x.tower}</p>
                    </div>
                  </div>

                  {/* ruler + facts */}
                  <div className={`grid content-between gap-8 lg:col-span-3 ${flip ? "lg:order-1" : ""}`}>
                    <div>
                      <p className="annot mb-4">{x.ruler} · {s.phases}</p>
                      <ol className="relative grid gap-5 ps-7">
                        <span aria-hidden className="fxb-spine absolute inset-y-1 start-[5px] w-px bg-mute" />
                        {d.phases.map((ph, k) => (
                          <li key={ph.date + ph.label.en} className="fxb-rise relative" style={{ "--d": `${300 + k * 140}ms` } as CSSProperties}>
                            <span aria-hidden className={`absolute -start-7 top-[0.55em] h-[3px] w-3 ${ph.done ? "bg-copper" : "bg-line"}`} />
                            <span aria-hidden className={`absolute -start-[1.7rem] top-[0.2em] size-2.5 rotate-45 ${ph.done ? "bg-copper" : "border border-mute bg-paper2"}`} />
                            <span className={`block text-sm ${ph.done ? "text-ink" : "text-mute"}`}>{tr(ph.label, lang)}</span>
                            <span className="annot">{ph.date} · {ph.done ? s.done : s.upcoming}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between gap-4"><dt className="text-mute">{s.quarter}</dt><dd className="num">{d.completionQuarter}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-mute">{s.units}</dt><dd className="num text-end">{fmt(s.unitsSample, { a: formatNumber(d.unitsAvailable, lang), n: formatNumber(d.units, lang) })}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-mute">{s.from}</dt><dd className="num font-semibold">{formatMoney(d.priceFrom, lang, d.currency, { compact: true })}</dd></div>
                    </dl>
                  </div>
                </div>

                <Link href={href(lang, `/developments/${d.slug}`)} className="btn btn-primary mt-10 w-fit">{s.view}<Arrow /></Link>
              </InView>
            );
          })}
        </div>
        <p className="annot mt-16">{s.sample}</p>
      </div>
    </section>
  );
}
