import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { InquiryForm } from "@/components/forms/forms";
import { PageHeader } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/landlords">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.landlords.meta;
  return { title: m.title, description: m.description };
}

export default async function LandlordsPage({ params }: PageProps<"/[lang]/landlords">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.pages.landlords;

  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      <section className="wrap pb-20">
        <h2 className="annot mb-4 !text-copper">{p.servicesTitle}</h2>
        <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
          {p.services.map((s, i) => (
            <li key={s.t} className="grid content-start gap-3 border-b border-line py-6 sm:pe-6 lg:border-e lg:px-5 lg:first:ps-0 lg:last:border-e-0">
              <span className="numeral text-4xl text-mute">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display h-sm">{s.t}</h3>
              <p className="text-sm text-soft text-pretty">{s.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-paper2">
        <div className="wrap py-16 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display h-lg">{p.tiersTitle}</h2>
            <p className="annot">{p.tiersNote}</p>
          </div>
          <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
            {p.tiers.map((tier, i) => (
              <article key={tier.n} className={`grid content-start gap-5 bg-paper p-8 ${i === 1 ? "md:-my-4 md:bg-surface md:py-12" : ""}`}>
                <span className="annot !text-copper">{String(i + 1).padStart(2, "0")} · {t.common.sample}</span>
                <h3 className="display h-md">{tier.n}</h3>
                <p className="text-soft">{tier.d}</p>
                <ul className="grid gap-2 border-t border-line pt-4 text-sm">
                  {tier.items.map((it) => <li key={it} className="flex gap-2"><Check aria-hidden size={14} className="mt-1 shrink-0 text-forest" />{it}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="display h-lg text-balance">{p.formTitle}</h2>
          <p className="mt-4 text-soft">{p.formIntro}</p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6"><InquiryForm kind="landlord" /></div>
      </section>
    </>
  );
}
