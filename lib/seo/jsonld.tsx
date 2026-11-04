import { apiConfig } from "@/lib/api/config";
import type { Property } from "@/lib/api/types";
import { tr, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";

type Json = Record<string, unknown>;

/** Renders schema.org structured data. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const abs = (path: string) => `${apiConfig.siteUrl}${path}`;
const DEMO_NOTE = "Fictional demo brand with sample data — not a real business or offer.";

/** Organization + WebSite for the home page. The brand is fictional, so no contact details are claimed. */
export function siteJsonLd(lang: Locale): Json[] {
  const t = getDictionary(lang);
  const orgId = abs("/#organization");
  return [
    {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "@id": orgId,
      name: t.common.brand,
      url: abs(`/${lang}`),
      description: t.footer.blurb,
      disambiguatingDescription: DEMO_NOTE,
      image: abs(`/${lang}/opengraph-image`),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": abs("/#website"),
      name: t.common.brand,
      url: abs(`/${lang}`),
      inLanguage: lang,
      publisher: { "@id": orgId },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: abs(`/${lang}/properties?q={search_term_string}`) },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

const ACCOMMODATION: Record<Property["type"], string> = {
  villa: "House", house: "House", townhouse: "House", apartment: "Apartment",
  penthouse: "Apartment", residence: "Residence", land: "Place",
};

/** RealEstateListing for a property detail page, built only from the (sample) listing data. */
export function listingJsonLd(p: Property, lang: Locale): Json {
  const url = abs(`/${lang}/properties/${p.slug}`);
  const isLand = p.type === "land";
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: tr(p.title, lang),
    description: tr(p.summary, lang),
    disambiguatingDescription: p.isDemo ? "Sample listing for a fictional city — not a real offer." : undefined,
    inLanguage: lang,
    datePosted: p.addedAt,
    image: p.images.map((i) => i.src),
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: p.currency,
      businessFunction: p.purpose === "rent" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
      availability: p.availability === "available" ? "https://schema.org/InStock" : p.availability === "coming-soon" ? "https://schema.org/PreOrder" : "https://schema.org/LimitedAvailability",
      ...(p.purpose === "rent" && p.pricePeriod
        ? { priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: p.currency, unitCode: p.pricePeriod === "year" ? "ANN" : "MON" } }
        : {}),
    },
    about: {
      "@type": ACCOMMODATION[p.type],
      name: tr(p.title, lang),
      address: { "@type": "PostalAddress", addressLocality: tr(p.location, lang) },
      ...(isLand
        ? {}
        : {
            numberOfBedrooms: p.bedrooms,
            numberOfBathroomsTotal: p.bathrooms,
            floorSize: { "@type": "QuantitativeValue", value: p.area, unitCode: "MTK" },
          }),
    },
  };
}

/** BreadcrumbList from [name, path] pairs (paths are locale-prefixed, e.g. "/en/properties"). */
export function breadcrumbJsonLd(items: [string, string][]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}
