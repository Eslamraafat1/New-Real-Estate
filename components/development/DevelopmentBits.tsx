"use client";

import type { Completion } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { useFormat } from "@/lib/hooks";
import { fmt } from "@/lib/i18n";

/** Explicit status label — never colour alone. */
export function StatusBadge({ status }: { status: Completion }) {
  const { t } = useApp();
  const d = t.property.dev;
  const label = status === "ready" ? d.statusReady : status === "under-construction" ? d.statusUnder : d.statusOff;
  const tone = status === "ready" ? "bg-forest !text-onforest" : status === "under-construction" ? "bg-copper !text-white" : "bg-surface !text-ink border border-line";
  return <span className={`annot annot-ar-ok inline-block px-2 py-1 ${tone}`}>{label}</span>;
}

/** Sample construction progress bar (0-100). */
export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const { t } = useApp();
  const f = useFormat();
  const d = t.property.dev;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="annot annot-ar-ok">{d.progress}</span>
        <span className="num annot annot-ar-ok !text-ink">{fmt(d.progressValue, { n: f.num(v) })}</span>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={d.progress} className="relative mt-2 h-1.5 bg-line">
        <div className="absolute inset-y-0 start-0 bg-copper" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
