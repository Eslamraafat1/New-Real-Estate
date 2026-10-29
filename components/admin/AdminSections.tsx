"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { useFormat } from "@/lib/hooks";
import { fmt, getDictionary } from "@/lib/i18n";
import { tr, type L } from "@/lib/i18n/config";
import {
  ARCH_STYLES, PROPERTY_TYPES, type Agent, type Completion, type Development, type Neighborhood, type Property, type PropertyImage,
} from "@/lib/api/types";
import { EntityTable, ImageListEditor, SectionFrame, Switch, type Col, type FieldDef } from "./AdminUi";

const setL = (l: L, k: "en" | "ar", v: string): L => ({ ...l, [k]: v });

/* ------------------------------ Categories ------------------------------ */
interface Category { id: string; kind: "type" | "style"; key: string; name: L; visible: boolean }

export function AdminCategories({ properties }: { properties: Property[] }) {
  const { t, lang } = useApp();
  const c = t.admin.console;
  const [rows, setRows] = useState<Category[]>(() => {
    const en = getDictionary("en").labels, ar = getDictionary("ar").labels;
    return [
      ...PROPERTY_TYPES.map((k): Category => ({ id: `type:${k}`, kind: "type", key: k, name: { en: en.type[k], ar: ar.type[k] }, visible: true })),
      ...ARCH_STYLES.map((k): Category => ({ id: `style:${k}`, kind: "style", key: k, name: { en: en.style[k], ar: ar.style[k] }, visible: true })),
    ];
  });
  const count = (r: Category) => properties.filter((p) => (r.kind === "type" ? p.type : p.style) === r.key).length;
  const cols: Col<Category>[] = [
    { label: c.entity.kind, cell: (r) => (r.kind === "type" ? c.entity.type : c.entity.style) },
    { label: c.entity.key, cell: (r) => <code className="text-xs">{r.key}</code> },
    { label: c.nameEn, cell: (r) => r.name.en },
    { label: c.nameAr, cell: (r) => r.name.ar },
    { label: c.entity.visible, cell: (r) => (r.visible ? c.yes : c.no) },
    { label: c.entity.listings, cell: (r) => count(r) },
  ];
  const fields: FieldDef<Category>[] = [
    { id: "en", label: c.nameEn, get: (r) => r.name.en, set: (r, v) => ({ ...r, name: setL(r.name, "en", v) }) },
    { id: "ar", label: c.nameAr, get: (r) => r.name.ar, set: (r, v) => ({ ...r, name: setL(r.name, "ar", v) }) },
    { id: "visible", label: c.entity.visible, kind: "select", options: [{ value: "1", label: c.yes }, { value: "0", label: c.no }], get: (r) => (r.visible ? "1" : "0"), set: (r, v) => ({ ...r, visible: v === "1" }) },
  ];
  return (
    <SectionFrame title={c.sections.categories} contract={["GET /api/categories", "PUT /api/categories/{kind}/{key}"]}>
      <EntityTable rows={rows} onChange={setRows} getId={(r) => r.id} getName={(r) => tr(r.name, lang)} cols={cols} fields={fields} />
    </SectionFrame>
  );
}

/* ------------------------------ Locations ------------------------------ */
export function AdminLocations({ rows, onChange, properties }: { rows: Neighborhood[]; onChange: (n: Neighborhood[]) => void; properties: Property[] }) {
  const { t, lang } = useApp();
  const c = t.admin.console;
  const f = useFormat();
  const cols: Col<Neighborhood>[] = [
    { label: c.entity.slug, cell: (r) => <code className="text-xs">{r.slug}</code> },
    { label: c.nameEn, cell: (r) => r.name.en },
    { label: c.nameAr, cell: (r) => r.name.ar },
    { label: c.entity.avgPrice, cell: (r) => f.money(r.sampleAvgPricePerM2) },
    { label: c.entity.listings, cell: (r) => properties.filter((p) => p.neighborhood === r.slug).length },
  ];
  const fields: FieldDef<Neighborhood>[] = [
    { id: "en", label: c.nameEn, get: (r) => r.name.en, set: (r, v) => ({ ...r, name: setL(r.name, "en", v) }) },
    { id: "ar", label: c.nameAr, get: (r) => r.name.ar, set: (r, v) => ({ ...r, name: setL(r.name, "ar", v) }) },
    { id: "tg", label: c.entity.tagline, get: (r) => r.tagline.en, set: (r, v) => ({ ...r, tagline: setL(r.tagline, "en", v) }) },
    { id: "tga", label: c.entity.taglineAr, get: (r) => r.tagline.ar, set: (r, v) => ({ ...r, tagline: setL(r.tagline, "ar", v) }) },
    { id: "avg", label: c.entity.avgPrice, kind: "number", min: 0, get: (r) => r.sampleAvgPricePerM2, set: (r, v) => ({ ...r, sampleAvgPricePerM2: Number(v) }) },
  ];
  return (
    <SectionFrame title={c.sections.locations} contract={["GET /api/neighborhoods", "PUT /api/neighborhoods/{slug}"]}>
      <EntityTable rows={rows} onChange={onChange} getId={(r) => r.slug} getName={(r) => tr(r.name, lang)} cols={cols} fields={fields} />
    </SectionFrame>
  );
}

/* ------------------------------ Agents ------------------------------ */
export function AdminAgents({ rows, onChange, properties }: { rows: Agent[]; onChange: (n: Agent[]) => void; properties: Property[] }) {
  const { t, lang } = useApp();
  const c = t.admin.console;
  const cols: Col<Agent>[] = [
    { label: c.entity.slug, cell: (r) => <code className="text-xs">{r.slug}</code> },
    { label: c.nameEn, cell: (r) => r.name.en },
    { label: c.nameAr, cell: (r) => r.name.ar },
    { label: c.entity.role, cell: (r) => tr(r.role, lang) },
    { label: c.entity.email, cell: (r) => <span dir="ltr">{r.email}</span> },
    { label: c.entity.listings, cell: (r) => properties.filter((p) => p.agentId === r.id).length },
  ];
  const fields: FieldDef<Agent>[] = [
    { id: "en", label: c.nameEn, get: (r) => r.name.en, set: (r, v) => ({ ...r, name: setL(r.name, "en", v) }) },
    { id: "ar", label: c.nameAr, get: (r) => r.name.ar, set: (r, v) => ({ ...r, name: setL(r.name, "ar", v) }) },
    { id: "ro", label: c.entity.role, get: (r) => r.role.en, set: (r, v) => ({ ...r, role: setL(r.role, "en", v) }) },
    { id: "roa", label: c.entity.roleAr, get: (r) => r.role.ar, set: (r, v) => ({ ...r, role: setL(r.role, "ar", v) }) },
    { id: "em", label: c.entity.email, get: (r) => r.email, set: (r, v) => ({ ...r, email: v }) },
    { id: "ph", label: c.entity.phone, get: (r) => r.phone, set: (r, v) => ({ ...r, phone: v }) },
  ];
  return (
    <SectionFrame title={c.sections.agents} contract={["GET /api/agents", "PUT /api/agents/{id}"]}>
      <EntityTable rows={rows} onChange={onChange} getId={(r) => r.id} getName={(r) => tr(r.name, lang)} cols={cols} fields={fields} />
    </SectionFrame>
  );
}

/* ------------------------------ Developments ------------------------------ */
export function AdminDevelopments({ rows, onChange }: { rows: Development[]; onChange: (n: Development[]) => void }) {
  const { t, lang } = useApp();
  const c = t.admin.console;
  const f = useFormat();
  const statuses: Completion[] = ["ready", "under-construction", "off-plan"];
  const cols: Col<Development>[] = [
    { label: c.entity.slug, cell: (r) => <code className="text-xs">{r.slug}</code> },
    { label: c.nameEn, cell: (r) => r.name.en },
    { label: c.nameAr, cell: (r) => r.name.ar },
    { label: c.entity.status, cell: (r) => t.labels.completion[r.status] },
    { label: c.entity.progress, cell: (r) => `${f.num(r.progress)}%` },
    { label: c.entity.units, cell: (r) => `${f.num(r.unitsAvailable)} / ${f.num(r.units)}` },
  ];
  const fields: FieldDef<Development>[] = [
    { id: "en", label: c.nameEn, get: (r) => r.name.en, set: (r, v) => ({ ...r, name: setL(r.name, "en", v) }) },
    { id: "ar", label: c.nameAr, get: (r) => r.name.ar, set: (r, v) => ({ ...r, name: setL(r.name, "ar", v) }) },
    { id: "dv", label: c.entity.developer, get: (r) => r.developer.en, set: (r, v) => ({ ...r, developer: setL(r.developer, "en", v) }) },
    { id: "dva", label: c.entity.developerAr, get: (r) => r.developer.ar, set: (r, v) => ({ ...r, developer: setL(r.developer, "ar", v) }) },
    { id: "st", label: c.entity.status, kind: "select", options: statuses.map((s) => ({ value: s, label: t.labels.completion[s] })), get: (r) => r.status, set: (r, v) => ({ ...r, status: v as Completion }) },
    { id: "pr", label: c.entity.progress, kind: "number", min: 0, max: 100, get: (r) => r.progress, set: (r, v) => ({ ...r, progress: Number(v) }) },
    { id: "un", label: c.entity.units, kind: "number", min: 0, get: (r) => r.units, set: (r, v) => ({ ...r, units: Number(v), unitsAvailable: Math.min(r.unitsAvailable, Number(v)) }) },
  ];
  return (
    <SectionFrame title={c.sections.developments} contract={["GET /api/developments", "PUT /api/developments/{slug}"]}>
      <EntityTable rows={rows} onChange={onChange} getId={(r) => r.slug} getName={(r) => tr(r.name, lang)} cols={cols} fields={fields} />
    </SectionFrame>
  );
}

/* ------------------------------ Property images ------------------------------ */
export function AdminImages({ rows, onChange, knownSrcs }: { rows: Property[]; onChange: (n: Property[]) => void; knownSrcs: ReadonlySet<string> }) {
  const { t, lang } = useApp();
  const c = t.admin.console;
  const [pickedId, setPickedId] = useState("");
  const current = rows.find((r) => r.id === pickedId) ?? rows[0];
  const update = (images: PropertyImage[]) => { if (current) onChange(rows.map((r) => (r.id === current.id ? { ...r, images } : r))); };
  return (
    <SectionFrame title={c.sections.images} contract={["GET /api/properties/{id}/images", "POST /api/properties/{id}/images", "PUT /api/properties/{id}/images/order", "DELETE /api/properties/{id}/images/{imageId}"]}>
      {current ? (
        <div className="grid gap-5">
          <div className="max-w-md">
            <label className="label" htmlFor="img-prop">{c.images.pick}</label>
            <select id="img-prop" className="field" value={current.id} onChange={(e) => setPickedId(e.target.value)}>
              {rows.map((r) => <option key={r.id} value={r.id}>{r.ref} · {tr(r.title, lang)}</option>)}
            </select>
          </div>
          <h3 className="display h-sm">{c.images.list} · {fmt(c.props.imagesCount, { n: current.images.length })}</h3>
          <ImageListEditor key={current.id} images={current.images} onChange={update} altText={current.title} knownSrcs={knownSrcs} />
        </div>
      ) : <p className="text-mute">{c.empty}</p>}
    </SectionFrame>
  );
}

/* ------------------------------ Featured ------------------------------ */
export function AdminFeatured({ rows, onChange }: { rows: Property[]; onChange: (n: Property[]) => void }) {
  const { t, lang } = useApp();
  const c = t.admin.console;
  const n = rows.filter((r) => r.featured).length;
  return (
    <SectionFrame title={c.sections.featured} intro={c.featured.intro} contract={["GET /api/properties?featured=1", "PATCH /api/properties/{id}/featured"]}>
      <p className="annot mb-2" role="status">{fmt(c.featured.count, { n })}</p>
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 py-2">
            <span id={`ft-${r.id}`} className="min-w-0 text-sm"><span className="annot me-3">{r.ref}</span>{tr(r.title, lang)}</span>
            <Switch checked={!!r.featured} labelledBy={`ft-${r.id}`} onText={c.yes} offText={c.no}
              onChange={(v) => onChange(rows.map((x) => (x.id === r.id ? { ...x, featured: v } : x)))} />
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}

/* ------------------------------ Inquiries / viewings ------------------------------ */
type ReqStatus = "new" | "contacted" | "closed";
const STATUS_KEYS: ReqStatus[] = ["new", "contacted", "closed"];

export function AdminRequests({ kind }: { kind: "inquiries" | "viewings" }) {
  const { t } = useApp();
  const c = t.admin.console;
  const r = c.requests;
  const f = useFormat();
  const [status, setStatus] = useState<Record<number, ReqStatus>>({});
  const items = r[kind];
  return (
    <SectionFrame title={c.sections[kind]} intro={r.sampleNote}
      contract={kind === "inquiries" ? ["GET /api/inquiries", "PATCH /api/inquiries/{id}"] : ["GET /api/viewing-requests", "PATCH /api/viewing-requests/{id}"]}>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="bg-paper2">
              {[r.cols.from, r.cols.about, r.cols.received, r.cols.status].map((h) => <th key={h} scope="col" className="annot px-3 py-2 text-start">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.from} className="border-t border-line">
                <td className="px-3 py-2 font-semibold">{it.from} <span className="chip ms-2" data-active="false">{c.sample}</span></td>
                <td className="px-3 py-2">{it.about}</td>
                <td className="whitespace-nowrap px-3 py-2">{f.date(it.date)}</td>
                <td className="px-3 py-2">
                  <select className="field !min-h-9 !py-1" aria-label={fmt(r.statusFor, { name: it.from })} value={status[i] ?? "new"}
                    onChange={(e) => setStatus((s) => ({ ...s, [i]: e.target.value as ReqStatus }))}>
                    {STATUS_KEYS.map((k) => <option key={k} value={k}>{r.status[k]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionFrame>
  );
}
