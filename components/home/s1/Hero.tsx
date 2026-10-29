"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { useFormat } from "@/lib/hooks";
import { tr, type Locale } from "@/lib/i18n/config";
import type { Property } from "@/lib/api/types";
import type { HomeData } from "../types";
import { BuildingElevation } from "./Blueprint";
import { HeroContours } from "./HeroContours";
import { gsap, PIN_QUERY, type ScrollTrigger as ST } from "./gsap";
import { useIdle, usePinned, useWebGL } from "./hooks";
import { coordLabel, pickHero } from "./pick";
import type { SceneProgress } from "./HeroScene";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type Pin = { x: number; y: number; text: string };

function useAnnotations(p: Property | undefined): Pin[] {
  const { lang, t } = useApp();
  const f = useFormat();
  if (!p) return [];
  const hood = p.location ? tr(p.location, lang) : "";
  return [
    { x: 30, y: 36, text: hood },
    { x: 58, y: 30, text: `${t.home.hero.demoPlane} ${coordLabel(p)}` },
    { x: 46, y: 62, text: `${p.ref} · ${tr(p.title, lang)}` },
    { x: 66, y: 66, text: f.money(p.price, p.currency, { compact: true }) },
  ];
}

function Headline(props: { pinned: boolean }) {
  void props;
  const { t } = useApp();
  return (
    <div className="grid max-w-[46rem] gap-5">
      <p className="annot !text-copper">A / 01 — {t.home.hero.kicker}</p>
      <h1 className="grid gap-4">
        <span className="annot !text-ink">{t.common.brand}</span>
        <span className="display h-xl max-w-[15ch] text-balance">{t.common.tagline}</span>
      </h1>
      <p className="max-w-[44ch] text-pretty text-soft">{t.home.hero.sub}</p>
    </div>
  );
}

function Pins({ pins, hidden = false }: { pins: Pin[]; hidden?: boolean }) {
  return (
    <>
      {pins.map((a, i) => (
        <div key={i} className="hero-ann pointer-events-none absolute flex items-center gap-2" style={{ insetInlineStart: `${a.x}%`, top: `${a.y}%`, ...(hidden ? { opacity: 0, visibility: "hidden" as const } : null) }} aria-hidden>
          <span className="size-2 shrink-0 rounded-full bg-copper ring-4 ring-[color-mix(in_srgb,var(--copper)_30%,transparent)]" />
          <span className="annot whitespace-nowrap bg-paper/90 px-1.5 py-0.5 !text-ink">{a.text}</span>
        </div>
      ))}
    </>
  );
}

function Discovery({ className = "" }: { className?: string }) {
  const { t } = useApp();
  return (
    <div className={`flex flex-wrap items-stretch gap-3 ${className}`}>
      <a href="#coordinates" className="group flex min-h-[52px] min-w-[16rem] flex-1 items-center gap-4 border border-ink bg-paper/90 px-5 text-ink backdrop-blur transition-colors hover:bg-ink hover:text-paper sm:flex-none">
        <Search size={18} aria-hidden />
        <span className="grid text-start leading-tight">
          <span className="annot !text-current opacity-70">{t.home.hero.searchKicker}</span>
          <span className="font-semibold">{t.home.hero.searchPrompt}</span>
        </span>
        <Arrow className="ms-auto" />
      </a>
      <a href="#atlas" className="btn min-h-[52px] bg-paper/90 backdrop-blur">
        {t.home.hero.explore}
        <Arrow />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Static composition: mobile, reduced motion, SSR. No pin, no 3D.                            */
/* ------------------------------------------------------------------------------------------ */
function HeroStatic({ hero, pins }: { hero?: Property; pins: Pin[] }) {
  const { lang, t } = useApp();
  return (
    <section id="hero" aria-label={t.common.brand} className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-70" aria-hidden><HeroContours className="h-full w-full" /></div>
      <div className="wrap relative pt-14 pb-10 md:pt-24">
        <Headline pinned={false} />
        <Discovery className="mt-8" />
      </div>
      {hero && (
        <div className="wrap relative pb-14 md:pb-24">
          <figure className="relative aspect-[4/5] overflow-hidden bg-paper2 sm:aspect-[16/10]">
            <AtlasImage src={hero.images[0].src} alt={tr(hero.images[0].alt, lang)} fill priority sizes="(min-width:1440px) 1330px, 94vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden />
            <Pins pins={pins} />
            <figcaption className="annot absolute bottom-3 start-3 bg-paper/90 px-1.5 py-0.5 !text-ink">{hero.ref} · {t.home.hero.photoCaption}</figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Pinned, scroll-driven opening (desktop + motion allowed).                                  */
/* ------------------------------------------------------------------------------------------ */
function HeroPinned({ hero, pins }: { hero?: Property; pins: Pin[] }) {
  const { lang, t } = useApp();
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const progress = useRef<SceneProgress>({ v: 0 });
  const trigger = useRef<ST | null>(null);
  const activeRef = useRef(false);
  const [active, setActive] = useState(false);
  const idle = useIdle();
  const webgl = useWebGL();
  const show3d = idle && webgl;

  useEffect(() => {
    const scope = pin.current;
    if (!scope) return;
    const mm = gsap.matchMedia(scope);
    {
      mm.add(PIN_QUERY, () => {
        const p = progress.current;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "+=250%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const on = self.progress > 0.05 && self.progress < 0.68;
              if (on !== activeRef.current) { activeRef.current = on; setActive(on); }
            },
          },
        });
        trigger.current = tl.scrollTrigger ?? null;
        tl
          // 1 — contour lines draw and drift across the screen
          .to(".hc", { strokeDashoffset: 0, stagger: 0.07, duration: 2.4 }, 0)
          .to(".hero-contours", { xPercent: -6, duration: 10 }, 0)
          // 2 — the 3D mass emerges and turns
          .to(".hero-canvas", { autoAlpha: 1, duration: 1.2 }, 1)
          .to(p, { v: 1, duration: 4.6 }, 1)
          .to(".hero-headline", { autoAlpha: 0, yPercent: -10, duration: 1.3 }, 4.4)
          // 3 — blueprint outline draws, then mass gives way to a photograph
          .to(".hero-frame .bp", { strokeDashoffset: 0, stagger: 0.08, duration: 1.4 }, 5)
          .to(".hero-canvas", { autoAlpha: 0, duration: 1 }, 5.7)
          .fromTo(".hero-photo", { clipPath: "inset(50% 50% 50% 50%)", autoAlpha: 1 }, { clipPath: "inset(16% 24% 16% 24%)", duration: 1.6 }, 6)
          .to(".hero-frame", { autoAlpha: 0, duration: 1 }, 7.1)
          // 4 — annotations pin themselves to the photograph
          .fromTo(".hero-ann", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.18, duration: 0.5 }, 7.4)
          // 5 — the composition expands into the landscape
          .to(".hero-photo", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6 }, 8.3)
          .fromTo(".hero-photo-img", { scale: 1.22 }, { scale: 1, duration: 1.8 }, 8.2)
          // 6 — discovery interface
          .fromTo(".hero-discovery", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1 }, 9.1)
          .to({}, { duration: 0.4 }, 10);
        return () => { trigger.current = null; };
      });
    }
    return () => mm.revert();
  }, []);

  const skip = () => {
    const st = trigger.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (st) window.scrollTo({ top: st.end + 2, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("coordinates")?.focus({ preventScroll: true });
  };

  return (
    <section id="hero" ref={root} aria-label={t.common.brand}>
      <div ref={pin} className="relative h-svh min-h-[560px] overflow-hidden bg-paper">
        {/* contour field */}
        <div className="hero-contours absolute -inset-x-[8%] inset-y-0" aria-hidden>
          <HeroContours hidden className="h-full w-full" />
        </div>

        {/* 3D mass (lazy, idle, WebGL only) — SVG elevation stands in without WebGL */}
        <div className="hero-canvas absolute inset-0" style={{ opacity: 0, visibility: "hidden" }} aria-hidden>
          {show3d ? (
            <HeroScene progress={progress} active={active} />
          ) : (
            <div className="grid h-full place-items-center p-10 text-ink"><BuildingElevation className="w-full max-w-3xl" /></div>
          )}
        </div>

        {/* blueprint frame */}
        <div className="hero-frame pointer-events-none absolute inset-x-[24%] inset-y-[16%] grid place-items-center text-ink" aria-hidden>
          <BuildingElevation hidden className="h-full w-full" />
          <span className="annot absolute bottom-0 end-0 translate-y-6">{t.home.hero.elevation}</span>
        </div>

        {/* photograph, revealed by clip-path */}
        {hero && (
          <div className="hero-photo absolute inset-0 bg-ink" style={{ clipPath: "inset(50% 50% 50% 50%)", visibility: "hidden" }}>
            <div className="hero-photo-img absolute inset-0">
              <AtlasImage src={hero.images[0].src} alt={tr(hero.images[0].alt, lang)} fill priority sizes="100vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" aria-hidden />
          </div>
        )}

        {/* annotations pinned to points on the photograph */}
        <div className="absolute inset-0" aria-hidden>
          <Pins pins={pins} hidden />
        </div>

        {/* headline: real text, always in the DOM */}
        <div className="hero-headline wrap absolute inset-x-0 bottom-[12vh] z-10">
          <Headline pinned />
        </div>

        <div className="hero-discovery wrap absolute inset-x-0 bottom-8 z-10" style={{ opacity: 0, visibility: "hidden" }}>
          <Discovery />
        </div>

        <p className="annot absolute bottom-8 end-[clamp(16px,4vw,56px)] hidden items-center gap-2 lg:flex" aria-hidden>{t.home.hero.scroll}</p>

        <button type="button" onClick={skip} className="btn btn-sm absolute end-[clamp(16px,4vw,56px)] top-[calc(var(--header-h)+16px)] z-20 bg-paper/90 backdrop-blur" aria-label={t.home.hero.skipLabel}>
          {t.home.hero.skip}
          <Arrow />
        </button>
      </div>
    </section>
  );
}

export function Hero({ data }: { data: HomeData; lang: Locale }) {
  const hero = pickHero(data);
  const pins = useAnnotations(hero);
  const pinned = usePinned();
  return pinned ? <HeroPinned hero={hero} pins={pins} /> : <HeroStatic hero={hero} pins={pins} />;
}
