import type { Locale } from "@/lib/i18n/config";
import { tr } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import type { HomeData } from "@/components/home/types";
import { CountUp } from "./CountUp";

/** Infinite survey-tape marquee of neighborhoods + demo coordinates. Static (scrollable) under reduced motion. */
export function CoordinateMarquee({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const items = data.neighborhoods.map((n) => ({
    name: tr(n.name, lang),
    xy: `${(n.geo.x / 10).toFixed(1)} · ${(n.geo.y / 10).toFixed(1)}`,
  }));
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((i) => (
        <li key={i.name} className="flex items-baseline gap-4">
          <span className="display h-md">{i.name}</span>
          <span className="annot">{i.xy}</span>
          <span aria-hidden className="text-copper">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee border-y border-line bg-paper2 py-6" role="region" aria-label={t.fx.marquee}>
      <div className="marquee__track" dir="ltr">{row(false)}{row(true)}{row(true)}</div>
    </div>
  );
}

/** Count-up figures drawn from the real (demo) catalog size. */
export function StatsBand({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang);
  const stats: [number, string][] = [
    [data.properties.length, t.fx.statListings],
    [data.neighborhoods.length, t.fx.statHoods],
    [data.developments.length, t.fx.statDevs],
    [2, t.fx.statLangs],
  ];
  return (
    <section aria-label={t.fx.statsLabel} className="wrap grid grid-cols-2 gap-px border-b border-line py-0 md:grid-cols-4">
      {stats.map(([n, label], i) => (
        <div key={label} className={`grid gap-2 px-2 py-8 md:py-12 ${i % 2 ? "border-s border-line" : ""} md:border-s md:first:border-s-0`}>
          <CountUp to={n} className="numeral text-6xl text-copper md:text-8xl" />
          <span className="annot annot-ar-ok">{label}</span>
        </div>
      ))}
    </section>
  );
}
