import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapView } from "@/components/atlas/MapView";
import { ScoreBars } from "@/components/pages/ScoreBars";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Arrow } from "@/components/ui/Arrow";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { getNeighborhood, listNeighborhoods } from "@/lib/api/locations";
import { listProperties } from "@/lib/api/properties";
import { fmt, getDictionary } from "@/lib/i18n";
import { href, isLocale, locales, tr } from "@/lib/i18n/config";
import { formatMoney } from "@/lib/i18n/format";

export async function generateStaticParams() {
  const all = await listNeighborhoods();
  return locales.flatMap((lang) => all.map((n) => ({ lang, slug: n.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/neighborhoods/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const n = await getNeighborhood(slug);
  if (!n) return {};
  const title = tr(n.name, lang);
  const description = `${tr(n.tagline, lang)}. ${tr(n.description, lang)}`;
  return { title, description, openGraph: { title, description, images: [{ url: n.image.src, width: n.image.width, height: n.image.height, alt: tr(n.image.alt, lang) }] } };
}

export default async function NeighborhoodPage({ params }: PageProps<"/[lang]/neighborhoods/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const n = await getNeighborhood(slug);
  if (!n) notFound();
  const t = getDictionary(lang);
  const p = t.pages.neighborhoods;
  const [hoods, props] = await Promise.all([listNeighborhoods(), listProperties({ neighborhood: n.slug, pageSize: 100 })]);
  const name = tr(n.name, lang);
  const rows = (["walkability", "greenery", "nightlife", "quiet"] as const).map((k) => ({
    label: p[k], value: n.sample[k], text: fmt(p.outOf, { n: n.sample[k] }),
  }));

  return (
    <>
      <header className="relative isolate overflow-hidden bg-forest text-onforest">
        <AtlasImage src={n.image.src} alt={tr(n.image.alt, lang)} fill priority sizes="100vw" className="-z-10 object-cover opacity-40" />
        <div className="wrap pt-20 pb-16 md:pt-32 md:pb-24">
          <Link href={href(lang, "/neighborhoods")} className="annot inline-flex items-center gap-2 !text-onforest"><Arrow className="rotate-180" />{p.allDistricts}</Link>
          <p className="annot mt-8 !text-onforest">{p.detailEyebrow} · {t.common.sample}</p>
          <h1 className="display h-xl mt-3 text-balance">{name}</h1>
          <p className="mt-4 max-w-[44ch] text-xl opacity-90">{tr(n.tagline, lang)}</p>
        </div>
      </header>

      <section className="wrap section grid gap-12 lg:grid-cols-12">
        <div className="grid content-start gap-6 lg:col-span-6">
          <p className="text-xl leading-relaxed text-pretty">{tr(n.description, lang)}</p>
          <div>
            <h2 className="annot mb-3 !text-copper">{p.character}</h2>
            <ul className="flex flex-wrap gap-2">{n.character.map((c) => <li key={c.en} className="chip">{tr(c, lang)}</li>)}</ul>
          </div>
        </div>
        <div className="border border-line bg-surface p-6 lg:col-span-5 lg:col-start-8">
          <h2 className="display h-sm">{p.indicatorsTitle}</h2>
          <p role="note" className="annot mb-6 mt-1 !text-copper">{p.indicatorsNote}</p>
          <ScoreBars rows={rows} />
          <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <span className="annot annot-ar-ok">{p.avgPrice}</span>
            <span className="display h-sm num">{formatMoney(n.sampleAvgPricePerM2, lang)}</span>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper2">
        <div className="wrap grid gap-8 py-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display h-md">{p.positionTitle}</h2>
            <p className="annot mt-3">{t.common.demoMap}</p>
          </div>
          <MapView className="h-[340px] w-full border border-line lg:col-span-8 lg:h-[420px]" markers={props.items.map((x) => ({ id: x.id, x: x.geo.x, y: x.geo.y, label: x.ref, title: tr(x.title, lang) }))} areas={hoods} activeArea={n.slug} interactive={false} controls={false} label={p.mapLabel} />
        </div>
      </section>

      <section className="wrap section">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display h-md">{fmt(p.listingsTitle, { name })}</h2>
          <Link className="btn" href={`${href(lang, "/properties")}?neighborhood=${n.slug}`}>{p.seeAll}<Arrow /></Link>
        </div>
        {props.items.length === 0 ? <p className="text-soft">{p.noListings}</p> : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {props.items.map((x) => <li key={x.id}><PropertyCard p={x} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
