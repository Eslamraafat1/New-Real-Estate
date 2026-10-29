import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompareStudio } from "@/components/listings/CompareStudio";
import { PageHeader } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/compare">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: t.compare.title, description: t.compare.intro, robots: { index: false }, alternates: { canonical: `/${lang}/compare`, languages: { en: "/en/compare", ar: "/ar/compare" } } };
}

export default async function Page({ params }: PageProps<"/[lang]/compare">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <PageHeader eyebrow={t.compare.eyebrow} title={t.compare.title} intro={t.compare.intro} />
      <CompareStudio />
    </>
  );
}
