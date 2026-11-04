import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Arrow } from "@/components/ui/Arrow";
import { getArticle, listArticles } from "@/lib/api/articles";
import { fmt, getDictionary } from "@/lib/i18n";
import { href, isLocale, locales, tr } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";

// Fully static route: unknown slugs wait for the static render, so notFound()
// returns a real 404 on the first request (see properties/[slug]/page.tsx).
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const all = await listArticles();
  return locales.flatMap((lang) => all.map((a) => ({ lang, slug: a.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/journal/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const a = await getArticle(slug);
  if (!a) return {};
  const title = tr(a.title, lang);
  const description = tr(a.excerpt, lang);
  return {
    title,
    description,
    openGraph: { type: "article", title, description, publishedTime: a.date, images: [{ url: a.image.src, width: a.image.width, height: a.image.height, alt: tr(a.image.alt, lang) }] },
    twitter: { card: "summary_large_image", title, description, images: [a.image.src] },
  };
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/journal/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const a = await getArticle(slug);
  if (!a) notFound();
  const t = getDictionary(lang);
  const p = t.pages.journal;
  const body = a.body[lang].length ? a.body[lang] : a.body.en;
  const all = await listArticles();
  const related = [...all.filter((x) => x.slug !== a.slug && x.category.en === a.category.en), ...all.filter((x) => x.slug !== a.slug && x.category.en !== a.category.en)].slice(0, 3);

  return (
    <article>
      <header className="wrap pt-12 md:pt-20">
        <Link href={href(lang, "/journal")} className="annot inline-flex items-center gap-2 hover:text-ink"><Arrow className="rotate-180" />{p.back}</Link>
        <p className="annot mt-8 !text-copper">{tr(a.category, lang)}</p>
        <h1 className="display h-xl mt-4 max-w-[16ch] text-balance">{tr(a.title, lang)}</h1>
        <p className="mt-6 max-w-[56ch] text-xl text-soft text-pretty">{tr(a.excerpt, lang)}</p>
        <p className="annot mt-8 flex flex-wrap gap-x-3 border-t border-line pt-4">
          <span>{fmt(t.pages.by, { name: tr(a.author, lang) })}</span><span aria-hidden>/</span>
          <time dateTime={a.date}>{formatDate(a.date, lang)}</time><span aria-hidden>/</span>
          <span>{fmt(t.pages.minRead, { n: a.readMinutes })}</span>
        </p>
      </header>

      <figure className="wrap mt-10">
        <div className="relative aspect-[16/8] overflow-hidden bg-paper2">
          <AtlasImage src={a.image.src} alt={tr(a.image.alt, lang)} fill priority sizes="100vw" className="object-cover" />
        </div>
        <figcaption className="annot mt-2">{p.shareHint}</figcaption>
      </figure>

      <div className="wrap section grid gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <p role="note" className="border-s-2 border-copper ps-4 text-sm text-soft lg:sticky lg:top-24">{p.sampleBanner}</p>
        </aside>
        <div className="lg:col-span-7 lg:col-start-5">
          {body.map((para, i) => (
            <p key={i} className={`mb-6 text-pretty leading-[1.85] ${i === 0 ? "text-xl text-ink" : "text-lg text-soft"}`}>{para}</p>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper2" aria-labelledby="related">
          <div className="wrap py-16 md:py-24">
            <h2 id="related" className="display h-md mb-10">{p.related}</h2>
            <ul className="grid gap-8 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug} className="group relative grid gap-3">
                  <div className="relative aspect-[3/2] overflow-hidden bg-paper">
                    <AtlasImage src={r.image.src} alt={tr(r.image.alt, lang)} fill sizes="(min-width:768px) 30vw, 100vw" className="img-hover object-cover" />
                  </div>
                  <p className="annot !text-copper">{tr(r.category, lang)}</p>
                  <h3 className="display h-sm text-balance"><Link className="after:absolute after:inset-0" href={href(lang, `/journal/${r.slug}`)}>{tr(r.title, lang)}</Link></h3>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
