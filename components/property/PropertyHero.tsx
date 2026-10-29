"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Chevron } from "@/components/ui/Arrow";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import { Badges, Price, Specs } from "./PropertyBits";
import { PrimaryActions, UtilityActions } from "./PropertyActions";
import { usePropertyDetail } from "./PropertyDetailContext";

/** Opening composition: asymmetric image set (1 large + 2 crops), title, price, ref numeral, actions. */
export function PropertyHero() {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const h = t.property.hero;
  const { property: p, openLightbox } = usePropertyDetail();
  const imgs = p.images;
  const [a, b, c] = imgs;

  const tile = (i: number, cls: string, sizes: string, priority = false) => {
    const im = imgs[i];
    if (!im) return null;
    return (
      <button type="button" onClick={() => openLightbox(i)} aria-label={fmt(h.openImage, { n: i + 1 })} className={`group relative block overflow-hidden bg-paper2 ${cls}`}>
        <AtlasImage src={im.src} alt={tr(im.alt, lang)} fill sizes={sizes} priority={priority} className="img-hover object-cover" />
      </button>
    );
  };

  return (
    <header className="wrap pt-6 md:pt-10">
      <nav aria-label={t.property.breadcrumb} className="annot annot-ar-ok mb-5 flex flex-wrap items-center gap-1">
        <Link href={href("/properties")} className="hover:text-ink">{t.nav.listings}</Link>
        <Chevron />
        <Link href={href(`/properties?neighborhood=${p.neighborhood}`)} className="hover:text-ink">{tr(p.location, lang)}</Link>
        <Chevron />
        <span className="text-ink">{t.common.ref} {p.ref}</span>
      </nav>

      <div className="grid gap-3 lg:grid-cols-12">
        {a && tile(0, "aspect-[4/3] lg:col-span-8 lg:aspect-auto lg:min-h-[34rem]", "(min-width: 1024px) 66vw, 100vw", true)}
        {(b || c) && (
          <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1 lg:grid-rows-[3fr_2fr]">
            {tile(1, "aspect-[4/3] lg:aspect-auto", "(min-width: 1024px) 33vw, 50vw")}
            {tile(2, "aspect-[4/3] lg:aspect-auto", "(min-width: 1024px) 33vw, 50vw")}
          </div>
        )}
      </div>
      {imgs.length > 3 && (
        <button type="button" className="annot annot-ar-ok mt-3 underline underline-offset-4 hover:text-ink" onClick={() => openLightbox(0)}>{fmt(h.viewAll, { n: f.num(imgs.length) })}</button>
      )}

      <div className="relative mt-8 grid gap-8 lg:mt-12 lg:grid-cols-12">
        <div className="grid content-start gap-5 lg:col-span-8">
          <Badges p={p} />
          <h1 className="display h-xl max-w-[16ch] text-balance !text-[clamp(2.4rem,6vw,5.2rem)]">{tr(p.title, lang)}</h1>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-soft">
            <span>{tr(p.location, lang)}</span>
            <span className="annot annot-ar-ok">{h.coords} {f.num(Math.round(p.geo.x))} · {f.num(Math.round(p.geo.y))}</span>
          </p>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <Price p={p} className="display h-lg" />
            <Specs p={p} className="text-base" />
          </div>
          <PrimaryActions className="mt-2" />
          <UtilityActions />
          <p className="annot annot-ar-ok border-s-2 border-copper ps-3">{t.property.demoListing}</p>
        </div>
        <div className="pointer-events-none order-first select-none lg:order-none lg:col-span-4 lg:text-end" aria-label={`${h.refLabel} ${p.ref}`} role="img">
          <p className="annot annot-ar-ok">{h.refLabel}</p>
          <p aria-hidden className="numeral num text-[clamp(7rem,22vw,17rem)] text-[var(--line)]">{p.ref}</p>
        </div>
      </div>
    </header>
  );
}
