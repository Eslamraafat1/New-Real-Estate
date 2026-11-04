"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Minus, Plus, RotateCcw } from "lucide-react";
import type { FloorPlan, Room } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { useFormat, useReducedMotion } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";

const PAD = 4;
const MIN_K = 1;
const MAX_K = 4;
const CHAR_W = 0.56; // average glyph width, in em, used to decide whether a label fits
const MIN_LABEL_PX = 8.5; // below this on-screen size a label is replaced by the room number
type View = { k: number; x: number; y: number };
const HOME: View = { k: 1, x: 0, y: 0 };

type Label = { lines: string[]; fs: number };

/** Largest font size (plan units) at which the name fits the room on one or two lines. */
function fitLabel(name: string, w: number, h: number): Label {
  const words = name.split(/\s+/).filter(Boolean);
  const candidates: string[][] = [[name]];
  if (words.length > 1) {
    let best: string[] = [];
    let bestMax = Infinity;
    for (let i = 1; i < words.length; i++) {
      const l1 = words.slice(0, i).join(" ");
      const l2 = words.slice(i).join(" ");
      const m = Math.max(l1.length, l2.length);
      if (m < bestMax) { bestMax = m; best = [l1, l2]; }
    }
    candidates.push(best);
  }
  let out: Label = { lines: [name], fs: 0 };
  for (const lines of candidates) {
    const longest = Math.max(...lines.map((l) => l.length));
    const fs = Math.min((w - 2.2) / (longest * CHAR_W), (h - 3) / (lines.length * 1.25), 3);
    if (fs > out.fs) out = { lines, fs };
  }
  return out;
}

/** Quarter-circle door swing on one wall of a room. */
function doorGeom(r: Room, edge: "top" | "bottom") {
  const dw = Math.min(4.2, r.w * 0.38);
  const x = r.x + Math.min(3, r.w * 0.16);
  const y = edge === "bottom" ? r.y + r.h : r.y;
  const dir = edge === "bottom" ? -1 : 1;
  return {
    gap: `M${x} ${y}H${x + dw}`,
    leaf: `M${x} ${y}V${y + dir * dw}`,
    arc: `M${x} ${y + dir * dw}A${dw} ${dw} 0 0 ${edge === "bottom" ? 1 : 0} ${x + dw} ${y}`,
  };
}

/**
 * Interactive SVG floor-plan viewer. Rooms are focusable buttons synchronised with a room list.
 * Pan/zoom is plain React state on a <g transform>; the selection outline is a framer-motion rect;
 * the wall draw-on and fills are CSS (one animation system per element).
 * Names are drawn only when they fit at the current zoom, otherwise the list number is shown;
 * the full name is always in the side list, the tooltip and the aria-label.
 * Dimensions are shown only when `room.areaM2` exists.
 */
export function FloorPlanViewer({ plan, propertyTitle, className = "", onShowGallery }: { plan: FloorPlan; propertyTitle?: string; className?: string; onShowGallery?: () => void }) {
  const { t, lang } = useApp();
  const p = t.property.plan;
  const f = useFormat();
  const reduce = useReducedMotion();
  const uid = useId();

  const [floorIdx, setFloorIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState<View>(HOME);
  const [seen, setSeen] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [box, setBox] = useState({ w: 640, h: 480 });

  const floor = plan.floors[Math.min(floorIdx, plan.floors.length - 1)];
  const [vw, vh] = floor.viewBox;
  const W = vw + PAD * 2;
  const H = vh + PAD * 2;
  const asset = plan.assets?.[floor.id];
  const room = useMemo(() => floor.rooms.find((r) => r.id === selected) ?? null, [floor, selected]);

  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; k: number } | null>(null);
  const suppressClick = useRef(false);

  // Track the frame size (for on-screen label sizes) and start the wall draw-on once visible.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver((es) => {
      const r = es[0]?.contentRect;
      if (r && r.width) setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const io = new IntersectionObserver((es) => {
      if (es[0]?.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  // Draw on (and re-draw when the floor changes). The state flips in rAF callbacks, never in the effect body.
  useEffect(() => {
    if (!seen) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setDrawn(true)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [seen, floorIdx]);
  const on = reduce || drawn;

  const changeFloor = (i: number) => { setDrawn(false); setFloorIdx(i); setSelected(null); setHover(null); setView(HOME); };

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

  const reset = () => { changeFloor(0); };

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

  // Geometry derived from the rooms: outer envelope and the row each room sits in.
  const geo = useMemo(() => {
    const rs = floor.rooms;
    if (!rs.length) return { x0: 0, y0: 0, x1: vw, y1: vh };
    return {
      x0: Math.min(...rs.map((r) => r.x)), y0: Math.min(...rs.map((r) => r.y)),
      x1: Math.max(...rs.map((r) => r.x + r.w)), y1: Math.max(...rs.map((r) => r.y + r.h)),
    };
  }, [floor, vw, vh]);
  const ppu = Math.min(box.w / W, box.h / H) * view.k; // on-screen pixels per plan unit

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
                onClick={() => changeFloor(i)}
              >{tr(fl.label, lang)}</button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative min-w-0">
          <div
            ref={frameRef}
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
                    <g key={floor.id}>
                      {/* 1. room fills + hit areas */}
                      {floor.rooms.map((r, i) => {
                        const isOn = r.id === selected;
                        const isHover = r.id === hover && !isOn;
                        const name = tr(r.name, lang);
                        const lab = fitLabel(name, r.w, r.h);
                        const showName = lab.fs * ppu >= MIN_LABEL_PX;
                        const numFs = Math.max(1.2, Math.min(2.6, Math.min(r.w, r.h) * 0.3));
                        const showNum = !showName && Math.min(r.w, r.h) * ppu >= 13;
                        const cx = r.x + r.w / 2;
                        const cy = r.y + r.h / 2;
                        return (
                          <g
                            key={r.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`${f.num(i + 1)}. ${name}. ${dims(r.areaM2)}`}
                            aria-pressed={isOn}
                            className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[var(--copper)] [&:focus-visible>rect]:stroke-[0.9]"
                            onClick={() => pick(r.id)}
                            onPointerEnter={() => setHover(r.id)}
                            onPointerLeave={() => setHover((h) => (h === r.id ? null : h))}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setSelected((s) => (s === r.id ? null : r.id)); } }}
                          >
                            <title>{name}</title>
                            <rect
                              x={r.x} y={r.y} width={r.w} height={r.h}
                              stroke="transparent" strokeWidth={0.4}
                              style={{
                                fill: isOn ? "var(--copper)" : "var(--paper-2)",
                                fillOpacity: isOn ? 0.34 : isHover ? 0.85 : 0.5,
                                transition: reduce ? "none" : "fill-opacity .7s ease, fill .7s ease",
                              }}
                            />
                            {showName && (
                              <text
                                textAnchor="middle" fontSize={lab.fs} fill="var(--ink)"
                                style={{ pointerEvents: "none", fontFamily: "var(--f-sans)", fontWeight: 500 }}
                              >
                                {lab.lines.map((ln, li) => (
                                  <tspan key={li} x={cx} y={cy + (li - (lab.lines.length - 1) / 2) * lab.fs * 1.2 + lab.fs * 0.35}>{ln}{li < lab.lines.length - 1 ? " " : null}</tspan>
                                ))}
                              </text>
                            )}
                            {showNum && (
                              <g style={{ pointerEvents: "none" }}>
                                <circle cx={cx} cy={cy} r={numFs * 0.95} fill="var(--surface)" stroke="var(--ink)" strokeWidth={0.25} />
                                <text x={cx} y={cy + numFs * 0.36} textAnchor="middle" fontSize={numFs} fill="var(--ink)" style={{ fontFamily: "var(--f-mono)", fontVariantNumeric: "tabular-nums" }}>{f.num(i + 1)}</text>
                              </g>
                            )}
                          </g>
                        );
                      })}

                      {/* 2. thin inner walls (draw on) */}
                      <g fill="none" stroke="var(--ink)" strokeWidth={0.35} strokeLinejoin="miter" style={{ pointerEvents: "none" }} aria-hidden>
                        {floor.rooms.map((r, i) => (
                          <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} pathLength={1} className="pd-wall" data-on={on ? 1 : 0} style={{ transitionDelay: reduce ? undefined : `${0.25 + i * 0.09}s` }} />
                        ))}
                      </g>

                      {/* 3. doors */}
                      <g className="pd-fade" data-on={on ? 1 : 0} aria-hidden style={{ pointerEvents: "none" }} fill="none">
                        {floor.rooms.map((r) => {
                          if (r.w < 9 || r.h < 9) return null;
                          const bottomRow = Math.abs(r.y + r.h - geo.y1) < 0.1;
                          const topRow = Math.abs(r.y - geo.y0) < 0.1;
                          const edge = topRow && !bottomRow ? "bottom" : bottomRow && !topRow ? "top" : "bottom";
                          const d = doorGeom(r, edge);
                          return (
                            <g key={r.id}>
                              <path d={d.gap} stroke="var(--surface)" strokeWidth={0.95} />
                              <path d={d.leaf} stroke="var(--ink)" strokeWidth={0.25} />
                              <path d={d.arc} stroke="var(--ink-mute)" strokeWidth={0.2} strokeDasharray="0.6 0.5" />
                            </g>
                          );
                        })}
                      </g>

                      {/* 4. thick outer wall */}
                      <rect
                        x={geo.x0} y={geo.y0} width={geo.x1 - geo.x0} height={geo.y1 - geo.y0}
                        fill="none" stroke="var(--ink)" strokeWidth={1.5} strokeLinejoin="miter" pathLength={1}
                        className="pd-wall" data-on={on ? 1 : 0} style={{ pointerEvents: "none" }} aria-hidden
                      />

                      {room && (
                        <motion.rect
                          aria-hidden
                          pointerEvents="none"
                          fill="none" stroke="var(--copper)" strokeWidth={0.9}
                          initial={false}
                          animate={{ x: room.x, y: room.y, width: room.w, height: room.h }}
                          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26 }}
                        />
                      )}
                    </g>
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

        <div className="grid min-w-0 content-start gap-3">
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
            <ul aria-label={p.rooms} className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-1">
              {floor.rooms.map((r, i) => {
                const isOn = r.id === selected;
                return (
                  <li key={r.id} className="border-b border-line">
                    <button
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => setSelected(isOn ? null : r.id)}
                      onPointerEnter={() => setHover(r.id)}
                      onPointerLeave={() => setHover((h) => (h === r.id ? null : h))}
                      className={`flex min-h-[44px] w-full items-center gap-3 px-2 py-1.5 text-start text-sm transition-colors ${isOn ? "bg-copper text-white" : "hover:bg-paper2"}`}
                    >
                      <span className="annot !text-inherit num w-6 shrink-0">{f.num(i + 1)}</span>
                      <span className="min-w-0 grow">{tr(r.name, lang)}</span>
                      {r.areaM2 ? <span className={`annot annot-ar-ok !text-inherit ${isOn ? "" : "opacity-70"}`}>{f.area(r.areaM2)}</span> : null}
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
