"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Contour } from "@/components/ui/Contour";

/**
 * First-visit intro (home page only, once per session). The <html data-intro="1"> flag is set by the
 * inline head script before first paint, so there is no flash of the page behind it. A CSS fallback hides
 * it after ~5s even if scripts fail; reduced-motion users never see it; click / Esc skips.
 */
export function Preloader() {
  const { t, lang } = useApp();
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "1") return;
    const el = root.current!;
    let raf = 0, done = false;
    const t0 = performance.now();
    const DUR = 1900;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      try { sessionStorage.setItem("atlas-intro", "1"); } catch { /* ignore */ }
      el.classList.add("out");
      window.setTimeout(() => { delete html.dataset.intro; }, 950);
    };
    el.classList.add("in-view");
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / DUR);
      const e = 1 - Math.pow(1 - k, 3);
      if (count.current) count.current.textContent = String(Math.round(e * 100)).padStart(3, "0");
      if (k < 1) raf = requestAnimationFrame(tick); else window.setTimeout(finish, 250);
    };
    raf = requestAnimationFrame(tick);
    const onKey = (ev: KeyboardEvent) => { if (ev.key === "Escape") finish(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", onKey); };
  }, []);

  const word = lang === "ar" ? "أطلس" : "ATLAS";
  return (
    <div ref={root} className="preloader" aria-hidden onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}>
      <Contour seed={7} rings={16} className="absolute inset-0 h-full w-full opacity-70" />
      <div className="relative grid justify-items-center gap-5 text-center">
        <p className="annot">{t.fx.charting}</p>
        <p className="display flex text-[clamp(3rem,12vw,9rem)] tracking-[0.2em]" dir="ltr" style={{ letterSpacing: lang === "ar" ? 0 : undefined }}>
          {(lang === "ar" ? [word] : word.split("")).map((c, i) => <span key={i} className="preloader__ch" style={{ animationDelay: `${i * 90 + 150}ms` }}>{c}</span>)}
        </p>
        <p className="annot num" dir="ltr">MB-01 · <span ref={count}>000</span>%</p>
      </div>
      <button type="button" className="btn btn-sm absolute bottom-6 end-6" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); }}>{t.fx.skip}</button>
    </div>
  );
}
