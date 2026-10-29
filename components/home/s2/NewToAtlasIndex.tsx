"use client";

import Link from "next/link";
import { useState } from "react";
import type { Property } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";

/** Editorial index: hover/focus a row to preview its facade. Rows are real links (touch friendly). */
export function NewToAtlasIndex({ items }: { items: Property[] }) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const [active, setActive] = useState(0);
  const cur = items[active] ?? items[0];
  if (!cur) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
      <ol className="border-t border-line">
        {items.map((p, i) => {
          const on = i === active;
          return (
            <li key={p.id} className="border-b border-line">
              <Link
                href={href(`/properties/${p.slug}`)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-describedby={on ? "fresh-preview" : undefined}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 py-5 transition-colors sm:grid-cols-[4.5rem_1fr_auto_4rem] sm:gap-x-6 md:py-6 ${on ? "bg-paper" : ""}`}
              >
                <span className={`numeral text-5xl sm:text-6xl ${on ? "text-copper" : "text-mute"}`} aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="annot block">{t.home2.fresh.added} {f.date(p.addedAt)}</span>
                  <span className="display h-sm block text-balance">{tr(p.title, lang)}</span>
                  <span className="block text-sm text-soft">{tr(p.location, lang)}</span>
                </span>
                <span className="num text-end font-semibold">
                  {f.money(p.price, p.currency, { compact: true })}
                  {p.purpose === "rent" && <span className="ms-1 text-xs font-normal text-mute">{p.pricePeriod === "year" ? t.common.perYear : t.common.perMonth}</span>}
                </span>
                <span className="relative hidden aspect-square w-16 overflow-hidden bg-paper2 sm:block">
                  <AtlasImage src={p.images[0].src} alt="" fill sizes="64px" className="object-cover" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="hidden lg:block">
        <div className="sticky top-28 grid gap-3">
          <div id="fresh-preview" className="relative aspect-[4/5] overflow-hidden bg-paper2" aria-live="polite">
            <AtlasImage key={cur.id} src={cur.images[0].src} alt={tr(cur.images[0].alt, lang)} fill sizes="35vw" className="object-cover" />
            <span className="annot absolute start-3 top-3 bg-paper/85 px-1.5 py-0.5 !text-ink">{t.home2.fresh.preview} · {cur.ref}</span>
          </div>
          <Link href={href(`/properties/${cur.slug}`)} className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
            {tr(cur.title, lang)} <Arrow />
          </Link>
        </div>
      </div>
    </div>
  );
}
