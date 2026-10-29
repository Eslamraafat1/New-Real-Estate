"use client";

import { useEffect } from "react";

/**
 * Global, delegated motion layer (one set of listeners for the whole site):
 *  - display headings rise out of a blur as they enter the viewport
 *  - primary buttons are gently magnetic
 *  - [data-tilt] cards tilt in 3D with a travelling highlight
 * Everything is disabled for prefers-reduced-motion; magnetic/tilt only for fine hover pointers.
 * It only touches `style` / helper classes, never React state, and never the pinned hero.
 */
export function FxRoot() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("fx-in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll("h1.display, h2.display, .fx-reveal").forEach((el) => {
        if (seen.has(el) || el.closest("#hero,[data-fx-skip]")) return;
        seen.add(el);
        el.classList.add("fx-head");
        io.observe(el);
      });
    };
    scan();
    let raf = 0;
    const mo = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; scan(); }); });
    mo.observe(document.body, { childList: true, subtree: true });

    let mag: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as Element;
      const m = target.closest<HTMLElement>(".btn-primary,.btn-copper,[data-magnetic]");
      if (mag && mag !== m) mag.style.transform = "";
      mag = m;
      if (m && !(m as HTMLButtonElement).disabled) {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.16}px, ${(e.clientY - (r.top + r.height / 2)) * 0.26}px)`;
      }
      const t = target.closest<HTMLElement>("[data-tilt]");
      if (tilt && tilt !== t) { tilt.style.transform = ""; }
      tilt = t;
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        t.style.transform = `perspective(1000px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
        t.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
        t.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
      }
    };
    const onLeave = () => {
      if (mag) mag.style.transform = "";
      if (tilt) tilt.style.transform = "";
      mag = tilt = null;
    };
    if (fine) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return null;
}
