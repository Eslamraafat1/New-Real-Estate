import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentsDirectory } from "@/components/pages/AgentsDirectory";
import { PageHeader } from "@/components/ui/SectionHead";
import { listAgents } from "@/lib/api/agents";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/agents">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.agents.meta;
  return { title: m.title, description: m.description };
}

export default async function AgentsPage({ params }: PageProps<"/[lang]/agents">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const p = getDictionary(lang).pages.agents;
  const agents = await listAgents();
  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro}>
        <p role="note" className="annot mt-6 !text-copper">{p.demoNote}</p>
      </PageHeader>
      <AgentsDirectory agents={agents} />
    </>
  );
}
