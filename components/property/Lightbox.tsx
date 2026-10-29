"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PropertyImage } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { Modal } from "@/components/ui/Modal";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";

/** Full-screen photo viewer: ←/→ (RTL-aware), Esc, swipe, captions, counter. */
export default function Lightbox({ images, index, onIndex, onClose }: { images: PropertyImage[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const { t, lang, dir } = useApp();
  const g = t.property.gallery;
  const f = useFormat();
  const start = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;
  const i = index ?? 0;
  const n = images.length;
  const rtl = dir === "rtl";

  const go = (d: number) => onIndex((i + d + n) % n);
  // "forward" = next photo. In RTL the left arrow / right swipe moves forward.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(rtl ? -1 : 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(rtl ? 1 : -1); }
    else if (e.key === "Home") { e.preventDefault(); onIndex(0); }
    else if (e.key === "End") { e.preventDefault(); onIndex(n - 1); }
  };
  const onDown = (e: PointerEvent) => { start.current = { x: e.clientX, y: e.clientY }; };
  const onUp = (e: PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go((dx < 0) === !rtl ? 1 : -1);
  };

  const img = images[i];
  const caption = img?.caption ? tr(img.caption, lang) : "";

  return (
    <Modal open={open} onClose={onClose} title={g.lightboxTitle} fullscreen hideHeader className="!bg-[var(--ink)] !text-[var(--paper)]">
      {img && (
        <div className="relative flex h-[100dvh] flex-col outline-none" onKeyDown={onKeyDown} role="group" aria-roledescription="carousel" aria-label={g.lightboxTitle}>
          <div className="flex items-center justify-between gap-4 px-4 py-3 safe-t">
            <span className="annot num !text-[var(--paper)]" aria-live="polite">{fmt(g.counter, { n: f.num(i + 1), total: f.num(n) })}</span>
            <button type="button" className="icon-btn !border-[var(--paper)]/40 !bg-transparent !text-[var(--paper)] hover:!bg-[var(--paper)] hover:!text-[var(--ink)]" onClick={onClose} aria-label={g.close}><X size={20} /></button>
          </div>
          <div className="relative min-h-0 flex-1 touch-pan-y select-none" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { start.current = null; }}>
            <AtlasImage key={img.src} src={img.src} alt={tr(img.alt, lang)} fill sizes="100vw" className="object-contain" draggable={false} />
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label={g.prev} className="icon-btn absolute start-3 top-1/2 -translate-y-1/2 !border-[var(--paper)]/40 !bg-[var(--ink)]/60 !text-[var(--paper)]">
                  <ChevronLeft size={22} className="rtl:-scale-x-100" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label={g.next} className="icon-btn absolute end-3 top-1/2 -translate-y-1/2 !border-[var(--paper)]/40 !bg-[var(--ink)]/60 !text-[var(--paper)]">
                  <ChevronRight size={22} className="rtl:-scale-x-100" />
                </button>
              </>
            )}
          </div>
          <div className="grid gap-1 px-4 py-3 text-center safe-b">
            {caption && <p className="text-sm">{caption}</p>}
            <p className="annot annot-ar-ok !text-[var(--paper)] opacity-70">{g.hint}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
