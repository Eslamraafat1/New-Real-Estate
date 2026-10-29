import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDoc } from "@/components/pages/LegalDoc";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.legal.terms.meta;
  return { title: m.title, description: m.description };
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const l = t.pages.legal;
  const d = l.terms;
  return (
    <LegalDoc eyebrow={d.eyebrow} title={d.title} intro={d.intro} banner={l.demoBanner} tocTitle={l.tocTitle}
      updatedLabel={t.pages.updatedLabel} updated={l.updated} sections={d.sections} />
  );
}
