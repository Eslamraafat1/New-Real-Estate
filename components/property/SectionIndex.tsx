"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { useFormat } from "@/lib/hooks";
import { fmt } from "@/lib/i18n";

export type IndexItem = { id: string; label: string };

/**
 * "Atlas index": a sticky navigation for the sections that actually render.
 *  - xl+: a slim fixed rail at the inline-start edge (01–0N, active label expands)
 *  - below xl: a compact pill bar that sticks under the site header
 * The active section comes from an IntersectionObserver band across the viewport. Links are plain
 * anchors (smooth scrolling + scroll-margin come from CSS), so everything works without JS.
 */
export function SectionIndex({ items }: { items: IndexItem[] }) {
  const { t } = useApp();
  const f = useFormat();
  const c = t.property.cine.nav;
  const [active, setActive] = useState<string | null>(null);
  const bar = useRef<HTMLUListElement>(null);
  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    const els = key.split("|").map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const hit = new Set<string>();
    const order = els.map((e) => e.id);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) hit.add(e.target.id); else hit.delete(e.target.id); });
      const cur = order.filter((id) => hit.has(id)).pop();
      if (cur) setActive(cur);
      else if (window.scrollY < 200) setActive(null);
    }, { rootMargin: "-38% 0px -58% 0px", threshold: 0 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [key]);

  // Keep the active pill centred in the (horizontally scrollable) bar, without moving the page.
  useEffect(() => {
    const ul = bar.current;
    const el = ul?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!ul || !el) return;
    const a = ul.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    ul.scrollBy({ left: b.left + b.width / 2 - (a.left + a.width / 2), behavior: "smooth" });
  }, [active]);

  const num = (i: number) => f.num(i + 1, { minimumIntegerDigits: 2 });

  return (
    <>
      {/* compact bar: below xl */}
      <nav aria-label={t.property.sections} className="pd-bar sticky top-[var(--header-h)] z-30 border-b border-line bg-paper/92 backdrop-blur-md xl:hidden">
        <ul ref={bar} className="no-scrollbar wrap flex snap-x gap-1.5 overflow-x-auto py-2">
          {items.map((it, i) => (
            <li key={it.id} className="pd-pill shrink-0">
              <a
                href={`#${it.id}`}
                aria-current={active === it.id ? "true" : undefined}
                className={`flex min-h-[40px] items-center gap-2 border px-3 text-[0.78rem] transition-colors ${active === it.id ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
              >
                <span className="annot num !text-inherit opacity-70">{num(i)}</span>
                <span className="whitespace-nowrap">{it.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* vertical rail: xl and up */}
      <nav
        aria-label={c.title}
        className={`fixed start-2 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 xl:block ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <p className="annot mb-3 [writing-mode:vertical-rl]">{c.title}</p>
        <ul className="grid gap-0.5">
          {items.map((it, i) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={active === it.id ? "true" : undefined}
                aria-label={fmt(c.jump, { name: it.label })}
                className="pd-rail-item group relative flex h-7 items-center gap-1"
              >
                <span className={`annot num block w-6 text-start transition-colors ${active === it.id ? "!text-copper" : "group-hover:!text-ink"}`}>{num(i)}</span>
                <span aria-hidden className={`block h-px transition-all duration-300 ${active === it.id ? "w-3 bg-copper" : "w-1.5 bg-[var(--line)]"}`} />
                <span className="pd-rail-label annot annot-ar-ok absolute start-11 whitespace-nowrap border border-line bg-paper px-2 py-0.5 !text-ink">{it.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
