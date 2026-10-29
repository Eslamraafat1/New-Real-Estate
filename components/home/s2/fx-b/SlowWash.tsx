"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, PIN_QUERY } from "../../s1/gsap";
import "./fxb.css";

/**
 * <section> whose background drifts from day to dusk while you scroll: one ScrollTrigger scrub writes `--wash` (0..1)
 * on the element (CSS does the colour mixing). Desktop + motion only; otherwise the CSS default stays.
 */
export function SlowWash({ id, labelledBy, className = "", children }: { id: string; labelledBy: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add(PIN_QUERY, () => {
        const set = (p: number) => el.style.setProperty("--wash", (0.08 + p * 0.85).toFixed(3));
        ScrollTrigger.create({ trigger: el, start: "top 85%", end: "bottom 35%", scrub: 1, onUpdate: (self) => set(self.progress) });
        return () => el.style.removeProperty("--wash");
      });
    }, el);
    return () => { mm.revert(); ctx.revert(); };
  }, []);
  return <section ref={ref} id={id} aria-labelledby={labelledBy} className={className}>{children}</section>;
}
