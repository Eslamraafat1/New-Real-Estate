import { developments as demo } from "@/data/demo/developments";
import { isRemote, remoteGet } from "./remote";
import type { Development } from "./types";

export async function listDevelopments(): Promise<Development[]> {
  if (isRemote()) return remoteGet<Development[]>("/developments");
  return demo;
}
export async function getDevelopment(slug: string): Promise<Development | null> {
  return (await listDevelopments()).find((d) => d.slug === slug) ?? null;
}
