"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { List, Map as MapIcon, X } from "lucide-react";
import type { Neighborhood, Property } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { MapView, type MapMarker } from "@/components/atlas/MapView";
import { PropertyCard } from "@/components/property/PropertyCard";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Arrow } from "@/components/ui/Arrow";
import { useFormat, useMedia } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";

/**
 * Atlas Explorer workspace: synchronized map ⇄ list ⇄ preview.
 * Desktop: split screen. Mobile: Map / List toggle + bottom-sheet preview (no forced split).
 */
export function AtlasWorkspace({ items, areas, selectedId, onSelect, loading, className = "" }: {
  items: Property[];
  areas: Neighborhood[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading?: boolean;
  className?: string;
}) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const desktop = useMedia("(min-width: 768px)");
  const [mobileMode, setMobileMode] = useState<"map" | "list">("map");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);

  const markers = useMemo<MapMarker[]>(
    () => items.map((p) => ({ id: p.id, x: p.geo.x, y: p.geo.y, label: f.money(p.price, p.currency, { compact: true }), title: tr(p.title, lang) })),
    [items, f, lang],
  );
  const selected = items.find((p) => p.id === selectedId) ?? null;

  // Map → list sync: bring the matching card into view.
  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`card-${selectedId}`)?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [selectedId, mobileMode]);

  return (
    <div className={`relative grid min-h-0 md:grid-cols-[minmax(340px,430px)_1fr] ${className}`}>
      {/* mobile toggle */}
      <div className="absolute inset-x-0 top-3 z-20 flex justify-center md:hidden" role="group" aria-label={t.listings.view}>
        <div className="flex border border-ink bg-paper shadow-md">
          <button type="button" className="chip !border-0" aria-pressed={mobileMode === "map"} onClick={() => setMobileMode("map")}><MapIcon size={15} />{t.listings.map}</button>
          <button type="button" className="chip !border-0" aria-pressed={mobileMode === "list"} onClick={() => setMobileMode("list")}><List size={15} />{t.listings.list}</button>
        </div>
      </div>

      {/* list + desktop preview */}
      <div className={`${mobileMode === "list" ? "block" : "hidden"} min-h-0 overflow-auto border-e border-line bg-paper pt-14 md:block md:pt-0`} aria-busy={loading}>
        <AnimatePresence mode="wait" initial={false}>
          {selected && desktop && (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} className="border-b border-line bg-paper2 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="annot !text-copper">{t.listings.selected}</span>
                <button type="button" className="icon-btn icon-btn-sm" onClick={() => onSelect(null)} aria-label={t.common.close}><X size={16} /></button>
              </div>
              <PropertyCard p={selected} variant="standard" priority sizes="430px" />
              <Link href={href(`/properties/${selected.slug}`)} className="btn btn-primary mt-3 w-full">{t.common.details}<Arrow /></Link>
            </motion.div>
          )}
        </AnimatePresence>
        <ul className="grid gap-2.5 p-3">
          {items.map((p) => (
            <li key={p.id} id={`card-${p.id}`}>
              <PropertyCard p={p} variant="compact" selected={p.id === selectedId} onHover={desktop ? setHoverId : undefined} onSelect={desktop ? onSelect : undefined} />
            </li>
          ))}
          {!items.length && !loading && <li className="p-6 text-center text-soft">{t.listings.empty}</li>}
        </ul>
      </div>

      {/* map */}
      <div className={`${mobileMode === "map" ? "block" : "hidden"} relative h-[calc(100dvh-var(--header-h)-120px)] min-h-[420px] md:block md:h-auto md:min-h-0`}>
        <MapView
          className="h-full w-full"
          markers={markers}
          areas={areas}
          selectedId={selectedId}
          hoverId={hoverId}
          onSelect={onSelect}
          activeArea={area}
          onArea={setArea}
          bottomInset={selected && !desktop ? 190 : 0}
        />
        <div className="annot pointer-events-none absolute end-3 bottom-3 hidden bg-paper/85 px-2 py-1 md:block" aria-live="polite">{fmt(t.listings.inMap, { n: f.num(items.length) })}</div>
      </div>

      <BottomSheet open={!!selected && !desktop && mobileMode === "map"} onClose={() => onSelect(null)} label={t.listings.selected}>
        {selected && (
          <div className="grid gap-3">
            <PropertyCard p={selected} variant="compact" />
            <p className="line-clamp-2 text-sm text-soft">{tr(selected.summary, lang)}</p>
            <Link href={href(`/properties/${selected.slug}`)} className="btn btn-primary w-full">{t.common.details}<Arrow /></Link>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
