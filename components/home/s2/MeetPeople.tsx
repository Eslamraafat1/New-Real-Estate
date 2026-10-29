import Link from "next/link";
import { AgentCard } from "@/components/agents/AgentCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";

/** Q — Meet the people: advisors in a staggered, asymmetric arrangement. */
export function MeetPeople({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  const agents = data.agents.slice(0, 4);
  if (agents.length === 0) return null;
  const offsets = ["", "md:mt-16", "md:mt-6", "md:mt-24"];
  return (
    <section id="meet-the-people" aria-labelledby="people-h" className="section bg-paper2">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <div id="people-h"><SectionHead num={t.people.num} eyebrow={t.people.eyebrow} title={t.people.title} intro={t.people.intro} /></div>
            <Link href={href(lang, "/agents")} className="btn mt-8">{t.people.cta}<Arrow /></Link>
            <p className="annot mt-8 !text-copper">{t.people.demo}</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:col-span-8 md:col-start-5 md:gap-8">
          {agents.map((a, i) => (
            <Reveal key={a.id} delay={(i % 2) * 120} className={offsets[i % 4]}>
              <div className="reveal"><AgentCard agent={a} /></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
