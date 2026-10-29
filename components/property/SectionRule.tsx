"use client";

import type { CSSProperties } from "react";
import { Reveal } from "@/components/ui/Reveal";

/** A hairline that draws itself (stroke-dash) the first time it enters the viewport. */
export function SectionRule({ className = "" }: { className?: string }) {
  return (
    <Reveal className={`pointer-events-none ${className}`} threshold={0.9}>
      <svg aria-hidden viewBox="0 0 1000 2" preserveAspectRatio="none" className="block h-[2px] w-full text-ink" fill="none">
        <path d="M0 1H1000" pathLength={1} stroke="currentColor" strokeOpacity={0.45} strokeWidth={1} className="draw" style={{ ["--len"]: 1 } as CSSProperties} />
      </svg>
    </Reveal>
  );
}
