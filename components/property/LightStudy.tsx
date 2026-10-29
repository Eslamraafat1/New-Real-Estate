"use client";

import { useId, useState, type CSSProperties } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Reveal } from "@/components/ui/Reveal";
import { useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import type { Property } from "@/lib/api/types";

type Stop = { t: number; b: number; s: number; sep: number; o: [number, number, number, number] };
/** Illustrative colour grade through the day: warm dawn, neutral noon, amber dusk, blue night. */
const STOPS: Stop[] = [
  { t: 6, b: 0.82, s: 0.85, sep: 0.28, o: [255, 160, 100, 0.32] },
  { t: 8.5, b: 0.98, s: 1.05, sep: 0.1, o: [255, 214, 160, 0.14] },
  { t: 12.5, b: 1.06, s: 1.02, sep: 0, o: [255, 255, 255, 0] },
  { t: 16.5, b: 1, s: 1.1, sep: 0.12, o: [255, 200, 120, 0.12] },
  { t: 18.5, b: 0.88, s: 1.25, sep: 0.3, o: [255, 140, 60, 0.28] },
  { t: 19.8, b: 0.66, s: 1, sep: 0.25, o: [150, 70, 90, 0.32] },
  { t: 21, b: 0.42, s: 0.7, sep: 0, o: [14, 28, 78, 0.55] },
];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function grade(t: number) {
  let i = STOPS.findIndex((s) => s.t >= t);
  if (i <= 0) i = 1;
  const a = STOPS[i - 1];
  const b = STOPS[i];
  const k = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const o = a.o.map((v, j) => lerp(v, b.o[j], k));
  return {
    filter: `brightness(${lerp(a.b, b.b, k).toFixed(3)}) saturate(${lerp(a.s, b.s, k).toFixed(3)}) sepia(${lerp(a.sep, b.sep, k).toFixed(3)})`,
    overlay: `rgba(${Math.round(o[0])},${Math.round(o[1])},${Math.round(o[2])},${o[3].toFixed(3)})`,
  };
}

const SUNSET = 19.5;
const periodOf = (t: number) => (t < 7 ? "dawn" : t < 11 ? "morning" : t < 14 ? "noon" : t < 17 ? "afternoon" : t < 19 ? "golden" : t < 20.25 ? "dusk" : "night") as "dawn" | "morning" | "noon" | "afternoon" | "golden" | "dusk" | "night";
const STARS: [number, number, number][] = [[60, 28, 1.2], [118, 52, 0.9], [170, 22, 1.3], [236, 40, 0.9], [296, 24, 1.2], [344, 58, 0.9], [90, 84, 0.8], [318, 90, 0.8]];
const TICKS = [6, 9, 12, 15, 18];

/** Interactive day-cycle: a time slider regrades the cover photo and moves a sun along an SVG arc. */
export function LightStudy({ property: p, num }: { property: Property; num: string }) {
  const { t, lang, dir } = useApp();
  const f = useFormat();
  const L = t.property.cine.light;
  const [time, setTime] = useState(12.5);
  const sliderId = useId();
  const rtl = dir === "rtl";
  const story = p.story?.light;
  const cover = p.images[0];
  if (!story) return null;

  const g = grade(time);
  const period = periodOf(time);
  const hh = Math.floor(time);
  const mm = Math.round((time - hh) * 60);
  const clock = `${f.num(hh, { minimumIntegerDigits: 2 })}:${f.num(mm, { minimumIntegerDigits: 2 })}`;
  const valueText = fmt(L.valueText, { time: clock, period: L[period] });

  // sun on the arc (viewBox 400 x 150, horizon at y = 130)
  const u = Math.min(1.1, Math.max(0, (time - 6) / (SUNSET - 6)));
  const ang = Math.PI * u;
  const sx0 = 200 - 170 * Math.cos(ang);
  const sy = 130 - 110 * Math.sin(ang);
  const X = (x: number) => (rtl ? 400 - x : x);
  const sunVis = u <= 0.03 ? u / 0.03 : u >= 0.97 ? Math.max(0, (1.03 - u) / 0.06) : 1;
  const stars = Math.min(1, Math.max(0, (time - 19.6) / 1.2));
  const tickX = (h: number) => 200 - 170 * Math.cos((Math.PI * (h - 6)) / (SUNSET - 6));

  const presets: { key: "dawn" | "noon" | "golden" | "night"; at: number }[] = [
    { key: "dawn", at: 6.5 }, { key: "noon", at: 12.5 }, { key: "golden", at: 18 }, { key: "night", at: 21 },
  ];
  const track = `linear-gradient(${rtl ? "to left" : "to right"}, #f2a56b 0%, #f6dcae 18%, #f7f3e6 45%, #f0b25f 72%, #b5564a 88%, #1c2a5a 100%)`;
  const heading = t.property.story.light;

  return (
    <section id="story-light" aria-labelledby="story-light-h" className="scroll-mt-32">
    <Reveal as="article" className="grid gap-x-8 gap-y-6 lg:grid-cols-[6.5rem_minmax(0,1fr)]">
      <div aria-hidden className="self-start lg:sticky lg:top-36">
        <span className="numeral num pd-outline block text-[clamp(4.5rem,9vw,6.5rem)]">{num}</span>
      </div>
      <div className="grid min-w-0 gap-8">
        <header>
          <p className="annot annot-ar-ok !text-copper">{L.eyebrow}</p>
          <h2 id="story-light-h" className="display h-md mt-3">{heading}</h2>
        </header>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <div className="pd-mask relative aspect-[4/3] overflow-hidden bg-paper2">
              <div className="pd-mask-img absolute inset-0">
                {cover && (
                  <div className="absolute inset-0 transition-[filter] duration-300 ease-linear" style={{ filter: g.filter }}>
                    <AtlasImage src={cover.src} alt={tr(cover.alt, lang)} fill sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 60vw, 100vw" className="object-cover" />
                  </div>
                )}
                <div aria-hidden className="pointer-events-none absolute inset-0 transition-colors duration-300 ease-linear" style={{ backgroundColor: g.overlay }} />
              </div>
              <p className="annot num pointer-events-none absolute start-3 top-3 bg-paper/90 px-2 py-1 !text-ink" dir="ltr" aria-hidden>{clock}</p>
            </div>
          </div>

          <div className="grid content-start gap-5 xl:col-span-5">
            <p className="annot annot-ar-ok border-s-2 border-copper ps-3 !text-copper">{L.disclaimer}</p>

            <svg viewBox="0 0 400 150" className="h-auto w-full text-ink" role="img" aria-label={`${L.sun}: ${valueText}`}>
              <path d={`M${X(30)} 130A170 110 0 0 ${rtl ? 0 : 1} ${X(370)} 130`} fill="none" stroke="currentColor" strokeOpacity={0.45} strokeDasharray="3 5" />
              <path d="M10 130H390" stroke="currentColor" strokeOpacity={0.6} />
              {STARS.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="currentColor" opacity={stars * 0.7} />)}
              {TICKS.map((h) => (
                <g key={h}>
                  <path d={`M${X(tickX(h))} 126v8`} stroke="currentColor" strokeOpacity={0.6} />
                  <text x={X(tickX(h))} y={147} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.7} style={{ fontFamily: "var(--f-mono)" }}>{f.num(h, { minimumIntegerDigits: 2 })}</text>
                </g>
              ))}
              <g opacity={sunVis}>
                <circle cx={X(sx0)} cy={sy} r={17} fill="var(--copper)" opacity={0.2} />
                <circle cx={X(sx0)} cy={sy} r={8} fill="var(--copper)" />
              </g>
            </svg>

            <div className="grid gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={sliderId} className="annot annot-ar-ok">{L.slider}</label>
                <p className="num display h-md" aria-hidden><span dir="ltr">{clock}</span></p>
              </div>
              <p className="annot annot-ar-ok !text-copper" aria-hidden>{L[period]}</p>
              <input
                id={sliderId}
                type="range"
                className="pd-range"
                min={6}
                max={21}
                step={0.25}
                value={time}
                aria-valuetext={valueText}
                style={{ ["--pd-track"]: track } as CSSProperties}
                onChange={(e) => setTime(Number(e.target.value))}
              />
            </div>

            <div role="group" aria-label={L.presets} className="flex flex-wrap gap-1.5">
              {presets.map((pr) => (
                <button key={pr.key} type="button" className="chip min-h-[44px]" aria-pressed={period === pr.key} onClick={() => setTime(pr.at)}>{L[pr.key]}</button>
              ))}
            </div>
          </div>
        </div>

        <blockquote className="pd-rise relative max-w-[60ch] border-s-2 border-copper ps-5 md:ps-8">
          <span aria-hidden className="pd-qmark absolute -top-2 end-0 text-7xl opacity-60">{lang === "ar" ? "»" : "”"}</span>
          <p className="display h-sm text-pretty !leading-snug">{tr(story, lang)}</p>
        </blockquote>
      </div>
    </Reveal>
    </section>
  );
}
