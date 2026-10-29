"use client";

import { useMemo, useState } from "react";
import type { Agent } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { AgentCard } from "@/components/agents/AgentCard";
import { fmt } from "@/lib/i18n";
import { tr } from "@/lib/i18n/config";

/** Agents grid with client-side language and specialty filters. */
export function AgentsDirectory({ agents }: { agents: Agent[] }) {
  const { t, lang } = useApp();
  const p = t.pages.agents;
  const [language, setLanguage] = useState("");
  const [specialty, setSpecialty] = useState("");

  const languages = useMemo(() => [...new Set(agents.flatMap((a) => a.languages))], [agents]);
  const specialties = useMemo(() => {
    const m = new Map<string, Agent["specialties"][number]>();
    agents.forEach((a) => a.specialties.forEach((s) => m.set(s.en, s)));
    return [...m.entries()];
  }, [agents]);

  const shown = agents.filter(
    (a) => (!language || a.languages.includes(language as Agent["languages"][number])) && (!specialty || a.specialties.some((s) => s.en === specialty)),
  );

  return (
    <div className="wrap pb-24">
      <div className="mb-8 flex flex-wrap items-end gap-4 border-y border-line py-5">
        <div className="grid gap-1">
          <label className="label" htmlFor="ag-lang">{p.language}</label>
          <select id="ag-lang" className="field min-w-44" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">{p.anyLanguage}</option>
            {languages.map((l) => <option key={l} value={l}>{p.languages[l]}</option>)}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="label" htmlFor="ag-spec">{p.specialty}</label>
          <select id="ag-spec" className="field min-w-44" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            <option value="">{p.anySpecialty}</option>
            {specialties.map(([k, s]) => <option key={k} value={k}>{tr(s, lang)}</option>)}
          </select>
        </div>
        <p className="annot ms-auto" aria-live="polite">{fmt(p.count, { n: shown.length })}</p>
      </div>
      {shown.length === 0 ? (
        <p className="py-12 text-soft">{p.none}</p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((a, i) => (
            <li key={a.id} className={i % 3 === 1 ? "xl:mt-10" : i % 3 === 2 ? "xl:mt-20" : ""}><AgentCard agent={a} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
