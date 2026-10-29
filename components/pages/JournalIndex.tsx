"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Article } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { fmt } from "@/lib/i18n";
import { tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";

/** Journal index: featured essay, category chips (client-side filter) and an editorial list. */
export function JournalIndex({ articles }: { articles: Article[] }) {
  const { t, lang, href } = useApp();
  const [cat, setCat] = useState<string | null>(null);
  const cats = useMemo(() => {
    const seen = new Map<string, Article["category"]>();
    articles.forEach((a) => seen.set(a.category.en, a.category));
    return [...seen.entries()];
  }, [articles]);
  const shown = cat ? articles.filter((a) => a.category.en === cat) : articles;
  const [first, ...rest] = shown;
  const p = t.pages.journal;

  return (
    <div className="wrap pb-24">
      <div role="group" aria-label={p.filterLabel} className="mb-10 flex flex-wrap gap-2">
        <button type="button" className="chip" aria-pressed={cat === null} onClick={() => setCat(null)}>{p.all}</button>
        {cats.map(([key, label]) => (
          <button key={key} type="button" className="chip" aria-pressed={cat === key} onClick={() => setCat(key)}>{tr(label, lang)}</button>
        ))}
      </div>

      {!first && <p className="py-16 text-soft">{p.empty}</p>}

      {first && (
        <article className="group relative grid gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
          <div className="relative aspect-[3/2] overflow-hidden bg-paper2">
            <AtlasImage src={first.image.src} alt={tr(first.image.alt, lang)} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="img-hover object-cover" />
          </div>
          <div className="flex flex-col justify-between gap-8">
            <div className="grid gap-4">
              <p className="annot !text-copper">{p.featured} · {tr(first.category, lang)}</p>
              <h2 className="display h-md text-balance">
                <Link className="after:absolute after:inset-0" href={href(`/journal/${first.slug}`)}>{tr(first.title, lang)}</Link>
              </h2>
              <p className="text-soft text-pretty">{tr(first.excerpt, lang)}</p>
            </div>
            <p className="annot flex items-center gap-3">
              <span>{formatDate(first.date, lang)}</span><span aria-hidden>/</span>
              <span>{fmt(t.pages.minRead, { n: first.readMinutes })}</span>
              <span className="ms-auto inline-flex items-center gap-2 !text-ink">{p.read}<Arrow /></span>
            </p>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <ul className="mt-16 border-t border-line">
          {rest.map((a, i) => (
            <li key={a.slug} className="group relative grid items-center gap-x-8 gap-y-4 border-b border-line py-6 md:grid-cols-[4rem_minmax(0,1.4fr)_minmax(0,1fr)_9rem]">
              <span className="numeral text-4xl text-mute">{String(i + 2).padStart(2, "0")}</span>
              <div className="grid gap-2">
                <p className="annot !text-copper">{tr(a.category, lang)}</p>
                <h3 className="display h-sm text-balance">
                  <Link className="after:absolute after:inset-0" href={href(`/journal/${a.slug}`)}>{tr(a.title, lang)}</Link>
                </h3>
              </div>
              <p className="line-clamp-2 text-sm text-soft">{tr(a.excerpt, lang)}</p>
              <div className="relative aspect-[3/2] overflow-hidden bg-paper2">
                <AtlasImage src={a.image.src} alt={tr(a.image.alt, lang)} fill sizes="144px" className="img-hover object-cover" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
