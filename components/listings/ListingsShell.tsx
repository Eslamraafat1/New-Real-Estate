import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/SectionHead";
import { listNeighborhoods } from "@/lib/api/locations";
import type { Purpose } from "@/lib/api/types";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ListingsExperience } from "./ListingsExperience";

type Kind = "all" | "buy" | "rent";
const PURPOSE: Record<Kind, Purpose | undefined> = { all: undefined, buy: "sale", rent: "rent" };
const PATH: Record<Kind, string> = { all: "properties", buy: "buy", rent: "rent" };

export async function listingsMetadata(langParam: string, kind: Kind): Promise<Metadata> {
  if (!isLocale(langParam)) return {};
  const t = getDictionary(langParam);
  const title = kind === "buy" ? t.listings.titleBuy : kind === "rent" ? t.listings.titleRent : t.nav.listings;
  const path = PATH[kind];
  return { title, description: t.listings.intro, alternates: { canonical: `/${langParam}/${path}`, languages: { en: `/en/${path}`, ar: `/ar/${path}` } } };
}

function Fallback() {
  return <div className="wrap" aria-busy="true"><div className="h-96 animate-pulse bg-paper2" /></div>;
}

export async function ListingsShell({ langParam, kind }: { langParam: string; kind: Kind }) {
  if (!isLocale(langParam)) notFound();
  const lang: Locale = langParam;
  const t = getDictionary(lang);
  const areas = await listNeighborhoods();
  const title = kind === "buy" ? t.listings.titleBuy : kind === "rent" ? t.listings.titleRent : t.listings.title;
  return (
    <>
      <PageHeader eyebrow={t.listings.eyebrowAll} title={title} intro={t.listings.intro} />
      <Suspense fallback={<Fallback />}>
        <ListingsExperience areas={areas} lockPurpose={PURPOSE[kind]} />
      </Suspense>
    </>
  );
}
