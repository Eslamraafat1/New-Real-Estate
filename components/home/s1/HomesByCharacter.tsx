"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { useFormat, useReducedMotion } from "@/lib/hooks";
import { tr, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import type { ArchStyle } from "@/lib/api/types";
import type { HomeData } from "../types";

export interface CharacterCategory {
  style: ArchStyle;
  /** Which photograph of the style's first property is the hero image (default 0). */
  imageIndex?: number;
}

/** Edit this list to reorder, add or remove the categories shown on the homepage. */
export const CHARACTER_CATEGORIES: CharacterCategory[] = [
  { style: "contemporary", imageIndex: 0 },
  { style: "modernist", imageIndex: 0 },
  { style: "mediterranean", imageIndex: 0 },
  { style: "minimalist", imageIndex: 0 },
  { style: "traditional", imageIndex: 0 },
];

export function HomesByCharacter({ data }: { data: HomeData; lang: Locale }) {
  const { t, lang, href } = useApp();
  const f = useFormat();
  const reduce = useReducedMotion();
  const h = t.home.character;
  const uid = useId();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const cats = useMemo(
    () =>
      CHARACTER_CATEGORIES.map((c) => {
        const list = data.properties.filter((p) => p.style === c.style);
        const first = list.find((p) => p.images.length > 0);
        const img = first ? first.images[Math.min(c.imageIndex ?? 0, first.images.length - 1)] : undefined;
        return { ...c, count: list.length, first, img };
      }),
    [data.properties],
  );
  const cur = cats[active] ?? cats[0];
  if (!cur) return null;

  const onKey = (e: KeyboardEvent) => {
    const n = cats.length;
    const next = e.key === "ArrowDown" || e.key === "ArrowRight" ? (active + 1) % n : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (active - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="character" aria-labelledby="character-title" className="section border-t border-line">
      <div className="wrap grid gap-12">
        <SectionHead num="G / 07" eyebrow={h.eyebrow} title={<span id="character-title">{h.title}</span>} intro={h.intro} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          <div role="tablist" aria-label={h.title} aria-orientation="vertical" onKeyDown={onKey} className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 lg:mx-0 lg:grid lg:gap-0 lg:overflow-visible lg:px-0">
            {cats.map((c, i) => {
              const on = i === active;
              return (
                <button
                  key={c.style}
                  ref={(el) => { tabs.current[i] = el; }}
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group flex shrink-0 items-baseline gap-4 text-start transition-colors lg:border-b lg:border-line lg:py-4 ${on ? "text-ink" : "text-mute hover:text-ink"}`}
                >
                  <span className={`annot ${on ? "!text-copper" : ""}`}>0{i + 1}</span>
                  <span className="display h-lg whitespace-nowrap">{t.labels.style[c.style]}</span>
                  <span className="annot ms-auto hidden lg:inline">{f.num(c.count)}</span>
                </button>
              );
            })}
          </div>

          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} className="grid gap-5">
            <div className="relative aspect-[4/3] overflow-hidden bg-paper2 sm:aspect-[16/11]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={cur.style}
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.01 : 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {cur.img ? (
                    <AtlasImage src={cur.img.src} alt={tr(cur.img.alt, lang)} fill sizes="(min-width:1024px) 56vw, 94vw" className="object-cover" />
                  ) : (
                    <div className="atlas-grid h-full w-full" />
                  )}
                </motion.div>
              </AnimatePresence>
              <span className="annot absolute start-3 top-3 z-10 bg-paper/90 px-1.5 py-0.5 !text-ink">{cur.first ? cur.first.ref : "—"}</span>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid gap-2">
                <p className="annot !text-copper">{fmt(h.count, { n: f.num(cur.count) })}</p>
                <p className="max-w-[48ch] text-pretty text-soft">{h.notes[cur.style]}</p>
              </div>
              <Link href={href(`/properties?style=${cur.style}`)} className="btn">{fmt(h.explore, { style: t.labels.style[cur.style] })}<Arrow /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
