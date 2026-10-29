import { SectionHead } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";
import { FloorPlanRoomClient } from "./FloorPlanRoomClient";

/** O — The floor plan room: pick a home, study its (illustrative) plan. */
export function FloorPlanRoom({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  const items = data.properties
    .filter((p) => p.type !== "land" && p.purpose === "sale" && p.floorPlan && p.floorPlan.floors.length > 0)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.price - a.price)
    .slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section id="floor-plan-room" aria-labelledby="plan-h" className="section bg-paper2">
      <div className="wrap">
        <div id="plan-h" className="mb-12 md:mb-16"><SectionHead num={t.plan.num} eyebrow={t.plan.eyebrow} title={t.plan.title} intro={t.plan.intro} /></div>
        <FloorPlanRoomClient items={items} />
      </div>
    </section>
  );
}
