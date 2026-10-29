import Link from "next/link";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";

/** I — The collection: asymmetric mix of wide / poster / standard cards. */
export function Collection({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  const featured = data.properties.filter((p) => p.featured);
  const pool = featured.length >= 4 ? featured : [...data.properties].sort((a, b) => b.price - a.price);
  const items = pool.slice(0, 5);
  if (items.length === 0) return null;
  const [a, b, c, d, e] = items;

  return (
    <section id="collection" aria-labelledby="collection-h" className="section">
      <div className="wrap">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div id="collection-h">
            <SectionHead num={t.collection.num} eyebrow={t.collection.eyebrow} title={t.collection.title} intro={t.collection.intro} />
          </div>
          <Link href={href(lang, "/properties")} className="btn">{t.collection.cta}<Arrow /></Link>
        </div>

        <div className="mt-12 grid gap-y-10 md:mt-16 md:grid-cols-12 md:gap-x-8 md:gap-y-16">
          <Reveal className="md:col-span-12">
            <div className="reveal"><PropertyCard p={a} variant="wide" priority sizes="(min-width:768px) 60vw, 100vw" /></div>
          </Reveal>
          {b && (
            <Reveal className="md:col-span-5 md:col-start-1">
              <div className="reveal"><PropertyCard p={b} variant="poster" sizes="(min-width:768px) 40vw, 100vw" /></div>
            </Reveal>
          )}
          {c && (
            <Reveal className="self-end md:col-span-4 md:col-start-7" delay={120}>
              <div className="reveal"><PropertyCard p={c} variant="standard" sizes="(min-width:768px) 33vw, 100vw" /></div>
              <p className="annot mt-6 max-w-[34ch]">{t.demoNote}</p>
            </Reveal>
          )}
          {d && (
            <Reveal className="md:col-span-4 md:col-start-2 md:-mt-8">
              <div className="reveal"><PropertyCard p={d} variant="standard" sizes="(min-width:768px) 33vw, 100vw" /></div>
            </Reveal>
          )}
          {e && (
            <Reveal className="md:col-span-5 md:col-start-8" delay={120}>
              <div className="reveal"><PropertyCard p={e} variant="poster" sizes="(min-width:768px) 40vw, 100vw" /></div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
