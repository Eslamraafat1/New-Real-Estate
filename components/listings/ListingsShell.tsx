import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/SectionHead";
import { listNeighborhoods } from "@/lib/api/locations";
import { listProperties } from "@/lib/api/properties";
import { serializeQuery } from "@/lib/search";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property, Purpose } from "@/lib/api/types";
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

/** Server-rendered first page shown until the interactive listings hydrate (keeps LCP out of the JS critical path). */
function Fallback({ items }: { items: Property[] }) {
  return (
    <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-8 pb-16 opacity-70 lg:grid-cols-[290px_minmax(0,1fr)]" aria-busy="true">
      <div className="hidden lg:block" aria-hidden />
      <div className="mt-[4.5rem] grid min-w-0 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p, i) => <PropertyCard key={p.id} p={p} priority={i < 3} />)}
      </div>
    </div>
  );
}

export async function ListingsShell({ langParam, kind }: { langParam: string; kind: Kind }) {
  if (!isLocale(langParam)) notFound();
  const lang: Locale = langParam;
  const t = getDictionary(lang);
  const [areas, first] = await Promise.all([listNeighborhoods(), listProperties({ purpose: PURPOSE[kind], pageSize: 12 })]);
  const initialKey = serializeQuery({ purpose: PURPOSE[kind], page: 1, pageSize: 12 }).toString();
  const title = kind === "buy" ? t.listings.titleBuy : kind === "rent" ? t.listings.titleRent : t.listings.title;
  return (
    <>
      <PageHeader eyebrow={t.listings.eyebrowAll} title={title} intro={t.listings.intro} />
      <Suspense fallback={<Fallback items={first.items} />}>
        <ListingsExperience areas={areas} lockPurpose={PURPOSE[kind]} initial={{ key: initialKey, data: first }} />
      </Suspense>
    </>
  );
}
