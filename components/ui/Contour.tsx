import type { CSSProperties } from "react";

/** Deterministic topographic contour lines (server-renderable, no JS). */
function ring(cx: number, cy: number, r: number, seed: number, k: number) {
  const pts: string[] = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const n =
      Math.sin(a * 2 + seed + k * 0.35) * 0.12 +
      Math.sin(a * 3 - seed * 1.7 + k * 0.2) * 0.08 +
      Math.sin(a * 5 + seed * 0.6) * 0.04;
    const rr = r * (1 + n);
    pts.push(`${i ? "L" : "M"}${(cx + Math.cos(a) * rr * 1.5).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join("");
}

export function Contour({ seed = 1, rings = 14, className = "", animate = true, cx = 500, cy = 300 }: {
  seed?: number; rings?: number; className?: string; animate?: boolean; cx?: number; cy?: number;
}) {
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden className={`contour pointer-events-none ${className}`}>
      {Array.from({ length: rings }, (_, k) => {
        const opacity = 0.25 + (k % 5 === 0 ? 0.45 : 0.15);
        const style: CSSProperties = animate
          ? ({ "--len": 3600, animationDelay: `${k * 90}ms`, opacity } as CSSProperties)
          : { opacity };
        return <path key={k} d={ring(cx, cy, 26 + k * 24, seed, k)} className={animate ? "draw" : undefined} style={style} />;
      })}
    </svg>
  );
}
