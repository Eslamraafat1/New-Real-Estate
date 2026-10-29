import Link from "next/link";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import { formatArea, formatMoney, formatNumber } from "@/lib/i18n/format";
import { href, tr, type Locale } from "@/lib/i18n/config";
import { Parallax } from "./Parallax";
import type { HomeData } from "../types";

/** K — Above the city: penthouses with oversized floor numerals and layered parallax. */
export function AboveTheCity({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.home2.sky;
  let items = data.properties.filter((p) => p.type === "penthouse").sort((a, b) => (b.floor ?? 0) - (a.floor ?? 0)).slice(0, 3);
  if (items.length === 0) items = data.properties.filter((p) => p.floor).sort((a, b) => (b.floor ?? 0) - (a.floor ?? 0)).slice(0, 3);
  if (items.length === 0) return null;
  const [hero, ...rest] = items;

  return (
    <section id="above-the-city" aria-labelledby="sky-h" className="section relative overflow-hidden bg-ink text-paper">
      <Parallax>
        {/* skyline backdrop */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[70%]" aria-hidden>
          <div data-depth="1" className="absolute inset-0 opacity-40">
            <AtlasImage src={hero.images[0].src} alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/70 to-ink" />
          </div>
        </div>
        <div data-depth="-2" className="numeral pointer-events-none absolute -top-6 end-2 select-none text-[34vw] leading-none text-paper/10 md:-top-16" aria-hidden>
          {formatNumber(hero.floor ?? 0, lang)}
        </div>

        <div className="wrap relative">
          <div id="sky-h" className="[&_.annot]:!text-paper/70 [&_p]:!text-paper/80">
            <SectionHead num={s.num} eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
          </div>

          <div className="mt-16 grid gap-12 md:mt-28 md:grid-cols-12 md:gap-8">
            <Reveal className="md:col-span-7">
              <article className="reveal group relative">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <AtlasImage src={hero.images[0].src} alt={tr(hero.images[0].alt, lang)} fill sizes="(min-width:768px) 58vw, 100vw" className="img-hover object-cover" />
                </div>
                <div className="mt-5 flex items-end gap-5">
                  <span className="numeral text-8xl text-copper md:text-9xl" aria-hidden>{formatNumber(hero.floor ?? 0, lang)}</span>
                  <div className="pb-1">
                    <p className="annot !text-paper/70">{s.floor} · {tr(hero.location, lang)}</p>
                    <h3 className="display h-md text-balance"><Link href={href(lang, `/properties/${hero.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(hero.title, lang)}</Link></h3>
                    <p className="num mt-1 text-paper/80">{formatMoney(hero.price, lang, hero.currency, { compact: true })} · {formatArea(hero.area, lang)}</p>
                  </div>
                </div>
              </article>
            </Reveal>

            <div className="grid content-start gap-10 md:col-span-4 md:col-start-9 md:pt-24">
              {rest.map((p, i) => (
                <Reveal key={p.id} delay={i * 120}>
                  <article className="reveal group relative grid grid-cols-[auto_1fr] items-start gap-4 border-t border-paper/25 pt-4">
                    <span className="numeral text-6xl text-paper/90" aria-hidden>{formatNumber(p.floor ?? 0, lang)}</span>
                    <div>
                      <p className="annot !text-paper/70">{s.level.replace("{n}", formatNumber(p.floor ?? 0, lang))}</p>
                      <h3 className="display h-sm text-balance"><Link href={href(lang, `/properties/${p.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(p.title, lang)}</Link></h3>
                      <p className="num text-sm text-paper/75">{tr(p.location, lang)} · {formatMoney(p.price, lang, p.currency, { compact: true })}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
              <Link href={`${href(lang, "/properties")}?type=penthouse`} className="btn btn-copper w-fit">{s.cta}<Arrow /></Link>
              <p className="annot !text-paper/60">{t.home2.demoNote}</p>
            </div>
          </div>
        </div>
      </Parallax>
    </section>
  );
}
