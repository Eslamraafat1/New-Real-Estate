import type { CSSProperties } from "react";

/** Deterministic seeded generator, so server and client render identical skylines. */
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

function buildings(seed: number, minH: number, maxH: number, minW: number, maxW: number) {
  const rnd = seeded(seed);
  const out: { x: number; w: number; h: number }[] = [];
  for (let x = -20; x < 1460;) {
    const w = Math.round(minW + rnd() * (maxW - minW));
    out.push({ x, w, h: Math.round(minH + rnd() * (maxH - minH)) });
    x += w + Math.round(rnd() * 6);
  }
  return out;
}

const LAYERS = [
  { id: "far", seed: 11, min: 60, max: 190, wmin: 40, wmax: 90, o: 0.07, win: 0 },
  { id: "mid", seed: 29, min: 90, max: 250, wmin: 50, wmax: 110, o: 0.14, win: 0.35 },
  { id: "near", seed: 53, min: 70, max: 300, wmin: 60, wmax: 130, o: 0.24, win: 0.85 },
] as const;

/** Three silhouette layers with dusk-lit windows. Each layer is an absolutely stacked SVG carrying `data-depth` for the parallax scene. */
export function Skyline() {
  return (
    <>
      {LAYERS.map((l, i) => (
        <svg key={l.id} data-depth={i + 1} viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[46svh] min-h-[220px] w-full overflow-visible" aria-hidden>
          <defs>
            <pattern id={`sk-win-${l.id}`} width="9" height="14" patternUnits="userSpaceOnUse"><rect x="2" y="3" width="3" height="4" fill="var(--copper)" /></pattern>
          </defs>
          {buildings(l.seed, l.min, l.max, l.wmin, l.wmax).map((b, k) => (
            <g key={k}>
              <rect x={b.x} y={360 - b.h} width={b.w} height={b.h + 600} fill="var(--paper)" fillOpacity={l.o} />
              {l.win > 0 && <rect x={b.x} y={360 - b.h + 6} width={b.w} height={b.h - 6} fill={`url(#sk-win-${l.id})`} opacity={l.win} />}
            </g>
          ))}
        </svg>
      ))}
    </>
  );
}

const STARS = [[8, 8], [17, 20], [26, 6], [34, 15], [43, 9], [52, 22], [61, 7], [70, 17], [79, 11], [88, 24], [94, 8], [13, 31], [58, 33], [84, 36]] as const;

export function Stars() {
  return (
    <>
      {STARS.map(([x, y], i) => (
        <span key={i} className="fxb-twinkle absolute size-[3px] bg-paper" style={{ insetInlineStart: `${x}%`, top: `${y}%`, "--fd": `${4 + (i % 4)}s`, "--fl": `${(i % 5) * 0.7}s` } as CSSProperties} aria-hidden />
      ))}
    </>
  );
}
