"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { tr, type Locale } from "@/lib/i18n/config";
import type { Property } from "@/lib/api/types";
import type { HomeData } from "../types";
import { BuildingElevation } from "./Blueprint";
import { gsap, PIN_QUERY } from "./gsap";
import { usePinned } from "./hooks";
import { pickHero, pickMotion } from "./pick";

function useChapters(p: Property | undefined) {
  const { t, lang } = useApp();
  if (!p) return [];
  const m = t.home.motion;
  const fallback = tr(p.summary, lang);
  return [
    { key: "exterior", label: m.exterior, text: tr(p.story?.exterior, lang) || fallback, img: p.images[0] },
    { key: "light", label: m.light, text: tr(p.story?.light, lang) || fallback, img: p.images[Math.min(1, p.images.length - 1)] },
    { key: "materials", label: m.materials, text: tr(p.story?.materials, lang) || fallback, img: p.images[Math.min(2, p.images.length - 1)] },
  ];
}

export function ArchitectureInMotion({ data }: { data: HomeData; lang: Locale }) {
  const hero = pickHero(data);
  const p = pickMotion(data, hero?.id);
  const chapters = useChapters(p);
  const pinned = usePinned();
  if (!p) return null;
  return pinned ? <Pinned p={p} chapters={chapters} /> : <Stacked p={p} chapters={chapters} />;
}

type Chapters = ReturnType<typeof useChapters>;

function Head({ p }: { p: Property }) {
  const { t, lang, href } = useApp();
  const m = t.home.motion;
  return (
    <div className="grid gap-5">
      <SectionHead num="E / 05" eyebrow={m.eyebrow} title={<span id="motion-title">{m.title}</span>} intro={m.intro} />
      <Link href={href(`/properties/${p.slug}`)} className="btn btn-sm justify-self-start">{tr(p.title, lang)}<Arrow /></Link>
    </div>
  );
}

/* Mobile / reduced motion: blueprint above, then the same photographs stacked. */
function Stacked({ p, chapters }: { p: Property; chapters: Chapters }) {
  const { lang, t } = useApp();
  return (
    <section id="motion" aria-labelledby="motion-title" className="section border-t border-line bg-paper2">
      <div className="wrap grid gap-10">
        <Head p={p} />
        <Reveal className="atlas-grid grid place-items-center border border-line p-6 text-ink">
          <BuildingElevation className="w-full max-w-xl" />
          <span className="annot mt-4 justify-self-start">{t.home.motion.blueprint}</span>
        </Reveal>
        <ol className="grid gap-12 md:grid-cols-3">
          {chapters.map((c, i) => (
            <li key={c.key} className="grid gap-3">
              <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                <AtlasImage src={c.img.src} alt={tr(c.img.alt, lang)} fill sizes="(min-width:768px) 30vw, 94vw" className="object-cover" />
              </div>
              <p className="annot !text-copper">0{i + 1} — {c.label}</p>
              <p className="text-pretty text-soft">{c.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* Desktop: pinned sequence, blueprint -> perspective -> photographs. */
function Pinned({ p, chapters }: { p: Property; chapters: Chapters }) {
  const { lang, t } = useApp();
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = pin.current;
    if (!scope) return;
    const mm = gsap.matchMedia(scope);
    mm.add(PIN_QUERY, () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: scope, start: "top top", end: "+=200%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      });
      gsap.set(".mo-photo", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".mo-cap", { autoAlpha: 0, y: 16 });
      tl
        .to(".mo-bp .bp", { strokeDashoffset: 0, stagger: 0.1, duration: 1.4 }, 0)
        .to(".mo-cap-0", { autoAlpha: 1, y: 0, duration: 0.5 }, 0.8)
        .to(".mo-stage", { rotateY: -24, rotateX: 6, scale: 0.92, duration: 1.6 }, 1.4)
        .to(".mo-photo-0", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2 }, 2.6)
        .to(".mo-bp", { opacity: 0.18, duration: 1 }, 2.8)
        .to(".mo-cap-0", { autoAlpha: 0.0, y: -16, duration: 0.4 }, 4.1)
        .fromTo(".mo-photo-1", { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2 }, 4.2)
        .fromTo(".mo-cap-1", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 4.6)
        .to(".mo-cap-1", { autoAlpha: 0, y: -16, duration: 0.4 }, 6.3)
        .fromTo(".mo-photo-2", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2 }, 6.4)
        .fromTo(".mo-cap-2", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 6.8)
        .to({}, { duration: 0.6 }, 8.2);
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="motion" aria-labelledby="motion-title" className="border-t border-line bg-paper2">
      <div ref={pin} className="relative h-svh min-h-[600px] overflow-hidden">
        <div className="wrap grid h-full items-center gap-8 pt-[var(--header-h)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div className="relative z-10 grid content-center gap-10">
            <Head p={p} />
            <div className="relative min-h-36 border-s border-line ps-5" aria-live="off">
              {chapters.map((c, i) => (
                <div key={c.key} className={`mo-cap mo-cap-${i} absolute inset-x-0 top-0 ps-5`} style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}>
                  <p className="annot !text-copper">0{i + 1} / 03 — {c.label}</p>
                  <p className="mt-2 max-w-[38ch] text-pretty">{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[68vh] [perspective:1400px]">
            <div className="mo-stage relative h-full w-full [transform-style:preserve-3d]">
              <div className="atlas-grid absolute inset-0 border border-line bg-paper" aria-hidden />
              <div className="mo-bp absolute inset-0 grid place-items-center p-8 text-ink" aria-hidden>
                <BuildingElevation hidden className="w-full" />
                <span className="annot absolute bottom-3 start-4">{t.home.motion.blueprint}</span>
              </div>
              {chapters.map((c, i) => (
                <div key={c.key} className={`mo-photo mo-photo-${i} absolute inset-0 overflow-hidden`} style={{ clipPath: "inset(100% 0% 0% 0%)" }}>
                  <AtlasImage src={c.img.src} alt={tr(c.img.alt, lang)} fill sizes="(min-width:1024px) 62vw, 90vw" className="object-cover" />
                  <span className="annot absolute bottom-3 end-3 bg-paper/90 px-1.5 py-0.5 !text-ink">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
