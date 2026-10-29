import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalIndex } from "@/components/pages/JournalIndex";
import { PageHeader } from "@/components/ui/SectionHead";
import { listArticles } from "@/lib/api/articles";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/journal">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.journal.meta;
  return { title: m.title, description: m.description };
}

export default async function JournalPage({ params }: PageProps<"/[lang]/journal">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const p = getDictionary(lang).pages.journal;
  const articles = await listArticles();
  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <JournalIndex articles={articles} />
    </>
  );
}
