"use client";

import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Minus, Plus, RotateCcw } from "lucide-react";
import type { FloorPlan } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { useFormat, useReducedMotion } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";

const PAD = 4;
const MIN_K = 1;
const MAX_K = 4;
type View = { k: number; x: number; y: number };
const HOME: View = { k: 1, x: 0, y: 0 };

/**
 * Interactive SVG floor-plan viewer. Rooms are focusable buttons synchronised with a room list.
 * Pan/zoom is plain React state on a <g transform>; the selection outline is a framer-motion rect
 * (one animation system per element). Dimensions are shown only when `room.areaM2` exists.
 */
export function FloorPlanViewer({ plan, propertyTitle, className = "", onShowGallery }: { plan: FloorPlan; propertyTitle?: string; className?: string; onShowGallery?: () => void }) {
  const { t, lang } = useApp();
  const p = t.property.plan;
  const f = useFormat();
  const reduce = useReducedMotion();
  const uid = useId();

  const [floorIdx, setFloorIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>(HOME);

  const floor = plan.floors[Math.min(floorIdx, plan.floors.length - 1)];
  const [vw, vh] = floor.viewBox;
  const W = vw + PAD * 2;
  const H = vh + PAD * 2;
  const asset = plan.assets?.[floor.id];
  const room = useMemo(() => floor.rooms.find((r) => r.id === selected) ?? null, [floor, selected]);

  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; k: number } | null>(null);
  const suppressClick = useRef(false);

  const clamp = useCallback((v: View): View => {
    const k = Math.min(MAX_K, Math.max(MIN_K, v.k));
    return { k, x: Math.min(0, Math.max(W * (1 - k), v.x)), y: Math.min(0, Math.max(H * (1 - k), v.y)) };
  }, [W, H]);

  const zoomTo = useCallback((nk: number) => {
    setView((v) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, nk));
      const cx = W / 2, cy = H / 2;
      const r = k / v.k;
      return clamp({ k, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r });
    });
  }, [W, H, clamp]);

  const reset = () => { setFloorIdx(0); setSelected(null); setView(HOME); };

  const unitsPerPx = () => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return 1;
    return Math.max(W / r.width, H / r.height);
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.k };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
    }
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.d > 0) zoomTo(pinch.current.k * (d / pinch.current.d));
      suppressClick.current = true;
      return;
    }
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) { d.moved = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
    suppressClick.current = true;
    const u = unitsPerPx();
    setView((v) => clamp({ k: v.k, x: d.vx + dx * u, y: d.vy + dy * u }));
  };
  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) { drag.current = null; setTimeout(() => { suppressClick.current = false; }, 0); }
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 6 * view.k;
    const pan = (dx: number, dy: number) => setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
    switch (e.key) {
      case "ArrowLeft": pan(step, 0); break;
      case "ArrowRight": pan(-step, 0); break;
      case "ArrowUp": pan(0, step); break;
      case "ArrowDown": pan(0, -step); break;
      case "+": case "=": zoomTo(view.k * 1.4); break;
      case "-": case "_": zoomTo(view.k / 1.4); break;
      case "0": setView(HOME); break;
      case "Escape": if (selected) setSelected(null); else return; break;
      default: return;
    }
    e.preventDefault();
  };

  const pick = (id: string) => { if (suppressClick.current) return; setSelected((s) => (s === id ? null : id)); };
  const dims = (a?: number) => (a ? f.area(a) : p.dimsMissing);
  const title = propertyTitle ? fmt(p.planOf, { title: propertyTitle }) : p.label;

  return (
    <section className={`grid gap-4 ${className}`} aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {plan.demo && <span className="annot annot-ar-ok border border-copper px-2 py-1 !text-copper">{p.demoBadge}</span>}
          {onShowGallery && <button type="button" className="btn btn-sm" onClick={onShowGallery}><ImageIcon size={14} />{p.gallery}</button>}
        </div>
        {plan.floors.length > 1 && (
          <div role="tablist" aria-label={p.floors} className="flex flex-wrap gap-1">
            {plan.floors.map((fl, i) => (
              <button
                key={fl.id}
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={i === floorIdx}
                className="chip min-h-[44px]"
                data-active={i === floorIdx}
                onClick={() => { setFloorIdx(i); setSelected(null); setView(HOME); }}
              >{tr(fl.label, lang)}</button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative">
          <div
            tabIndex={0}
            role="group"
            aria-label={`${title}. ${p.keysHint}`}
            onKeyDown={onKey}
            className="atlas-grid relative overflow-hidden border border-line bg-surface text-ink"
            style={{ aspectRatio: `${W} / ${H}`, maxHeight: "70vh", width: "100%" }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="absolute inset-0 h-full w-full select-none"
              style={{ touchAction: "none", cursor: view.k > 1 ? "grab" : "default" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
                <g transform={`translate(${PAD} ${PAD})`}>
                  {asset ? (
                    <image href={asset} x={0} y={0} width={vw} height={vh} preserveAspectRatio="xMidYMid meet" aria-label={p.suppliedImage} />
                  ) : (
                    <>
                      <rect x={0} y={0} width={vw} height={vh} fill="none" stroke="var(--ink)" strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
                      {floor.rooms.map((r) => {
                        const on = r.id === selected;
                        const fs = Math.max(1.6, Math.min(3.2, Math.min(r.w / 5.5, r.h / 3)));
                        const name = tr(r.name, lang);
                        return (
                          <g
                            key={r.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`${name}. ${dims(r.areaM2)}`}
                            aria-pressed={on}
                            className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[var(--copper)]"
                            onClick={() => pick(r.id)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setSelected((s) => (s === r.id ? null : r.id)); } }}
                          >
                            <rect
                              x={r.x} y={r.y} width={r.w} height={r.h}
                              stroke="var(--ink)" strokeWidth={0.6} vectorEffect="non-scaling-stroke"
                              style={{ fill: on ? "var(--copper)" : "var(--paper-2)", fillOpacity: on ? 0.28 : 0.55, transition: reduce ? "none" : "fill-opacity .35s, fill .35s" }}
                            />
                            <text
                              x={r.x + r.w / 2} y={r.y + r.h / 2}
                              textAnchor="middle" dominantBaseline="middle"
                              fontSize={fs} fill="var(--ink)" style={{ pointerEvents: "none", fontFamily: "var(--f-mono)" }}
                            >{name}</text>
                          </g>
                        );
                      })}
                      {room && (
                        <motion.rect
                          aria-hidden
                          pointerEvents="none"
                          fill="none" stroke="var(--copper)" strokeWidth={2.2} vectorEffect="non-scaling-stroke"
                          initial={false}
                          animate={{ x: room.x, y: room.y, width: room.w, height: room.h }}
                          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26 }}
                        />
                      )}
                    </>
                  )}
                </g>
              </g>
            </svg>
            <div className="absolute end-2 top-2 flex flex-col gap-1.5">
              <button type="button" className="icon-btn" aria-label={p.zoomIn} onClick={() => zoomTo(view.k * 1.4)} disabled={view.k >= MAX_K}><Plus size={18} /></button>
              <button type="button" className="icon-btn" aria-label={p.zoomOut} onClick={() => zoomTo(view.k / 1.4)} disabled={view.k <= MIN_K}><Minus size={18} /></button>
              <button type="button" className="icon-btn" aria-label={p.reset} title={p.reset} onClick={reset}><RotateCcw size={16} /></button>
            </div>
            <span className="annot pointer-events-none absolute bottom-2 start-3">{fmt(p.zoomLevel, { n: f.num(Math.round(view.k * 10) / 10) })}</span>
          </div>
          <p className="annot mt-2">{p.keysHint}</p>
        </div>

        <div className="grid content-start gap-3">
          <div aria-live="polite" className="border border-line bg-surface p-3 text-sm">
            <p className="annot">{p.selected}</p>
            {room ? (
              <>
                <p className="display h-sm mt-1">{tr(room.name, lang)}</p>
                <p className="num text-soft">{room.areaM2 ? `${p.area}: ${f.area(room.areaM2)}` : p.dimsMissing}</p>
              </>
            ) : (
              <p className="mt-1 text-soft">{asset ? p.suppliedImage : p.selectHint}</p>
            )}
          </div>
          {!asset && (
            <ul aria-label={p.rooms} className="grid border-t border-line">
              {floor.rooms.map((r, i) => {
                const on = r.id === selected;
                return (
                  <li key={r.id} className="border-b border-line">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSelected(on ? null : r.id)}
                      className={`flex min-h-[44px] w-full items-center gap-3 px-2 py-1.5 text-start text-sm transition-colors ${on ? "bg-copper text-white" : "hover:bg-paper2"}`}
                    >
                      <span className="annot !text-inherit num w-6">{f.num(i + 1)}</span>
                      <span className="grow">{tr(r.name, lang)}</span>
                      <span className={`annot annot-ar-ok !text-inherit ${on ? "" : "opacity-70"}`}>{r.areaM2 ? f.area(r.areaM2) : "—"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!asset && floor.rooms.every((r) => !r.areaM2) && <p className="annot annot-ar-ok">{p.dimsMissing}</p>}
        </div>
      </div>
    </section>
  );
}
