import { PageHeader } from "@/components/ui/SectionHead";

/** Shared layout for the demo legal templates: banner, table of contents, numbered sections. */
export function LegalDoc({ eyebrow, title, intro, banner, tocTitle, updatedLabel, updated, sections }: {
  eyebrow: string; title: string; intro: string; banner: string; tocTitle: string; updatedLabel: string; updated: string;
  sections: { h: string; p: string[] }[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro}>
        <p className="annot mt-6">{updatedLabel}: <span className="num">{updated}</span></p>
      </PageHeader>
      <div className="wrap pb-24">
        <p role="note" className="mb-12 max-w-[72ch] border-s-2 border-copper bg-paper2 p-4 text-sm text-soft">{banner}</p>
        <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <nav aria-label={tocTitle} className="lg:sticky lg:top-24 lg:self-start">
            <p className="annot mb-3">{tocTitle}</p>
            <ol className="grid gap-2 border-t border-line pt-3 text-sm">
              {sections.map((s, i) => (
                <li key={s.h}>
                  <a className="flex gap-3 text-soft hover:text-ink" href={`#sec-${i + 1}`}>
                    <span className="annot !text-copper">{String(i + 1).padStart(2, "0")}</span>
                    <span>{s.h}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-[68ch]">
            {sections.map((s, i) => (
              <section key={s.h} id={`sec-${i + 1}`} className="scroll-mt-24 border-t border-line py-8 first:border-t-0 first:pt-0">
                <h2 className="display h-sm mb-4 flex items-baseline gap-4">
                  <span className="annot !text-copper">{String(i + 1).padStart(2, "0")}</span>
                  {s.h}
                </h2>
                {s.p.map((para) => <p key={para} className="mb-4 leading-relaxed text-soft text-pretty">{para}</p>)}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
