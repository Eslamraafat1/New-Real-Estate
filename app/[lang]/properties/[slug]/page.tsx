import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProperty, getPropertySlugs, getSimilarProperties } from "@/lib/api/properties";
import { getAgent } from "@/lib/api/agents";
import { getNeighborhood } from "@/lib/api/locations";
import { getDevelopment } from "@/lib/api/developments";
import { getDictionary } from "@/lib/i18n";
import { isLocale, locales, tr } from "@/lib/i18n/config";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyDetailProvider } from "@/components/property/PropertyDetailContext";
import { PropertyHero } from "@/components/property/PropertyHero";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { MobileActionBar, SideCard } from "@/components/property/PropertyActions";
import { AgentBlock } from "@/components/property/AgentBlock";
import { DevelopmentLink, EssentialsSection, FinanceSection, NeighborhoodSection, PlansSection, SpecsSection, StorySections, buildSections, sectionNumbers } from "@/components/property/PropertyDetailSections";
import { SectionIndex } from "@/components/property/SectionIndex";
import { JsonLd, breadcrumbJsonLd, listingJsonLd } from "@/lib/seo/jsonld";
import "@/components/property/property-fx.css";

// The whole route must be produced statically. Listed slugs are prerendered at
// build time; for any other slug Next.js waits for the static result instead of
// streaming the loading.tsx fallback with a 200, so notFound() below yields a
// real HTTP 404 on the very first request (dynamicParams is not available with
// Cache Components).
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const slugs = await getPropertySlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/properties/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const p = await getProperty(slug);
  const t = getDictionary(lang);
  if (!p) return { title: t.property.notFoundTitle };
  const title = tr(p.title, lang);
  const description = tr(p.summary, lang) || t.property.metaFallback;
  const cover = p.images[0];
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/properties/${p.slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/properties/${p.slug}`])),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: lang === "ar" ? "ar_AR" : "en_US",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: tr(cover.alt, lang) }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: cover ? [cover.src] : undefined },
  };
}

export default async function PropertyPage({ params }: PageProps<"/[lang]/properties/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const p = await getProperty(slug);
  if (!p) notFound();

  const [agent, hood, similar, dev] = await Promise.all([
    getAgent(p.agentId),
    getNeighborhood(p.neighborhood),
    getSimilarProperties(p, 3),
    p.developmentId ? getDevelopment(p.developmentId) : Promise.resolve(null),
  ]);
  const t = getDictionary(lang);
  const sections = buildSections(p, lang, { hasAgent: !!agent });
  const nums = sectionNumbers(sections, lang);

  return (
    <PropertyDetailProvider property={p} agent={agent}>
      <JsonLd
        data={[
          listingJsonLd(p, lang),
          breadcrumbJsonLd([
            [t.nav.home, `/${lang}`],
            [t.nav.listings, `/${lang}/properties`],
            [tr(p.title, lang), `/${lang}/properties/${p.slug}`],
          ]),
        ]}
      />
      <article className="pd-root">
        <PropertyHero />
        <SectionIndex items={sections} />
        <PropertyGallery />
        <div className="wrap grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <EssentialsSection p={p} lang={lang} num={nums.essentials} />
            {dev && <DevelopmentLink dev={dev} lang={lang} />}
            <StorySections p={p} lang={lang} nums={nums} />
            <PlansSection p={p} lang={lang} num={nums.plans} />
            <FinanceSection p={p} lang={lang} num={nums.finance} />
            <NeighborhoodSection p={p} hood={hood} lang={lang} num={nums.neighborhood} />
            <SpecsSection p={p} lang={lang} num={nums.specs} />
          </div>
          <div className="hidden pt-24 lg:block"><SideCard /></div>
        </div>
        <div className="wrap"><AgentBlock /></div>
        {similar.length > 0 && (
          <section aria-labelledby="similar-h" className="wrap section border-t border-line">
            <p className="annot !text-copper">{t.property.similar.eyebrow}</p>
            <h2 id="similar-h" className="display h-lg mt-3 mb-10">{t.property.similar.title}</h2>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} p={s} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              ))}
            </div>
          </section>
        )}
      </article>
      <MobileActionBar />
    </PropertyDetailProvider>
  );
}
