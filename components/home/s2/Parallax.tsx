"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One GSAP ScrollTrigger scene: descendants with `data-depth="<n>"` drift vertically (scrubbed)
 * at different speeds. Only runs on >=768px with no reduced-motion preference; fully reverted on cleanup.
 */
export function Parallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        el.querySelectorAll<HTMLElement>("[data-depth]").forEach((node) => {
          const depth = Number(node.dataset.depth) || 0;
          gsap.fromTo(
            node,
            { yPercent: -depth * 6 },
            { yPercent: depth * 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
    }, el);
    return () => { mm.revert(); ctx.revert(); };
  }, []);
  return <div ref={root} className={className}>{children}</div>;
}
