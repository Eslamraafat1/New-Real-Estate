import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listDevelopments } from "@/lib/api/developments";
import { getDictionary } from "@/lib/i18n";
import { isLocale, locales } from "@/lib/i18n/config";
import { PageHeader } from "@/components/ui/SectionHead";
import { DevelopmentDirectory } from "@/components/development/DevelopmentDirectory";

export async function generateMetadata({ params }: PageProps<"/[lang]/developments">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.nav.developments,
    description: t.property.dev.intro,
    alternates: { canonical: `/${lang}/developments`, languages: Object.fromEntries(locales.map((l) => [l, `/${l}/developments`])) },
  };
}

export default async function DevelopmentsPage({ params }: PageProps<"/[lang]/developments">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const items = await listDevelopments();
  return (
    <>
      <PageHeader eyebrow={t.property.dev.eyebrow} title={t.property.dev.pageTitle} intro={t.property.dev.intro}>
        <p className="annot annot-ar-ok mt-6 border-s-2 border-copper ps-3">{t.property.dev.demoNote}</p>
      </PageHeader>
      <div className="wrap pb-24">
        <DevelopmentDirectory items={items} />
      </div>
    </>
  );
}
