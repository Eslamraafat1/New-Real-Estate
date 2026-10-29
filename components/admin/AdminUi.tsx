"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Eye, ImageIcon, Pencil, Star, Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { Modal } from "@/components/ui/Modal";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { fmt } from "@/lib/i18n";
import type { PropertyImage } from "@/lib/api/types";

/* ------------------------------ Switch ------------------------------ */
export function Switch({ checked, onChange, labelledBy, label, onText, offText }: {
  checked: boolean; onChange: (v: boolean) => void; labelledBy?: string; label?: string; onText: string; offText: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label}
      onClick={() => onChange(!checked)} className="inline-flex min-h-11 shrink-0 items-center gap-3">
      <span aria-hidden className={`relative h-6 w-11 border transition-colors ${checked ? "border-forest bg-forest" : "border-line bg-paper2"}`}>
        <span className={`absolute top-0.5 h-4 w-4 transition-all ${checked ? "start-6 bg-paper" : "start-0.5 bg-ink"}`} />
      </span>
      <span className="annot w-12 text-start">{checked ? onText : offText}</span>
    </button>
  );
}

/* --------------------------- API contract note --------------------------- */
export function ContractNote({ lines }: { lines: string[] }) {
  const { t } = useApp();
  const c = t.admin.console;
  return (
    <aside aria-label={c.apiContract} className="border border-line bg-paper2 p-4 text-sm">
      <p className="annot !text-copper">{c.apiContract}</p>
      <ul dir="ltr" className="mt-2 grid gap-1 text-start font-mono text-xs">
        {lines.map((l) => <li key={l}><code>{l}</code></li>)}
      </ul>
      <p className="mt-3 text-xs text-mute">{c.apiNote}</p>
    </aside>
  );
}

/* --------------------------- Delete confirmation --------------------------- */
export function ConfirmDelete({ name, onCancel, onConfirm }: { name: string | null; onCancel: () => void; onConfirm: () => void }) {
  const { t } = useApp();
  const c = t.admin.console;
  return (
    <Modal open={name !== null} onClose={onCancel} title={c.confirmTitle} className="!w-[min(92vw,460px)]">
      <div className="grid gap-5 p-5">
        <p className="text-sm text-soft">{fmt(c.confirmBody, { name: name ?? "" })}</p>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-sm" onClick={onCancel}>{c.cancel}</button>
          <button type="button" className="btn btn-sm btn-copper" onClick={onConfirm}>{c.del}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------ Section frame ------------------------------ */
export function SectionFrame({ title, intro, contract, actions, children }: {
  title: string; intro?: string; contract: string[]; actions?: ReactNode; children: ReactNode;
}) {
  const { t } = useApp();
  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display h-md">{title}</h2>
          {intro && <p className="mt-2 max-w-[60ch] text-sm text-soft">{intro}</p>}
          <p className="annot mt-2">{t.admin.console.memoryNote}</p>
        </div>
        {actions}
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-start">
        <div className="min-w-0">{children}</div>
        <ContractNote lines={contract} />
      </div>
    </section>
  );
}

/* ------------------------------ Image list ------------------------------ */
export function ImageListEditor({ images, onChange, altText, knownSrcs }: {
  images: PropertyImage[]; onChange: (next: PropertyImage[]) => void; altText: { en: string; ar: string }; knownSrcs: ReadonlySet<string>;
}) {
  const { t, lang } = useApp();
  const c = t.admin.console;
  const [url, setUrl] = useState("");
  const [err, setErr] = useState(false);
  const urlId = useId();

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const cover = (i: number) => onChange([images[i], ...images.filter((_, k) => k !== i)]);
  const remove = (i: number) => onChange(images.filter((_, k) => k !== i));
  const add = () => {
    let ok = false;
    try { ok = new URL(url.trim()).protocol === "https:"; } catch { ok = false; }
    if (!ok) { setErr(true); return; }
    setErr(false);
    onChange([...images, { src: url.trim(), width: 1600, height: 1067, alt: altText }]);
    setUrl("");
  };

  return (
    <div className="grid gap-4">
      {images.length === 0 ? <p className="text-sm text-mute">{c.images.empty}</p> : (
        <ol className="grid gap-2">
          {images.map((im, i) => (
            <li key={im.src + i} className="flex flex-wrap items-center gap-3 border border-line bg-surface p-2">
              <div className="relative grid h-14 w-20 shrink-0 place-items-center overflow-hidden bg-paper2 text-mute">
                {knownSrcs.has(im.src)
                  ? <AtlasImage src={im.src} alt={im.alt[lang] || im.alt.en} fill sizes="80px" className="object-cover" />
                  : <ImageIcon size={18} aria-label={c.images.noPreview} role="img" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="annot">{i === 0 ? c.images.cover : fmt(c.images.item, { n: i + 1 })}</p>
                <p dir="ltr" className="truncate text-start text-xs text-soft" title={im.src}>{im.src}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="icon-btn icon-btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${c.images.moveUp}: ${fmt(c.images.item, { n: i + 1 })}`}><ArrowUp size={14} /></button>
                <button type="button" className="icon-btn icon-btn-sm" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label={`${c.images.moveDown}: ${fmt(c.images.item, { n: i + 1 })}`}><ArrowDown size={14} /></button>
                <button type="button" className="icon-btn icon-btn-sm" onClick={() => cover(i)} disabled={i === 0} aria-label={`${c.images.setCover}: ${fmt(c.images.item, { n: i + 1 })}`}><Star size={14} /></button>
                <button type="button" className="icon-btn icon-btn-sm" onClick={() => remove(i)} aria-label={`${c.images.remove}: ${fmt(c.images.item, { n: i + 1 })}`}><Trash2 size={14} /></button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div>
        <label className="label" htmlFor={urlId}>{c.images.url}</label>
        <div className="flex flex-wrap gap-2">
          <input id={urlId} dir="ltr" className="field min-w-0 flex-1 text-start" inputMode="url" placeholder="https://" value={url}
            aria-invalid={err} aria-describedby={err ? `${urlId}-e` : undefined}
            onChange={(e) => { setUrl(e.target.value); setErr(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
          <button type="button" className="btn" onClick={add}>{c.images.addUrl}</button>
        </div>
        {err ? <p id={`${urlId}-e`} role="alert" className="err">{c.images.urlError}</p> : <p className="annot mt-1.5">{c.images.urlHint}</p>}
      </div>
    </div>
  );
}

/* ------------------------- Generic entity table ------------------------- */
export interface Col<T> { label: string; cell: (x: T) => ReactNode }
export interface FieldDef<T> {
  id: string;
  label: string;
  kind?: "text" | "textarea" | "number" | "select";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  required?: boolean;
  get: (x: T) => string | number;
  set: (x: T, v: string) => T;
}

export function EntityTable<T>({ rows, onChange, getId, getName, cols, fields }: {
  rows: T[]; onChange: (next: T[]) => void; getId: (x: T) => string; getName: (x: T) => string; cols: Col<T>[]; fields: FieldDef<T>[];
}) {
  const { t, toast } = useApp();
  const c = t.admin.console;
  const [sel, setSel] = useState<{ id: string; mode: "view" | "edit" } | null>(null);
  const row = sel ? rows.find((r) => getId(r) === sel.id) : undefined;

  return (
    <>
      <p className="annot mb-2">{fmt(c.rows, { n: rows.length })}</p>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="bg-paper2 text-start">
              {cols.map((k) => <th key={k.label} scope="col" className="annot px-3 py-2 text-start">{k.label}</th>)}
              <th scope="col" className="annot px-3 py-2 text-start">{c.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={getId(r)} className="border-t border-line align-middle">
                {cols.map((k) => <td key={k.label} className="px-3 py-2">{k.cell(r)}</td>)}
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button type="button" className="icon-btn icon-btn-sm" aria-label={`${c.view}: ${getName(r)}`} onClick={() => setSel({ id: getId(r), mode: "view" })}><Eye size={14} /></button>
                    <button type="button" className="icon-btn icon-btn-sm" aria-label={`${c.edit}: ${getName(r)}`} onClick={() => setSel({ id: getId(r), mode: "edit" })}><Pencil size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!row} onClose={() => setSel(null)} title={row && sel ? fmt(sel.mode === "edit" ? c.entity.editTitle : c.entity.viewTitle, { name: getName(row) }) : ""}>
        {row && sel && (sel.mode === "view" ? (
          <div className="grid gap-4 p-5">
            <dl className="grid gap-3">
              {fields.map((f) => (
                <div key={f.id}><dt className="annot">{f.label}</dt><dd className="text-sm">{f.kind === "select" ? f.options?.find((o) => o.value === String(f.get(row)))?.label : String(f.get(row))}</dd></div>
              ))}
            </dl>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-sm" onClick={() => setSel(null)}>{t.common.close}</button>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => setSel({ id: sel.id, mode: "edit" })}>{c.edit}</button>
            </div>
          </div>
        ) : (
          <EntityForm key={sel.id} row={row} fields={fields} onCancel={() => setSel(null)}
            onSave={(next) => { onChange(rows.map((x) => (getId(x) === sel.id ? next : x))); setSel(null); toast(c.savedMem); }} />
        ))}
      </Modal>
    </>
  );
}

function EntityForm<T>({ row, fields, onSave, onCancel }: { row: T; fields: FieldDef<T>[]; onSave: (next: T) => void; onCancel: () => void }) {
  const { t } = useApp();
  const c = t.admin.console;
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.id, String(f.get(row))])));
  const [errs, setErrs] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = vals[f.id].trim();
      if (f.kind === "number") {
        const n = Number(v);
        if (v === "" || !Number.isFinite(n) || n < (f.min ?? 0) || (f.max !== undefined && n > f.max)) next[f.id] = c.entity.numberError;
      } else if (f.required !== false && v === "") next[f.id] = c.entity.saveFirst;
    }
    setErrs(next);
    if (Object.keys(next).length) return;
    onSave(fields.reduce((acc, f) => f.set(acc, vals[f.id].trim()), row));
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 p-5">
      {fields.map((f) => {
        const id = `ef-${f.id}`;
        const common = {
          id, "aria-invalid": !!errs[f.id], "aria-describedby": errs[f.id] ? `${id}-e` : undefined,
          value: vals[f.id], onChange: (e: { target: { value: string } }) => setVals((s) => ({ ...s, [f.id]: e.target.value })),
        };
        return (
          <div key={f.id}>
            <label className="label" htmlFor={id}>{f.label}</label>
            {f.kind === "select" ? (
              <select {...common} className="field">{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            ) : f.kind === "textarea" ? (
              <textarea {...common} className="field" />
            ) : (
              <input {...common} className="field" type={f.kind === "number" ? "number" : "text"} min={f.min} max={f.max} />
            )}
            {errs[f.id] && <p id={`${id}-e`} role="alert" className="err">{errs[f.id]}</p>}
          </div>
        );
      })}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-sm" onClick={onCancel}>{c.cancel}</button>
        <button type="submit" className="btn btn-sm btn-primary">{c.save}</button>
      </div>
    </form>
  );
}
