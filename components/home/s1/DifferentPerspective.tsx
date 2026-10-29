"use client";

import { useEffect, useMemo, useRef } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { tr, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";
import { ContourBg } from "./ContourBg";
import { gsap, PIN_QUERY } from "./gsap";
import { usePinned } from "./hooks";
import { coordLabel } from "./pick";

/** Placement + parallax speed (percent of own height travelled across the section) per frame. */
const FRAMES = [
  { cls: "md:col-span-5 md:col-start-1 md:row-start-1", ratio: "aspect-[4/5]", speed: -6, pick: 0 },
  { cls: "md:col-span-4 md:col-start-7 md:row-start-1 md:mt-40", ratio: "aspect-[3/4]", speed: 10, pick: 1 },
  { cls: "md:col-span-3 md:col-start-11 md:row-start-1 md:mt-12", ratio: "aspect-square", speed: -14, pick: 2 },
  { cls: "md:col-span-7 md:col-start-2 md:row-start-2 md:-mt-6", ratio: "aspect-[16/10]", speed: 5, pick: 3 },
  { cls: "md:col-span-4 md:col-start-9 md:row-start-2 md:mt-28", ratio: "aspect-[4/5]", speed: -9, pick: 4 },
] as const;

export function DifferentPerspective({ data }: { data: HomeData; lang: Locale }) {
  const { t, lang } = useApp();
  const h = t.home.perspective;
  const pinnedOk = usePinned();
  const root = useRef<HTMLDivElement>(null);

  // One distinct photograph per property, preferring the second image (interiors / details) for variety.
  const shots = useMemo(() => {
    const out: { p: HomeData["properties"][number]; im: HomeData["properties"][number]["images"][number] }[] = [];
    const seen = new Set<string>();
    for (const p of data.properties) {
      if (p.images.length < 2 || seen.has(p.neighborhood + p.style)) continue;
      seen.add(p.neighborhood + p.style);
      out.push({ p, im: p.images[out.length % 2 === 0 ? 1 : 0] });
      if (out.length === FRAMES.length) break;
    }
    return out;
  }, [data.properties]);

  useEffect(() => {
    const scope = root.current;
    if (!scope || !pinnedOk) return;
    const mm = gsap.matchMedia(scope);
    mm.add(PIN_QUERY, () => {
      gsap.utils.toArray<HTMLElement>(".dp-frame").forEach((el) => {
        const speed = Number(el.dataset.speed ?? 0);
        gsap.fromTo(
          el,
          { yPercent: -speed * 1.6 },
          { yPercent: speed * 1.6, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } },
        );
      });
    });
    return () => mm.revert();
  }, [pinnedOk]);

  return (
    <section id="perspective" aria-labelledby="perspective-title" className="section relative overflow-hidden border-t border-line bg-paper2">
      <ContourBg seed={11} rings={10} cx={760} cy={260} className="opacity-50" />
      <div className="wrap relative grid gap-16 md:gap-24">
        <Reveal className="reveal">
          <SectionHead num="H / 08" eyebrow={h.eyebrow} title={<span id="perspective-title">{h.title}</span>} intro={h.intro} />
        </Reveal>

        <div ref={root} className="grid gap-12 md:grid-cols-12 md:gap-x-8 md:gap-y-0 md:pb-24">
          {shots.map(({ p, im }, i) => {
            const fr = FRAMES[i];
            return (
              <figure key={p.id} className={`dp-frame relative ${fr.cls}`} data-speed={fr.speed}>
                <Reveal className="grid gap-3">
                  <div className={`reveal relative overflow-hidden bg-surface ${fr.ratio}`}>
                    <AtlasImage src={im.src} alt={tr(im.alt, lang)} fill sizes="(min-width:768px) 40vw, 94vw" className="object-cover" />
                    <span className="annot absolute start-2 top-2 bg-paper/90 px-1.5 py-0.5 !text-ink" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <figcaption className="reveal flex items-baseline justify-between gap-3" style={{ transitionDelay: "150ms" }}>
                    <span className="text-sm text-soft">{tr(p.title, lang)}</span>
                    <span className="annot whitespace-nowrap" dir="ltr">{coordLabel(p)}</span>
                  </figcaption>
                </Reveal>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
