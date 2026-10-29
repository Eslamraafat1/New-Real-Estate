import Link from "next/link";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { fmt, getDictionary } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { href, tr, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";

/** R — Stories of place: one large featured story, smaller ones alongside. Renders nothing if there are no articles. */
export function StoriesOfPlace({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  const articles = [...data.articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  if (articles.length === 0) return null;
  const [main, ...rest] = articles;
  const meta = (a: typeof main) => `${tr(a.category, lang)} · ${formatDate(a.date, lang)} · ${fmt(t.stories.minutes, { n: formatNumber(a.readMinutes, lang) })}`;

  return (
    <section id="stories-of-place" aria-labelledby="stories-h" className="section">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div id="stories-h"><SectionHead num={t.stories.num} eyebrow={t.stories.eyebrow} title={t.stories.title} intro={t.stories.intro} /></div>
          <Link href={href(lang, "/journal")} className="btn">{t.stories.cta}<Arrow /></Link>
        </div>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <article className="reveal group relative">
              <div className="relative aspect-[3/2] overflow-hidden">
                <AtlasImage src={main.image.src} alt={tr(main.image.alt, lang)} fill sizes="(min-width:1024px) 58vw, 100vw" className="img-hover object-cover" />
              </div>
              <p className="annot mt-5">{meta(main)}</p>
              <h3 className="display h-md mt-2 max-w-[24ch] text-balance"><Link href={href(lang, `/journal/${main.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(main.title, lang)}</Link></h3>
              <p className="mt-3 max-w-[60ch] text-soft text-pretty">{tr(main.excerpt, lang)}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">{t.stories.read}<Arrow /></span>
            </article>
          </Reveal>

          {rest.length > 0 && (
            <div className="grid content-start gap-8 lg:col-span-5 lg:border-s lg:border-line lg:ps-10">
              {rest.map((a, i) => (
                <Reveal key={a.slug} delay={i * 100}>
                  <article className="reveal group relative grid grid-cols-[7rem_1fr] items-start gap-4 border-b border-line pb-8 last:border-b-0 sm:grid-cols-[9rem_1fr]">
                    <div className="relative aspect-square overflow-hidden">
                      <AtlasImage src={a.image.src} alt="" fill sizes="144px" className="img-hover object-cover" />
                    </div>
                    <div>
                      <p className="annot">{meta(a)}</p>
                      <h3 className="display h-sm mt-1 text-balance"><Link href={href(lang, `/journal/${a.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(a.title, lang)}</Link></h3>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
