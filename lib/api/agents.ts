import { agents as demo } from "@/data/demo/agents";
import { isRemote, remoteGet } from "./remote";
import type { Agent } from "./types";

export async function listAgents(): Promise<Agent[]> {
  if (isRemote()) return remoteGet<Agent[]>("/agents");
  return demo;
}
export async function getAgent(idOrSlug: string): Promise<Agent | null> {
  return (await listAgents()).find((a) => a.id === idOrSlug || a.slug === idOrSlug) ?? null;
}
