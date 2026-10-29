"use client";

import { useRef } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { tr } from "@/lib/i18n/config";
import { AMENITIES, ARCH_STYLES, PROPERTY_TYPES, type Amenity, type ArchStyle, type Completion, type Furnished, type Neighborhood, type PropertyQuery, type PropertyType, type Purpose } from "@/lib/api/types";
import { fmt } from "@/lib/i18n";

/** Number input that commits to the URL after a short pause (uncontrolled; remounted via `resetKey` on clear-all). */
function NumInput({ label, value, onCommit, placeholder, resetKey }: { label: string; value?: number; onCommit: (n: number | undefined) => void; placeholder?: string; resetKey: number }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const commit = (raw: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const n = Number(raw.replace(/[^\d.]/g, ""));
      onCommit(raw.trim() === "" || !Number.isFinite(n) ? undefined : n);
    }, 450);
  };
  return (
    <div>
      <label className="label">{label}
        <input key={resetKey} className="field num mt-1.5 font-normal normal-case tracking-normal" inputMode="numeric" defaultValue={value ?? ""} placeholder={placeholder}
          onChange={(e) => commit(e.target.value)} onBlur={(e) => { clearTimeout(timer.current); const n = Number(e.target.value.replace(/[^\d.]/g, "")); onCommit(e.target.value.trim() === "" || !Number.isFinite(n) ? undefined : n); }} />
      </label>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-2.5 border-t border-line pt-4">
      <legend className="label !mb-0 float-start w-full">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function FilterPanel({ query, onChange, areas, resetKey, hidePurpose = false }: {
  query: PropertyQuery;
  onChange: (patch: Partial<PropertyQuery>) => void;
  areas: Neighborhood[];
  resetKey: number;
  hidePurpose?: boolean;
}) {
  const { t, lang } = useApp();
  const qTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toggle = <T extends string>(list: T[] | undefined, v: T): T[] | undefined => {
    const cur = list ?? [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    return next.length ? next : undefined;
  };
  const step = [1, 2, 3, 4, 5];

  return (
    <div className="grid gap-5">
      <label className="label">{t.listings.location}
        <input key={`q${resetKey}`} className="field mt-1.5 font-normal normal-case tracking-normal" type="search" placeholder={t.listings.locationPlaceholder} defaultValue={query.q ?? ""} onChange={(e) => { const v = e.target.value; clearTimeout(qTimer.current); qTimer.current = setTimeout(() => onChange({ q: v.trim() || undefined }), 400); }} />
      </label>
      <label className="label">{t.forms.neighborhoodLabel}
        <select className="field mt-1.5 font-normal normal-case tracking-normal" value={query.neighborhood ?? ""} onChange={(e) => onChange({ neighborhood: e.target.value || undefined })}>
          <option value="">{t.listings.anyLocation}</option>
          {areas.map((a) => <option key={a.slug} value={a.slug}>{tr(a.name, lang)}</option>)}
        </select>
      </label>

      {!hidePurpose && (
        <Group title={t.listings.purpose}>
          <div className="flex gap-2" role="group" aria-label={t.listings.purpose}>
            {([undefined, "sale", "rent"] as (Purpose | undefined)[]).map((p) => (
              <button key={p ?? "all"} type="button" className="chip" aria-pressed={query.purpose === p} onClick={() => onChange({ purpose: p })}>
                {p ? t.labels.purpose[p === "sale" ? "saleShort" : "rentShort"] : t.common.all}
              </button>
            ))}
          </div>
        </Group>
      )}

      <Group title={t.listings.propertyType}>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((p: PropertyType) => (
            <button key={p} type="button" className="chip" aria-pressed={!!query.types?.includes(p)} onClick={() => onChange({ types: toggle(query.types, p) })}>{t.labels.type[p]}</button>
          ))}
        </div>
      </Group>

      <Group title={t.listings.price}>
        <div className="grid grid-cols-2 gap-3">
          <NumInput resetKey={resetKey} label={t.listings.minPrice} value={query.minPrice} onCommit={(n) => onChange({ minPrice: n })} placeholder="0" />
          <NumInput resetKey={resetKey} label={t.listings.maxPrice} value={query.maxPrice} onCommit={(n) => onChange({ maxPrice: n })} placeholder="∞" />
        </div>
      </Group>

      <Group title={t.listings.bedrooms}>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={query.beds === undefined} onClick={() => onChange({ beds: undefined })}>{t.common.any}</button>
          {step.map((n) => <button key={n} type="button" className="chip num" aria-pressed={query.beds === n} onClick={() => onChange({ beds: query.beds === n ? undefined : n })}>{fmt(t.listings.bedsPlus, { n: lang === "ar" ? n.toLocaleString("ar-EG") : n })}</button>)}
        </div>
      </Group>
      <Group title={t.listings.bathrooms}>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={query.baths === undefined} onClick={() => onChange({ baths: undefined })}>{t.common.any}</button>
          {step.slice(0, 4).map((n) => <button key={n} type="button" className="chip num" aria-pressed={query.baths === n} onClick={() => onChange({ baths: query.baths === n ? undefined : n })}>{fmt(t.listings.bedsPlus, { n: lang === "ar" ? n.toLocaleString("ar-EG") : n })}</button>)}
        </div>
      </Group>

      <Group title={t.listings.areaRange}>
        <div className="grid grid-cols-2 gap-3">
          <NumInput resetKey={resetKey} label={t.listings.minArea} value={query.minArea} onCommit={(n) => onChange({ minArea: n })} placeholder="0" />
          <NumInput resetKey={resetKey} label={t.listings.maxArea} value={query.maxArea} onCommit={(n) => onChange({ maxArea: n })} placeholder="∞" />
        </div>
      </Group>

      <Group title={t.listings.furnished}>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={!query.furnished} onClick={() => onChange({ furnished: undefined })}>{t.common.any}</button>
          {(["furnished", "semi", "unfurnished"] as Furnished[]).map((v) => <button key={v} type="button" className="chip" aria-pressed={query.furnished === v} onClick={() => onChange({ furnished: query.furnished === v ? undefined : v })}>{t.labels.furnished[v]}</button>)}
        </div>
      </Group>

      <Group title={t.listings.completion}>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={!query.completion} onClick={() => onChange({ completion: undefined })}>{t.common.any}</button>
          {(["ready", "under-construction", "off-plan"] as Completion[]).map((v) => <button key={v} type="button" className="chip" aria-pressed={query.completion === v} onClick={() => onChange({ completion: query.completion === v ? undefined : v })}>{t.labels.completion[v]}</button>)}
        </div>
      </Group>

      <Group title={t.listings.style}>
        <div className="flex flex-wrap gap-2">
          {ARCH_STYLES.map((s: ArchStyle) => <button key={s} type="button" className="chip" aria-pressed={!!query.styles?.includes(s)} onClick={() => onChange({ styles: toggle(query.styles, s) })}>{t.labels.style[s]}</button>)}
        </div>
      </Group>

      <Group title={t.listings.amenities}>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a: Amenity) => <button key={a} type="button" className="chip" aria-pressed={!!query.amenities?.includes(a)} onClick={() => onChange({ amenities: toggle(query.amenities, a) })}>{t.labels.amenity[a]}</button>)}
        </div>
      </Group>
    </div>
  );
}
