"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/components/providers/AppProvider";
import { MapView, type MapMarker } from "@/components/atlas/MapView";
import { PropertyCard } from "@/components/property/PropertyCard";
import { FavButton, Price, Specs } from "@/components/property/PropertyBits";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { useFormat, useReducedMotion } from "@/lib/hooks";
import { tr, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import type { Property } from "@/lib/api/types";
import type { HomeData } from "../types";
import { coordLabel } from "./pick";

type Filter = "all" | "sale" | "rent";

export function HomeAtlas({ data }: { data: HomeData; lang: Locale }) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const reduce = useReducedMotion();
  const h = t.home.atlas;
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(() => (data.properties.find((p) => p.featured) ?? data.properties[0])?.id ?? null);
  const [area, setArea] = useState<string | null>(null);

  const visible = useMemo(() => data.properties.filter((p) => filter === "all" || p.purpose === filter), [data.properties, filter]);
  const markers = useMemo<MapMarker[]>(
    () => visible.map((p) => ({ id: p.id, x: p.geo.x, y: p.geo.y, label: f.money(p.price, p.currency, { compact: true }), title: tr(p.title, lang) })),
    [visible, f, lang],
  );
  const selected = visible.find((p) => p.id === selectedId) ?? null;
  const areaObj = data.neighborhoods.find((n) => n.slug === area) ?? null;
  const list = useMemo(() => {
    const pool = area ? visible.filter((p) => p.neighborhood === area) : [...visible].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return pool.slice(0, 5);
  }, [visible, area]);

  const pickProperty = (id: string | null) => setSelectedId(id);
  const pickArea = (slug: string | null) => { setArea(slug); if (slug) setSelectedId(null); };

  const previewKey = selected ? `p-${selected.id}` : areaObj ? `a-${areaObj.slug}` : "none";

  return (
    <section id="atlas" aria-labelledby="atlas-title" className="relative scroll-mt-20 border-t border-line bg-paper2 py-[clamp(48px,8vw,120px)]">
      <div className="wrap grid gap-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="reveal"><SectionHead num="C / 03" eyebrow={h.eyebrow} title={<span id="atlas-title">{h.title}</span>} intro={h.intro} /></div>
          <div className="reveal flex flex-wrap items-center gap-3">
            <div className="flex gap-1.5" role="group" aria-label={t.listings.purpose}>
              {(["all", "sale", "rent"] as const).map((k) => (
                <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => { setFilter(k); setSelectedId(null); }}>
                  {k === "all" ? t.common.all : k === "sale" ? t.labels.purpose.saleShort : t.labels.purpose.rentShort}
                </button>
              ))}
            </div>
            <Link href={href("/map")} className="btn btn-sm">{h.openFull}<Arrow /></Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-8">
          <div className="relative h-[56vh] min-h-[380px] border border-line bg-surface lg:h-[720px]">
            <MapView
              className="h-full w-full"
              markers={markers}
              areas={data.neighborhoods}
              selectedId={selectedId}
              onSelect={pickProperty}
              activeArea={area}
              onArea={pickArea}
              label={h.mapLabel}
            />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] content-start gap-5 lg:max-h-[720px] lg:overflow-y-auto lg:pe-1">
            {/* neighborhood quick-pick */}
            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label={h.areas}>
              {data.neighborhoods.map((n) => (
                <button key={n.slug} type="button" className="chip shrink-0" aria-pressed={area === n.slug} onClick={() => pickArea(area === n.slug ? null : n.slug)}>
                  {tr(n.name, lang)}
                </button>
              ))}
            </div>

            <div aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={previewKey}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: reduce ? 0.01 : 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {selected ? (
                    <Preview p={selected} label={h.viewProperty} coords={`${h.coords} ${coordLabel(selected)}`} />
                  ) : areaObj ? (
                    <AreaPreview
                      name={tr(areaObj.name, lang)}
                      tagline={tr(areaObj.tagline, lang)}
                      img={areaObj.image}
                      count={fmt(h.listingsIn, { n: f.num(visible.filter((p) => p.neighborhood === areaObj.slug).length) })}
                      href={href(`/properties?neighborhood=${areaObj.slug}`)}
                      cta={h.seeArea}
                    />
                  ) : (
                    <div className="atlas-grid grid min-h-52 place-items-center border border-dashed border-line p-6 text-center"><p className="annot max-w-[32ch]">{h.empty}</p></div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
              <p className="annot">{area ? fmt(h.inArea, { area: tr(areaObj?.name, lang) }) : h.featuredList}</p>
              {list.length === 0 && <p className="text-sm text-soft">{h.noneHere}</p>}
              {list.map((p) => (
                <PropertyCard key={p.id} p={p} variant="compact" selected={p.id === selectedId} onSelect={(id) => pickProperty(id)} onHover={undefined} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Preview({ p, label, coords }: { p: Property; label: string; coords: string }) {
  const { lang, href } = useApp();
  const cover = p.images[0];
  return (
    <article className="group relative border border-line bg-surface">
      <div className="relative aspect-[16/11] overflow-hidden bg-paper2">
        <AtlasImage src={cover.src} alt={tr(cover.alt, lang)} fill sizes="(min-width:1024px) 38vw, 100vw" className="img-hover object-cover" />
        <span className="numeral absolute end-3 top-2 text-6xl text-white/90 [text-shadow:0_2px_24px_rgba(0,0,0,.45)]" aria-hidden>{p.ref}</span>
        <span className="annot absolute bottom-2 start-2 bg-paper/90 px-1.5 py-0.5 !text-ink">{coords}</span>
      </div>
      <div className="grid gap-3 p-5">
        <p className="annot">{tr(p.location, lang)}</p>
        <h3 className="display h-md text-balance">{tr(p.title, lang)}</h3>
        <p className="line-clamp-2 text-sm text-soft">{tr(p.summary, lang)}</p>
        <Specs p={p} />
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <Price p={p} className="display h-sm" />
          <div className="flex items-center gap-2">
            <FavButton id={p.id} />
            <Link href={href(`/properties/${p.slug}`)} className="btn btn-sm btn-primary">{label}<Arrow /></Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function AreaPreview({ name, tagline, img, count, href, cta }: { name: string; tagline: string; img: Property["images"][number]; count: string; href: string; cta: string }) {
  const { lang } = useApp();
  return (
    <article className="border border-line bg-surface">
      <div className="relative aspect-[16/9] overflow-hidden bg-paper2">
        <AtlasImage src={img.src} alt={tr(img.alt, lang)} fill sizes="(min-width:1024px) 38vw, 100vw" className="object-cover" />
      </div>
      <div className="grid gap-2 p-5">
        <p className="annot">{count}</p>
        <h3 className="display h-md">{name}</h3>
        <p className="text-sm text-soft">{tagline}</p>
        <Link href={href} className="btn btn-sm mt-2 justify-self-start">{cta}<Arrow /></Link>
      </div>
    </article>
  );
}
