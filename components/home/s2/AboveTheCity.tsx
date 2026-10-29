import type { CSSProperties } from "react";
import Link from "next/link";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHead } from "@/components/ui/SectionHead";
import { fmt, getDictionary } from "@/lib/i18n";
import { formatArea, formatMoney, formatNumber } from "@/lib/i18n/format";
import { href, tr, type Locale } from "@/lib/i18n/config";
import { InView } from "./fx-b/InView";
import { SkyStage } from "./fx-b/SkyStage";
import { Skyline, Stars } from "./fx-b/Skyline";
import type { HomeData } from "../types";

/** K — Above the city: a dusk skyline, an elevator readout that counts floors, glass price tags. */
export function AboveTheCity({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.home2.sky;
  const x = t.home3.sky;
  let top = data.properties.filter((p) => p.type === "penthouse").sort((a, b) => (b.floor ?? 0) - (a.floor ?? 0)).slice(0, 3);
  if (top.length === 0) top = data.properties.filter((p) => p.floor).sort((a, b) => (b.floor ?? 0) - (a.floor ?? 0)).slice(0, 3);
  if (top.length === 0) return null;
  const items = [...top].reverse(); // ascending: scrolling down rides the elevator up
  const floorOf = (p: (typeof items)[number]) => p.floor ?? 1;
  const maxFloor = Math.max(...items.map(floorOf));
  const bgImg = top[0].images[0];

  return (
    <section id="above-the-city" aria-labelledby="sky-h" className="relative overflow-clip bg-ink text-paper">
      <SkyStage className="section relative">
        {/* pinned dusk backdrop (sticky inside the section; layers drift via GSAP on desktop) */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="sticky top-0 h-[100svh] overflow-clip">
            <div className="absolute inset-0 opacity-30">
              <AtlasImage src={bgImg.src} alt="" fill sizes="100vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-copper/45 via-ink/70 to-ink" />
            <div className="absolute inset-x-0 bottom-[8%] h-[42svh] bg-[radial-gradient(ellipse_at_50%_100%,var(--copper),transparent_65%)] opacity-40" />
            <Stars />
            <Skyline />
            <p className="annot absolute bottom-3 start-4 !text-paper/60 md:start-8">{x.dusk}</p>
          </div>
        </div>

        <div className="wrap relative">
          <div id="sky-h" className="[&_.annot]:!text-paper/70 [&_p]:!text-paper/80">
            <SectionHead num={s.num} eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
          </div>

          <div className="mt-12 grid gap-8 md:mt-20 md:grid-cols-[minmax(0,1fr)_7.5rem] md:gap-10 lg:grid-cols-[minmax(0,1fr)_9rem]">
            <div className="grid gap-20 md:gap-32">
              {items.map((p, i) => {
                const f = formatNumber(floorOf(p), lang);
                const img = p.images[0];
                return (
                  <InView key={p.id} as="article" threshold={0.2} id={`ph-${i}`} className={`relative scroll-mt-24 pt-14 md:pt-24 ${i % 2 === 1 ? "md:ms-[12%]" : "md:me-[12%]"}`}>
                    <div data-ph="" data-floor={floorOf(p)} className="group relative">
                      <span className="numeral fxb-rise pointer-events-none absolute -top-[0.62em] start-1 z-10 select-none text-[clamp(6.5rem,26vw,15rem)] text-copper md:-top-[0.55em]" aria-hidden>{f}</span>
                      <div className="fxb-curtain relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                        <div className="absolute inset-0">
                          <AtlasImage src={img.src} alt={tr(img.alt, lang)} fill sizes="(min-width:1024px) 62vw, (min-width:768px) 78vw, 100vw" className="img-hover object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" aria-hidden />
                      </div>
                      {/* glassy price tag */}
                      <div className="fxb-rise relative z-10 -mt-12 ms-3 w-fit max-w-[calc(100%-1.5rem)] border border-paper/30 bg-paper/10 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:-mt-16 md:ms-8 md:px-6 md:py-4" style={{ "--d": "250ms" } as CSSProperties}>
                        <p className="annot !text-paper/75">{x.glass}</p>
                        <p className="numeral num text-3xl text-paper md:text-5xl">{formatMoney(p.price, lang, p.currency, { compact: true })}</p>
                        <p className="num mt-1 text-sm text-paper/80">{formatArea(p.area, lang)}</p>
                      </div>
                      <div className="fxb-rise mt-6 max-w-xl" style={{ "--d": "350ms" } as CSSProperties}>
                        <p className="annot !text-paper/70">{s.level.replace("{n}", f)} · {tr(p.location, lang)}</p>
                        <h3 className="display h-md mt-1 text-balance"><Link href={href(lang, `/properties/${p.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(p.title, lang)}</Link></h3>
                      </div>
                    </div>
                  </InView>
                );
              })}
              <div className="grid justify-items-start gap-4">
                <Link href={`${href(lang, "/properties")}?type=penthouse`} className="btn btn-copper w-fit">{s.cta}<Arrow /></Link>
                <p className="annot !text-paper/60">{t.home2.demoNote}</p>
              </div>
            </div>

            {/* elevator panel (md+) */}
            <nav aria-label={x.panel} className="relative hidden md:block">
              <div className="sticky top-24 grid gap-5 border-s border-paper/25 bg-ink/40 p-4 backdrop-blur-sm">
                <p className="annot !text-paper/70">{x.floor}</p>
                <p className="numeral num text-7xl text-copper" data-elev-readout aria-hidden>{formatNumber(maxFloor, lang)}</p>
                <div className="relative mx-auto h-40 w-px bg-paper/30" aria-hidden>
                  {items.map((p) => <span key={p.id} className="absolute -start-1.5 h-px w-3 bg-paper/60" style={{ bottom: `${maxFloor > 1 ? ((floorOf(p) - 1) / (maxFloor - 1)) * 100 : 0}%` }} />)}
                  <span data-elev-car className="absolute -start-[5px] size-[11px] translate-y-1/2 bg-copper" style={{ bottom: "100%" }} />
                </div>
                <ul className="grid gap-2">
                  {items.map((p, i) => (
                    <li key={p.id}>
                      <a href={`#ph-${i}`} data-elev-item="" data-idx={i} data-active="false" aria-label={fmt(x.goTo, { n: formatNumber(floorOf(p), lang) })} className="num flex items-center justify-between gap-2 border border-paper/30 px-3 py-1.5 text-sm transition-colors hover:border-copper focus-visible:border-copper data-[active=true]:border-copper data-[active=true]:bg-copper data-[active=true]:text-ink">
                        <span>{formatNumber(floorOf(p), lang)}</span><span aria-hidden className="size-1.5 bg-current" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </SkyStage>
    </section>
  );
}
