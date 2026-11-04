"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Moon, Scale, Search, Sun, X } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { locales } from "@/lib/i18n/config";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, t } = useApp();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      aria-label={dark ? t.common.switchToLight : t.common.switchToDark}
      title={dark ? t.common.switchToLight : t.common.switchToDark}
      onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTheme(dark ? "light" : "dark", { x: r.left + r.width / 2, y: r.top + r.height / 2 }); }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, t } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const other = locales.find((l) => l !== lang) ?? "en";
  const go = () => {
    const rest = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), "");
    // read the query at click time (avoids a Suspense-requiring useSearchParams in the shell)
    router.push(`/${other}${rest}${window.location.search}${window.location.hash}`);
  };
  return (
    // Accessible name ("Language: EN") contains the visible text, as WCAG 2.5.3 requires.
    <button type="button" onClick={go} className={`btn btn-sm ${className}`}>
      <span className="sr-only">{t.common.language}: </span>
      <span lang={other}>{other === "ar" ? "العربية" : "EN"}</span>
    </button>
  );
}

export function Header() {
  const { t, href, lang, favorites, compare } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const primary = [
    { to: "/buy", label: t.nav.buy },
    { to: "/rent", label: t.nav.rent },
    { to: "/map", label: t.nav.map },
    { to: "/neighborhoods", label: t.nav.neighborhoods },
    { to: "/developments", label: t.nav.developments },
    { to: "/journal", label: t.nav.journal },
  ];
  const secondary = [
    { to: "/properties", label: t.nav.listings },
    { to: "/agents", label: t.nav.agents },
    { to: "/sell", label: t.nav.sell },
    { to: "/landlords", label: t.nav.landlords },
    { to: "/valuation", label: t.nav.valuation },
    { to: "/mortgage-calculator", label: t.nav.mortgage },
    { to: "/compare", label: t.nav.compare },
    { to: "/saved", label: t.nav.saved },
    { to: "/saved-searches", label: t.nav.savedSearches },
    { to: "/about", label: t.nav.about },
    { to: "/contact", label: t.nav.contact },
    { to: "/faq", label: t.nav.faq },
    { to: "/login", label: t.nav.login },
  ];
  const isActive = (to: string) => pathname === href(to) || pathname.startsWith(href(to) + "/");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper safe-t" style={{ height: "var(--header-h)" }}>
        <div className="wrap flex h-full items-center justify-between gap-4">
          <Link href={href("/")} className="flex items-baseline gap-2">
            <span className="display text-xl tracking-[0.18em] sm:text-2xl" style={{ letterSpacing: lang === "ar" ? 0 : undefined }}>{lang === "ar" ? "أطلس" : "ATLAS"}</span>
            <span className="annot hidden !text-copper sm:inline">{lang === "ar" ? "العقارية" : "Estates"}</span>
            <span className="sr-only"> — {t.nav.home}</span>
          </Link>

          <nav aria-label={t.nav.primary} className="hidden items-center gap-6 lg:flex">
            {primary.map((n) => (
              <Link key={n.to} href={href(n.to)} aria-current={isActive(n.to) ? "page" : undefined} className="group relative py-2 text-sm font-medium">
                {n.label}
                <span className={`absolute inset-x-0 -bottom-px h-px origin-left bg-copper transition-transform duration-300 rtl:origin-right ${isActive(n.to) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href={href("/properties")} className="icon-btn hidden sm:inline-grid" aria-label={t.common.search}><Search size={18} /></Link>
            <Link href={href("/saved")} className="icon-btn relative" aria-label={`${t.nav.saved} (${favorites.length})`}>
              <Heart size={18} />
              {favorites.length > 0 && <span className="num absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center bg-copper px-1 text-[10px] font-bold text-white">{favorites.length}</span>}
            </Link>
            <Link href={href("/compare")} className="icon-btn relative hidden sm:inline-grid" aria-label={`${t.nav.compare} (${compare.length})`}>
              <Scale size={18} />
              {compare.length > 0 && <span className="num absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center bg-copper px-1 text-[10px] font-bold text-white">{compare.length}</span>}
            </Link>
            <LangSwitch className="hidden sm:inline-flex" />
            <ThemeToggle />
            <button type="button" className="icon-btn lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={t.common.menu} onClick={() => setOpen(true)}><Menu size={18} /></button>
          </div>
        </div>
      </header>

      {/* mobile / full menu */}
      <div id="mobile-nav" hidden={!open} className="fixed inset-0 z-[100] overflow-auto bg-paper safe-t safe-b" role="dialog" aria-modal="true" aria-label={t.common.menu}>
        <div className="wrap flex h-16 items-center justify-between">
          <span className="annot">{t.footer.indexTitle}</span>
          <div className="flex gap-1.5"><LangSwitch /><button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t.common.close}><X size={18} /></button></div>
        </div>
        <nav className="wrap grid gap-8 pb-16 pt-4 md:grid-cols-2" aria-label={t.nav.primary}>
          <ol className="grid gap-1">
            {primary.map((n, i) => (
              <li key={n.to}>
                <Link onClick={() => setOpen(false)} href={href(n.to)} className="group flex items-baseline gap-4 border-b border-line py-3">
                  <span className="annot !text-copper">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display h-md">{n.label}</span>
                </Link>
              </li>
            ))}
          </ol>
          <ul className="grid content-start gap-1">
            {secondary.map((n) => (
              <li key={n.to}><Link onClick={() => setOpen(false)} href={href(n.to)} className="block py-2.5 text-lg">{n.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
