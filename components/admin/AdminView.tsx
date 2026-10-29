"use client";

import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { fetchAgents, fetchDevelopments, fetchNeighborhoods, fetchProperties } from "@/lib/api/client";
import { useAsync } from "@/lib/hooks";
import { PageHeader } from "@/components/ui/SectionHead";
import { Tabs } from "./Tabs";
import { AdminProperties } from "./AdminProperties";
import {
  AdminAgents, AdminCategories, AdminDevelopments, AdminFeatured, AdminImages, AdminLocations, AdminRequests,
} from "./AdminSections";

type Section = "properties" | "categories" | "locations" | "agents" | "developments" | "images" | "featured" | "inquiries" | "viewings";
const ORDER: Section[] = ["properties", "categories", "locations", "agents", "developments", "images", "featured", "inquiries", "viewings"];

export function AdminView() {
  const { t } = useApp();
  const c = t.admin.console;
  const [section, setSection] = useState<Section>("properties");
  const [reload, setReload] = useState(0);

  const { loading, data, error } = useAsync("admin-data", async (signal) => {
    const [props, nbs, agents, devs] = await Promise.all([
      fetchProperties({ pageSize: 100 }, signal), fetchNeighborhoods(signal), fetchAgents(signal), fetchDevelopments(signal),
    ]);
    return { props: props.items, nbs, agents, devs };
  }, reload);

  // In-memory edits layer over the loaded data (no effects, no persistence).
  const [props, setProps] = useState<NonNullable<typeof data>["props"] | null>(null);
  const [nbs, setNbs] = useState<NonNullable<typeof data>["nbs"] | null>(null);
  const [agents, setAgents] = useState<NonNullable<typeof data>["agents"] | null>(null);
  const [devs, setDevs] = useState<NonNullable<typeof data>["devs"] | null>(null);

  const knownSrcs = useMemo(() => new Set((data?.props ?? []).flatMap((p) => p.images.map((i) => i.src))), [data]);

  const tabs = ORDER.map((k) => ({ key: k, label: c.sections[k] }));

  let body;
  if (loading) body = <p role="status" className="annot">{c.loading}</p>;
  else if (error || !data) {
    body = (
      <div role="alert" className="grid justify-items-start gap-3 border border-[#b3321f] p-5">
        <p>{c.loadError}</p>
        <button type="button" className="btn btn-sm" onClick={() => { setReload((n) => n + 1); }}>{c.retry}</button>
      </div>
    );
  } else {
    const P = props ?? data.props, N = nbs ?? data.nbs, A = agents ?? data.agents, D = devs ?? data.devs;
    body = (
      <>
        {section === "properties" && <AdminProperties rows={P} onChange={setProps} neighborhoods={N} knownSrcs={knownSrcs} />}
        {section === "categories" && <AdminCategories properties={P} />}
        {section === "locations" && <AdminLocations rows={N} onChange={setNbs} properties={P} />}
        {section === "agents" && <AdminAgents rows={A} onChange={setAgents} properties={P} />}
        {section === "developments" && <AdminDevelopments rows={D} onChange={setDevs} />}
        {section === "images" && <AdminImages rows={P} onChange={setProps} knownSrcs={knownSrcs} />}
        {section === "featured" && <AdminFeatured rows={P} onChange={setProps} />}
        {section === "inquiries" && <AdminRequests kind="inquiries" />}
        {section === "viewings" && <AdminRequests kind="viewings" />}
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={c.eyebrow} title={c.title} />
      <div className="wrap pb-20">
        <p role="alert" className="mb-8 flex gap-3 border-2 border-[#b3321f] bg-surface p-4 text-sm font-semibold">
          <ShieldAlert size={20} className="mt-0.5 shrink-0 text-[#b3321f]" aria-hidden />{c.banner}
        </p>
        <Tabs tabs={tabs} value={section} onChange={setSection} label={c.navLabel}>{body}</Tabs>
      </div>
    </>
  );
}
