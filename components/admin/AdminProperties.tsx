"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { useFormat } from "@/lib/hooks";
import { fmt } from "@/lib/i18n";
import { tr } from "@/lib/i18n/config";
import { Modal } from "@/components/ui/Modal";
import {
  PROPERTY_TYPES, type Availability, type Neighborhood, type Property, type PropertyImage, type PropertyType, type Purpose,
} from "@/lib/api/types";
import { ConfirmDelete, ImageListEditor, SectionFrame } from "./AdminUi";

const STATUSES: Availability[] = ["available", "under-offer", "coming-soon"];
type SortKey = "newest" | "price-asc" | "price-desc" | "title";

export function AdminProperties({ rows, onChange, neighborhoods, knownSrcs }: {
  rows: Property[]; onChange: (next: Property[]) => void; neighborhoods: Neighborhood[]; knownSrcs: ReadonlySet<string>;
}) {
  const { t, lang, toast } = useApp();
  const c = t.admin.console;
  const p = c.props;
  const f = useFormat();
  const [q, setQ] = useState("");
  const [purpose, setPurpose] = useState<"" | Purpose>("");
  const [type, setType] = useState<"" | PropertyType>("");
  const [status, setStatus] = useState<"" | Availability>("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [editing, setEditing] = useState<Property | "new" | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows.filter((r) =>
      (!purpose || r.purpose === purpose) && (!type || r.type === type) && (!status || r.availability === status) &&
      (!needle || r.title.en.toLowerCase().includes(needle) || r.title.ar.includes(needle) || r.ref.toLowerCase().includes(needle)));
    return list.sort((a, b) =>
      sort === "price-asc" ? a.price - b.price :
      sort === "price-desc" ? b.price - a.price :
      sort === "title" ? tr(a.title, lang).localeCompare(tr(b.title, lang), lang) :
      b.addedAt.localeCompare(a.addedAt));
  }, [rows, q, purpose, type, status, sort, lang]);

  const nbName = (slug: string) => { const n = neighborhoods.find((x) => x.slug === slug); return n ? tr(n.name, lang) : slug; };
  const toggleFeatured = (id: string) => onChange(rows.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r)));

  return (
    <SectionFrame title={c.sections.properties} contract={["GET /api/properties", "POST /api/properties", "PUT /api/properties/{id}", "DELETE /api/properties/{id}", "PATCH /api/properties/{id}/featured"]}
      actions={<button type="button" className="btn btn-primary" onClick={() => setEditing("new")}><Plus size={16} aria-hidden />{p.add}</button>}>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="label" htmlFor="ap-q">{c.search}</label>
          <input id="ap-q" type="search" className="field" placeholder={p.searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div><label className="label" htmlFor="ap-pu">{p.filterPurpose}</label>
          <select id="ap-pu" className="field" value={purpose} onChange={(e) => setPurpose(e.target.value as "" | Purpose)}>
            <option value="">{t.common.all}</option><option value="sale">{t.labels.purpose.sale}</option><option value="rent">{t.labels.purpose.rent}</option>
          </select></div>
        <div><label className="label" htmlFor="ap-ty">{p.filterType}</label>
          <select id="ap-ty" className="field" value={type} onChange={(e) => setType(e.target.value as "" | PropertyType)}>
            <option value="">{t.common.all}</option>{PROPERTY_TYPES.map((x) => <option key={x} value={x}>{t.labels.type[x]}</option>)}
          </select></div>
        <div><label className="label" htmlFor="ap-st">{p.filterStatus}</label>
          <select id="ap-st" className="field" value={status} onChange={(e) => setStatus(e.target.value as "" | Availability)}>
            <option value="">{t.common.all}</option>{STATUSES.map((x) => <option key={x} value={x}>{t.labels.availability[x]}</option>)}
          </select></div>
        <div><label className="label" htmlFor="ap-so">{p.sortBy}</label>
          <select id="ap-so" className="field" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="newest">{p.sortNewest}</option><option value="price-asc">{p.sortPriceAsc}</option>
            <option value="price-desc">{p.sortPriceDesc}</option><option value="title">{p.sortTitle}</option>
          </select></div>
      </div>
      <p className="annot mb-2" role="status">{fmt(c.rows, { n: shown.length })}</p>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[56rem] border-collapse text-sm">
          <thead>
            <tr className="bg-paper2">
              {[p.cols.ref, p.cols.title, p.cols.type, p.cols.purpose, p.cols.price, p.cols.neighborhood, p.cols.status, p.cols.featured, c.actions].map((h) => (
                <th key={h} scope="col" className="annot px-3 py-2 text-start">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={9} className="px-3 py-8 text-center text-mute">{c.empty}</td></tr>}
            {shown.map((r) => {
              const title = tr(r.title, lang);
              return (
                <tr key={r.id} className="border-t border-line">
                  <td className="num annot px-3 py-2">{r.ref}</td>
                  <td className="px-3 py-2 font-semibold">{title}</td>
                  <td className="px-3 py-2">{t.labels.type[r.type]}</td>
                  <td className="px-3 py-2">{t.labels.purpose[r.purpose]}</td>
                  <td className="whitespace-nowrap px-3 py-2">{f.money(r.price, r.currency)}{r.purpose === "rent" && r.pricePeriod ? ` ${r.pricePeriod === "year" ? t.common.perYear : t.common.perMonth}` : ""}</td>
                  <td className="px-3 py-2">{nbName(r.neighborhood)}</td>
                  <td className="px-3 py-2">{t.labels.availability[r.availability]}</td>
                  <td className="px-3 py-2">
                    <button type="button" className="icon-btn icon-btn-sm" aria-pressed={!!r.featured} aria-label={fmt(p.toggleFeatured, { name: title })} onClick={() => toggleFeatured(r.id)}><Star size={14} /></button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button type="button" className="icon-btn icon-btn-sm" aria-label={`${c.edit}: ${title}`} onClick={() => setEditing(r)}><Pencil size={14} /></button>
                      <button type="button" className="icon-btn icon-btn-sm" aria-label={`${c.del}: ${title}`} onClick={() => setDeleting(r)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? p.add : p.edit} className="!w-[min(94vw,760px)]">
        {editing && (
          <PropertyForm key={editing === "new" ? "new" : editing.id} initial={editing === "new" ? null : editing} neighborhoods={neighborhoods} knownSrcs={knownSrcs}
            count={rows.length} onCancel={() => setEditing(null)}
            onSave={(next) => {
              onChange(editing === "new" ? [next, ...rows] : rows.map((r) => (r.id === next.id ? next : r)));
              setEditing(null);
              toast(c.savedMem);
            }} />
        )}
      </Modal>
      <ConfirmDelete name={deleting ? tr(deleting.title, lang) : null} onCancel={() => setDeleting(null)}
        onConfirm={() => { if (deleting) onChange(rows.filter((r) => r.id !== deleting.id)); setDeleting(null); toast(c.deletedMem); }} />
    </SectionFrame>
  );
}

type Draft = { titleEn: string; titleAr: string; price: string; type: string; purpose: string; neighborhood: string; bedrooms: string; bathrooms: string; area: string; status: string };
type ErrKey = keyof Draft;

function PropertyForm({ initial, neighborhoods, knownSrcs, count, onSave, onCancel }: {
  initial: Property | null; neighborhoods: Neighborhood[]; knownSrcs: ReadonlySet<string>; count: number;
  onSave: (p: Property) => void; onCancel: () => void;
}) {
  const { t, lang } = useApp();
  const c = t.admin.console;
  const p = c.props;
  const [d, setD] = useState<Draft>({
    titleEn: initial?.title.en ?? "", titleAr: initial?.title.ar ?? "", price: initial ? String(initial.price) : "",
    type: initial?.type ?? "", purpose: initial?.purpose ?? "", neighborhood: initial?.neighborhood ?? "",
    bedrooms: initial ? String(initial.bedrooms) : "", bathrooms: initial ? String(initial.bathrooms) : "",
    area: initial ? String(initial.area) : "", status: initial?.availability ?? "",
  });
  const [images, setImages] = useState<PropertyImage[]>(initial?.images ?? []);
  const [errs, setErrs] = useState<Partial<Record<ErrKey, string>>>({});
  const set = (k: ErrKey) => (e: { target: { value: string } }) => setD((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n: Partial<Record<ErrKey, string>> = {};
    const int = (v: string) => v.trim() !== "" && Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 20;
    if (!d.titleEn.trim()) n.titleEn = p.errors.titleEn;
    if (!d.titleAr.trim()) n.titleAr = p.errors.titleAr;
    if (!(Number(d.price) > 0)) n.price = p.errors.price;
    if (!(PROPERTY_TYPES as string[]).includes(d.type)) n.type = p.errors.type;
    if (d.purpose !== "sale" && d.purpose !== "rent") n.purpose = p.errors.purpose;
    if (!neighborhoods.some((x) => x.slug === d.neighborhood)) n.neighborhood = p.errors.neighborhood;
    if (!int(d.bedrooms)) n.bedrooms = p.errors.bedrooms;
    if (!int(d.bathrooms)) n.bathrooms = p.errors.bathrooms;
    if (!(Number(d.area) > 0)) n.area = p.errors.area;
    if (!(STATUSES as string[]).includes(d.status)) n.status = p.errors.status;
    setErrs(n);
    if (Object.keys(n).length) return;

    const nb = neighborhoods.find((x) => x.slug === d.neighborhood)!;
    const title = { en: d.titleEn.trim(), ar: d.titleAr.trim() };
    const patch = {
      title, price: Number(d.price), type: d.type as PropertyType, purpose: d.purpose as Purpose,
      neighborhood: nb.slug, location: nb.name, bedrooms: Number(d.bedrooms), bathrooms: Number(d.bathrooms),
      area: Number(d.area), availability: d.status as Availability, images,
    };
    if (initial) {
      onSave({ ...initial, ...patch, geo: initial.neighborhood === nb.slug ? initial.geo : { x: nb.geo.x, y: nb.geo.y } });
    } else {
      const stamp = Date.now();
      onSave({
        id: `draft-${stamp}`, slug: `${title.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "listing"}-${stamp.toString(36)}`,
        ref: String(count + 1).padStart(3, "0"), summary: { en: "", ar: "" }, description: { en: "", ar: "" }, currency: "USD",
        style: "contemporary", furnished: "na", completion: "ready", geo: { x: nb.geo.x, y: nb.geo.y }, amenities: [], agentId: "",
        featured: false, addedAt: new Date(stamp).toISOString(), isDemo: true, ...patch,
      });
    }
  };

  const fld = (k: ErrKey, label: string, node: (a: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode) => {
    const id = `pf-${k}`;
    return (
      <div>
        <label className="label" htmlFor={id}>{label}</label>
        {node({ id, "aria-invalid": !!errs[k], "aria-describedby": errs[k] ? `${id}-e` : undefined })}
        {errs[k] && <p id={`${id}-e`} role="alert" className="err">{errs[k]}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fld("titleEn", p.titleEn, (a) => <input {...a} dir="ltr" className="field text-start" value={d.titleEn} onChange={set("titleEn")} />)}
        {fld("titleAr", p.titleAr, (a) => <input {...a} dir="rtl" lang="ar" className="field text-start" value={d.titleAr} onChange={set("titleAr")} />)}
        {fld("price", p.price, (a) => <input {...a} type="number" min={0} className="field" value={d.price} onChange={set("price")} />)}
        {fld("area", p.area, (a) => <input {...a} type="number" min={0} className="field" value={d.area} onChange={set("area")} />)}
        {fld("type", p.type, (a) => (
          <select {...a} className="field" value={d.type} onChange={set("type")}>
            <option value="">{p.choose}</option>{PROPERTY_TYPES.map((x) => <option key={x} value={x}>{t.labels.type[x]}</option>)}
          </select>))}
        {fld("purpose", p.purpose, (a) => (
          <select {...a} className="field" value={d.purpose} onChange={set("purpose")}>
            <option value="">{p.choose}</option><option value="sale">{t.labels.purpose.sale}</option><option value="rent">{t.labels.purpose.rent}</option>
          </select>))}
        {fld("neighborhood", p.neighborhood, (a) => (
          <select {...a} className="field" value={d.neighborhood} onChange={set("neighborhood")}>
            <option value="">{p.choose}</option>{neighborhoods.map((x) => <option key={x.slug} value={x.slug}>{tr(x.name, lang)}</option>)}
          </select>))}
        {fld("status", p.status, (a) => (
          <select {...a} className="field" value={d.status} onChange={set("status")}>
            <option value="">{p.choose}</option>{STATUSES.map((x) => <option key={x} value={x}>{t.labels.availability[x]}</option>)}
          </select>))}
        {fld("bedrooms", p.bedrooms, (a) => <input {...a} type="number" min={0} max={20} className="field" value={d.bedrooms} onChange={set("bedrooms")} />)}
        {fld("bathrooms", p.bathrooms, (a) => <input {...a} type="number" min={0} max={20} className="field" value={d.bathrooms} onChange={set("bathrooms")} />)}
      </div>
      <fieldset className="grid gap-3 border-t border-line pt-4">
        <legend className="label">{p.images} · {fmt(p.imagesCount, { n: images.length })}</legend>
        <ImageListEditor images={images} onChange={setImages} altText={{ en: d.titleEn || "Property", ar: d.titleAr || "عقار" }} knownSrcs={knownSrcs} />
      </fieldset>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-sm" onClick={onCancel}>{c.cancel}</button>
        <button type="submit" className="btn btn-sm btn-primary">{c.save}</button>
      </div>
    </form>
  );
}
