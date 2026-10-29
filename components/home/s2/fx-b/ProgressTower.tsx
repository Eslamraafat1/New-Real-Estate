import type { CSSProperties } from "react";

const TOWER = "M6 200V152H24V120H38V86H52V48H60V12H64V48H76V94H90V130H114V200Z";
const WINDOWS = Array.from({ length: 19 }, (_, i) => 16 + i * 10);

function Tower({ id, fill }: { id: string; fill: boolean }) {
  return (
    <svg viewBox="0 0 120 200" className="absolute inset-0 size-full" aria-hidden preserveAspectRatio="xMidYMax meet">
      <defs><clipPath id={id}><path d={TOWER} /></clipPath></defs>
      <path d={TOWER} fill={fill ? "var(--copper)" : "var(--surface)"} />
      <g clipPath={`url(#${id})`} stroke={fill ? "var(--paper)" : "var(--line)"} strokeWidth="1" opacity={fill ? 0.55 : 0.9}>
        {WINDOWS.map((y) => <line key={y} x1="0" x2="120" y1={y} y2={y} strokeDasharray="3 4" />)}
      </g>
      {!fill && <path d={TOWER} fill="none" stroke="var(--ink-mute)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

/** Stylised stepped tower. The copper copy is revealed from the ground up to `progress` % (CSS clip, armed by <InView>). */
export function ProgressTower({ slug, progress, className = "" }: { slug: string; progress: number; className?: string }) {
  const p = Math.max(0, Math.min(100, progress));
  return (
    <div className={`relative aspect-[3/5] ${className}`} style={{ "--p": p } as CSSProperties}>
      <Tower id={`tw-b-${slug}`} fill={false} />
      <div className="fxb-tower-fill absolute inset-0"><Tower id={`tw-f-${slug}`} fill /></div>
      <span className="fxb-tower-line pointer-events-none absolute inset-x-[-6%] h-px bg-copper" aria-hidden />
      <span className="absolute inset-x-0 bottom-0 h-px bg-ink" aria-hidden />
    </div>
  );
}
