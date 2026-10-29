import Link from "next/link";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { href, tr, type Locale } from "@/lib/i18n/config";
import { formatArea, formatMoney, formatNumber } from "@/lib/i18n/format";
import type { Property } from "@/lib/api/types";
import type { HomeData } from "../types";
import { ContourBg } from "./ContourBg";
import { coordLabel } from "./pick";

/** Three exceptional featured places, each a different asymmetric composition. Server component. */
export function PlacesWithPOV({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const h = t.home.places;
  const picks = data.properties.filter((p) => p.featured && p.images.length > 0).slice(0, 3);
  if (picks.length === 0) return null;

  const copy = (p: Property) => tr(p.story?.exterior, lang) || tr(p.summary, lang);
  const meta = (p: Property) => (
    <ul className="annot flex flex-wrap gap-x-5 gap-y-1">
      <li>{formatMoney(p.price, lang, p.currency, { compact: true })}{p.purpose === "rent" ? ` ${p.pricePeriod === "year" ? t.common.perYear : t.common.perMonth}` : ""}</li>
      <li>{formatArea(p.area, lang)}</li>
      {p.type !== "land" && <li>{formatNumber(p.bedrooms, lang)} {t.common.beds}</li>}
      <li dir="ltr">{coordLabel(p)}</li>
    </ul>
  );
  const link = (p: Property) => (
    <Link href={href(lang, `/properties/${p.slug}`)} className="btn justify-self-start">{h.cta}<Arrow /></Link>
  );
  const img = (p: Property, i: number, sizes: string, cls: string, priorityIdx = false) => {
    const im = p.images[Math.min(i, p.images.length - 1)];
    return (
      <div className={`group relative overflow-hidden bg-paper2 ${cls}`}>
        <AtlasImage src={im.src} alt={tr(im.alt, lang)} fill sizes={sizes} priority={priorityIdx} className="img-hover object-cover" />
      </div>
    );
  };

  const [a, b, c] = picks;
  return (
    <section id="places" aria-labelledby="places-title" className="section relative overflow-hidden">
      <ContourBg seed={9} rings={9} cx={200} cy={500} className="opacity-50" />
      <div className="wrap relative grid gap-20 md:gap-32">
        <Reveal className="reveal">
          <SectionHead num="D / 04" eyebrow={h.eyebrow} title={<span id="places-title">{h.title}</span>} intro={h.intro} />
        </Reveal>

        {/* 01 — tall image, numeral bleeding over the edge */}
        <article className="grid items-end gap-8 md:grid-cols-12">
          <Reveal className="relative md:col-span-7">
            {img(a, 0, "(min-width:768px) 58vw, 94vw", "aspect-[4/5] md:aspect-[5/6]")}
            <span className="numeral reveal pointer-events-none absolute -bottom-6 end-4 text-[clamp(7rem,22vw,20rem)] text-copper" aria-hidden>{a.ref}</span>
          </Reveal>
          <Reveal className="grid gap-5 md:col-span-4 md:col-start-9 md:pb-16">
            <div className="reveal grid gap-5">
              <p className="annot !text-copper">{tr(a.location, lang)}</p>
              <h3 className="display h-lg text-balance">{tr(a.title, lang)}</h3>
              <p className="max-w-[40ch] text-pretty text-soft">{copy(a)}</p>
              {meta(a)}
              {link(a)}
            </div>
          </Reveal>
        </article>

        {/* 02 — wide panorama with offset text card, mirrored */}
        {b && (
          <article className="relative grid gap-8 md:grid-cols-12">
            <Reveal className="relative md:col-span-9 md:col-start-4">
              {img(b, 0, "(min-width:768px) 70vw, 94vw", "aspect-[16/10] md:aspect-[2/1]")}
            </Reveal>
            <Reveal className="relative md:absolute md:bottom-[-3rem] md:start-0 md:col-span-5 md:w-[min(34rem,45%)]">
              <div className="reveal grid gap-4 border border-line bg-paper p-6 shadow-[var(--shadow)] md:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="numeral text-7xl text-copper md:text-8xl" aria-hidden>{b.ref}</span>
                  <p className="annot text-end">{tr(b.location, lang)}</p>
                </div>
                <h3 className="display h-md text-balance">{tr(b.title, lang)}</h3>
                <p className="text-pretty text-soft">{copy(b)}</p>
                {meta(b)}
                {link(b)}
              </div>
            </Reveal>
          </article>
        )}

        {/* 03 — narrow tall + detail inset, large type */}
        {c && (
          <article className="grid items-start gap-8 pt-6 md:grid-cols-12 md:pt-20">
            <Reveal className="grid content-start gap-6 md:col-span-5">
              <div className="reveal grid gap-5">
                <span className="numeral text-[clamp(5rem,12vw,10rem)] text-copper" aria-hidden>{c.ref}</span>
                <p className="annot">{tr(c.location, lang)}</p>
                <h3 className="display h-lg text-balance">{tr(c.title, lang)}</h3>
                <p className="max-w-[44ch] text-pretty text-soft">{copy(c)}</p>
                {meta(c)}
                {link(c)}
              </div>
            </Reveal>
            <Reveal className="relative md:col-span-6 md:col-start-7">
              {img(c, 0, "(min-width:768px) 48vw, 94vw", "aspect-[3/4]")}
              {c.images.length > 1 && (
                <div className="absolute -bottom-10 start-[-8%] hidden w-[42%] border-4 border-paper md:block">
                  {img(c, 1, "20vw", "aspect-square")}
                </div>
              )}
            </Reveal>
          </article>
        )}
      </div>
    </section>
  );
}
