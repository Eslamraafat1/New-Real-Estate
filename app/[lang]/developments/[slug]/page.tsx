import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Circle } from "lucide-react";
import { getDevelopment, listDevelopments } from "@/lib/api/developments";
import { listProperties } from "@/lib/api/properties";
import { getNeighborhood } from "@/lib/api/locations";
import { fmt, getDictionary } from "@/lib/i18n";
import { href as hrefFor, isLocale, locales, tr } from "@/lib/i18n/config";
import { formatMoney, formatNumber } from "@/lib/i18n/format";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Chevron } from "@/components/ui/Arrow";
import { MapView } from "@/components/atlas/MapView";
import { InquiryForm } from "@/components/forms/forms";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ProgressBar, StatusBadge } from "@/components/development/DevelopmentBits";

export async function generateStaticParams() {
  const devs = await listDevelopments();
  return locales.flatMap((lang) => devs.map((d) => ({ lang, slug: d.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/developments/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const dev = await getDevelopment(slug);
  const t = getDictionary(lang);
  if (!dev) return { title: t.property.notFoundDevTitle };
  const title = tr(dev.name, lang);
  const description = tr(dev.tagline, lang) || t.property.metaDevFallback;
  const cover = dev.images[0];
  return {
    title,
    description,
    alternates: { canonical: `/${lang}/developments/${dev.slug}`, languages: Object.fromEntries(locales.map((l) => [l, `/${l}/developments/${dev.slug}`])) },
    openGraph: { title, description, images: cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: tr(cover.alt, lang) }] : undefined },
  };
}

export default async function DevelopmentPage({ params }: PageProps<"/[lang]/developments/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dev = await getDevelopment(slug);
  if (!dev) notFound();
  const t = getDictionary(lang);
  const d = t.property.dev;
  // property.developmentId equals the development slug
  const [hood, related] = await Promise.all([getNeighborhood(dev.neighborhood), listProperties({ developmentId: dev.slug, pageSize: 12 })]);
  const [main, ...rest] = dev.images;
  const n = (v: number) => formatNumber(v, lang);

  return (
    <article>
      <header className="wrap pt-6 md:pt-10">
        <nav aria-label={t.property.breadcrumb} className="annot annot-ar-ok mb-5 flex flex-wrap items-center gap-1">
          <Link href={hrefFor(lang, "/developments")} className="hover:text-ink">{t.nav.developments}</Link>
          <Chevron />
          <span className="text-ink">{tr(dev.name, lang)}</span>
        </nav>
        <div className="grid gap-3 lg:grid-cols-12">
          {main && (
            <div className="relative aspect-[4/3] overflow-hidden bg-paper2 lg:col-span-8 lg:aspect-auto lg:min-h-[32rem]">
              <AtlasImage src={main.src} alt={tr(main.alt, lang)} fill priority sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
              <span className="annot annot-ar-ok absolute start-3 top-3 bg-paper/90 px-2 py-1 !text-ink">{d.sampleBadge}</span>
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
              {rest.slice(0, 2).map((im) => (
                <div key={im.src} className="relative aspect-[4/3] overflow-hidden bg-paper2">
                  <AtlasImage src={im.src} alt={tr(im.alt, lang)} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="grid content-start gap-5 lg:col-span-7">
            <StatusBadge status={dev.status} />
            <h1 className="display text-balance !text-[clamp(2.4rem,6vw,5.2rem)]">{tr(dev.name, lang)}</h1>
            <p className="display h-sm text-soft">{tr(dev.tagline, lang)}</p>
            <p className="annot annot-ar-ok border-s-2 border-copper ps-3">{d.demoNote}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-5 lg:col-span-5 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
            <div><dt className="annot annot-ar-ok">{d.priceFrom}</dt><dd className="display h-md num mt-1">{formatMoney(dev.priceFrom, lang, dev.currency, { compact: true })}</dd></div>
            <div><dt className="annot annot-ar-ok">{d.completion}</dt><dd className="display h-md num mt-1">{dev.completionQuarter}</dd></div>
            <div><dt className="annot annot-ar-ok">{d.units}</dt><dd className="num mt-1">{fmt(d.unitsAvailable, { n: n(dev.unitsAvailable), total: n(dev.units) })}</dd></div>
            <div><dt className="annot annot-ar-ok">{d.developer}</dt><dd className="mt-1">{tr(dev.developer, lang)}</dd></div>
            {dev.status !== "ready" && <ProgressBar value={dev.progress} className="col-span-2" />}
          </dl>
        </div>
      </header>

      <section className="wrap section grid gap-12 lg:grid-cols-12" aria-labelledby="dev-about">
        <div className="lg:col-span-5">
          <p className="annot !text-copper">{d.overview}</p>
          <h2 id="dev-about" className="display h-lg mt-3">{d.about}</h2>
        </div>
        <div className="grid gap-10 lg:col-span-7">
          <p className="text-lg text-soft text-pretty">{tr(dev.description, lang)}</p>
          <div>
            <h3 className="annot mb-1">{d.amenities}</h3>
            <ul className="flex flex-wrap gap-2 pt-2">
              {dev.amenities.map((a) => <li key={a} className="chip cursor-default">{t.labels.amenity[a]}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap border-t border-line py-16 md:py-24" aria-labelledby="dev-phases">
        <div className="grid gap-10 lg:grid-cols-12">
          <header className="lg:col-span-4">
            <p className="annot !text-copper">{t.common.sample}</p>
            <h2 id="dev-phases" className="display h-lg mt-3">{d.phases}</h2>
            <p className="mt-3 text-soft">{d.phasesIntro}</p>
          </header>
          <ol className="relative grid gap-0 lg:col-span-8">
            {dev.phases.map((ph, i) => (
              <li key={i} className="relative grid grid-cols-[2.5rem_1fr_auto] items-start gap-4 border-b border-line py-5 first:border-t">
                <span className={`grid h-8 w-8 place-items-center border ${ph.done ? "border-forest bg-forest text-onforest" : "border-line text-mute"}`}>
                  {ph.done ? <Check size={16} aria-hidden /> : <Circle size={10} aria-hidden />}
                </span>
                <div>
                  <p className="display h-sm">{tr(ph.label, lang)}</p>
                  <p className="annot annot-ar-ok mt-1">{ph.done ? d.done : d.upcoming}</p>
                </div>
                <span className="num annot annot-ar-ok !text-ink">{ph.date}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap border-t border-line py-16 md:py-24" aria-labelledby="dev-loc">
        <div className="grid gap-8 lg:grid-cols-12">
          <header className="grid content-start gap-3 lg:col-span-4">
            <p className="annot !text-copper">{d.location}</p>
            <h2 id="dev-loc" className="display h-lg">{hood ? tr(hood.name, lang) : d.location}</h2>
            {hood && <p className="text-soft">{tr(hood.tagline, lang)}</p>}
            <p className="annot annot-ar-ok">{d.locationNote}</p>
          </header>
          <div className="lg:col-span-8">
            <MapView
              className="h-[24rem] w-full border border-line lg:h-[30rem]"
              markers={[{ id: dev.slug, x: dev.geo.x, y: dev.geo.y, label: "◆", title: tr(dev.name, lang), kind: "development" }]}
              areas={hood ? [hood] : []}
              activeArea={hood?.slug ?? null}
              selectedId={dev.slug}
              interactive={false}
              controls={false}
              cluster={false}
              label={d.location}
            />
          </div>
        </div>
      </section>

      <section className="wrap border-t border-line py-16 md:py-24" aria-labelledby="dev-related">
        <h2 id="dev-related" className="display h-lg mb-10">{d.related}</h2>
        {related.items.length ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.items.map((p) => <PropertyCard key={p.id} p={p} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />)}
          </div>
        ) : (
          <p className="text-soft">{d.relatedEmpty}</p>
        )}
      </section>

      <section className="wrap border-t border-line py-16 md:py-24" aria-labelledby="dev-enquire">
        <div className="grid gap-10 lg:grid-cols-12">
          <header className="lg:col-span-5">
            <p className="annot !text-copper">{t.common.sample}</p>
            <h2 id="dev-enquire" className="display h-lg mt-3">{d.enquire}</h2>
            <p className="mt-3 max-w-[48ch] text-soft">{d.enquireIntro}</p>
          </header>
          <div className="lg:col-span-7">
            <InquiryForm kind="details" defaultMessage={`${tr(dev.name, lang)}: `} />
          </div>
        </div>
      </section>
    </article>
  );
}
