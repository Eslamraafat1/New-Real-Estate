import Link from "next/link";
import { Flame, Flower2, Sun, Trees, Waves, type LucideIcon } from "lucide-react";
import type { Amenity, Property } from "@/lib/api/types";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import { formatArea, formatMoney } from "@/lib/i18n/format";
import { href, tr, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";

const GLYPHS: Partial<Record<Amenity, LucideIcon>> = {
  garden: Trees, pool: Waves, terrace: Sun, fireplace: Flame, spa: Flower2,
};

/** L — A slower kind of living: calm, text-led, landscape-first. */
export function SlowerLiving({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.home2.slow;
  const landscape = (p: Property) => ["villa", "house", "land"].includes(p.type) && p.purpose === "sale";
  const score = (p: Property) => (p.amenities.includes("garden") ? 2 : 0) + (p.amenities.includes("pool") ? 1 : 0) + (p.plotArea ? 1 : 0);
  const items = data.properties.filter(landscape).sort((a, b) => score(b) - score(a) || (b.plotArea ?? 0) - (a.plotArea ?? 0)).slice(0, 4);
  if (items.length === 0) return null;
  const [lead, ...more] = items;

  const glyphs = (p: Property) => p.amenities.filter((a) => GLYPHS[a]).slice(0, 4);

  return (
    <section id="slower-living" aria-labelledby="slow-h" className="section">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4 lg:pt-10">
            <div id="slow-h"><SectionHead num={s.num} eyebrow={s.eyebrow} title={s.title} intro={s.intro} /></div>
            <Link href={`${href(lang, "/properties")}?type=villa`} className="btn mt-8">{s.cta}<Arrow /></Link>
            <ul className="mt-10 grid gap-3 border-t border-line pt-5" aria-label={s.outdoors}>
              {(["garden", "pool", "terrace"] as Amenity[]).map((a) => {
                const Icon = GLYPHS[a]!;
                return <li key={a} className="flex items-center gap-3 text-sm text-soft"><Icon size={18} aria-hidden className="text-forest" />{t.labels.amenity[a]}</li>;
              })}
            </ul>
          </div>

          <Reveal className="lg:col-span-8">
            <article className="reveal group relative">
              <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/10]">
                <AtlasImage src={lead.images[0].src} alt={tr(lead.images[0].alt, lang)} fill sizes="(min-width:1024px) 62vw, 100vw" className="img-hover object-cover" />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="annot">{tr(lead.location, lang)}{lead.plotArea ? ` · ${s.plot} ${formatArea(lead.plotArea, lang)}` : ""}</p>
                  <h3 className="display h-md max-w-[22ch] text-balance"><Link href={href(lang, `/properties/${lead.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(lead.title, lang)}</Link></h3>
                  <p className="mt-2 max-w-[56ch] text-soft">{tr(lead.story?.outdoor ?? lead.summary, lang)}</p>
                </div>
                <div className="flex items-center gap-3 text-forest">
                  {glyphs(lead).map((a) => { const Icon = GLYPHS[a]!; return <span key={a} title={t.labels.amenity[a]}><Icon size={22} aria-hidden /><span className="sr-only">{t.labels.amenity[a]}</span></span>; })}
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-3 md:gap-12">
          {more.map((p, i) => (
            <Reveal key={p.id} delay={i * 120} className={i === 1 ? "md:mt-16" : ""}>
              <article className="reveal group relative grid gap-4">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <AtlasImage src={p.images[0].src} alt={tr(p.images[0].alt, lang)} fill sizes="(min-width:768px) 30vw, 100vw" className="img-hover object-cover" />
                </div>
                <div>
                  <p className="annot">{tr(p.location, lang)}</p>
                  <h3 className="display h-sm text-balance"><Link href={href(lang, `/properties/${p.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(p.title, lang)}</Link></h3>
                  <p className="num mt-1 text-soft">{formatMoney(p.price, lang, p.currency, { compact: true })}{p.plotArea ? ` · ${s.plot} ${formatArea(p.plotArea, lang)}` : ""}</p>
                  <div className="mt-2 flex gap-3 text-forest">
                    {glyphs(p).map((a) => { const Icon = GLYPHS[a]!; return <span key={a} title={t.labels.amenity[a]}><Icon size={18} aria-hidden /><span className="sr-only">{t.labels.amenity[a]}</span></span>; })}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="annot mt-10">{t.home2.demoNote}</p>
      </div>
    </section>
  );
}
