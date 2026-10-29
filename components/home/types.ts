import type { Agent, Article, Development, Neighborhood, Property } from "@/lib/api/types";

/** Fetched once in app/[lang]/page.tsx (server) and passed to every homepage section. */
export interface HomeData {
  properties: Property[]; // full demo catalog (sale + rent), newest-agnostic
  neighborhoods: Neighborhood[];
  agents: Agent[];
  developments: Development[];
  articles: Article[];
}
