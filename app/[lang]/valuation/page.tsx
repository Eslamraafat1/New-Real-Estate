import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ValuationForm } from "@/components/forms/forms";
import { Contour } from "@/components/ui/Contour";
import { PageHeader } from "@/components/ui/SectionHead";
import { Steps } from "@/components/pages/Steps";
import { listNeighborhoods } from "@/lib/api/locations";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/valuation">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.valuation.meta;
  return { title: m.title, description: m.description };
}

export default async function ValuationPage({ params }: PageProps<"/[lang]/valuation">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.pages.valuation;
  const hoods = (await listNeighborhoods()).map((n) => ({ slug: n.slug, name: n.name }));

  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <div className="wrap grid gap-14 pb-24 lg:grid-cols-12">
        <section className="lg:col-span-6 lg:order-2 lg:col-start-7">
          <div className="border border-line bg-surface p-6 md:p-8">
            <h2 className="display h-md mb-6">{t.forms.valuationTitle}</h2>
            <ValuationForm neighborhoods={hoods} />
          </div>
        </section>
        <section className="relative lg:col-span-5 lg:order-1">
          <Contour seed={11} rings={9} className="absolute -start-10 -top-10 -z-10 h-72 w-full text-forest opacity-30" animate={false} />
          <h2 className="annot mb-4 !text-copper">{p.howTitle}</h2>
          <Steps items={p.steps} label={t.pages.step} />
          <aside className="mt-10 border-s-2 border-copper ps-5">
            <h3 className="display h-sm mb-2">{p.caveatTitle}</h3>
            <p className="text-sm text-soft text-pretty">{p.caveat}</p>
          </aside>
        </section>
      </div>
    </>
  );
}
