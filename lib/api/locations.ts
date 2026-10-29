import { neighborhoods as demo } from "@/data/demo/neighborhoods";
import { properties } from "@/data/demo/properties";
import { isRemote, remoteGet } from "./remote";
import type { Neighborhood } from "./types";

export interface LocationOption {
  slug: string;
  name: Neighborhood["name"];
  count: number;
}

export async function listNeighborhoods(): Promise<Neighborhood[]> {
  if (isRemote()) return remoteGet<Neighborhood[]>("/neighborhoods");
  return demo;
}

export async function getNeighborhood(slug: string): Promise<Neighborhood | null> {
  return (await listNeighborhoods()).find((n) => n.slug === slug) ?? null;
}

/** Flat list used by location pickers, with listing counts. */
export async function listLocations(): Promise<LocationOption[]> {
  if (isRemote()) return remoteGet<LocationOption[]>("/locations");
  return demo.map((n) => ({ slug: n.slug, name: n.name, count: properties.filter((p) => p.neighborhood === n.slug).length }));
}
