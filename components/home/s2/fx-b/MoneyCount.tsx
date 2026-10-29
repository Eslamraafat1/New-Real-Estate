"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { formatMoney } from "@/lib/i18n/format";

/** Currency figure that counts up once when first on screen (direct textContent writes, no re-renders). */
export function MoneyCount({ to, currency, compact = true, className = "" }: { to: number; currency?: string; compact?: boolean; className?: string }) {
  const { lang } = useApp();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fmtv = (n: number) => formatMoney(n, lang, currency, { compact });
    el.textContent = fmtv(0);
    let raf = 0;
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 1800);
        el.textContent = fmtv(to * (1 - Math.pow(1 - k, 4)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, currency, compact, lang]);
  return <span ref={ref} className={`num ${className}`}>{formatMoney(to, lang, currency, { compact })}</span>;
}
