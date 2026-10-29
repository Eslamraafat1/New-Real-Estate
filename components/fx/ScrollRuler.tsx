"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";

/** "Coordinate navigation": a vertical survey ruler with a live position marker and the current section id. */
export function ScrollRuler() {
  const { t } = useApp();
  const thumb = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (thumb.current) thumb.current.style.top = `${p * 100}%`;
      if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setLabel((e.target as HTMLElement).id.replace(/-/g, " ")); }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    const observe = () => document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.getElementById("main") ?? document.body, { childList: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div aria-hidden className="scroll-ruler" title={t.fx.ruler}>
      <div className="scroll-ruler__track">
        <div ref={thumb} className="scroll-ruler__thumb">
          <span ref={pct} className="annot num">000</span>
          <span className="annot !text-copper">{label}</span>
        </div>
      </div>
    </div>
  );
}
