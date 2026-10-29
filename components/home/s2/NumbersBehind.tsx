import type { CSSProperties } from "react";
import Link from "next/link";
import { MortgageCalculator } from "@/components/finance/MortgageCalculator";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import { InView } from "./fx-b/InView";
import { MoneyCount } from "./fx-b/MoneyCount";
import type { HomeData } from "../types";

/** P — The numbers behind the address: the calculator on a perforated receipt / ledger sheet with animated figures. */
export function NumbersBehind({ data, lang }: { data: HomeData; lang: Locale }) {
  const dict = getDictionary(lang);
  const t = dict.home2;
  const x = dict.home3.numbers;
  const sale = data.properties.filter((p) => p.purpose === "sale").map((p) => p.price).sort((a, b) => a - b);
  const median = sale.length ? sale[Math.floor(sale.length / 2)] : undefined;
  const currency = data.properties.find((p) => p.purpose === "sale")?.currency;
  const lines = median
    ? [
        { k: "median", label: x.median, v: median },
        { k: "deposit", label: x.deposit, v: Math.round(median * 0.2) },
        { k: "borrow", label: x.borrow, v: Math.round(median * 0.8) },
      ]
    : [];

  return (
    <section id="numbers-behind-the-address" aria-labelledby="numbers-h" className="section overflow-x-clip">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div id="numbers-h"><SectionHead num={t.numbers.num} eyebrow={t.numbers.eyebrow} title={t.numbers.title} intro={t.numbers.intro} /></div>
          <InView as="div" className="mt-10">
            <p className="annot mb-4">{x.notes}</p>
            <ol className="grid gap-6">
              {t.numbers.points.map((pt, i) => (
                <li key={i} className="fxb-rise grid grid-cols-[auto_1fr] items-start gap-5" style={{ "--d": `${i * 140}ms` } as CSSProperties}>
                  <span className="numeral text-5xl text-copper md:text-6xl" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <p className="pt-1 text-soft">{pt}</p>
                </li>
              ))}
            </ol>
          </InView>
          <Link href={href(lang, "/mortgage-calculator")} className="btn mt-10 w-fit">{t.numbers.cta}<Arrow /></Link>
        </div>

        <InView as="div" threshold={0.1} className="relative lg:col-span-7 lg:pt-10">
          <div className="fxb-rise relative drop-shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
            <span aria-hidden className="annot absolute -top-3 end-3 z-10 -rotate-12 border-2 border-copper bg-paper px-3 py-1 !text-copper rtl:rotate-12 md:end-8">{x.sample}</span>
            <div className="fxb-perf" aria-hidden />
            <div className="bg-surface px-4 pb-6 pt-4 md:px-10 md:pb-10">
              <div className="flex items-baseline justify-between gap-4 border-b-2 border-dashed border-line pb-3">
                <span className="annot">{x.ref}</span>
                <span className="annot" aria-hidden>№ 001</span>
              </div>
              <h3 className="display h-xl mt-4 text-balance !text-[clamp(2.4rem,8vw,5.5rem)]">{x.sheet}</h3>

              {lines.length > 0 && (
                <dl className="mt-8 grid gap-4">
                  {lines.map((l, i) => (
                    <div key={l.k} className="fxb-rise flex items-baseline gap-3" style={{ "--d": `${200 + i * 150}ms` } as CSSProperties}>
                      <dt className="text-sm text-soft md:text-base">{l.label}</dt>
                      <span aria-hidden className="mb-1 min-w-4 flex-1 border-b border-dotted border-mute" />
                      <dd className={`numeral ${i === 0 ? "text-3xl text-copper md:text-5xl" : "text-2xl md:text-4xl"}`}><MoneyCount to={l.v} currency={currency} /></dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="my-8 flex items-center gap-3 text-mute" aria-hidden>
                <span className="flex-1 border-t-2 border-dashed border-line" />
                <span className="annot">{x.tear}</span>
                <span className="flex-1 border-t-2 border-dashed border-line" />
              </div>

              <MortgageCalculator initialPrice={median} currency={currency} compact />
            </div>
            <div className="fxb-perf fxb-perf-b" aria-hidden />
          </div>
          <p className="annot mt-5 !text-copper">{t.numbers.disclaimer}</p>
        </InView>
      </div>
    </section>
  );
}
