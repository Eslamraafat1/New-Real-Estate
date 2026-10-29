import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { href, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.faq.meta;
  return { title: m.title, description: m.description };
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.pages.faq;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <div className="wrap grid gap-12 pb-24 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="border-t border-line">
          {p.items.map((it, i) => (
            <details key={it.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-baseline gap-5 py-5 [&::-webkit-details-marker]:hidden">
                <span className="annot !text-copper">{String(i + 1).padStart(2, "0")}</span>
                <span className="display h-sm flex-1 text-balance">{it.q}</span>
                <Plus aria-hidden size={18} className="shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <p className="max-w-[62ch] pb-6 ps-12 leading-relaxed text-soft text-pretty">{it.a}</p>
            </details>
          ))}
        </div>
        <aside className="grid content-start gap-4 border border-line bg-surface p-6 lg:sticky lg:top-24 lg:self-start">
          <p className="annot !text-copper">{t.pages.demoLabel}</p>
          <h2 className="display h-sm">{p.stillTitle}</h2>
          <p className="text-sm text-soft">{p.stillText}</p>
          <Link className="btn btn-primary justify-self-start" href={href(lang, "/contact")}>{p.stillCta}<Arrow /></Link>
        </aside>
      </div>
    </>
  );
}
