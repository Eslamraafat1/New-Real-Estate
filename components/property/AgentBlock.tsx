"use client";

import Link from "next/link";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { Monogram } from "@/components/agents/AgentCard";
import { tr } from "@/lib/i18n/config";
import { SectionRule } from "./SectionRule";
import { usePropertyDetail } from "./PropertyDetailContext";

/** The listing agent (fictional identity; 555 phone and example.com email). */
export function AgentBlock() {
  const { t, lang, href } = useApp();
  const a = t.property.agent;
  const { agent, openDialog } = usePropertyDetail();
  if (!agent) return null;
  return (
    <section id="agent" aria-labelledby="agent-h" className="scroll-mt-32 py-16 md:py-24">
      <SectionRule className="mb-10" />
      <div className="grid gap-8 md:grid-cols-12">
        <header className="md:col-span-4">
          <p className="annot !text-copper">{a.eyebrow}</p>
          <h2 id="agent-h" className="display h-lg mt-3">{a.title}</h2>
        </header>
        <div className="grid gap-6 md:col-span-8 md:grid-cols-[9rem_1fr]">
          <Monogram name={agent.name.en} className="w-36" />
          <div className="grid content-start gap-3">
            <p className="annot annot-ar-ok">{a.sample}</p>
            <p className="display h-md">{tr(agent.name, lang)}</p>
            <p className="text-soft">{tr(agent.role, lang)}</p>
            <p className="text-sm text-soft">{a.languages}: {agent.languages.map((l) => a.langNames[l]).join(" · ")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a className="btn btn-sm" href={`tel:${agent.phone.replace(/\s/g, "")}`}><Phone size={14} />{agent.phone}</a>
              <a className="btn btn-sm" href={`mailto:${agent.email}`}><Mail size={14} />{agent.email}</a>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => openDialog("contact")}><MessageSquare size={14} />{a.message}</button>
              <Link className="btn btn-sm" href={href(`/agents/${agent.slug}`)}>{a.viewProfile}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
