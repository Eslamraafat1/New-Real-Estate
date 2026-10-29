import Link from "next/link";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { SectionHead } from "@/components/ui/SectionHead";
import { fmt, getDictionary } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { href, tr, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";
import { Mask } from "./fx-a/Mask";

/** X — Stories of place: layered editorial teaser. One oversized story with an overlapping title card, smaller offset stories. Renders nothing if there are no articles. */
export function StoriesOfPlace({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  const articles = [...data.articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  if (articles.length === 0) return null;
  const [main, ...rest] = articles;
  const mins = (a: typeof main) => fmt(t.stories.minutes, { n: formatNumber(a.readMinutes, lang) });
  const idx = (n: number) => `${formatNumber(0, lang)}${formatNumber(n, lang)}`;
  const chip = "annot border border-line bg-paper px-2.5 py-1.5";

  return (
    <section id="stories-of-place" aria-labelledby="stories-h" className="section overflow-x-clip">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div id="stories-h"><SectionHead num={t.stories.num} eyebrow={t.stories.eyebrow} title={t.stories.title} intro={t.stories.intro} /></div>
          <Link href={href(lang, "/journal")} className="btn">{t.stories.cta}<Arrow /></Link>
        </div>

        {/* lead story: oversized image, title card layered over its corner */}
        <article className="group relative mt-14 md:mt-20">
          <span aria-hidden className="numeral pointer-events-none absolute end-0 top-0 hidden text-[clamp(8rem,14vw,14rem)] font-extralight text-ink/15 lg:block">{idx(1)}</span>
          <div className="relative lg:w-[78%]">
            <Mask className="relative aspect-[4/3] sm:aspect-[16/10]">
              <div className="absolute inset-0">
                <AtlasImage src={main.image.src} alt={tr(main.image.alt, lang)} fill priority sizes="(min-width:1024px) 62vw, 100vw" className="img-hover object-cover" />
              </div>
            </Mask>
            <div className="absolute start-3 top-3 flex flex-wrap gap-2 sm:start-4 sm:top-4">
              <span className={chip}>{tr(main.category, lang)}</span>
              <span className={chip}>{mins(main)}</span>
            </div>
          </div>
          <div className="relative z-10 -mt-12 ms-auto w-[calc(100%-1.5rem)] border border-line bg-paper p-6 sm:w-[78%] md:p-8 lg:-mt-56 lg:w-[46%] lg:p-10">
            <p className="annot">{formatDate(main.date, lang)}</p>
            <h3 className="display h-md mt-3 text-balance">
              <Link href={href(lang, `/journal/${main.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(main.title, lang)}</Link>
            </h3>
            <p className="mt-4 text-soft text-pretty">{tr(main.excerpt, lang)}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 group-hover:underline">{t.stories.read}<Arrow /></span>
          </div>
        </article>

        {/* supporting stories: staggered, with large light numerals tabbed onto the photos */}
        {rest.length > 0 && (
          <div className="mt-16 grid gap-14 sm:grid-cols-2 md:gap-8 lg:mt-28 lg:grid-cols-3 lg:[&>*:nth-child(2)]:mt-16 lg:[&>*:nth-child(3)]:mt-32">
            {rest.map((a, i) => (
              <article key={a.slug} className="group relative">
                <Mask className="relative aspect-[4/5]" delay={i * 120}>
                  <div className="absolute inset-0">
                    <AtlasImage src={a.image.src} alt={tr(a.image.alt, lang)} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" className="img-hover object-cover" />
                  </div>
                </Mask>
                <span aria-hidden className="numeral relative z-10 -mt-12 inline-block bg-paper pe-5 pt-3 text-[5.5rem] font-extralight text-ink">{idx(i + 2)}</span>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={chip}>{tr(a.category, lang)}</span>
                  <span className={chip}>{mins(a)}</span>
                </div>
                <h3 className="display h-sm mt-4 text-balance">
                  <Link href={href(lang, `/journal/${a.slug}`)} className="after:absolute after:inset-0 after:content-['']">{tr(a.title, lang)}</Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-soft">{tr(a.excerpt, lang)}</p>
                <p className="annot mt-3">{formatDate(a.date, lang)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
