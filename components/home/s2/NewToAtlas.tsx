import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";
import { NewToAtlasIndex } from "./NewToAtlasIndex";

/** J — New to the atlas: newest listings as a numbered editorial index. */
export function NewToAtlas({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  const items = [...data.properties].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 6);
  if (items.length === 0) return null;
  return (
    <section id="new-to-the-atlas" aria-labelledby="fresh-h" className="section bg-paper2">
      <div className="wrap">
        <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-[1fr_auto] md:items-end">
          <div id="fresh-h">
            <SectionHead num={t.fresh.num} eyebrow={t.fresh.eyebrow} title={t.fresh.title} intro={t.fresh.intro} />
          </div>
          <Link href={`${href(lang, "/properties")}?sort=newest`} className="btn">{t.fresh.cta}<Arrow /></Link>
        </div>
        <NewToAtlasIndex items={items} />
        <p className="annot mt-8">{t.fresh.demo}</p>
      </div>
    </section>
  );
}
