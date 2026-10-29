"use client";

import Link from "next/link";
import { useState } from "react";
import type { Property } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { FloorPlanViewer } from "@/components/property/FloorPlanViewer";
import { Arrow } from "@/components/ui/Arrow";
import { useFormat } from "@/lib/hooks";
import { fmt } from "@/lib/i18n";
import { tr } from "@/lib/i18n/config";

export function FloorPlanRoomClient({ items }: { items: Property[] }) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const s = t.home2.plan;
  const [id, setId] = useState(items[0]?.id);
  const p = items.find((x) => x.id === id) ?? items[0];
  if (!p?.floorPlan) return null;
  const title = tr(p.title, lang);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-4">
        <p className="annot mb-3" id="plan-pick">{s.pick}</p>
        <ul className="grid gap-2" aria-labelledby="plan-pick">
          {items.map((x, i) => {
            const on = x.id === p.id;
            return (
              <li key={x.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setId(x.id)}
                  className={`grid w-full grid-cols-[auto_1fr] items-baseline gap-4 border px-4 py-3 text-start transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line hover:bg-paper2"}`}
                >
                  <span className="numeral text-3xl" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="display block text-lg">{tr(x.title, lang)}</span>
                    <span className="annot block !text-inherit opacity-70">{fmt(s.bedrooms, { n: f.num(x.bedrooms) })} · {f.area(x.area)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <Link href={href(`/properties/${p.slug}`)} className="btn btn-primary mt-6">{s.open}<Arrow /></Link>
      </div>

      <div className="lg:col-span-8">
        <div className="atlas-grid border border-line bg-surface p-3 md:p-6">
          <FloorPlanViewer plan={p.floorPlan} propertyTitle={title} />
        </div>
        <p className="annot mt-3 !text-copper">{s.demo}</p>
      </div>
    </div>
  );
}
