"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Chevron } from "@/components/ui/Arrow";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import { Badges, Specs } from "./PropertyBits";
import { PrimaryActions, UtilityActions } from "./PropertyActions";
import { usePropertyDetail } from "./PropertyDetailContext";
import { CountTo } from "./CountTo";

/** Coordinates that "lock in" digit by digit on load (writes textContent directly; final text is server-rendered). */
function CoordChip({ x, y }: { x: number; y: number }) {
  const { t } = useApp();
  const f = useFormat();
  const ref = useRef<HTMLSpanElement>(null);
  const digits = useRef(f);
  useEffect(() => { digits.current = f; });
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fin = `${digits.current.num(x)} · ${digits.current.num(y)}`;
    const isDigit = (c: string) => /[0-9٠-٩]/.test(c);
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1100);
      const frame = Math.floor(now / 45);
      let n = 0;
      const out = [...fin].map((c, i) => {
        if (!isDigit(c)) return c;
        n++;
        return k >= (n / 9) * 0.9 + 0.1 ? c : digits.current.num((i * 7 + frame * 13 + n) % 10);
      }).join("");
      el.textContent = out;
      if (k < 1) raf = requestAnimationFrame(step);
      else el.textContent = fin;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); el.textContent = fin; };
  }, [x, y]);
  return (
    <span className="annot annot-ar-ok flex items-center gap-2 border border-line bg-paper/85 px-3 py-2 backdrop-blur-md" title={t.property.cine.planeNote}>
      <span className="pd-dot" aria-hidden />
      <span>{t.property.hero.coords}</span>
      <span ref={ref} className="num !text-ink" dir="ltr">{`${f.num(x)} · ${f.num(y)}`}</span>
    </span>
  );
}

/**
 * Cinematic opening: full-width photo with a GSAP parallax layer, a live coordinates chip, a title that
 * rises word by word out of masks (split on spaces only, so Arabic words stay whole), a price that counts up,
 * and a huge outlined reference numeral that drifts on scroll behind the text.
 */
export function PropertyHero() {
  const { t, lang, href, dir } = useApp();
  const f = useFormat();
  const h = t.property.hero;
  const { property: p, openLightbox } = usePropertyDetail();
  const imgs = p.images;
  const root = useRef<HTMLElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const numeral = useRef<HTMLSpanElement>(null);
  const numWrap = useRef<HTMLDivElement>(null);
  const title = tr(p.title, lang);
  const words = title.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const sign = dir === "rtl" ? -1 : 1;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (photo.current && layer.current) {
          gsap.fromTo(layer.current, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: photo.current, start: "top bottom", end: "bottom top", scrub: true } });
        }
        if (numWrap.current && numeral.current) {
          gsap.fromTo(numeral.current, { x: `${-6 * sign}vw` }, { x: `${8 * sign}vw`, ease: "none", scrollTrigger: { trigger: numWrap.current, start: "top bottom", end: "bottom top", scrub: true } });
        }
      });
    }, el);
    return () => { mm.revert(); ctx.revert(); };
  }, [dir]);

  const tile = (i: number, sizes: string) => {
    const im = imgs[i];
    if (!im) return null;
    return (
      <button type="button" onClick={() => openLightbox(i)} aria-label={fmt(h.openImage, { n: i + 1 })} className="group relative block aspect-[4/3] overflow-hidden border border-paper bg-paper2 lg:border-2">
        <AtlasImage src={im.src} alt={tr(im.alt, lang)} fill sizes={sizes} className="img-hover object-cover" />
      </button>
    );
  };
  const cover = imgs[0];

  return (
    <header ref={root} className="relative pt-6 md:pt-10">
      <div className="wrap">
        <nav aria-label={t.property.breadcrumb} className="annot annot-ar-ok mb-5 flex flex-wrap items-center gap-1">
          <Link href={href("/properties")} className="hover:text-ink">{t.nav.listings}</Link>
          <Chevron />
          <Link href={href(`/properties?neighborhood=${p.neighborhood}`)} className="hover:text-ink">{tr(p.location, lang)}</Link>
          <Chevron />
          <span className="text-ink">{t.common.ref} {p.ref}</span>
        </nav>

        <div className="relative z-10">
          <div ref={photo} className="group relative aspect-[4/5] overflow-hidden bg-paper2 sm:aspect-[4/3] lg:aspect-[16/8] lg:max-h-[46rem]">
            {cover && (
              <div ref={layer} className="absolute inset-x-0 -inset-y-[8%]">
                <AtlasImage src={cover.src} alt={tr(cover.alt, lang)} fill priority sizes="(min-width: 1440px) 1330px, 100vw" className="img-hover object-cover" />
              </div>
            )}
            <button type="button" onClick={() => openLightbox(0)} aria-label={fmt(h.openImage, { n: 1 })} className="absolute inset-0 z-10" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] h-1/3 bg-gradient-to-t from-[var(--scrim)] to-transparent" />
            <div className="pointer-events-none absolute start-3 top-3 z-20 sm:start-5 sm:top-5"><CoordChip x={Math.round(p.geo.x)} y={Math.round(p.geo.y)} /></div>
          </div>
          {(imgs[1] || imgs[2]) && (
            <div className="mt-2 grid grid-cols-2 gap-2 lg:absolute lg:bottom-5 lg:end-5 lg:z-20 lg:mt-0 lg:w-[20rem]">
              {tile(1, "(min-width: 1024px) 10rem, 50vw")}
              {tile(2, "(min-width: 1024px) 10rem, 50vw")}
            </div>
          )}
        </div>
        {imgs.length > 3 && (
          <button type="button" className="annot annot-ar-ok mt-3 inline-flex min-h-[44px] items-center underline underline-offset-4 hover:text-ink" onClick={() => openLightbox(0)}>{fmt(h.viewAll, { n: f.num(imgs.length) })}</button>
        )}
      </div>

      <div ref={numWrap} className="wrap relative mt-6 overflow-x-clip pb-2 lg:mt-10">
        {/* outlined reference numeral: sits behind the photo's lower edge and the text */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 -translate-y-[24%] select-none overflow-x-clip text-end">
          <span ref={numeral} className="numeral num pd-outline inline-block text-[clamp(8rem,30vw,26rem)]">{p.ref}</span>
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-12">
          <div className="grid content-start gap-5 lg:col-span-9 xl:col-span-8">
            <Badges p={p} />
            <h1 data-fx-skip className="display h-xl max-w-[18ch] text-balance !text-[clamp(2.4rem,6.4vw,5.6rem)]">
              {words.map((w, i) => (
                <span key={`${w}-${i}`}>
                  {i > 0 && " "}
                  <span className="pd-w"><span style={{ animationDelay: `${180 + i * 110}ms` }}>{w}</span></span>
                </span>
              ))}
            </h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-soft">
              <span>{tr(p.location, lang)}</span>
              <span className="annot annot-ar-ok">{h.refLabel} {p.ref}</span>
            </p>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="num display h-lg">
                <CountTo to={p.price} format={(n) => f.money(n, p.currency)} />
                {p.purpose === "rent" && <span className="ms-1 text-[0.7em] text-mute">{p.pricePeriod === "year" ? t.common.perYear : t.common.perMonth}</span>}
              </span>
              <Specs p={p} className="text-base" />
            </div>
            <PrimaryActions className="mt-2" />
            <UtilityActions />
            <p className="annot annot-ar-ok border-s-2 border-copper ps-3">{t.property.demoListing}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
