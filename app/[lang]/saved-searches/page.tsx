import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SavedSearches } from "@/components/listings/SavedLists";
import { PageHeader } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/saved-searches">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: t.saved.searchesTitle, description: t.saved.searchesIntro, robots: { index: false }, alternates: { canonical: `/${lang}/saved-searches`, languages: { en: "/en/saved-searches", ar: "/ar/saved-searches" } } };
}

export default async function Page({ params }: PageProps<"/[lang]/saved-searches">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <PageHeader eyebrow={t.saved.eyebrow} title={t.saved.searchesTitle} intro={t.saved.searchesIntro} />
      <SavedSearches />
    </>
  );
}
