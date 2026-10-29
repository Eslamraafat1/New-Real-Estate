"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { formatNumber } from "@/lib/i18n/format";

/** Number that counts up the first time it scrolls into view (writes textContent directly; no re-renders). */
export function CountUp({ to, className = "" }: { to: number; className?: string }) {
  const { lang } = useApp();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.textContent = formatNumber(0, lang);
    let raf = 0;
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 1600);
        el.textContent = formatNumber(Math.round(to * (1 - Math.pow(1 - k, 4))), lang);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, lang]);
  return <span ref={ref} className={`num ${className}`}>{formatNumber(to, lang)}</span>;
}
