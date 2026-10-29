import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { Contour } from "@/components/ui/Contour";
import { getDictionary } from "@/lib/i18n";
import { href, tr, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";
import { ChapterNav, type ChapterRow } from "./fx-a/ChapterNav";

const ROUTES = [
  ["buy", "/buy"],
  ["rent", "/rent"],
  ["sell", "/sell"],
  ["landlords", "/landlords"],
  ["developers", "/developments"],
] as const;

/** S — The next chapter: five-way typographic navigation on forest, with photo previews and a looping tagline. */
export function NextChapter({ data, lang }: { data?: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2.next;

  const props = data?.properties ?? [];
  const sale = props.filter((p) => p.purpose === "sale");
  const rent = props.filter((p) => p.purpose === "rent");
  const pick = (p?: (typeof props)[number]) => (p?.images[0] ? { src: p.images[0].src, alt: tr(p.images[0].alt, lang) } : null);
  const dev = data?.developments[0]?.images[0];
  const photos = {
    buy: pick(sale[0] ?? props[0]),
    rent: pick(rent[0] ?? props[1]),
    sell: pick(sale[1] ?? sale[0] ?? props[2]),
    landlords: pick(rent[1] ?? rent[0] ?? props[3]),
    developers: dev ? { src: dev.src, alt: tr(dev.alt, lang) } : pick(sale[2] ?? props[4]),
  };

  const rows: ChapterRow[] = ROUTES.map(([k, path]) => ({
    key: k,
    to: href(lang, path),
    k: t.items[k].k,
    label: t.items[k].label,
    note: t.items[k].note,
    blurb: t.items[k].blurb,
    image: photos[k],
  }));

  return (
    <section id="next-chapter" aria-labelledby="next-h" className="section relative overflow-hidden bg-forest text-onforest">
      <Contour seed={7} rings={12} className="absolute inset-0 size-full stroke-current fill-none text-onforest opacity-20" />
      <div className="wrap relative">
        <header className="grid gap-4">
          <div className="annot flex items-baseline gap-4 !text-onforest/70"><span>{t.num}</span><span>{t.eyebrow}</span></div>
          <h2 id="next-h" className="display h-xl max-w-[14ch] text-balance">{t.title}</h2>
          <p className="max-w-[48ch] text-onforest/80">{t.intro}</p>
        </header>

        <ChapterNav rows={rows} tagline={t.tagline} />

        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-8 gap-y-6 md:mt-16">
          <p className="max-w-[36ch] text-onforest/80">{t.contact}</p>
          <Link href={href(lang, "/contact")} data-magnetic className="btn btn-copper min-h-16 px-8 text-base">
            {t.advisor}<Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
