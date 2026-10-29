import type { Property } from "@/lib/api/types";
import type { HomeData } from "../types";

/** Property whose cover photograph opens the homepage. */
export function pickHero(data: HomeData): Property | undefined {
  return data.properties.find((p) => p.featured && p.images.length > 0) ?? data.properties.find((p) => p.images.length > 0);
}

/** Property used by "Architecture in motion": needs a story and 3+ photographs. */
export function pickMotion(data: HomeData, excludeId?: string): Property | undefined {
  const ok = (p: Property) => p.images.length >= 3 && p.id !== excludeId;
  return (
    data.properties.find((p) => ok(p) && p.story?.exterior && p.story?.light && p.story?.materials) ??
    data.properties.find((p) => ok(p) && p.story) ??
    data.properties.find(ok) ??
    data.properties[0]
  );
}

/** "412.0 / 233.0" style coordinate label for the illustrative demo plane. */
export const coordLabel = (p: { geo: { x: number; y: number } }) => `${(p.geo.x / 10).toFixed(1)} · ${(p.geo.y / 10).toFixed(1)}`;
