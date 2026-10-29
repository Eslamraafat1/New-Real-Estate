import {
  AMENITIES, ARCH_STYLES, PROPERTY_TYPES,
  type Amenity, type ArchStyle, type Completion, type Furnished, type Property, type PropertyQuery,
  type PropertyType, type SortKey,
} from "@/lib/api/types";
import { neighborhoods } from "@/data/demo/neighborhoods";

/** Isomorphic helpers shared by the URL layer, the UI and the API service. */
type Raw = URLSearchParams | Record<string, string | string[] | undefined>;

const get = (raw: Raw, k: string): string | undefined => {
  if (raw instanceof URLSearchParams) return raw.get(k) ?? undefined;
  const v = raw[k];
  return Array.isArray(v) ? v[0] : v;
};
const num = (s?: string) => {
  if (s === undefined || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
const list = <T extends string>(s: string | undefined, allowed: readonly T[]): T[] | undefined => {
  if (!s) return undefined;
  const out = s.split(",").filter((x): x is T => (allowed as readonly string[]).includes(x));
  return out.length ? out : undefined;
};

const SORTS: SortKey[] = ["relevance", "price-asc", "price-desc", "newest"];
const FURNISHED: Furnished[] = ["furnished", "semi", "unfurnished"];
const COMPLETIONS: Completion[] = ["ready", "under-construction", "off-plan"];

export function parseQuery(raw: Raw): PropertyQuery {
  const purpose = get(raw, "purpose");
  const sort = get(raw, "sort") as SortKey | undefined;
  const furn = get(raw, "furnished") as Furnished | undefined;
  const comp = get(raw, "completion") as Completion | undefined;
  return {
    purpose: purpose === "sale" || purpose === "rent" ? purpose : undefined,
    q: get(raw, "q")?.trim() || undefined,
    neighborhood: get(raw, "neighborhood") || undefined,
    types: list<PropertyType>(get(raw, "type"), PROPERTY_TYPES),
    styles: list<ArchStyle>(get(raw, "style"), ARCH_STYLES),
    minPrice: num(get(raw, "minPrice")),
    maxPrice: num(get(raw, "maxPrice")),
    beds: num(get(raw, "beds")),
    baths: num(get(raw, "baths")),
    minArea: num(get(raw, "minArea")),
    maxArea: num(get(raw, "maxArea")),
    furnished: furn && FURNISHED.includes(furn) ? furn : undefined,
    amenities: list<Amenity>(get(raw, "amenities"), AMENITIES),
    completion: comp && COMPLETIONS.includes(comp) ? comp : undefined,
    developmentId: get(raw, "development") || undefined,
    featured: get(raw, "featured") === "1" ? true : undefined,
    ids: get(raw, "ids")?.split(",").filter(Boolean),
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: num(get(raw, "page")),
    pageSize: num(get(raw, "pageSize")),
  };
}

export function serializeQuery(q: PropertyQuery): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: unknown) => {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return;
    p.set(k, Array.isArray(v) ? v.join(",") : String(v));
  };
  set("purpose", q.purpose);
  set("q", q.q);
  set("neighborhood", q.neighborhood);
  set("type", q.types);
  set("style", q.styles);
  set("minPrice", q.minPrice);
  set("maxPrice", q.maxPrice);
  set("beds", q.beds);
  set("baths", q.baths);
  set("minArea", q.minArea);
  set("maxArea", q.maxArea);
  set("furnished", q.furnished);
  set("amenities", q.amenities);
  set("completion", q.completion);
  set("development", q.developmentId);
  set("featured", q.featured ? "1" : undefined);
  set("ids", q.ids);
  set("sort", q.sort && q.sort !== "relevance" ? q.sort : undefined);
  set("page", q.page && q.page > 1 ? q.page : undefined);
  set("pageSize", q.pageSize);
  return p;
}

/** Number of active filters (excluding purpose / sort / paging). */
export function activeFilterKeys(q: PropertyQuery): (keyof PropertyQuery)[] {
  const keys: (keyof PropertyQuery)[] = ["q", "neighborhood", "types", "styles", "minPrice", "maxPrice", "beds", "baths", "minArea", "maxArea", "furnished", "amenities", "completion", "developmentId", "featured"];
  return keys.filter((k) => {
    const v = q[k];
    return v !== undefined && !(Array.isArray(v) && !v.length);
  });
}

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[ً-ٟ]/g, "");

function textScore(p: Property, q: string): number {
  const hood = neighborhoods.find((h) => h.slug === p.neighborhood);
  const hay = norm(
    [p.title.en, p.title.ar, p.location.en, p.location.ar, p.ref, p.type, p.style, hood?.name.en, hood?.name.ar].filter(Boolean).join(" "),
  );
  const terms = norm(q).split(/\s+/).filter(Boolean);
  let score = 0;
  for (const t of terms) {
    if (!hay.includes(t)) return 0;
    score += norm(p.title.en).includes(t) || norm(p.title.ar).includes(t) ? 3 : 1;
  }
  return score;
}

export function filterProperties(all: Property[], q: PropertyQuery): Property[] {
  let out = all.filter((p) => {
    if (q.ids && !q.ids.includes(p.id) && !q.ids.includes(p.slug)) return false;
    if (q.purpose && p.purpose !== q.purpose) return false;
    if (q.neighborhood && p.neighborhood !== q.neighborhood) return false;
    if (q.types?.length && !q.types.includes(p.type)) return false;
    if (q.styles?.length && !q.styles.includes(p.style)) return false;
    if (q.minPrice !== undefined && p.price < q.minPrice) return false;
    if (q.maxPrice !== undefined && p.price > q.maxPrice) return false;
    if (q.beds !== undefined && p.bedrooms < q.beds) return false;
    if (q.baths !== undefined && p.bathrooms < q.baths) return false;
    if (q.minArea !== undefined && p.area < q.minArea) return false;
    if (q.maxArea !== undefined && p.area > q.maxArea) return false;
    if (q.furnished && p.furnished !== q.furnished) return false;
    if (q.amenities?.length && !q.amenities.every((a) => p.amenities.includes(a))) return false;
    if (q.completion && p.completion !== q.completion) return false;
    if (q.developmentId && p.developmentId !== q.developmentId) return false;
    if (q.featured && !p.featured) return false;
    if (q.q && textScore(p, q.q) === 0) return false;
    return true;
  });
  const sort = q.sort ?? "relevance";
  const rel = (p: Property) => (q.q ? textScore(p, q.q) * 10 : 0) + (p.featured ? 5 : 0) + new Date(p.addedAt).getTime() / 1e12;
  out = [...out].sort((a, b) => {
    switch (sort) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "newest": return +new Date(b.addedAt) - +new Date(a.addedAt);
      default: return rel(b) - rel(a);
    }
  });
  return out;
}
