"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { Property } from "@/lib/api/types";
import { fetchProperties } from "@/lib/api/client";
import { computeMortgage } from "@/lib/finance";
import { useAsync, useFormat } from "@/lib/hooks";
import { tr } from "@/lib/i18n/config";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Price } from "@/components/property/PropertyBits";
import { Arrow } from "@/components/ui/Arrow";

/** Comparison studio: up to three properties, differences highlighted, remove per column. State persists in localStorage. */
export function CompareStudio() {
  const { t, lang, href, compare, toggleCompare, clearCompare } = useApp();
  const f = useFormat();
  const key = compare.join(",");
  const { data, loading, error } = useAsync(`compare:${key}`, (signal) => (compare.length ? fetchProperties({ ids: compare, pageSize: 100 }, signal) : Promise.resolve(null)));

  if (!compare.length) {
    return (
      <div className="wrap pb-20"><div className="grid gap-4 border border-dashed border-line p-12 text-center">
        <p className="display h-md">{t.compare.empty}</p><p className="text-soft">{t.compare.emptyHint}</p>
        <Link href={href("/properties")} className="btn btn-primary justify-self-center">{t.nav.listings}<Arrow /></Link>
      </div></div>
    );
  }
  if (error) return <div role="alert" className="wrap pb-20">{t.common.error}</div>;

  // keep the user's selection order, drop ids no longer in the catalog
  const items: Property[] = compare.map((id) => data?.items.find((p) => p.id === id)).filter((p): p is Property => !!p);
  if (loading && !items.length) return <div className="wrap pb-20" aria-busy="true"><div className="h-64 animate-pulse bg-paper2" /></div>;

  type Row = { key: string; label: string; cell: (p: Property) => React.ReactNode; value: (p: Property) => string };
  const monthly = (p: Property) => {
    if (p.purpose === "rent") return f.money(p.price, p.currency);
    const r = computeMortgage({ price: p.price, down: p.price * 0.2, ratePct: 6, years: 25 });
    return f.money(r.monthlyLoan, p.currency);
  };
  const rows: Row[] = [
    { key: "price", label: t.compare.row.price, cell: (p) => <Price p={p} className="display h-sm" />, value: (p) => `${p.price}${p.currency}` },
    { key: "location", label: t.compare.row.location, cell: (p) => tr(p.location, lang), value: (p) => p.neighborhood },
    { key: "type", label: t.compare.row.type, cell: (p) => t.labels.type[p.type], value: (p) => p.type },
    { key: "purpose", label: t.compare.row.purpose, cell: (p) => t.labels.purpose[p.purpose], value: (p) => p.purpose },
    { key: "style", label: t.compare.row.style, cell: (p) => t.labels.style[p.style], value: (p) => p.style },
    { key: "bedrooms", label: t.compare.row.bedrooms, cell: (p) => (p.type === "land" ? "—" : f.num(p.bedrooms)), value: (p) => String(p.bedrooms) },
    { key: "bathrooms", label: t.compare.row.bathrooms, cell: (p) => (p.type === "land" ? "—" : f.num(p.bathrooms)), value: (p) => String(p.bathrooms) },
    { key: "area", label: t.compare.row.area, cell: (p) => f.area(p.area), value: (p) => String(p.area) },
    { key: "ppm", label: t.compare.row.pricePerM2, cell: (p) => f.money(Math.round(p.price / p.area), p.currency), value: (p) => String(Math.round(p.price / p.area)) },
    { key: "completion", label: t.compare.row.completion, cell: (p) => t.labels.completion[p.completion], value: (p) => p.completion },
    { key: "availability", label: t.compare.row.availability, cell: (p) => t.labels.availability[p.availability], value: (p) => p.availability },
    { key: "furnished", label: t.compare.row.furnished, cell: (p) => t.labels.furnished[p.furnished], value: (p) => p.furnished },
    { key: "monthly", label: t.compare.row.monthly, cell: (p) => <>{monthly(p)}<span className="annot ms-1">{p.purpose === "rent" ? t.common.perMonth : "*"}</span></>, value: (p) => monthly(p) },
    { key: "amenities", label: t.compare.row.amenities, cell: (p) => <ul className="flex flex-wrap gap-1">{p.amenities.map((a) => <li key={a} className="annot annot-ar-ok border border-line px-1.5 py-0.5">{t.labels.amenity[a]}</li>)}</ul>, value: (p) => [...p.amenities].sort().join("|") },
  ];
  const cols = items.length;

  return (
    <div className="wrap pb-20">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="annot">{t.compare.trayTitle.replace("{n}", f.num(cols))}</p>
        <div className="flex gap-2">
          {cols < 3 && <Link href={href("/properties")} className="btn btn-sm"><Plus size={15} />{t.compare.addMore}</Link>}
          <button type="button" className="btn btn-sm" onClick={clearCompare}>{t.compare.clear}</button>
        </div>
      </div>
      <p className="annot mb-3 hidden md:block">{t.common.demoNotice}</p>
      <div className="no-scrollbar overflow-x-auto border border-line" tabIndex={0} role="region" aria-label={t.compare.title}>
        <table className="w-full min-w-[640px] table-fixed border-collapse text-start text-sm">
          <caption className="sr-only">{t.compare.title}</caption>
          <colgroup><col className="w-28 md:w-44" />{items.map((p) => <col key={p.id} />)}</colgroup>
          <thead>
            <tr className="align-top">
              <th scope="col" className="sticky start-0 z-10 bg-paper p-3 text-start"><span className="sr-only">{t.compare.title}</span></th>
              {items.map((p) => (
                <th key={p.id} scope="col" className="border-s border-line p-3 text-start font-normal">
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper2"><AtlasImage src={p.images[0].src} alt={tr(p.images[0].alt, lang)} fill sizes="(min-width:768px) 30vw, 60vw" className="object-cover" /></div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div><p className="annot">{p.ref}</p><Link href={href(`/properties/${p.slug}`)} className="display h-sm underline-offset-4 hover:underline">{tr(p.title, lang)}</Link></div>
                    <button type="button" className="icon-btn icon-btn-sm shrink-0" onClick={() => toggleCompare(p.id)} aria-label={`${t.compare.remove}: ${tr(p.title, lang)}`}><X size={15} /></button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const vals = items.map(r.value);
              const differs = cols > 1 && new Set(vals).size > 1;
              return (
                <tr key={r.key} className={`border-t border-line ${differs ? "bg-[color-mix(in_srgb,var(--copper)_9%,transparent)]" : ""}`}>
                  <th scope="row" className={`sticky start-0 z-10 p-3 text-start align-top ${differs ? "bg-paper2" : "bg-paper"}`}>
                    <span className="label !mb-0">{r.label}</span>
                    {differs && <span className="annot annot-ar-ok mt-1 block !text-copper">{t.compare.differs}</span>}
                  </th>
                  {items.map((p) => <td key={p.id} className="border-s border-line p-3 align-top">{r.cell(p)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="annot mt-3">* {t.compare.monthlyNote}</p>
    </div>
  );
}
