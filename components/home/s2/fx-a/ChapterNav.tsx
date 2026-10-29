"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Arrow } from "@/components/ui/Arrow";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { gsap } from "../../s1/gsap";

export interface ChapterRow {
  key: string;
  to: string;
  k: string;
  label: string;
  note: string;
  blurb: string;
  image: { src: string; alt: string } | null;
}

const FINE = "md:[@media(hover:hover)_and_(pointer:fine)]";

/**
 * Five-way typographic navigator.
 *  - fine-pointer desktops: a clipped photo follows the cursor (or sits beside the focused row) with a wipe + descriptor
 *  - touch / narrow screens: every row carries its own photo strip, so nothing depends on hover
 * A giant looping tagline marquee runs behind (GSAP, direction flips in RTL, off under reduced motion).
 */
export function ChapterNav({ rows, tagline }: { rows: ChapterRow[]; tagline: string }) {
  const { dir } = useApp();
  const rtl = dir === "rtl";
  const [active, setActive] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<((x: number, y: number) => void) | null>(null);
  const placeRef = useRef<((row: HTMLElement) => void) | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    const preview = previewRef.current;
    const marquee = marqueeRef.current;
    if (!nav || !preview || !marquee) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sign = getComputedStyle(nav).direction === "rtl" ? 1 : -1;
        gsap.to(marquee, { xPercent: sign * 33.3333, duration: 70, ease: "none", repeat: -1 });
      });
      mm.add("(min-width: 768px) and (hover: hover) and (pointer: fine)", () => {
        // physical coordinates on purpose: the preview tracks the cursor
        const qx = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3.out" });
        const qy = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3.out" });
        const clampX = (x: number) => Math.max(0, Math.min(x, nav.clientWidth - preview.offsetWidth));
        moveRef.current = (cx, cy) => {
          const r = nav.getBoundingClientRect();
          qx(clampX(cx - r.left + 28));
          qy(cy - r.top - preview.offsetHeight / 2);
        };
        placeRef.current = (row) => {
          const w = nav.clientWidth;
          qx(clampX(getComputedStyle(nav).direction === "rtl" ? 24 : w - preview.offsetWidth - 24));
          qy(row.offsetTop + row.offsetHeight / 2 - preview.offsetHeight / 2);
        };
        return () => { moveRef.current = null; placeRef.current = null; };
      });
    }, nav);
    return () => { mm.revert(); ctx.revert(); };
  }, []);

  const wipe = (on: boolean) => ({ clipPath: on ? "inset(0 0 0 0)" : rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" });

  return (
    <div className="relative mt-14 md:mt-20">
      {/* looping tagline, behind everything */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 -translate-y-1/2 overflow-hidden select-none">
        <div ref={marqueeRef} className="flex w-max">
          {[0, 1, 2].map((n) => (
            <div key={n} className="flex shrink-0 items-center gap-[0.4em] pe-[0.4em] display text-[clamp(7rem,24vw,24rem)] whitespace-nowrap text-onforest/[0.07]">
              <span>{tagline}</span><span>—</span><span>{tagline}</span><span>—</span>
            </div>
          ))}
        </div>
      </div>

      <nav
        ref={navRef}
        aria-label={tagline}
        className="relative z-10"
        onPointerMove={(e) => { if (e.pointerType === "mouse") moveRef.current?.(e.clientX, e.clientY); }}
        onPointerLeave={() => setActive(null)}
      >
        <ul className="border-t border-onforest/30">
          {rows.map((r, i) => (
            <li
              key={r.key}
              className={`relative border-b border-onforest/30 transition-opacity duration-500 ${active !== null && active !== i ? "opacity-40" : ""}`}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") { setActive(i); moveRef.current?.(e.clientX, e.clientY); } }}
            >
              <Link
                href={r.to}
                onFocus={(e) => {
                  if (!e.currentTarget.matches(":focus-visible")) return;
                  setActive(i);
                  placeRef.current?.(e.currentTarget.parentElement as HTMLElement);
                }}
                onBlur={() => setActive(null)}
                className={`group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-4 py-6 transition-[padding] duration-500 focus-visible:ps-3 ${FINE}:py-9 md:gap-x-8 md:hover:ps-6 md:py-8`}
              >
                <span className="annot !text-onforest/70 md:w-10">{r.k}</span>
                <span className="grid min-w-0">
                  <span className="relative w-fit max-w-full">
                    <span className="display block text-[clamp(3.25rem,13vw,12rem)]">{r.label}</span>
                    <span aria-hidden className="absolute inset-x-0 -bottom-1 h-[3px] origin-left scale-x-0 bg-copper transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)] rtl:origin-right group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                  </span>
                  <span className="mt-2 text-sm text-onforest/75 md:text-base">{r.note}</span>
                </span>
                <span className="grid size-12 place-items-center overflow-hidden rounded-full border border-onforest/50 transition-colors duration-300 group-hover:bg-onforest group-hover:text-forest group-focus-visible:bg-onforest group-focus-visible:text-forest md:size-16">
                  <Arrow className="size-6 transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1 rtl:group-hover:-translate-x-1 rtl:group-focus-visible:-translate-x-1" />
                </span>

                {/* touch / narrow: always-visible photo strip */}
                <span className={`relative col-span-3 block aspect-[16/6] overflow-hidden bg-onforest/10 ${FINE}:hidden`}>
                  {r.image && <AtlasImage src={r.image.src} alt="" fill sizes="(min-width:768px) 90vw, 100vw" className="object-cover" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-forest/60 to-transparent" />
                  <span className="absolute bottom-2 start-3 end-3 text-xs text-onforest/90 text-pretty">{r.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* fine-pointer preview */}
        <div
          ref={previewRef}
          aria-hidden
          style={{ left: 0, top: 0 }}
          className={`pointer-events-none absolute z-20 hidden aspect-[4/5] w-[clamp(220px,24vw,360px)] overflow-hidden bg-forest transition-[opacity,scale] duration-500 ${FINE}:block ${active === null ? "scale-90 opacity-0" : "scale-100 opacity-100"}`}
        >
          {rows.map((r, i) => (
            <div key={r.key} className="absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(.7,0,.2,1)]" style={wipe(active === i)}>
              {r.image && <AtlasImage src={r.image.src} alt="" fill sizes="360px" className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <p className="absolute inset-x-0 bottom-0 p-4 text-sm text-white text-pretty">{r.blurb}</p>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
