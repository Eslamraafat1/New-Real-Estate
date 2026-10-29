import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SavedProperties } from "@/components/listings/SavedLists";
import { PageHeader } from "@/components/ui/SectionHead";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/saved">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: t.saved.title, description: t.saved.intro, robots: { index: false }, alternates: { canonical: `/${lang}/saved`, languages: { en: "/en/saved", ar: "/ar/saved" } } };
}

export default async function Page({ params }: PageProps<"/[lang]/saved">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <PageHeader eyebrow={t.saved.eyebrow} title={t.saved.title} intro={t.saved.intro} />
      <SavedProperties />
    </>
  );
}
