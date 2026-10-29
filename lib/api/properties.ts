import { properties as demo } from "@/data/demo/properties";
import { filterProperties, serializeQuery } from "@/lib/search";
import { apiConfig } from "./config";
import { isRemote, remoteGet } from "./remote";
import type { Paged, Property, PropertyQuery } from "./types";

/** Typed data-access layer. UI code never imports `data/demo/*` directly. */

export async function listProperties(q: PropertyQuery = {}): Promise<Paged<Property>> {
  if (isRemote()) return remoteGet<Paged<Property>>(`/properties?${serializeQuery(q)}`);
  const all = filterProperties(demo, q);
  const pageSize = Math.min(Math.max(q.pageSize ?? apiConfig.pageSize, 1), apiConfig.maxPageSize);
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const page = Math.min(Math.max(q.page ?? 1, 1), totalPages);
  return {
    items: all.slice((page - 1) * pageSize, page * pageSize),
    total: all.length,
    page,
    pageSize,
    totalPages,
    isDemo: true,
  };
}

export async function getProperty(idOrSlug: string): Promise<Property | null> {
  if (isRemote()) {
    try { return await remoteGet<Property>(`/properties/${encodeURIComponent(idOrSlug)}`); } catch { return null; }
  }
  return demo.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
}

export async function getSimilarProperties(p: Property, limit = 3): Promise<Property[]> {
  const res = await listProperties({ purpose: p.purpose, pageSize: 100 });
  return res.items
    .filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      s: (x.neighborhood === p.neighborhood ? 3 : 0) + (x.type === p.type ? 2 : 0) + (x.style === p.style ? 1 : 0) - Math.abs(Math.log(x.price / p.price)),
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.x);
}

export async function getPropertySlugs(): Promise<string[]> {
  return demo.map((p) => p.slug);
}

/** Price bounds per purpose, used to scale filter sliders. */
export async function getPriceBounds(): Promise<Record<"sale" | "rent", { min: number; max: number }>> {
  const b = (pp: Property[]) => ({ min: Math.min(...pp.map((p) => p.price)), max: Math.max(...pp.map((p) => p.price)) });
  return { sale: b(demo.filter((p) => p.purpose === "sale")), rent: b(demo.filter((p) => p.purpose === "rent")) };
}
