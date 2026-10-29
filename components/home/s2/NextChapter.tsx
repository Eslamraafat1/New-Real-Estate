import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { Contour } from "@/components/ui/Contour";
import { getDictionary } from "@/lib/i18n";
import { href, type Locale } from "@/lib/i18n/config";
import type { HomeData } from "../types";

const ROUTES = [
  ["buy", "/buy"],
  ["rent", "/rent"],
  ["sell", "/sell"],
  ["landlords", "/landlords"],
  ["developers", "/developments"],
] as const;

/** S — The next chapter: five-way typographic navigation on forest. */
export function NextChapter({ lang }: { data?: HomeData; lang: Locale }) {
  const t = getDictionary(lang).home2.next;
  return (
    <section id="next-chapter" aria-labelledby="next-h" className="section relative overflow-hidden bg-forest text-onforest">
      <Contour seed={7} rings={12} className="absolute inset-0 size-full stroke-current fill-none text-onforest opacity-20" />
      <div className="wrap relative">
        <header className="grid gap-4">
          <div className="annot flex items-baseline gap-4 !text-onforest/70"><span>{t.num}</span><span>{t.eyebrow}</span></div>
          <h2 id="next-h" className="display h-xl max-w-[14ch] text-balance">{t.title}</h2>
          <p className="max-w-[48ch] text-onforest/80">{t.intro}</p>
        </header>

        <nav aria-label={t.eyebrow} className="mt-14 md:mt-20">
          <ul className="border-t border-onforest/30">
            {ROUTES.map(([k, path]) => {
              const it = t.items[k];
              return (
                <li key={k} className="border-b border-onforest/30">
                  <Link href={href(lang, path)} className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 py-5 transition-[padding] duration-300 hover:ps-4 focus-visible:ps-4 md:gap-x-10 md:py-8">
                    <span className="annot !text-onforest/70">{it.k}</span>
                    <span className="grid gap-1 md:flex md:items-baseline md:gap-8">
                      <span className="display text-[clamp(2.5rem,9vw,7rem)] leading-none">{it.label}</span>
                      <span className="text-sm text-onforest/75 md:text-base">{it.note}</span>
                    </span>
                    <Arrow className="size-7 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="mt-10">
          <Link href={href(lang, "/contact")} className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline">{t.contact}<Arrow /></Link>
        </p>
      </div>
    </section>
  );
}
