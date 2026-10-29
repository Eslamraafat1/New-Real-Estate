import type { ReactNode } from "react";

/** Editorial section header: big numeral + eyebrow + display title. */
export function SectionHead({ num, eyebrow, title, intro, align = "start", className = "" }: {
  num?: string; eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "start" | "center"; className?: string;
}) {
  return (
    <header className={`grid gap-4 ${align === "center" ? "text-center justify-items-center" : ""} ${className}`}>
      <div className="flex items-baseline gap-4">
        {num && <span className="annot !text-copper">{num}</span>}
        {eyebrow && <span className="annot">{eyebrow}</span>}
      </div>
      <h2 className="display h-lg max-w-[18ch] text-balance">{title}</h2>
      {intro && <p className="max-w-[56ch] text-soft text-pretty">{intro}</p>}
    </header>
  );
}

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="wrap pt-12 pb-8 md:pt-20 md:pb-12">
      {eyebrow && <p className="annot mb-4 !text-copper">{eyebrow}</p>}
      <h1 className="display h-lg max-w-[20ch] text-balance">{title}</h1>
      {intro && <p className="mt-5 max-w-[62ch] text-soft text-pretty">{intro}</p>}
      {children}
    </header>
  );
}
