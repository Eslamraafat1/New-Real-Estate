"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import { LazyFloorPlanViewer } from "./LazyFloorPlanViewer";
import { usePropertyDetail, type MediaTab } from "./PropertyDetailContext";

const isFile = (u: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(u);

/**
 * Scroll-snap filmstrip: large slides, mouse drag + touch swipe (native) + arrow buttons + keyboard,
 * thumbnails that double as a progress index. Tapping a slide opens the lightbox.
 */
function Filmstrip() {
  const { t, lang, dir } = useApp();
  const g = t.property.gallery;
  const c = t.property.cine.gallery;
  const f = useFormat();
  const { property: p, openLightbox } = usePropertyDetail();
  const n = p.images.length;
  const strip = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLUListElement>(null);
  const [cur, setCur] = useState(0);
  const dragState = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const raf = useRef(0);
  const rtl = dir === "rtl";

  const slides = () => Array.from(strip.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? []);

  const sync = useCallback(() => {
    const el = strip.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const edge = rtl ? box.right : box.left;
    let best = 0;
    let bestD = Infinity;
    slides().forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs((rtl ? r.right : r.left) - edge - (rtl ? -1 : 1) * parseFloat(getComputedStyle(el).paddingInlineStart || "0"));
      if (d < bestD) { bestD = d; best = i; }
    });
    if (Math.abs(el.scrollLeft) + el.clientWidth >= el.scrollWidth - 3) best = slides().length - 1;
    setCur(best);
  }, [rtl]);

  const onScroll = () => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(sync); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const goTo = (i: number) => {
    const el = strip.current;
    const target = slides()[Math.max(0, Math.min(n - 1, i))];
    if (!el || !target) return;
    const a = el.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(el).paddingInlineStart || "0");
    const delta = rtl ? b.right - a.right + pad : b.left - a.left - pad;
    el.scrollBy({ left: delta, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const fwd = e.key === (rtl ? "ArrowLeft" : "ArrowRight");
    const back = e.key === (rtl ? "ArrowRight" : "ArrowLeft");
    if (!fwd && !back) return;
    e.preventDefault();
    goTo(cur + (fwd ? 1 : -1));
  };

  // Mouse drag (touch and pen use native scrolling).
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragState.current = { x: e.clientX, left: strip.current?.scrollLeft ?? 0, moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    const el = strip.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) { d.moved = true; el.dataset.drag = "1"; try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
    el.scrollLeft = d.left - dx;
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    dragState.current = null;
    const el = strip.current;
    if (!d || !el) return;
    if (d.moved) {
      justDragged.current = true;
      setTimeout(() => { justDragged.current = false; }, 60);
      try { el.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      delete el.dataset.drag; // snapping resumes and settles on the nearest slide
    }
  };

  // keep the current thumbnail in view inside its own scroller (never moves the page)
  useEffect(() => {
    const ul = thumbs.current;
    const el = ul?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!ul || !el) return;
    const a = ul.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    ul.scrollBy({ left: b.left + b.width / 2 - (a.left + a.width / 2), behavior: "smooth" });
  }, [cur]);

  const img = p.images[cur];
  return (
    <div>
      <div
        ref={strip}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={c.strip}
        onKeyDown={onKey}
        onScroll={onScroll}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="pd-strip pd-bleed flex gap-3 overflow-x-auto pb-1 md:gap-5"
      >
        {p.images.map((im, i) => (
          <figure key={`${i}-${im.src}`} data-slide className="group relative m-0 w-[86%] shrink-0 snap-start sm:w-[78%] lg:w-[66%] xl:w-[60%]">
            {/* Decorative badges sit beside (not inside) the button so its accessible name matches its content (WCAG 2.5.3). */}
            <div className="relative">
              <button
                type="button"
                className="relative block aspect-[3/2] w-full overflow-hidden bg-paper2"
                aria-label={fmt(g.open, { n: i + 1 })}
                onClick={() => { if (!justDragged.current) openLightbox(i); }}
                draggable={false}
              >
                <AtlasImage src={im.src} alt={tr(im.alt, lang)} fill sizes="(min-width: 1280px) 60vw, (min-width: 1024px) 66vw, (min-width: 640px) 78vw, 86vw" className="img-hover object-cover" draggable={false} />
              </button>
              <span className="pointer-events-none absolute end-3 top-3 grid h-9 w-9 place-items-center bg-paper/90 text-ink" aria-hidden><Maximize2 size={16} /></span>
              <span className="annot num pointer-events-none absolute start-3 bottom-3 bg-paper/90 px-2 py-1 !text-ink" aria-hidden>{f.num(i + 1, { minimumIntegerDigits: 2 })}</span>
            </div>
            <figcaption className="annot annot-ar-ok mt-2 min-h-[1.5em]">{im.caption ? tr(im.caption, lang) : ""}</figcaption>
          </figure>
        ))}
      </div>

      {/* progress index */}
      <div className="mt-4 grid items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <p className="num display h-md leading-none" aria-live="polite">
          {f.num(cur + 1, { minimumIntegerDigits: 2 })}
          <span className="text-mute"> / {f.num(n, { minimumIntegerDigits: 2 })}</span>
          <span className="sr-only">{img ? fmt(c.progress, { n: f.num(cur + 1), total: f.num(n) }) : ""}</span>
        </p>
        <ul ref={thumbs} aria-label={g.thumbs} className="no-scrollbar flex gap-2 overflow-x-auto py-1">
          {p.images.map((im, i) => (
            <li key={`${i}-${im.src}`} className="shrink-0">
              <button
                type="button"
                aria-label={fmt(c.goTo, { n: i + 1 })}
                aria-current={i === cur ? "true" : undefined}
                onClick={() => goTo(i)}
                onDoubleClick={() => openLightbox(i)}
                className={`relative block h-14 w-20 overflow-hidden border sm:h-16 sm:w-24 ${i === cur ? "border-copper" : "border-transparent opacity-60 hover:opacity-100 focus-visible:opacity-100"}`}
              >
                <AtlasImage src={im.src} alt="" fill sizes="96px" className="object-cover" />
                <span aria-hidden className={`absolute inset-x-0 bottom-0 h-[3px] origin-left bg-copper transition-transform duration-500 rtl:origin-right ${i <= cur ? "scale-x-100" : "scale-x-0"}`} />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button type="button" className="icon-btn" aria-label={g.prev} onClick={() => goTo(cur - 1)} disabled={cur <= 0}><ChevronLeft size={20} className="rtl:-scale-x-100" /></button>
          <button type="button" className="icon-btn" aria-label={g.next} onClick={() => goTo(cur + 1)} disabled={cur >= n - 1}><ChevronRight size={20} className="rtl:-scale-x-100" /></button>
        </div>
      </div>
      <p className="annot annot-ar-ok mt-3">{c.hint}</p>
    </div>
  );
}

/** Media gallery: Photos / Floor plan / Video / Virtual tour (tabs only when the data exists). */
export function PropertyGallery() {
  const { t, lang } = useApp();
  const g = t.property.gallery;
  const { property: p, tab, setTab } = usePropertyDetail();
  const title = tr(p.title, lang);

  const tabs: { id: MediaTab; label: string }[] = [{ id: "photos", label: g.tabs.photos }];
  if (p.floorPlan) tabs.push({ id: "plan", label: g.tabs.plan });
  if (p.videoUrl) tabs.push({ id: "video", label: g.tabs.video });
  if (p.virtualTourUrl) tabs.push({ id: "tour", label: g.tabs.tour });
  const active = tabs.some((x) => x.id === tab) ? tab : "photos";

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((x) => x.id === active);
    const rtl = document.documentElement.dir === "rtl";
    const fwd = e.key === (rtl ? "ArrowLeft" : "ArrowRight");
    const back = e.key === (rtl ? "ArrowRight" : "ArrowLeft");
    if (!fwd && !back) return;
    e.preventDefault();
    const next = tabs[(i + (fwd ? 1 : -1) + tabs.length) % tabs.length];
    setTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <section id="gallery" aria-labelledby="gallery-h" className="wrap section scroll-mt-32 !pb-0">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="annot !text-copper">{g.eyebrow}</p>
          <h2 id="gallery-h" className="display h-lg mt-3">{g.title}</h2>
        </div>
        {tabs.length > 1 && (
          <div role="tablist" aria-label={g.label} onKeyDown={onTabKey} className="flex flex-wrap gap-1">
            {tabs.map((x) => (
              <button key={x.id} id={`tab-${x.id}`} role="tab" aria-selected={x.id === active} aria-controls="gallery-panel" tabIndex={x.id === active ? 0 : -1} className="chip min-h-[44px]" data-active={x.id === active} onClick={() => setTab(x.id)}>{x.label}</button>
            ))}
          </div>
        )}
      </div>

      <div id="gallery-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
        {active === "photos" && p.images.length > 0 && <Filmstrip />}
        {active === "plan" && p.floorPlan && (
          <LazyFloorPlanViewer plan={p.floorPlan} propertyTitle={title} onShowGallery={() => setTab("photos")} />
        )}
        {active === "video" && p.videoUrl && (
          isFile(p.videoUrl) ? (
            <video controls preload="metadata" className="aspect-video w-full bg-ink" src={p.videoUrl} />
          ) : (
            <a className="btn" href={p.videoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />{g.openVideo}</a>
          )
        )}
        {active === "tour" && p.virtualTourUrl && (
          <div className="grid justify-items-start gap-2">
            <a className="btn" href={p.virtualTourUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />{g.openTour}</a>
            <p className="annot annot-ar-ok">{g.externalNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}
