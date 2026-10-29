import { articles as demo } from "@/data/demo/articles";
import { isRemote, remoteGet } from "./remote";
import type { Article } from "./types";

export async function listArticles(): Promise<Article[]> {
  if (isRemote()) return remoteGet<Article[]>("/articles");
  return [...demo].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
export async function getArticle(slug: string): Promise<Article | null> {
  return (await listArticles()).find((a) => a.slug === slug) ?? null;
}
