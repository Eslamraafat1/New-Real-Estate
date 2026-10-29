import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MortgageCalculator } from "@/components/finance/MortgageCalculator";
import { PageHeader } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/mortgage-calculator">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: t.nav.mortgage, description: t.mortgage.intro, alternates: { canonical: `/${lang}/mortgage-calculator`, languages: { en: "/en/mortgage-calculator", ar: "/ar/mortgage-calculator" } } };
}

export default async function Page({ params }: PageProps<"/[lang]/mortgage-calculator">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <PageHeader eyebrow={t.mortgage.eyebrow} title={t.mortgage.title} intro={t.mortgage.intro} />
      <div className="wrap pb-16"><MortgageCalculator /></div>
    </>
  );
}
