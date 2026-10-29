import type { MetadataRoute } from "next";
import { apiConfig } from "@/lib/api/config";
import { listArticles } from "@/lib/api/articles";
import { listAgents } from "@/lib/api/agents";
import { listDevelopments } from "@/lib/api/developments";
import { listNeighborhoods } from "@/lib/api/locations";
import { listProperties } from "@/lib/api/properties";
import { locales } from "@/lib/i18n/config";

const STATIC = ["", "/buy", "/rent", "/properties", "/map", "/neighborhoods", "/developments", "/agents", "/about", "/journal", "/sell", "/landlords", "/valuation", "/mortgage-calculator", "/contact", "/faq", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [props, hoods, devs, agents, articles] = await Promise.all([
    listProperties({ pageSize: 100 }), listNeighborhoods(), listDevelopments(), listAgents(), listArticles(),
  ]);
  const paths = [
    ...STATIC,
    ...props.items.map((p) => `/properties/${p.slug}`),
    ...hoods.map((n) => `/neighborhoods/${n.slug}`),
    ...devs.map((d) => `/developments/${d.slug}`),
    ...agents.map((a) => `/agents/${a.slug}`),
    ...articles.map((a) => `/journal/${a.slug}`),
  ];
  return locales.flatMap((l) =>
    paths.map((p) => ({
      url: `${apiConfig.siteUrl}/${l}${p}`,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${apiConfig.siteUrl}/${x}${p}`])) },
      changeFrequency: p.startsWith("/properties/") ? ("weekly" as const) : ("monthly" as const),
      priority: p === "" ? 1 : p.startsWith("/properties/") ? 0.8 : 0.6,
    })),
  );
}
