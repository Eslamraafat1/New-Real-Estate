"use client";

import { useFormat } from "@/lib/hooks";
import { CountTo } from "./CountTo";

export type LedgerCell = { label: string; note: string; value: number; kind: "num" | "area" };

/** Large count-up numerals separated by hairlines, each with a small annotation. Count-ups run once when visible. */
export function Ledger({ cells }: { cells: LedgerCell[] }) {
  const f = useFormat();
  const unit = f.area(1).replace(/[\d\s.,٠-٩٫٬]+/g, "") || "m²";
  return (
    <dl className="grid border-y border-ink" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(10.5rem, 1fr))" }}>
      {cells.map((c, i) => (
        <div key={c.label} className={`relative grid min-w-0 content-between gap-6 px-4 py-5 md:px-5 ${i > 0 ? "border-s border-line" : ""} max-sm:border-b max-sm:border-line`}>
          <dt className="annot annot-ar-ok flex items-center justify-between gap-2">
            <span>{c.label}</span>
            <span className="num opacity-60">{f.num(i + 1, { minimumIntegerDigits: 2 })}</span>
          </dt>
          <dd className="m-0 grid gap-2">
            <span className="numeral flex items-baseline gap-1.5 text-[clamp(3.2rem,6.5vw,5.6rem)] leading-none">
              <CountTo to={c.value} format={(n) => f.num(n)} />
              {c.kind === "area" && <span className="annot annot-ar-ok !text-copper text-[0.28em]">{unit}</span>}
            </span>
            <span className="annot annot-ar-ok border-t border-line pt-2">{c.note}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
