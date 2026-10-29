"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, LocateFixed } from "lucide-react";
import type { Neighborhood } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { tr } from "@/lib/i18n/config";
import { useReducedMotion } from "@/lib/hooks";

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  title?: string;
  kind?: "property" | "development";
}

export interface MapViewProps {
  markers: MapMarker[];
  areas?: Neighborhood[];
  selectedId?: string | null;
  hoverId?: string | null;
  onSelect?: (id: string | null) => void;
  activeArea?: string | null;
  onArea?: (slug: string | null) => void;
  /** Group nearby markers at low zoom. */
  cluster?: boolean;
  controls?: boolean;
  /** Show the "demo map" disclosure badge. */
  badge?: boolean;
  className?: string;
  /** Bottom inset (px) kept free of the focused marker, e.g. when a bottom sheet is open. */
  bottomInset?: number;
  label?: string;
  interactive?: boolean;
}

const W0 = 1000;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Illustrative SVG map of the FICTIONAL city of Meridian Bay. It is deliberately labelled as a
 * demo and makes no claim of geographic accuracy. Zoom, pan (drag / arrows / pinch / wheel),
 * clustering and fly-to are implemented here so a real provider can replace it behind <MapView/>.
 */
export function DemoSvgMap({ markers, areas = [], selectedId, hoverId, onSelect, activeArea, onArea, cluster = true, controls = true, badge = true, className = "", bottomInset = 0, label, interactive = true }: MapViewProps) {
  const { t, lang } = useApp();
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const fit = Math.min(size.w, size.h) / W0;
  const [view, setView] = useState({ cx: 500, cy: 500, s: 0 }); // s: px per unit; 0 = "fit"
  const s = view.s || fit;
  const zoom = s / fit;
  const raf = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth || 800, h: el.clientHeight || 600 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clamp = useCallback((v: { cx: number; cy: number; s: number }) => ({
    cx: Math.min(1000, Math.max(0, v.cx)),
    cy: Math.min(1000, Math.max(0, v.cy)),
    s: Math.min(fit * 6, Math.max(fit * 0.85, v.s)),
  }), [fit]);

  const flyTo = useCallback((target: { cx: number; cy: number; z: number }) => {
    cancelAnimationFrame(raf.current);
    const from = { cx: viewRef.current.cx, cy: viewRef.current.cy, s: viewRef.current.s || fit };
    const to = clamp({ cx: target.cx, cy: target.cy, s: fit * target.z });
    if (reduce) { raf.current = requestAnimationFrame(() => setView(to)); return; }
    const t0 = performance.now();
    const dur = 650;
    const step = (now: number) => {
      const k = ease(Math.min(1, (now - t0) / dur));
      // interpolate scale geometrically so zooming feels even
      setView({ cx: from.cx + (to.cx - from.cx) * k, cy: from.cy + (to.cy - from.cy) * k, s: from.s * Math.pow(to.s / from.s, k) });
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [clamp, fit, reduce]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Marker selected elsewhere (list, panel) → map flies to it.
  const sel = markers.find((m) => m.id === selectedId);
  const selX = sel?.x, selY = sel?.y;
  useEffect(() => {
    if (selX === undefined || selY === undefined) return;
    const z = Math.max(viewRef.current.s / fit || 1, 2.1);
    // shift the focus point up when a bottom inset (mobile sheet) hides part of the map
    const shift = bottomInset / 2 / (fit * z);
    flyTo({ cx: selX, cy: selY + shift, z });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selX, selY, bottomInset]);

  // Active neighborhood → fly to it.
  const area = areas.find((a) => a.slug === activeArea);
  const arX = area?.geo.x, arY = area?.geo.y, arR = area?.geo.r;
  useEffect(() => {
    if (arX === undefined || arY === undefined || !arR) return;
    flyTo({ cx: arX, cy: arY, z: Math.min(3, 520 / arR / 1.8) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arX, arY, arR]);

  const zoomBy = (f: number) => setView((v) => clamp({ ...v, s: (v.s || fit) * f }));
  const reset = () => { onSelect?.(null); onArea?.(null); flyTo({ cx: 500, cy: 500, z: 1 }); };

  /* ---------- gestures ---------- */
  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy, moved: false };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s };
      drag.current = null;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const next = pinch.current.s * (d / pinch.current.d);
      setView((v) => clamp({ ...v, s: next }));
    } else if (drag.current) {
      const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
      if (!drag.current.moved && Math.hypot(dx, dy) > 5) {
        drag.current.moved = true;
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
      }
      if (drag.current.moved) {
        cancelAnimationFrame(raf.current);
        const d = drag.current;
        setView((v) => clamp({ ...v, cx: d.cx - dx / s, cy: d.cy - dy / s }));
      }
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  };

  useEffect(() => {
    const el = box.current;
    if (!el || !interactive) return;
    const wheel = (e: WheelEvent) => {
      // Only capture the wheel for ctrl/meta-zoom or when the map is the focused element, so page scroll isn't trapped.
      if (!(e.ctrlKey || e.metaKey || document.activeElement === el)) return;
      e.preventDefault();
      setView((v) => clamp({ ...v, s: (v.s || fit) * Math.exp(-e.deltaY * 0.0015) }));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [clamp, fit, interactive]);

  const onKey = (e: React.KeyboardEvent) => {
    const step = 60 / s;
    if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomBy(1.3); }
    else if (e.key === "-") { e.preventDefault(); zoomBy(1 / 1.3); }
    else if (e.key === "0") { e.preventDefault(); reset(); }
    else if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      setView((v) => clamp({ ...v, cx: v.cx + (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0), cy: v.cy + (e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0) }));
    }
  };

  /* ---------- clustering ---------- */
  const { singles, clusters } = useMemo(() => {
    const keep = new Set([selectedId, hoverId].filter(Boolean) as string[]);
    if (!cluster || zoom >= 1.7) return { singles: markers, clusters: [] as { x: number; y: number; ids: string[] }[] };
    const cell = 64 / s;
    const groups = new Map<string, MapMarker[]>();
    for (const m of markers) {
      if (keep.has(m.id)) continue;
      const k = `${Math.floor(m.x / cell)}:${Math.floor(m.y / cell)}`;
      groups.set(k, [...(groups.get(k) ?? []), m]);
    }
    const singles: MapMarker[] = markers.filter((m) => keep.has(m.id));
    const clusters: { x: number; y: number; ids: string[] }[] = [];
    groups.forEach((g) => {
      if (g.length === 1) singles.push(g[0]);
      else clusters.push({ x: g.reduce((a, m) => a + m.x, 0) / g.length, y: g.reduce((a, m) => a + m.y, 0) / g.length, ids: g.map((m) => m.id) });
    });
    return { singles, clusters };
  }, [markers, cluster, zoom, s, selectedId, hoverId]);

  const vbW = size.w / s, vbH = size.h / s;
  const vb = `${view.cx - vbW / 2} ${view.cy - vbH / 2} ${vbW} ${vbH}`;
  const inv = 1 / s; // marker & label scale: constant screen size
  const labelsShown = zoom < 4.5;

  return (
    <div
      ref={box}
      role="group"
      tabIndex={interactive ? 0 : -1}
      aria-label={label ?? t.listings.demoMapTitle}
      onKeyDown={interactive ? onKey : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`relative isolate select-none overflow-hidden bg-[var(--map-land)] ${interactive ? "touch-none" : ""} ${className}`}
      style={{ touchAction: interactive ? "none" : undefined }}
    >
      <svg viewBox={vb} className="absolute inset-0 h-full w-full" aria-hidden={false}>
        <title>{t.common.demoMap}</title>
        <rect x="-3000" y="-3000" width="7000" height="7000" fill="var(--map-land)" />
        {/* sea & harbour */}
        <path d="M1000 380 C930 430 960 560 925 640 C890 725 965 800 940 880 C915 960 975 990 1000 1010 L3000 1010 L3000 380Z" fill="var(--map-water)" />
        <path d="M-1000 1010 L120 1010 C150 920 240 872 330 850 C378 905 400 965 422 1010 L-1000 1010Z M-1000 1010 L3000 1010 L3000 3000 L-1000 3000Z" fill="var(--map-water)" />
        <path d="M930 640 C900 725 965 800 940 880" fill="none" stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* parks & ridges */}
        <ellipse cx="130" cy="560" rx="105" ry="80" fill="var(--map-park)" />
        <ellipse cx="260" cy="300" rx="95" ry="70" fill="var(--map-park)" opacity="0.8" />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ellipse key={k} cx="800" cy="205" rx={30 + k * 24} ry={22 + k * 17} fill="none" stroke="var(--ink-mute)" strokeWidth="1" opacity={0.35} vectorEffect="non-scaling-stroke" />
        ))}
        {/* street network */}
        <g fill="none" stroke="var(--map-road)" strokeLinecap="round">
          <path d="M-20 520 C200 470 360 540 520 520 S800 420 1020 470" strokeWidth="9" />
          <path d="M610 -20 C600 160 520 380 520 520 S470 760 450 1010" strokeWidth="9" />
          <path d="M250 290 C340 320 430 330 610 330 S760 250 800 210" strokeWidth="6" />
          <path d="M290 720 C380 700 480 640 520 520" strokeWidth="6" />
          <path d="M520 520 C600 600 740 640 820 700" strokeWidth="6" />
          <path d="M130 560 C200 600 240 660 290 720" strokeWidth="5" />
          <path d="M250 300 C210 400 170 480 130 560" strokeWidth="5" />
          <path d="M610 330 C680 420 720 520 820 700" strokeWidth="4" />
          <path d="M-20 300 C100 280 180 300 250 300" strokeWidth="4" />
          <path d="M450 860 C470 780 500 700 520 520" strokeWidth="4" />
        </g>
        <g stroke="var(--line-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {Array.from({ length: 11 }, (_, i) => <path key={`v${i}`} d={`M${i * 100} 0V1000`} vectorEffect="non-scaling-stroke" />)}
          {Array.from({ length: 11 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 100}H1000`} vectorEffect="non-scaling-stroke" />)}
        </g>

        {/* neighborhoods */}
        {areas.map((a) => {
          const on = activeArea === a.slug;
          return (
            <g key={a.slug}>
              <circle
                cx={a.geo.x} cy={a.geo.y} r={a.geo.r}
                fill={on ? "var(--copper)" : "transparent"} fillOpacity={on ? 0.12 : 0}
                stroke={on ? "var(--copper)" : "var(--ink-mute)"} strokeWidth={on ? 1.6 : 1} strokeDasharray="4 5" vectorEffect="non-scaling-stroke"
                className="cursor-pointer transition-[fill-opacity]"
                onClick={() => onArea?.(on ? null : a.slug)}
              />
              {labelsShown && (
                <text transform={`translate(${a.geo.x} ${a.geo.y - a.geo.r - 8 * inv}) scale(${inv})`} textAnchor="middle" className="annot-ar-ok" fill={on ? "var(--copper)" : "var(--ink-soft)"} fontSize="11" fontFamily="var(--f-mono)" letterSpacing={lang === "ar" ? 0 : 1.6} style={{ pointerEvents: "none", textTransform: lang === "ar" ? "none" : "uppercase" }}>
                  {tr(a.name, lang)}
                </text>
              )}
            </g>
          );
        })}

        {/* clusters */}
        {clusters.map((c) => (
          <g key={`${c.x}-${c.y}`} transform={`translate(${c.x} ${c.y}) scale(${inv})`} className="cursor-pointer" role="button" tabIndex={0}
            aria-label={`${c.ids.length} ${t.common.listings.replace("{n} ", "")}`}
            onClick={() => flyTo({ cx: c.x, cy: c.y, z: Math.max(zoom * 2.2, 2) })}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flyTo({ cx: c.x, cy: c.y, z: Math.max(zoom * 2.2, 2) }); } }}>
            <circle r="22" fill="var(--forest)" />
            <circle r="26" fill="none" stroke="var(--forest)" strokeWidth="1" />
            <text textAnchor="middle" dy="5" fill="var(--on-forest)" fontSize="14" fontWeight="700">{c.ids.length}</text>
          </g>
        ))}

        {/* markers (selected / hovered rendered last so they sit on top) */}
        {[...singles].sort((a, b) => Number(a.id === selectedId || a.id === hoverId) - Number(b.id === selectedId || b.id === hoverId)).map((m) => {
          const on = m.id === selectedId;
          const hot = on || m.id === hoverId;
          const w = Math.max(54, m.label.length * 8 + 18);
          return (
            <g key={m.id} transform={`translate(${m.x} ${m.y}) scale(${inv})`} className="cursor-pointer" role="button" tabIndex={0}
              aria-label={m.title ? `${m.title} — ${m.label}` : m.label} aria-pressed={on}
              onClick={(e) => { e.stopPropagation(); onSelect?.(on ? null : m.id); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(on ? null : m.id); } }}>
              {/* 44px touch target */}
              <rect x={-Math.max(w / 2, 22)} y="-50" width={Math.max(w, 44)} height="50" fill="transparent" />
              <path d={`M0 0 L-6 -10 L6 -10Z`} fill={hot ? "var(--copper)" : "var(--ink)"} />
              <rect x={-w / 2} y="-36" width={w} height="26" rx="0" fill={hot ? "var(--copper)" : "var(--ink)"} stroke="var(--paper)" strokeWidth="1.5" />
              {m.kind === "development" && <rect x={-w / 2} y="-36" width="4" height="26" fill="var(--forest-2)" />}
              <text textAnchor="middle" y="-18" fill={hot ? "#fff" : "var(--paper)"} fontSize="12" fontWeight="700" fontFamily="var(--f-sans)" style={{ pointerEvents: "none" }}>{m.label}</text>
              {hot && <circle r="5" fill="var(--copper)" opacity="0.4"><animate attributeName="r" values="4;16;4" dur="2s" repeatCount="indefinite" /></circle>}
            </g>
          );
        })}
      </svg>

      {/* compass / scale (decorative) */}
      <div className="annot pointer-events-none absolute start-3 top-3 grid gap-1 bg-paper/80 px-2 py-1.5" aria-hidden>
        <span>N ↑</span>
      </div>
      {badge && (
        <div className="annot pointer-events-none absolute bottom-3 start-3 max-w-[70%] bg-paper/85 px-2 py-1" style={{ bottom: 12 + bottomInset }}>
          {t.common.demoMap}
        </div>
      )}
      {controls && interactive && (
        <div className="absolute end-3 top-3 z-10 grid gap-1.5">
          <button type="button" className="icon-btn" onClick={() => zoomBy(1.4)} aria-label={t.listings.zoomIn}><Plus size={18} /></button>
          <button type="button" className="icon-btn" onClick={() => zoomBy(1 / 1.4)} aria-label={t.listings.zoomOut}><Minus size={18} /></button>
          <button type="button" className="icon-btn" onClick={reset} aria-label={t.listings.resetMap}><LocateFixed size={18} /></button>
        </div>
      )}
    </div>
  );
}
