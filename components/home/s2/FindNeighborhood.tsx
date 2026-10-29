import { SectionHead } from "@/components/ui/SectionHead";
import type { MapMarker } from "@/components/atlas/MapView";
import { getDictionary } from "@/lib/i18n";
import { tr, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";
import { FindNeighborhoodTabs } from "./FindNeighborhoodTabs";

/** N — Find your neighborhood: tabbed profiles with a mini map and sample (unverified) indicators. */
export function FindNeighborhood({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  if (data.neighborhoods.length === 0) return null;
  const markers: Record<string, MapMarker[]> = {};
  const counts: Record<string, number> = {};
  for (const p of data.properties) {
    counts[p.neighborhood] = (counts[p.neighborhood] ?? 0) + 1;
    (markers[p.neighborhood] ??= []).push({ id: p.id, x: p.geo.x, y: p.geo.y, label: p.ref, title: tr(p.title, lang) });
  }
  return (
    <section id="find-your-neighborhood" aria-labelledby="hood-h" className="section">
      <div className="wrap">
        <div id="hood-h" className="mb-12 md:mb-16"><SectionHead num={t.hood.num} eyebrow={t.hood.eyebrow} title={t.hood.title} intro={t.hood.intro} /></div>
        <FindNeighborhoodTabs neighborhoods={data.neighborhoods} markers={markers} counts={counts} />
      </div>
    </section>
  );
}
