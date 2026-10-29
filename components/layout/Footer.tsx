"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { LangSwitch, ThemeToggle } from "./Header";
import { Contour } from "@/components/ui/Contour";

/** T — The atlas index: navigation, contact options, language switching, legal. */
export function Footer() {
  const { t, href } = useApp();
  const cols: { title: string; links: [string, string][] }[] = [
    { title: t.nav.explore, links: [["/buy", t.nav.buy], ["/rent", t.nav.rent], ["/map", t.nav.map], ["/neighborhoods", t.nav.neighborhoods], ["/developments", t.nav.developments]] },
    { title: t.nav.services, links: [["/sell", t.nav.sell], ["/landlords", t.nav.landlords], ["/valuation", t.nav.valuation], ["/mortgage-calculator", t.nav.mortgage], ["/agents", t.nav.agents]] },
    { title: t.nav.company, links: [["/about", t.nav.about], ["/journal", t.nav.journal], ["/contact", t.nav.contact], ["/faq", t.nav.faq]] },
    { title: t.nav.tools, links: [["/compare", t.nav.compare], ["/saved", t.nav.saved], ["/saved-searches", t.nav.savedSearches], ["/login", t.nav.login], ["/admin", t.nav.admin]] },
  ];
  return (
    <footer className="relative isolate mt-24 overflow-hidden border-t border-line bg-paper2 pb-28 md:pb-10">
      <Contour seed={4} rings={12} animate={false} className="absolute inset-0 -z-10 h-full w-full opacity-40" />
      <div className="wrap pt-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="grid content-start gap-5">
            <p className="annot !text-copper">{t.footer.indexTitle}</p>
            <p className="display h-lg">{t.common.tagline}</p>
            <p className="max-w-[42ch] text-sm text-soft">{t.footer.blurb}</p>
            <form className="flex max-w-sm gap-2" onSubmit={(e) => e.preventDefault()} aria-label={t.footer.newsletter}>
              <label className="sr-only" htmlFor="nl">{t.forms.email}</label>
              <input id="nl" type="email" className="field" placeholder={t.forms.email} disabled aria-describedby="nl-hint" />
              <button className="btn" disabled>{t.footer.subscribe}</button>
            </form>
            <p id="nl-hint" className="annot">{t.footer.newsletterHint}</p>
          </div>
          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4" aria-label={t.footer.indexTitle}>
            {cols.map((c) => (
              <div key={c.title} className="grid content-start gap-3">
                <p className="annot">{c.title}</p>
                <ul className="grid gap-2 text-sm">
                  {c.links.map(([to, label]) => (
                    <li key={to}><Link href={href(to)} className="underline-offset-4 hover:underline">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-12 grid gap-4 border-t border-line pt-6 text-sm text-soft md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{t.footer.rights}</span>
            <Link href={href("/privacy")} className="underline-offset-4 hover:underline">{t.nav.privacy}</Link>
            <Link href={href("/terms")} className="underline-offset-4 hover:underline">{t.nav.terms}</Link>
            <span className="annot">{t.footer.coords}</span>
          </div>
          <div className="flex items-center gap-2"><LangSwitch /><ThemeToggle /></div>
        </div>
        <p className="annot mt-6">{t.common.demoNotice}</p>
      </div>
    </footer>
  );
}
