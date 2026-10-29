import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { InquiryForm } from "@/components/forms/forms";
import { Contour } from "@/components/ui/Contour";
import { Arrow } from "@/components/ui/Arrow";
import { PageHeader } from "@/components/ui/SectionHead";
import { Steps } from "@/components/pages/Steps";
import { getDictionary } from "@/lib/i18n";
import { href, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/sell">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.sell.meta;
  return { title: m.title, description: m.description };
}

export default async function SellPage({ params }: PageProps<"/[lang]/sell">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.pages.sell;

  return (
    <>
      <div className="relative overflow-hidden">
        <Contour seed={7} rings={12} className="absolute -end-20 top-0 h-full w-2/3 text-forest opacity-40" animate={false} />
        <div className="relative"><PageHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} /></div>
      </div>

      <section className="wrap grid gap-12 pb-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="annot mb-4 !text-copper">{p.processTitle}</h2>
          <Steps items={p.steps} label={t.pages.step} />
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border border-line bg-surface p-6 lg:sticky lg:top-24">
            <h2 className="display h-sm mb-4">{p.doTitle}</h2>
            <ul className="grid gap-3">
              {p.does.map((d) => (
                <li key={d} className="flex gap-3 border-t border-linesoft pt-3 text-sm"><Check aria-hidden size={16} className="mt-0.5 shrink-0 text-forest" />{d}</li>
              ))}
            </ul>
            <Link className="mt-6 inline-flex items-center gap-2 text-sm underline underline-offset-4" href={href(lang, "/valuation")}>{p.valuationCta}<Arrow /></Link>
          </div>
        </aside>
      </section>

      <section className="border-t border-line bg-paper2">
        <div className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display h-lg text-balance">{p.formTitle}</h2>
            <p className="mt-4 text-soft">{p.formIntro}</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6"><InquiryForm kind="seller" /></div>
        </div>
      </section>
    </>
  );
}
