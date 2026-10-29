"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import type { Agent } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { tr } from "@/lib/i18n/config";

/** Monogram avatar — demo identities have no photographs. */
export function Monogram({ name, className = "" }: { name: string; className?: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  return (
    <div aria-hidden className={`grid aspect-square place-items-center border border-line bg-paper2 display text-3xl ${className}`}>
      {initials}
    </div>
  );
}

/** Agent / advisor card. Demo identities only: 555 phone numbers and example.com emails. */
export function AgentCard({ agent, className = "" }: { agent: Agent; className?: string }) {
  const { lang, href, t } = useApp();
  const name = tr(agent.name, lang);
  return (
    <article className={`group relative grid gap-4 border border-line bg-surface p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <Monogram name={agent.name.en} className="w-20 shrink-0" />
        <div className="min-w-0">
          <p className="annot">{t.common.sample}</p>
          <h3 className="display h-sm"><Link className="after:absolute after:inset-0" href={href(`/agents/${agent.slug}`)}>{name}</Link></h3>
          <p className="text-sm text-soft">{tr(agent.role, lang)}</p>
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-soft">{tr(agent.bio, lang)}</p>
      <div className="relative z-10 flex flex-wrap gap-2 text-sm">
        <a className="btn btn-sm" href={`tel:${agent.phone.replace(/\s/g, "")}`}><Phone size={14} />{agent.phone}</a>
        <a className="btn btn-sm" href={`mailto:${agent.email}`}><Mail size={14} />{t.footer.email}</a>
      </div>
    </article>
  );
}
