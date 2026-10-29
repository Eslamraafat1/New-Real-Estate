import type { CSSProperties } from "react";
import Link from "next/link";
import { Flame, Flower2, Sun, Trees, Waves, type LucideIcon } from "lucide-react";
import type { Amenity, Property } from "@/lib/api/types";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHead } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import { formatArea, formatMoney } from "@/lib/i18n/format";
import { href, tr, type Locale } from "@/lib/i18n/config";
import { InView } from "./fx-b/InView";
import { SlowWash } from "./fx-b/SlowWash";
import type { HomeData } from "../types";

const GLYPHS: Partial<Record<Amenity, LucideIcon>> = {
  garden: Trees, pool: Waves, terrace: Sun, fireplace: Flame, spa: Flower2,
};
const DEFAULTS: Amenity[] = ["garden", "pool", "terrace"];
/** Loose constellation positions (% of the photograph); lines connect them in order. */
const SPOTS: [number, number][] = [[10, 18], [38, 9], [64, 24], [88, 10], [76, 44]];

/** L — A slower kind of living: slow Ken-Burns, floating glyph constellation, day-to-dusk wash, editorial column. */
export function SlowerLiving({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.home2.slow;
  const x = t.home3.slow;
  const landscape = (p: Property) => ["villa", "house", "land"].includes(p.type) && p.purpose === "sale";
  const score = (p: Property) => (p.amenities.includes("garden") ? 2 : 0) + (p.amenities.includes("pool") ? 1 : 0) + (p.plotArea ? 1 : 0);
  const items = data.properties.filter(landscape).sort((a, b) => score(b) - score(a) || (b.plotArea ?? 0) - (a.plotArea ?? 0)).slice(0, 4);
  if (items.length === 0) return null;
  const [lead, ...more] = items;

  let glyphs = lead.amenities.filter((a) => GLYPHS[a]).slice(0, 5);
  for (const d of DEFAULTS) if (glyphs.length < 3 && !glyphs.includes(d)) glyphs = [...glyphs, d];
  const spots = SPOTS.slice(0, glyphs.length);

  return (
    <SlowWash id="slower-living" labelledBy="slow-h" className="fxb-wash section relative overflow-clip">
      <span aria-hidden className="fxb-orb pointer-events-none absolute size-[44vmin] rounded-full blur-2xl" />
      <div className="wrap relative">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div id="slow-h"><SectionHead num={s.num} eyebrow={s.eyebrow} title={s.title} intro={s.intro} /></div>
          <Link href={`${href(lang, "/properties")}?type=villa`} className="btn w-fit">{s.cta}<Arrow /></Link>
        </div>

        <InView as="article" threshold={0.15} className="relative mt-14 md:mt-20">
          <div className="fxb-curtain relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:aspect-[21/10]">
            <div className="absolute inset-0">
              <div className="fxb-kb absolute inset-0">
                <AtlasImage src={lead.images[0].src} alt={tr(lead.images[0].alt, lang)} fill sizes="(min-width:1440px) 1330px, 100vw" className="object-cover" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-transparent" aria-hidden />

            {/* floating amenity constellation */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full rtl:-scale-x-100" aria-hidden>
              <polyline points={spots.map(([sx, sy]) => `${sx},${sy}`).join(" ")} fill="none" stroke="var(--on-forest)" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
            </svg>
            <ul className="absolute inset-0" aria-label={x.constellation}>
              {glyphs.map((a, i) => {
                const Icon = GLYPHS[a]!;
                return (
                  <li key={a} className="absolute -translate-x-1/2 rtl:translate-x-1/2" style={{ insetInlineStart: `${spots[i][0]}%`, top: `${spots[i][1]}%` }}>
                    <div className="fxb-float grid justify-items-center gap-1.5" style={{ "--fd": `${8 + i * 1.7}s`, "--fl": `${-i * 1.9}s` } as CSSProperties}>
                      <span className="grid size-10 place-items-center rounded-full border border-onforest/60 bg-forest/35 text-onforest backdrop-blur-sm sm:size-12"><Icon size={20} aria-hidden /></span>
                      <span className="annot !hidden !text-onforest sm:!block">{t.labels.amenity[a]}</span>
                      <span className="sr-only sm:hidden">{t.labels.amenity[a]}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="fxb-rise absolute inset-x-0 bottom-0 p-5 text-onforest sm:p-8 lg:p-12">
              <p className="annot !text-onforest/80">{tr(lead.location, lang)}{lead.plotArea ? ` · ${s.plot} ${formatArea(lead.plotArea, lang)}` : ""}</p>
              <h3 className="display h-lg mt-2 max-w-[20ch] text-balance"><Link href={href(lang, `/properties/${lead.slug}`)} className="after:absolute after:inset-0 after:z-10 after:content-['']">{tr(lead.title, lang)}</Link></h3>
            </div>
          </div>

          {/* generous editorial column */}
          <div className="mt-10 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
            <div className="fxb-rise lg:col-span-4">
              <p className="annot">{x.notes}</p>
              <p className="num mt-3 text-2xl text-ink">{formatMoney(lead.price, lang, lead.currency, { compact: true })}</p>
              <p className="annot mt-2">{x.hours}</p>
            </div>
            <p className="fxb-rise max-w-[38ch] text-pretty text-lg leading-[1.8] text-soft md:text-xl md:leading-[1.85] lg:col-span-7 lg:col-start-6" style={{ "--d": "200ms" } as CSSProperties}>
              {tr(lead.story?.outdoor ?? lead.summary, lang)}
            </p>
          </div>
        </InView>

        <div className="mt-24 md:mt-36">
          <p className="annot mb-8">{x.also}</p>
          <div className="grid gap-14 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
            {more.map((p, i) => (
              <InView key={p.id} as="article" className={`group relative grid gap-4 ${i === 1 ? "md:mt-20" : i === 2 ? "md:mt-8" : ""}`}>
                <div className="fxb-curtain relative aspect-[3/4] overflow-hidden" style={{ "--d": `${i * 120}ms` } as CSSProperties}>
                  <div className="absolute inset-0">
                    <AtlasImage src={p.images[0].src} alt={tr(p.images[0].alt, lang)} fill sizes="(min-width:768px) 30vw, (min-width:640px) 45vw, 100vw" className="img-hover object-cover" />
                  </div>
                </div>
                <div className="fxb-rise" style={{ "--d": `${250 + i * 120}ms` } as CSSProperties}>
                  <p className="annot">{tr(p.location, lang)}</p>
                  <h3 className="display h-sm text-balance"><Link href={href(lang, `/properties/${p.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(p.title, lang)}</Link></h3>
                  <p className="num mt-1 text-soft">{formatMoney(p.price, lang, p.currency, { compact: true })}{p.plotArea ? ` · ${s.plot} ${formatArea(p.plotArea, lang)}` : ""}</p>
                  <div className="mt-2 flex gap-3 text-forest">
                    {p.amenities.filter((a) => GLYPHS[a]).slice(0, 4).map((a) => { const Icon = GLYPHS[a]!; return <span key={a} title={t.labels.amenity[a]}><Icon size={18} aria-hidden /><span className="sr-only">{t.labels.amenity[a]}</span></span>; })}
                  </div>
                </div>
              </InView>
            ))}
          </div>
        </div>
        <p className="annot mt-14">{t.home2.demoNote}</p>
      </div>
    </SlowWash>
  );
}
