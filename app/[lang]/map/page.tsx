import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingsExperience } from "@/components/listings/ListingsExperience";
import { listNeighborhoods } from "@/lib/api/locations";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/map">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: t.nav.map, description: t.listings.intro, alternates: { canonical: `/${lang}/map`, languages: { en: "/en/map", ar: "/ar/map" } } };
}

export default async function Page({ params }: PageProps<"/[lang]/map">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const areas = await listNeighborhoods();
  const t = getDictionary(lang);
  return (
    <>
      <h1 className="sr-only">{t.nav.map}</h1>
      <Suspense fallback={<div className="h-[70dvh] animate-pulse bg-paper2" aria-busy="true" />}>
        <ListingsExperience areas={areas} variant="explorer" />
      </Suspense>
    </>
  );
}
