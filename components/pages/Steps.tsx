/** Editorial numbered process list: big numerals, hairlines, asymmetric columns. Server-renderable. */
export function Steps({ items, label }: { items: { t: string; d: string }[]; label?: string }) {
  return (
    <ol className="border-t border-line">
      {items.map((s, i) => (
        <li key={s.t} className="grid items-baseline gap-x-8 gap-y-2 border-b border-line py-6 md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1.3fr)]">
          <span className="numeral text-5xl text-copper md:text-6xl" aria-label={label ? `${label} ${i + 1}` : undefined}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="display h-sm">{s.t}</h3>
          <p className="text-soft text-pretty">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}
