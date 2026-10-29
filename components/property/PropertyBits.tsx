"use client";

import { Bath, BedDouble, Heart, Ruler, Scale, Check } from "lucide-react";
import type { Property } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";

export function Price({ p, className = "", compact = false }: { p: Property; className?: string; compact?: boolean }) {
  const { t } = useApp();
  const f = useFormat();
  return (
    <span className={`num ${className}`}>
      {f.money(p.price, p.currency, { compact })}
      {p.purpose === "rent" && <span className="ms-1 text-[0.7em] text-mute">{p.pricePeriod === "year" ? t.common.perYear : t.common.perMonth}</span>}
    </span>
  );
}

export function Specs({ p, className = "" }: { p: Property; className?: string }) {
  const f = useFormat();
  const { t } = useApp();
  const land = p.type === "land";
  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-soft ${className}`}>
      {!land && (
        <>
          <li className="flex items-center gap-1.5" title={t.common.beds}><BedDouble size={15} aria-hidden /><span className="num">{f.num(p.bedrooms)}</span><span className="sr-only">{t.common.beds}</span></li>
          <li className="flex items-center gap-1.5" title={t.common.baths}><Bath size={15} aria-hidden /><span className="num">{f.num(p.bathrooms)}</span><span className="sr-only">{t.common.baths}</span></li>
        </>
      )}
      <li className="flex items-center gap-1.5" title={t.common.area}><Ruler size={15} aria-hidden /><span className="num">{f.area(p.area)}</span></li>
    </ul>
  );
}

export function FavButton({ id, className = "" }: { id: string; className?: string }) {
  const { isFavorite, toggleFavorite, t } = useApp();
  const on = isFavorite(id);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? t.common.saved : t.common.save} title={on ? t.common.saved : t.common.save} className={`icon-btn icon-btn-sm ${className}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(id); }}>
      <Heart size={16} fill={on ? "currentColor" : "none"} />
    </button>
  );
}

export function CompareButton({ id, className = "", label = false }: { id: string; className?: string; label?: boolean }) {
  const { inCompare, toggleCompare, t } = useApp();
  const on = inCompare(id);
  const text = on ? t.common.comparing : t.common.compare;
  return (
    <button type="button" aria-pressed={on} aria-label={text} title={text} className={label ? `btn btn-sm ${className}` : `icon-btn icon-btn-sm ${className}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(id); }}>
      {on ? <Check size={16} /> : <Scale size={16} />}
      {label && <span>{text}</span>}
    </button>
  );
}

/** Status badges: only data-backed claims. `verified` renders only when the record says so. */
export function Badges({ p }: { p: Property }) {
  const { t } = useApp();
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="annot annot-ar-ok bg-ink px-2 py-1 !text-paper">{p.purpose === "sale" ? t.labels.purpose.sale : t.labels.purpose.rent}</span>
      {p.completion !== "ready" && <span className="annot annot-ar-ok bg-copper px-2 py-1 !text-white">{t.labels.completion[p.completion]}</span>}
      {p.availability !== "available" && <span className="annot annot-ar-ok bg-surface px-2 py-1 !text-ink border border-line">{t.labels.availability[p.availability]}</span>}
      {p.verified && <span className="annot annot-ar-ok bg-forest px-2 py-1 !text-onforest">{t.common.verified}</span>}
    </div>
  );
}

export const propTitle = (p: Property, lang: "en" | "ar") => tr(p.title, lang);

/** Miniature, illustrative floor plan used on cards and in the map panel. */
export function MiniPlan({ p, className = "" }: { p: Property; className?: string }) {
  const floor = p.floorPlan?.floors[0];
  if (!floor) return null;
  const [w, h] = floor.viewBox;
  return (
    <svg viewBox={`-2 -2 ${w + 4} ${h + 4}`} className={className} role="img" aria-label="Illustrative floor plan" fill="none" stroke="currentColor" strokeWidth="0.6">
      {floor.rooms.map((r) => (
        <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} />
      ))}
      <rect x="0" y="0" width={w} height={h} strokeWidth="1.4" />
    </svg>
  );
}
