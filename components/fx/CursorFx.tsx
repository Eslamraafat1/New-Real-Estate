"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/components/providers/AppProvider";

/** A lagging ring cursor that swells (and says "Open") over property / article links. Fine pointers only. */
export function CursorFx() {
  const { t } = useApp();
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0, shown = false;
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx - 28}px, ${cy - 28}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; cx = x; cy = y; el.dataset.on = "1"; raf = requestAnimationFrame(loop); }
      const tgt = e.target as Element;
      const card = tgt.closest('a[href*="/properties/"], a[href*="/developments/"], a[href*="/journal/"], [data-cursor-open]');
      const any = tgt.closest("a, button, [role=button], input, select, textarea, summary");
      el.dataset.state = card ? "open" : any ? "link" : "";
    };
    const onLeave = () => { el.dataset.on = ""; cancelAnimationFrame(raf); shown = false; };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ring} aria-hidden className="cursor-fx">
      <span>{t.fx.open}</span>
    </div>
  );
}
