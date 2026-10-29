"use client";

import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { fmt } from "@/lib/i18n";
import { Arrow } from "@/components/ui/Arrow";

/** Floating comparison tray (appears once at least one property is selected). */
export function CompareTray() {
  const { compare, clearCompare, t, href, lang } = useApp();
  if (!compare.length) return null;
  return (
    <div className="safe-b fixed inset-x-0 bottom-3 z-[60] flex justify-center px-3" role="region" aria-label={t.compare.title}>
      <div className="flex w-full max-w-lg items-center gap-3 border border-ink bg-paper px-3 py-2 shadow-[var(--shadow)]">
        <Scale size={18} aria-hidden />
        <span className="num flex-1 text-sm font-semibold">{fmt(t.compare.trayTitle, { n: lang === "ar" ? compare.length.toLocaleString("ar-EG") : compare.length })}</span>
        <Link href={href("/compare")} className="btn btn-primary btn-sm">{t.compare.open}<Arrow /></Link>
        <button type="button" className="icon-btn icon-btn-sm" onClick={clearCompare} aria-label={t.compare.clear}><X size={16} /></button>
      </div>
    </div>
  );
}
