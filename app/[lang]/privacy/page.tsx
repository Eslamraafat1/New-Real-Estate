import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDoc } from "@/components/pages/LegalDoc";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.legal.privacy.meta;
  return { title: m.title, description: m.description };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const l = t.pages.legal;
  const d = l.privacy;
  return (
    <LegalDoc eyebrow={d.eyebrow} title={d.title} intro={d.intro} banner={l.demoBanner} tocTitle={l.tocTitle}
      updatedLabel={t.pages.updatedLabel} updated={l.updated} sections={d.sections} />
  );
}
