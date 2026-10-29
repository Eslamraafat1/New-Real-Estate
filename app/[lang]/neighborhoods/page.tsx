import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapView } from "@/components/atlas/MapView";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { PageHeader } from "@/components/ui/SectionHead";
import { listNeighborhoods } from "@/lib/api/locations";
import { listProperties } from "@/lib/api/properties";
import { fmt, getDictionary } from "@/lib/i18n";
import { href, isLocale, tr } from "@/lib/i18n/config";
import { formatMoney } from "@/lib/i18n/format";

export async function generateMetadata({ params }: PageProps<"/[lang]/neighborhoods">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.neighborhoods.meta;
  return { title: m.title, description: m.description };
}

export default async function NeighborhoodsPage({ params }: PageProps<"/[lang]/neighborhoods">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.pages.neighborhoods;
  const [hoods, props] = await Promise.all([listNeighborhoods(), listProperties({ pageSize: 100 })]);
  const counts = new Map<string, number>();
  props.items.forEach((x) => counts.set(x.neighborhood, (counts.get(x.neighborhood) ?? 0) + 1));

  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <div className="wrap grid gap-10 pb-24 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <MapView className="h-[340px] w-full border border-line lg:h-[620px]" markers={[]} areas={hoods} label={p.mapLabel} />
          </div>
        </div>
        <ol className="border-t border-line lg:col-span-7 lg:order-1">
          {hoods.map((h, i) => (
            <li key={h.slug} className="group relative grid items-center gap-x-6 gap-y-3 border-b border-line py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)_9rem]">
              <span className="numeral text-4xl text-mute">{String(i + 1).padStart(2, "0")}</span>
              <div className="grid gap-2">
                <h2 className="display h-md">
                  <Link className="after:absolute after:inset-0" href={href(lang, `/neighborhoods/${h.slug}`)}>{tr(h.name, lang)}</Link>
                </h2>
                <p className="text-soft">{tr(h.tagline, lang)}</p>
                <p className="annot flex flex-wrap gap-x-3">
                  <span>{fmt(p.listingsCount, { n: counts.get(h.slug) ?? 0 })}</span><span aria-hidden>/</span>
                  <span>{t.common.sample}: {formatMoney(h.sampleAvgPricePerM2, lang)}</span>
                </p>
                <p className="annot inline-flex items-center gap-2 !text-copper">{p.open}<Arrow /></p>
              </div>
              <div className="relative aspect-[3/2] overflow-hidden bg-paper2 sm:order-none">
                <AtlasImage src={h.image.src} alt={tr(h.image.alt, lang)} fill sizes="144px" className="img-hover object-cover" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
