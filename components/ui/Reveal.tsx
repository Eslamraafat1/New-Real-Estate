"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Adds `in-view` once the element enters the viewport. Children with .reveal / .draw
 * animate via CSS (no JS animation library on the same element). Under reduced motion CSS shows everything.
 */
export function Reveal({ as: Tag = "div", className = "", children, delay = 0, threshold = 0.2 }: {
  as?: ElementType; className?: string; children: ReactNode; delay?: number; threshold?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("in-view"); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("in-view"); io.disconnect(); } }),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return (
    <Tag ref={ref} className={className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
