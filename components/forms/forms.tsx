"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { postInquiry, postValuationRequest, postViewingRequest, type SubmitOutcome } from "@/lib/api/client";
import { validateInquiry, validateValuation, validateViewing, type ErrorKey } from "@/lib/api/validation";
import { PROPERTY_TYPES, type InquiryKind, type PropertyType, type Purpose } from "@/lib/api/types";
import { tr, type L } from "@/lib/i18n/config";

/* ---------- shared bits ---------- */
type Errors = Record<string, ErrorKey | undefined>;

export function Field({ label, error, hint, children, id }: { label: string; error?: ErrorKey; hint?: string; children: (a: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode; id?: string }) {
  const { t } = useApp();
  const auto = useId();
  const fid = id ?? auto;
  const errId = `${fid}-err`;
  return (
    <div>
      <label className="label" htmlFor={fid}>{label}</label>
      {children({ id: fid, "aria-invalid": !!error, "aria-describedby": error ? errId : undefined })}
      {hint && !error && <p className="annot mt-1.5">{hint}</p>}
      {error && <p id={errId} role="alert" className="err">{t.forms.errors[error]}</p>}
    </div>
  );
}

function Consent({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: ErrorKey }) {
  const { t } = useApp();
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={!!error} className="mt-1 h-5 w-5 shrink-0 accent-[var(--forest)]" />
        <span>{t.forms.consent}</span>
      </label>
      {error && <p role="alert" className="err">{t.forms.errors[error]}</p>}
    </div>
  );
}

function Outcome({ status, reference, onReset }: { status: "ok" | "fail"; reference?: string; onReset: () => void }) {
  const { t } = useApp();
  if (status === "ok") {
    return (
      <div role="status" className="grid gap-3 border border-forest bg-surface p-5">
        <CheckCircle2 className="text-forest" aria-hidden />
        <p className="display h-sm">{t.forms.successTitle}</p>
        <p className="text-sm text-soft">{t.forms.successBody} <strong className="num annot !text-ink">{reference}</strong></p>
        <button type="button" className="btn btn-sm justify-self-start" onClick={onReset}>{t.common.close}</button>
      </div>
    );
  }
  return (
    <div role="alert" className="mb-4 flex gap-3 border border-[#b3321f] bg-surface p-4 text-sm">
      <AlertTriangle className="shrink-0 text-[#b3321f]" size={18} aria-hidden />
      <div><p className="font-semibold">{t.forms.failTitle}</p><p className="text-soft">{t.forms.failBody}</p></div>
    </div>
  );
}

function useSubmit() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "fail">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [reference, setReference] = useState<string>();
  const run = async (local: Errors, send: () => Promise<SubmitOutcome>) => {
    if (Object.keys(local).length) { setErrors(local); setStatus("fail"); return; }
    setErrors({}); setStatus("sending");
    const out = await send();
    if (out.ok) { setReference(out.result.reference); setStatus("ok"); }
    else { setErrors((out.fieldErrors as Errors) ?? {}); setStatus("fail"); }
  };
  return { status, errors, reference, run, reset: () => { setStatus("idle"); setErrors({}); } };
}

const DemoNote = () => {
  const { t } = useApp();
  return <p className="annot border-s-2 border-copper ps-3">{t.forms.demoNotice}</p>;
};

/* ---------- Inquiry / agent / details / seller / landlord / contact ---------- */
export function InquiryForm({ kind, propertyId, agentId, defaultMessage = "", submitLabel, className = "" }: {
  kind: InquiryKind; propertyId?: string; agentId?: string; defaultMessage?: string; submitLabel?: string; className?: string;
}) {
  const { t } = useApp();
  const s = useSubmit();
  const [v, setV] = useState({ name: "", email: "", phone: "", message: defaultMessage, consent: false });
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = { kind, propertyId, agentId, ...v, phone: v.phone || undefined };
    s.run(validateInquiry(payload) as Errors, () => postInquiry(payload));
  };
  if (s.status === "ok") return <Outcome status="ok" reference={s.reference} onReset={s.reset} />;
  return (
    <form onSubmit={onSubmit} noValidate className={`grid gap-4 ${className}`} aria-busy={s.status === "sending"}>
      {s.status === "fail" && <Outcome status="fail" onReset={s.reset} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.forms.name} error={s.errors.name}>{(a) => <input {...a} className="field" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} />}</Field>
        <Field label={t.forms.email} error={s.errors.email}>{(a) => <input {...a} type="email" className="field" autoComplete="email" inputMode="email" value={v.email} onChange={(e) => set("email", e.target.value)} />}</Field>
      </div>
      <Field label={t.forms.phone} error={s.errors.phone}>{(a) => <input {...a} type="tel" className="field" autoComplete="tel" inputMode="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} />}</Field>
      <Field label={t.forms.message} error={s.errors.message}>{(a) => <textarea {...a} className="field" placeholder={t.forms.messagePlaceholder} value={v.message} onChange={(e) => set("message", e.target.value)} />}</Field>
      <Consent checked={v.consent} onChange={(c) => set("consent", c)} error={s.errors.consent} />
      <DemoNote />
      <button className="btn btn-primary justify-self-start" disabled={s.status === "sending"}>{s.status === "sending" ? t.forms.sending : (submitLabel ?? t.forms.submit)}</button>
    </form>
  );
}

/* ---------- Viewing request ---------- */
export function ViewingForm({ propertyId, className = "" }: { propertyId: string; className?: string }) {
  const { t } = useApp();
  const s = useSubmit();
  const [v, setV] = useState({ name: "", email: "", phone: "", date: "", time: "morning" as "morning" | "afternoon" | "evening", mode: "in-person" as "in-person" | "video", message: "", consent: false });
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));
  const today = new Date().toISOString().slice(0, 10);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = { propertyId, ...v, phone: v.phone || undefined, message: v.message || undefined };
    s.run(validateViewing(payload) as Errors, () => postViewingRequest(payload));
  };
  if (s.status === "ok") return <Outcome status="ok" reference={s.reference} onReset={s.reset} />;
  return (
    <form onSubmit={onSubmit} noValidate className={`grid gap-4 ${className}`} aria-busy={s.status === "sending"}>
      {s.status === "fail" && <Outcome status="fail" onReset={s.reset} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.forms.name} error={s.errors.name}>{(a) => <input {...a} className="field" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} />}</Field>
        <Field label={t.forms.email} error={s.errors.email}>{(a) => <input {...a} type="email" className="field" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} />}</Field>
      </div>
      <Field label={t.forms.phone} error={s.errors.phone}>{(a) => <input {...a} type="tel" className="field" autoComplete="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} />}</Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t.forms.date} error={s.errors.date}>{(a) => <input {...a} type="date" min={today} className="field" value={v.date} onChange={(e) => set("date", e.target.value)} />}</Field>
        <Field label={t.forms.time} error={s.errors.time}>{(a) => (
          <select {...a} className="field" value={v.time} onChange={(e) => set("time", e.target.value as typeof v.time)}>
            <option value="morning">{t.forms.morning}</option><option value="afternoon">{t.forms.afternoon}</option><option value="evening">{t.forms.evening}</option>
          </select>)}
        </Field>
        <Field label={t.forms.mode} error={s.errors.mode}>{(a) => (
          <select {...a} className="field" value={v.mode} onChange={(e) => set("mode", e.target.value as typeof v.mode)}>
            <option value="in-person">{t.forms.inPerson}</option><option value="video">{t.forms.video}</option>
          </select>)}
        </Field>
      </div>
      <Field label={t.forms.message}>{(a) => <textarea {...a} className="field" value={v.message} onChange={(e) => set("message", e.target.value)} />}</Field>
      <Consent checked={v.consent} onChange={(c) => set("consent", c)} error={s.errors.consent} />
      <DemoNote />
      <button className="btn btn-primary justify-self-start" disabled={s.status === "sending"}>{s.status === "sending" ? t.forms.sending : t.common.scheduleViewing}</button>
    </form>
  );
}

/* ---------- Valuation request ---------- */
export function ValuationForm({ neighborhoods, className = "" }: { neighborhoods: { slug: string; name: L }[]; className?: string }) {
  const { t, lang } = useApp();
  const s = useSubmit();
  const [v, setV] = useState({ name: "", email: "", phone: "", purpose: "sale" as Purpose, type: "" as PropertyType | "", neighborhood: "", bedrooms: "", area: "", message: "", consent: false });
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...v, type: v.type as PropertyType, bedrooms: v.bedrooms === "" ? (undefined as never) : Number(v.bedrooms), area: Number(v.area), phone: v.phone || undefined, message: v.message || undefined };
    s.run(validateValuation(payload) as Errors, () => postValuationRequest(payload));
  };
  if (s.status === "ok") return <Outcome status="ok" reference={s.reference} onReset={s.reset} />;
  return (
    <form onSubmit={onSubmit} noValidate className={`grid gap-4 ${className}`} aria-busy={s.status === "sending"}>
      {s.status === "fail" && <Outcome status="fail" onReset={s.reset} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.forms.name} error={s.errors.name}>{(a) => <input {...a} className="field" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} />}</Field>
        <Field label={t.forms.email} error={s.errors.email}>{(a) => <input {...a} type="email" className="field" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} />}</Field>
      </div>
      <Field label={t.forms.phone} error={s.errors.phone}>{(a) => <input {...a} type="tel" className="field" autoComplete="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} />}</Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.forms.purposeLabel} error={s.errors.purpose}>{(a) => (
          <select {...a} className="field" value={v.purpose} onChange={(e) => set("purpose", e.target.value as Purpose)}>
            <option value="sale">{t.labels.purpose.sale}</option><option value="rent">{t.labels.purpose.rent}</option>
          </select>)}
        </Field>
        <Field label={t.forms.propertyTypeLabel} error={s.errors.type}>{(a) => (
          <select {...a} className="field" value={v.type} onChange={(e) => set("type", e.target.value as PropertyType)}>
            <option value="">{t.forms.chooseOption}</option>
            {PROPERTY_TYPES.map((p) => <option key={p} value={p}>{t.labels.type[p]}</option>)}
          </select>)}
        </Field>
        <Field label={t.forms.neighborhoodLabel} error={s.errors.neighborhood}>{(a) => (
          <select {...a} className="field" value={v.neighborhood} onChange={(e) => set("neighborhood", e.target.value)}>
            <option value="">{t.forms.chooseOption}</option>
            {neighborhoods.map((n) => <option key={n.slug} value={n.slug}>{tr(n.name, lang)}</option>)}
          </select>)}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.forms.bedroomsLabel} error={s.errors.bedrooms}>{(a) => <input {...a} type="number" min={0} inputMode="numeric" className="field" value={v.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />}</Field>
          <Field label={t.forms.areaLabel} error={s.errors.area}>{(a) => <input {...a} type="number" min={1} inputMode="numeric" className="field" value={v.area} onChange={(e) => set("area", e.target.value)} />}</Field>
        </div>
      </div>
      <Field label={t.forms.message}>{(a) => <textarea {...a} className="field" value={v.message} onChange={(e) => set("message", e.target.value)} />}</Field>
      <Consent checked={v.consent} onChange={(c) => set("consent", c)} error={s.errors.consent} />
      <DemoNote />
      <button className="btn btn-primary justify-self-start" disabled={s.status === "sending"}>{s.status === "sending" ? t.forms.sending : t.forms.submit}</button>
    </form>
  );
}
