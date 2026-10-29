import Link from "next/link";
import { MortgageCalculator } from "@/components/finance/MortgageCalculator";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";

/** P — The numbers behind the address: finance copy beside the calculator. */
export function NumbersBehind({ data, lang }: { data: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2;
  const sale = data.properties.filter((p) => p.purpose === "sale").map((p) => p.price).sort((a, b) => a - b);
  const median = sale.length ? sale[Math.floor(sale.length / 2)] : undefined;
  const currency = data.properties.find((p) => p.purpose === "sale")?.currency;
  return (
    <section id="numbers-behind-the-address" aria-labelledby="numbers-h" className="section">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div id="numbers-h"><SectionHead num={t.numbers.num} eyebrow={t.numbers.eyebrow} title={t.numbers.title} intro={t.numbers.intro} /></div>
          <ol className="mt-10 grid gap-5 border-t border-line pt-6">
            {t.numbers.points.map((pt, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="numeral text-4xl text-copper" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <p className="text-soft">{pt}</p>
              </li>
            ))}
          </ol>
          <Link href={href(lang, "/mortgage-calculator")} className="btn mt-8">{t.numbers.cta}<Arrow /></Link>
        </div>
        <div className="lg:col-span-7">
          <div className="border border-line bg-surface p-4 md:p-8">
            <MortgageCalculator initialPrice={median} currency={currency} compact />
          </div>
          <p className="annot mt-3 !text-copper">{t.numbers.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
