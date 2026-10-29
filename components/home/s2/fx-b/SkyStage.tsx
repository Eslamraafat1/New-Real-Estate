"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { formatNumber } from "@/lib/i18n/format";
import { gsap, ScrollTrigger, PIN_QUERY } from "../../s1/gsap";
import "./fxb.css";

/**
 * Scroll scene for "Above the city" (desktop + motion only, reverted on cleanup):
 *  - [data-depth] skyline layers drift at different speeds (scrub);
 *  - the elevator readout counts floors as the viewport passes each [data-ph][data-floor] card;
 *  - the matching [data-elev-item] gets data-active="true" and [data-elev-car] rides the shaft.
 * Everything else is static markup, so mobile / reduced motion / no-JS show the full composition.
 */
export function SkyStage({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { lang } = useApp();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add(PIN_QUERY, () => {
        el.querySelectorAll<HTMLElement>("[data-depth]").forEach((node) => {
          const d = Number(node.dataset.depth) || 0;
          gsap.fromTo(node, { yPercent: -d * 5 }, { yPercent: d * 7, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });

        const readout = el.querySelector<HTMLElement>("[data-elev-readout]");
        const car = el.querySelector<HTMLElement>("[data-elev-car]");
        const items = Array.from(el.querySelectorAll<HTMLElement>("[data-elev-item]"));
        const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-ph]"));
        if (!readout || cards.length === 0) return;
        const floors = cards.map((c) => Number(c.dataset.floor) || 1);
        const maxF = Math.max(...floors, 2);
        let lastText = "";
        let lastActive = -1;

        const update = () => {
          const H = window.innerHeight;
          const mid = H / 2;
          const centers = cards.map((c) => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; });
          let v: number;
          if (mid <= centers[0]) {
            const k = Math.min(1, Math.max(0, 1 - (centers[0] - mid) / H));
            v = 1 + (floors[0] - 1) * k;
          } else if (mid >= centers[centers.length - 1]) {
            v = floors[floors.length - 1];
          } else {
            let i = 0;
            while (i < centers.length - 2 && mid > centers[i + 1]) i++;
            const k = (mid - centers[i]) / (centers[i + 1] - centers[i]);
            v = floors[i] + (floors[i + 1] - floors[i]) * k;
          }
          const text = formatNumber(Math.round(v), lang);
          if (text !== lastText) { readout.textContent = text; lastText = text; }
          if (car) car.style.bottom = `${((v - 1) / (maxF - 1)) * 100}%`;
          let active = 0;
          centers.forEach((c, i) => { if (Math.abs(c - mid) < Math.abs(centers[active] - mid)) active = i; });
          if (active !== lastActive) {
            lastActive = active;
            items.forEach((it) => it.setAttribute("data-active", String(Number(it.dataset.idx) === active)));
          }
        };
        ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: update, onRefresh: update });
        update();
      });
    }, el);
    return () => { mm.revert(); ctx.revert(); };
  }, [lang]);

  return <div ref={root} className={className}>{children}</div>;
}
