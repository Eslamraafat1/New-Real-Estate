"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Property } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow, Chevron } from "@/components/ui/Arrow";
import { Badges, CompareButton, FavButton, Price, Specs } from "@/components/property/PropertyBits";
import { gsap, PIN_QUERY, ScrollTrigger } from "../../s1/gsap";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";

export interface FilmStrings {
  num: string;
  eyebrow: string;
  title: string;
  intro: string;
  cta: string;
  hint: string;
  strip: string;
  end: string;
  open: string;
}

/**
 * Collection "film strip". Desktop (>=768px, motion allowed): the stage is pinned and a horizontal
 * translate of tall poster panels is scrubbed by scroll (RTL flips direction), with per-panel photo
 * parallax, sliding outline numerals, a live counter and a progress hairline.
 * Otherwise (mobile / reduced motion / no JS): a native scroll-snap horizontal scroller with the same panels.
 * `data-pinned` on the section is the only switch between the two compositions (CSS reads it).
 */
export function FilmStrip({ items, strings }: { items: Property[]; strings: FilmStrings }) {
  const { lang, href, dir } = useApp();
  const f = useFormat();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const focusRef = useRef<((i: number) => void) | null>(null);

  const pad = (n: number) => `${f.num(0)}${f.num(n)}`;
  const total = items.length;
  const padded = items.map((_, i) => pad(i + 1));
  const totalLabel = pad(total);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!section || !stage || !scroller || !track) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add(PIN_QUERY, () => {
        section.dataset.pinned = "true";
        const rtl = getComputedStyle(section).direction === "rtl";
        const sign = rtl ? 1 : -1;
        const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", track);
        const imgSet = panels.map((p, i) => ({ set: gsap.quickSetter(p.querySelector("[data-par-img]"), "x", "px"), k: 0.12 + (i % 3) * 0.04 }));
        const numSet = panels.map((p) => gsap.quickSetter(p.querySelector("[data-par-num]"), "x", "px"));
        const dist = () => Math.max(0, track.offsetWidth - scroller.clientWidth);
        const len = () => Math.min(Math.max(dist() * 0.9, window.innerHeight * 1.2), window.innerHeight * 3);
        let current = -1;

        const trackLeft = () => {
          const vw = scroller.clientWidth;
          const x = Number(gsap.getProperty(track, "x")) || 0;
          return rtl ? vw - track.offsetWidth + x : x;
        };

        const update = () => {
          const vw = scroller.clientWidth;
          const tl = trackLeft();
          let best = 0;
          let bestD = Infinity;
          panels.forEach((p, i) => {
            const pw = p.offsetWidth;
            const centre = tl + p.offsetLeft + pw / 2;
            const rel = (centre - vw / 2) / vw;
            imgSet[i].set(-rel * pw * imgSet[i].k);
            numSet[i](rel * pw * 0.55);
            const d = Math.abs(centre - vw / 2);
            if (d < bestD) { bestD = d; best = i; }
          });
          if (best !== current && counterRef.current) {
            current = best;
            counterRef.current.textContent = panels[best].dataset.label ?? "";
          }
        };

        const tween = gsap.to(track, {
          x: () => sign * dist(),
          ease: "none",
          onUpdate() {
            update();
            if (barRef.current) barRef.current.style.transform = `scaleX(${this.progress().toFixed(4)})`;
          },
          scrollTrigger: {
            trigger: stage,
            pin: stage,
            start: "top top",
            end: () => `+=${len()}`,
            scrub: 0.4,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: update,
          },
        });
        const st = tween.scrollTrigger!;

        // keyboard: focusing a panel scrolls the page so that panel is centred in the strip
        focusRef.current = (i: number) => {
          const p = panels[i];
          if (!p) return;
          const vw = scroller.clientWidth;
          const c = p.offsetLeft + p.offsetWidth / 2;
          const x = rtl ? vw / 2 - c - vw + track.offsetWidth : vw / 2 - c;
          const d = dist();
          const prog = d > 0 ? Math.min(1, Math.max(0, x / (sign * d))) : 0;
          window.scrollTo({ top: st.start + prog * (st.end - st.start), behavior: "auto" });
        };
        update();

        return () => {
          focusRef.current = null;
          delete section.dataset.pinned;
          if (barRef.current) barRef.current.style.transform = "";
        };
      });
    }, section);
    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  const step = (d: 1 | -1) => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const amount = (sc.querySelector<HTMLElement>("[data-panel]")?.offsetWidth ?? 320) + 16;
    sc.scrollBy({ left: d * (dir === "rtl" ? -1 : 1) * amount, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="collection"
      aria-labelledby="collection-h"
      className="group/film section relative data-[pinned=true]:py-0"
    >
      <div
        ref={stageRef}
        className="flex flex-col group-data-[pinned=true]/film:h-svh group-data-[pinned=true]/film:min-h-[600px] group-data-[pinned=true]/film:pb-6 group-data-[pinned=true]/film:pt-24"
      >
        <div className="wrap w-full">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <div className="grid gap-3">
              <div className="flex items-baseline gap-4">
                <span className="annot !text-copper">{strings.num}</span>
                <span className="annot">{strings.eyebrow}</span>
              </div>
              <h2 id="collection-h" className="display h-lg max-w-[18ch] text-balance group-data-[pinned=true]/film:max-w-none group-data-[pinned=true]/film:text-[clamp(1.6rem,2.7vw,2.7rem)]">
                {strings.title}
              </h2>
              <p className="max-w-[56ch] text-soft text-pretty group-data-[pinned=true]/film:hidden">{strings.intro}</p>
            </div>
            <div className="flex items-center gap-5">
              <p className="num hidden items-baseline gap-2 group-data-[pinned=true]/film:flex" aria-hidden>
                <span ref={counterRef} className="display text-5xl text-copper">{padded[0]}</span>
                <span className="annot">/ {totalLabel}</span>
              </p>
              <Link href={href("/properties")} className="btn">{strings.cta}<Arrow /></Link>
            </div>
          </div>
          <div className="relative mt-6 hidden h-px bg-line group-data-[pinned=true]/film:block" aria-hidden>
            <span ref={barRef} className="absolute inset-0 origin-left bg-copper rtl:origin-right" style={{ transform: "scaleX(0)" }} />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 group-data-[pinned=true]/film:hidden">
            <p className="annot md:hidden">{strings.hint}</p>
            <div className="ms-auto hidden gap-2 md:flex">
              <button type="button" className="icon-btn" aria-label={lang === "ar" ? "السابق" : "Previous"} onClick={() => step(-1)}><Chevron className="rotate-180" /></button>
              <button type="button" className="icon-btn" aria-label={lang === "ar" ? "التالي" : "Next"} onClick={() => step(1)}><Chevron /></button>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          role="region"
          aria-label={strings.strip}
          className="mt-6 min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-ps-[clamp(16px,4vw,56px)] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden group-data-[pinned=true]/film:snap-none group-data-[pinned=true]/film:overflow-x-clip"
        >
          <ul ref={trackRef} className="relative flex h-full w-max min-w-full gap-4 px-[clamp(16px,4vw,56px)] md:gap-6">
            {items.map((p, i) => (
              <li
                key={p.id}
                data-panel
                data-label={padded[i]}
                onFocus={(e) => { if ((e.target as HTMLElement).matches(":focus-visible")) focusRef.current?.(i); }}
                className="relative aspect-[3/4] w-[78vw] max-w-[440px] shrink-0 snap-start sm:w-[52vw] md:w-[clamp(300px,30vw,520px)] group-data-[pinned=true]/film:aspect-auto group-data-[pinned=true]/film:h-full"
              >
                <article className="group absolute inset-0 isolate overflow-hidden bg-ink text-white">
                  <div className="absolute inset-y-0 -inset-x-[15%]" data-par-img>
                    <AtlasImage
                      src={p.images[0].src}
                      alt={tr(p.images[0].alt, lang)}
                      fill
                      priority={i === 0}
                      sizes="(min-width:768px) 42vw, 90vw"
                      className="img-hover object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />
                  <span
                    data-par-num
                    aria-hidden
                    className="numeral pointer-events-none absolute start-3 top-16 whitespace-nowrap text-[clamp(5.5rem,12vw,11rem)] font-light text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.85)]"
                  >
                    {p.ref}
                  </span>
                  <div className="absolute start-3 top-3 z-10"><Badges p={p} /></div>
                  <div className="absolute end-3 top-3 z-10 flex gap-1.5">
                    <CompareButton id={p.id} />
                    <FavButton id={p.id} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 grid gap-2 p-4 sm:p-5">
                    <div className="annot !text-white/80">{padded[i]} · {tr(p.location, lang)}</div>
                    <h3 className="display h-md text-balance">
                      <Link href={href(`/properties/${p.slug}`)} aria-label={`${strings.open}: ${tr(p.title, lang)}`} className="after:absolute after:inset-0 after:content-['']">
                        {tr(p.title, lang)}
                      </Link>
                    </h3>
                    <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
                      <Price p={p} className="display h-sm" />
                      <div className="[&_*]:!text-white/85"><Specs p={p} /></div>
                    </div>
                  </div>
                </article>
              </li>
            ))}
            <li
              data-end
              className="relative aspect-[3/4] w-[60vw] max-w-[320px] shrink-0 snap-start sm:w-[36vw] md:w-[clamp(240px,20vw,340px)] group-data-[pinned=true]/film:aspect-auto group-data-[pinned=true]/film:h-full"
            >
              <Link href={href("/properties")} className="group absolute inset-0 grid content-between bg-forest p-5 text-onforest">
                <span className="annot !text-onforest/70">{strings.end}</span>
                <span className="display h-md text-balance">{strings.cta}</span>
                <span className="grid size-14 place-items-center rounded-full border border-onforest/50 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1 rtl:group-hover:-translate-x-1 rtl:group-focus-visible:-translate-x-1"><Arrow /></span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
