/** Sample 0–10 indicator rows drawn as ten hairline ticks. Server-renderable. */
export function ScoreBars({ rows }: { rows: { label: string; value: number; text: string }[] }) {
  return (
    <dl className="grid gap-5">
      {rows.map((r) => (
        <div key={r.label} className="grid gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="annot annot-ar-ok">{r.label}</dt>
            <dd className="annot annot-ar-ok !text-ink num">{r.text}</dd>
          </div>
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={`h-2 flex-1 ${i < r.value ? "bg-forest" : "bg-linesoft"}`} />
            ))}
          </div>
        </div>
      ))}
    </dl>
  );
}
