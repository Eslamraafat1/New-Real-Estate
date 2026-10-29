"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import type { Property } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { tr } from "@/lib/i18n/config";
import { Badges, CompareButton, FavButton, MiniPlan, Price, Specs } from "./PropertyBits";

export type CardVariant = "standard" | "poster" | "wide" | "row" | "compact";

interface Props {
  p: Property;
  variant?: CardVariant;
  priority?: boolean;
  selected?: boolean;
  /** When provided, hovering/focusing the card reports it (used by the atlas map). */
  onHover?: (id: string | null) => void;
  /** When provided, clicking the card body selects it instead of navigating (map explorer). */
  onSelect?: (id: string) => void;
  sizes?: string;
  className?: string;
}

/**
 * Architectural-object cards. One component, five compositions:
 * standard (image over data), poster (full-bleed editorial), wide (split), row (list view), compact (map panel).
 */
export function PropertyCard({ p, variant = "standard", priority, selected, onHover, onSelect, sizes, className = "" }: Props) {
  const { lang, href } = useApp();
  const { t } = useApp();
  const [plan, setPlan] = useState(false);
  const title = tr(p.title, lang);
  const loc = tr(p.location, lang);
  const cover = p.images[0];
  const url = href(`/properties/${p.slug}`);
  const hover = onHover ? { onMouseEnter: () => onHover(p.id), onMouseLeave: () => onHover(null), onFocus: () => onHover(p.id), onBlur: () => onHover(null) } : {};

  const titleLink = onSelect ? (
    <button type="button" onClick={() => onSelect(p.id)} className="text-start after:absolute after:inset-0 after:content-['']" aria-pressed={selected}>
      {title}
    </button>
  ) : (
    <Link href={url} className="after:absolute after:inset-0 after:content-['']">{title}</Link>
  );

  const image = (aspect: string, imgSizes: string, extra = "") => (
    <div className={`relative overflow-hidden bg-paper2 ${aspect} ${extra}`}>
      {plan && p.floorPlan ? (
        <div className="atlas-grid absolute inset-0 grid place-items-center p-6 text-ink">
          <MiniPlan p={p} className="h-full w-full" />
          <span className="annot absolute bottom-2 start-3">{lang === "ar" ? "مخطط توضيحي" : "Illustrative plan"}</span>
        </div>
      ) : (
        <AtlasImage src={cover.src} alt={tr(cover.alt, lang)} fill sizes={imgSizes} priority={priority} className="img-hover object-cover" />
      )}
      {/* architectural annotation — decorative, revealed on hover/focus */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-between p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" aria-hidden>
        <span className="annot bg-paper/85 px-1.5 py-0.5 !text-ink">{`${(p.geo.x / 10).toFixed(1)}, ${(p.geo.y / 10).toFixed(1)}`}</span>
        <span className="annot bg-paper/85 px-1.5 py-0.5 !text-ink">{p.images.length} img</span>
      </div>
      {selected && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 text-sm text-white" aria-hidden>
          {tr(p.summary, lang)}
        </div>
      )}
    </div>
  );

  const controls = (
    <div className="relative z-10 flex items-center gap-1.5">
      {p.floorPlan && variant !== "compact" && (
        <button type="button" aria-pressed={plan} aria-label={lang === "ar" ? "إظهار المخطط" : "Show floor plan"} title={lang === "ar" ? "المخطط" : "Plan"} className="icon-btn icon-btn-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlan((v) => !v); }}>
          <LayoutDashboard size={16} />
        </button>
      )}
      <CompareButton id={p.id} />
      <FavButton id={p.id} />
    </div>
  );

  const ring = selected ? "outline outline-2 outline-offset-2 outline-[var(--copper)]" : "";

  if (variant === "poster") {
    return (
      <article {...hover} className={`group relative isolate overflow-hidden bg-ink text-white ${ring} ${className}`}>
        <div className="relative aspect-[4/5] sm:aspect-[3/4]">
          <AtlasImage src={cover.src} alt={tr(cover.alt, lang)} fill sizes={sizes ?? "(min-width:1024px) 33vw, 90vw"} priority={priority} className="img-hover object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <span className="numeral absolute end-4 top-3 text-6xl text-white/90 sm:text-7xl" aria-hidden>{p.ref}</span>
          <div className="absolute inset-x-0 bottom-0 grid gap-2 p-5">
            <div className="annot !text-white/80">{loc}</div>
            <h3 className="display h-md text-balance">{titleLink}</h3>
            <div className="flex items-end justify-between gap-3">
              <Price p={p} className="display h-sm" />
              <div className="[&_*]:!text-white/85"><Specs p={p} /></div>
            </div>
          </div>
          <div className="absolute start-3 top-3 z-10"><Badges p={p} /></div>
          <div className="absolute end-3 bottom-3 hidden" />
        </div>
        <div className="absolute end-3 top-20 z-10">{controls}</div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article {...hover} className={`group relative flex gap-3 border border-line bg-surface p-2 ${ring} ${selected ? "bg-paper2" : ""} ${className}`}>
        {image("w-24 shrink-0 aspect-square", "96px")}
        <div className="grid min-w-0 flex-1 content-between gap-1 py-0.5">
          <div>
            <div className="annot truncate">{p.ref} · {loc}</div>
            <h3 className="truncate font-semibold">{titleLink}</h3>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Price p={p} compact className="font-semibold" />
            <Specs p={p} className="!text-xs" />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "row" || variant === "wide") {
    const wide = variant === "wide";
    return (
      <article {...hover} className={`group relative grid border border-line bg-surface ${wide ? "md:grid-cols-[1.35fr_1fr]" : "sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"} ${ring} ${className}`}>
        {image("aspect-[4/3] sm:aspect-auto sm:min-h-52", sizes ?? (wide ? "(min-width:768px) 55vw, 100vw" : "(min-width:640px) 40vw, 100vw"), wide ? "md:min-h-[420px]" : "")}
        <div className="grid content-between gap-4 p-5 md:p-6">
          <div className="grid gap-3">
            <div className="flex items-start justify-between gap-3">
              <span className="numeral text-5xl text-copper md:text-6xl" aria-hidden>{p.ref}</span>
              <Badges p={p} />
            </div>
            <div>
              <div className="annot">{loc}</div>
              <h3 className="display h-md mt-1 text-balance">{titleLink}</h3>
            </div>
            <p className="line-clamp-2 text-sm text-soft">{tr(p.summary, lang)}</p>
          </div>
          <div className="grid gap-3">
            <Specs p={p} />
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <Price p={p} className="display h-sm" />
              {controls}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article {...hover} className={`group relative grid content-start gap-3 ${ring} ${className}`}>
      {image("aspect-[4/3]", sizes ?? "(min-width:1280px) 28vw, (min-width:640px) 45vw, 100vw")}
      <div className="absolute start-3 top-3"><Badges p={p} /></div>
      <div className="grid gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="annot">{p.ref} · {t.labels.type[p.type]}</span>
          <span className="annot truncate">{loc}</span>
        </div>
        <h3 className="display h-sm text-balance">{titleLink}</h3>
        <Specs p={p} />
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <Price p={p} className="text-lg font-semibold" />
          {controls}
        </div>
      </div>
    </article>
  );
}
