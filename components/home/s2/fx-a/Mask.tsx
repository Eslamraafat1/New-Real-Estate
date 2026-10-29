"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Image mask reveal: a clip-path wipe (start edge -> end edge, mirrored in RTL) with the first child
 * easing from a slight zoom to rest. Plain IntersectionObserver + inline CSS transitions (no GSAP here).
 * Content is fully visible on the server / without JS / under reduced motion: the hidden state is only
 * applied in an effect, and only to elements that are still below the fold.
 */
export function Mask({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const inner = el?.firstElementChild as HTMLElement | null;
    if (!el || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.style.clipPath = rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
    inner.style.transform = "scale(1.28)";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.style.transition = `clip-path 1.2s cubic-bezier(0.7, 0, 0.2, 1) ${delay}ms`;
        inner.style.transition = `transform 1.6s cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms`;
        el.style.clipPath = "inset(0 0 0 0)";
        inner.style.transform = "scale(1)";
        io.disconnect();
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.style.clipPath = el.style.transition = inner.style.transform = inner.style.transition = "";
    };
  }, [delay]);
  return <div ref={ref} className={`overflow-hidden ${className}`}>{children}</div>;
}
