"use client";

import { useEffect, useRef } from "react";

/**
 * Number that counts up once, the first time it is visible. The server (and no-JS / reduced-motion)
 * render is the final text; the animation writes textContent directly, so React never re-renders.
 */
export function CountTo({ to, format, className = "", duration = 1500 }: { to: number; format: (n: number) => string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmtRef = useRef(format);
  useEffect(() => { fmtRef.current = format; });
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let done = false;
    el.textContent = fmtRef.current(0);
    const io = new IntersectionObserver((es) => {
      if (!es[0]?.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / duration);
        el.textContent = fmtRef.current(Math.round(to * (1 - Math.pow(1 - k, 4))));
        if (k < 1) raf = requestAnimationFrame(step);
        else done = true;
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      if (!done) el.textContent = fmtRef.current(to);
    };
  }, [to, duration]);
  return <span ref={ref} className={`num ${className}`}>{format(to)}</span>;
}
