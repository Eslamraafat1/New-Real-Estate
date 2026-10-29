import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Contour } from "@/components/ui/Contour";
import { Arrow } from "@/components/ui/Arrow";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { SectionHead } from "@/components/ui/SectionHead";
import { Steps } from "@/components/pages/Steps";
import { imgUrl } from "@/data/demo/images";
import { getDictionary } from "@/lib/i18n";
import { href, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.about.meta;
  return { title: m.title, description: m.description };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.pages.about;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <Contour seed={4} rings={16} className="absolute inset-0 size-full text-forest opacity-60" />
        <div className="wrap relative pt-16 pb-20 md:pt-28 md:pb-32">
          <p className="annot mb-6 !text-copper">{p.eyebrow}</p>
          <h1 className="display h-xl max-w-[14ch] text-balance">{p.title}</h1>
          <p className="mt-8 max-w-[56ch] text-lg text-soft text-pretty">{p.intro}</p>
          <p role="note" className="mt-10 inline-block border border-line bg-surface px-4 py-2 text-sm">
            <span className="annot me-3 !text-copper">{t.pages.demoLabel}</span>{p.demoNote}
          </p>
        </div>
      </section>

      <section className="section wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="numeral text-8xl text-copper md:text-9xl">{p.storyNum}</p>
          <h2 className="display h-lg mt-6 max-w-[10ch] text-balance">{p.storyTitle}</h2>
          <p className="annot mt-6">{p.coordinates}</p>
        </div>
        <div className="grid gap-6 lg:col-span-7 lg:col-start-6">
          <div className="relative aspect-[16/9] overflow-hidden bg-paper2">
            <AtlasImage src={imgUrl(0, 1600)} alt="" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
          </div>
          {p.story.map((para, i) => (
            <p key={i} className={`text-pretty text-soft ${i === 0 ? "text-xl leading-relaxed text-ink" : "leading-relaxed"}`}>{para}</p>
          ))}
        </div>
      </section>

      <section className="section border-y border-line bg-paper2">
        <div className="wrap">
          <SectionHead num={p.principlesNum} title={p.principlesTitle} />
          <div className="mt-14 grid border-t border-line md:grid-cols-2">
            {p.principles.map((x, i) => (
              <div key={x.t} className={`grid gap-3 border-b border-line py-8 md:px-8 ${i % 2 === 0 ? "md:border-e" : ""}`}>
                <span className="annot !text-copper">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display h-sm">{x.t}</h3>
                <p className="max-w-[46ch] text-soft text-pretty">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section wrap">
        <SectionHead num={p.howNum} title={p.howTitle} />
        <div className="mt-14"><Steps items={p.how} label={t.pages.step} /></div>
      </section>

      <section className="section wrap grid gap-10 border-t border-line lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHead num={p.teamNum} title={p.teamTitle} />
        </div>
        <div className="grid content-start gap-6 lg:col-span-6 lg:col-start-7">
          <p className="text-lg leading-relaxed text-soft text-pretty">{p.teamText}</p>
          <Link className="btn justify-self-start" href={href(lang, "/agents")}>{p.teamCta}<Arrow /></Link>
        </div>
      </section>

      <section className="bg-forest text-onforest">
        <div className="wrap flex flex-wrap items-end justify-between gap-8 py-16 md:py-24">
          <div className="grid gap-3">
            <h2 className="display h-lg max-w-[14ch] text-balance">{p.ctaTitle}</h2>
            <p className="max-w-[44ch] opacity-80">{p.ctaText}</p>
          </div>
          <Link className="btn btn-copper" href={href(lang, "/neighborhoods")}>{p.ctaLink}<Arrow /></Link>
        </div>
      </section>
    </>
  );
}
