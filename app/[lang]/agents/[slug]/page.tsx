import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { Monogram } from "@/components/agents/AgentCard";
import { InquiryForm } from "@/components/forms/forms";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Arrow } from "@/components/ui/Arrow";
import { getAgent, listAgents } from "@/lib/api/agents";
import { listNeighborhoods } from "@/lib/api/locations";
import { listProperties } from "@/lib/api/properties";
import { fmt, getDictionary } from "@/lib/i18n";
import { href, isLocale, locales, tr } from "@/lib/i18n/config";

// Fully static route: unknown slugs wait for the static render, so notFound()
// returns a real 404 on the first request (see properties/[slug]/page.tsx).
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const all = await listAgents();
  return locales.flatMap((lang) => all.map((a) => ({ lang, slug: a.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/agents/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const a = await getAgent(slug);
  if (!a) return {};
  return { title: tr(a.name, lang), description: `${tr(a.role, lang)} — ${tr(a.bio, lang)}` };
}

export default async function AgentPage({ params }: PageProps<"/[lang]/agents/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await getAgent(slug);
  if (!agent) notFound();
  const t = getDictionary(lang);
  const p = t.pages.agents;
  const [hoods, props] = await Promise.all([listNeighborhoods(), listProperties({ pageSize: 100 })]);
  const mine = props.items.filter((x) => x.agentId === agent.id);
  const areas = agent.neighborhoods.map((s) => hoods.find((h) => h.slug === s)).filter((h) => !!h);
  const name = tr(agent.name, lang);

  return (
    <>
      <header className="wrap grid gap-8 pt-12 pb-12 md:pt-20 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
        <Monogram name={agent.name.en} className="w-40 text-6xl lg:w-full" />
        <div>
          <Link href={href(lang, "/agents")} className="annot inline-flex items-center gap-2 hover:text-ink"><Arrow className="rotate-180" />{p.allAgents}</Link>
          <p className="annot mt-6 !text-copper">{p.profileEyebrow} · {t.pages.demoLabel}</p>
          <h1 className="display h-xl mt-3 text-balance">{name}</h1>
          <p className="mt-3 text-lg text-soft">{tr(agent.role, lang)}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a className="btn btn-sm" dir="ltr" href={`tel:${agent.phone.replace(/\s/g, "")}`}><Phone size={14} />{agent.phone}</a>
            <a className="btn btn-sm" dir="ltr" href={`mailto:${agent.email}`}><Mail size={14} />{agent.email}</a>
          </div>
        </div>
      </header>

      <section className="wrap grid gap-10 border-t border-line pb-16 pt-10 lg:grid-cols-3">
        <div>
          <h2 className="annot mb-3 !text-copper">{p.about}</h2>
          <p className="leading-relaxed text-soft text-pretty">{tr(agent.bio, lang)}</p>
        </div>
        <div>
          <h2 className="annot mb-3 !text-copper">{p.specialties}</h2>
          <ul className="flex flex-wrap gap-2">{agent.specialties.map((s) => <li key={s.en} className="chip">{tr(s, lang)}</li>)}</ul>
          <h2 className="annot mb-3 mt-8 !text-copper">{p.languagesSpoken}</h2>
          <p className="text-soft">{agent.languages.map((l) => p.languages[l]).join(" · ")}</p>
        </div>
        <div>
          <h2 className="annot mb-3 !text-copper">{p.areas}</h2>
          <ul className="border-t border-line">
            {areas.map((h) => (
              <li key={h.slug} className="border-b border-linesoft">
                <Link className="flex items-center justify-between py-3 hover:text-copper" href={href(lang, `/neighborhoods/${h.slug}`)}>{tr(h.name, lang)}<Arrow /></Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line bg-paper2">
        <div className="wrap py-16 md:py-20">
          <h2 className="display h-md mb-8">{p.listingsTitle} <span className="annot ms-2">{fmt(t.common.listings, { n: mine.length })}</span></h2>
          {mine.length === 0 ? <p className="text-soft">{p.noListings}</p> : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((x) => <li key={x.id}><PropertyCard p={x} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" /></li>)}
            </ul>
          )}
        </div>
      </section>

      <section className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="display h-lg text-balance">{fmt(p.contactTitle, { name })}</h2>
          <p className="mt-4 text-soft">{p.contactIntro}</p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6"><InquiryForm kind="agent" agentId={agent.id} /></div>
      </section>
    </>
  );
}
