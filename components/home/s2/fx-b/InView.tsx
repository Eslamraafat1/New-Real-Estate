"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import "./fxb.css";

/**
 * Arms its subtree for CSS reveals (.fxb-rise / .fxb-curtain / .fxb-tower-fill / .fxb-spine) and flips
 * `data-in` once it scrolls into view. Pure attribute writes (no re-render); content stays visible without JS,
 * under reduced motion, or when already on screen at mount.
 */
export function InView({ as: Tag = "div", className = "", style, children, threshold = 0.2, id, ...aria }: {
  as?: ElementType; className?: string; style?: CSSProperties; children: ReactNode; threshold?: number; id?: string; "aria-labelledby"?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.85 && r.bottom > 0) return; // already visible: leave as is
    el.setAttribute("data-armed", "");
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { el.setAttribute("data-in", ""); io.disconnect(); }
    }, { threshold, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return <Tag ref={ref} id={id} className={className} style={style} {...aria}>{children}</Tag>;
}
