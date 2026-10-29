"use client";

import { useId, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { fetchProperties } from "@/lib/api/client";
import { computeMortgage } from "@/lib/finance";
import { useAsync, useFormat } from "@/lib/hooks";
import { DEFAULT_CURRENCY } from "@/lib/i18n/format";
import { fmt } from "@/lib/i18n";
import { tr } from "@/lib/i18n/config";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SAR", "EGP"];

const toNum = (s: string) => {
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function NumberField({ label, value, onChange, suffix, step, hint, error }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; step?: number; hint?: string; error?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input id={id} className="field num pe-14" inputMode="decimal" step={step} value={value} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} onChange={(e) => onChange(e.target.value)} />
        {suffix && <span className="annot pointer-events-none absolute end-3 top-1/2 -translate-y-1/2">{suffix}</span>}
      </div>
      {hint && !error && <p className="annot mt-1.5">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="err">{error}</p>}
    </div>
  );
}

/** P — Transparent mortgage estimate with adjustable assumptions. Not a lender offer. */
export function MortgageCalculator({ initialPrice = 1500000, currency, compact = false }: { initialPrice?: number; currency?: string; compact?: boolean }) {
  const { t, lang } = useApp();
  const f = useFormat();
  const [cur, setCur] = useState(currency ?? DEFAULT_CURRENCY);
  const [price, setPrice] = useState(String(initialPrice));
  const [downPct, setDownPct] = useState(20);
  const [downStr, setDownStr] = useState<string | null>(null); // typed override of the % slider
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState(25);
  const [extras, setExtras] = useState("0");
  const pid = useId();

  const sale = useAsync("calc-sale", (s) => fetchProperties({ purpose: "sale", pageSize: 100, sort: "price-asc" }, s));

  const p = toNum(price);
  const down = downStr !== null ? toNum(downStr) : Math.round((p * downPct) / 100);
  const downTooBig = down > p;
  const res = useMemo(
    () => computeMortgage({ price: p, down: Math.min(down, p), ratePct: toNum(rate), years, extras: toNum(extras) }),
    [p, down, rate, years, extras],
  );
  const principalShare = res.totalPaid > 0 ? (res.loan / res.totalPaid) * 100 : 100;
  const pctOfPrice = p > 0 ? Math.round((down / p) * 100) : 0;
  const money = (n: number) => f.money(n, cur, { decimals: 0 });

  return (
    <section aria-labelledby={`${pid}-t`} className={`grid gap-8 ${compact ? "" : "lg:grid-cols-[1.1fr_1fr]"}`}>
      <h2 id={`${pid}-t`} className="sr-only">{t.mortgage.title}</h2>
      <div className="grid content-start gap-5 border border-line bg-surface p-5 md:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label={t.mortgage.price} value={price} onChange={(v) => { setPrice(v); setDownStr(null); }} suffix={cur} />
          <div>
            <label htmlFor={`${pid}-cur`} className="label">{t.mortgage.currency}</label>
            <select id={`${pid}-cur`} className="field" value={cur} onChange={(e) => setCur(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {sale.data && !compact && (
          <div>
            <label htmlFor={`${pid}-l`} className="label">{t.mortgage.useListing}</label>
            <select id={`${pid}-l`} className="field" defaultValue="" onChange={(e) => { if (e.target.value) { setPrice(e.target.value); setDownStr(null); setCur(sale.data!.items[0]?.currency ?? cur); } }}>
              <option value="">{t.mortgage.custom}</option>
              {sale.data.items.filter((x) => x.type !== "land").map((x) => <option key={x.id} value={x.price}>{`${x.ref} · ${tr(x.title, lang)} — ${f.money(x.price, x.currency, { compact: true })}`}</option>)}
            </select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label={t.mortgage.down} value={downStr ?? String(down)} onChange={setDownStr} suffix={cur} hint={fmt(t.mortgage.downPct, { n: f.num(pctOfPrice) })} error={downTooBig ? t.mortgage.invalidDown : undefined} />
          <div>
            <label htmlFor={`${pid}-dp`} className="label">{t.mortgage.down} (%)</label>
            <input id={`${pid}-dp`} type="range" min={0} max={90} step={1} value={downPct} className="h-11 w-full accent-[var(--forest)]" onChange={(e) => { setDownPct(Number(e.target.value)); setDownStr(null); }} />
            <p className="annot num">{f.num(downPct)}%</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label={t.mortgage.rate} value={rate} onChange={setRate} suffix="%" step={0.1} />
          <div>
            <label htmlFor={`${pid}-y`} className="label">{t.mortgage.term}: <span className="num">{f.num(years)} {t.mortgage.years}</span></label>
            <input id={`${pid}-y`} type="range" min={5} max={35} step={1} value={years} className="h-11 w-full accent-[var(--forest)]" onChange={(e) => setYears(Number(e.target.value))} />
          </div>
        </div>

        <NumberField label={t.mortgage.extras} value={extras} onChange={setExtras} suffix={cur} hint={t.mortgage.extrasHint} />
      </div>

      <div className="grid content-start gap-5">
        <div className="border border-forest bg-forest p-6 text-onforest md:p-8" aria-live="polite">
          <p className="annot !text-onforest/70">{t.mortgage.monthly}</p>
          <p className="display h-lg num mt-2" data-testid="monthly">{money(res.monthlyTotal)}</p>
          <p className="annot mt-1 !text-onforest/70">{t.mortgage.loan}: {money(res.loan)}</p>
        </div>

        <dl className="grid grid-cols-2 gap-px border border-line bg-line text-sm">
          {[
            [t.mortgage.totalPaid, money(res.totalPaid + toNum(extras) * res.months)],
            [t.mortgage.totalInterest, money(res.totalInterest)],
            [t.mortgage.principal, money(res.loan)],
            [t.mortgage.interest, `${f.num(100 - principalShare, { maximumFractionDigits: 0 })}%`],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface p-4"><dt className="annot annot-ar-ok">{k}</dt><dd className="num mt-1 text-lg font-semibold">{v}</dd></div>
          ))}
        </dl>

        <div aria-hidden className="flex h-3 overflow-hidden border border-line">
          <div className="bg-forest" style={{ width: `${principalShare}%` }} />
          <div className="bg-copper" style={{ width: `${100 - principalShare}%` }} />
        </div>

        <details className="border border-line bg-surface p-4 text-sm">
          <summary className="cursor-pointer font-semibold">{t.mortgage.formulaTitle}</summary>
          <p className="mt-2 text-soft" dir="auto">{t.mortgage.formula}</p>
        </details>
        <p className="flex gap-2 text-sm text-soft"><Info size={16} className="mt-0.5 shrink-0" aria-hidden />{t.mortgage.disclaimer}</p>
      </div>
    </section>
  );
}
