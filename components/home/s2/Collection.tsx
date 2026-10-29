import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";
import { FilmStrip } from "./fx-a/FilmStrip";

/** I — The collection: a pinned, scroll-scrubbed horizontal "film strip" of poster panels (native snap scroller on mobile). */
export function Collection({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  const featured = data.properties.filter((p) => p.featured);
  const pool = featured.length >= 4 ? featured : [...data.properties].sort((a, b) => b.price - a.price);
  const items = pool.slice(0, 6);
  if (items.length === 0) return null;
  const c = t.collection;
  return (
    <FilmStrip
      items={items}
      strings={{ num: c.num, eyebrow: c.eyebrow, title: c.title, intro: c.intro, cta: c.cta, hint: c.hint, strip: c.strip, end: c.end, open: c.open }}
    />
  );
}
