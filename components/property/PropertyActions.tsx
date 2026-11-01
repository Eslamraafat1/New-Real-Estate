"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Download, FileText, LayoutDashboard, MapPin, MessageSquare } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { CompareButton, FavButton, Price } from "./PropertyBits";
import { ShareMenu } from "./ShareMenu";
import { usePropertyDetail } from "./PropertyDetailContext";
import { tr } from "@/lib/i18n/config";

/** Primary calls to action: viewing, contact agent, request information. */
export function PrimaryActions({ className = "", stacked = false }: { className?: string; stacked?: boolean }) {
  const { t } = useApp();
  const { openDialog } = usePropertyDetail();
  return (
    <div className={`flex ${stacked ? "flex-col" : "flex-wrap"} gap-2 ${className}`}>
      <button type="button" className="btn btn-primary" onClick={() => openDialog("viewing")}><CalendarCheck size={16} />{t.common.scheduleViewing}</button>
      <button type="button" className="btn" onClick={() => openDialog("contact")}><MessageSquare size={16} />{t.common.contactAgent}</button>
      <button type="button" className="btn" onClick={() => openDialog("info")}><FileText size={16} />{t.property.actions.requestInfo}</button>
    </div>
  );
}

/** Secondary utility actions: save, compare, share, copy, brochure, floor plan, location. */
export function UtilityActions({ className = "" }: { className?: string }) {
  const { t, lang, href } = useApp();
  const { property: p, goPlan } = usePropertyDetail();
  const a = t.property.actions;
  return (
    <div role="group" aria-label={a.moreActions} className={`flex flex-wrap items-center gap-2 ${className}`}>
      <FavButton id={p.id} className="!h-[44px] !w-[44px]" />
      <CompareButton id={p.id} label className="!min-h-[44px]" />
      <ShareMenu title={tr(p.title, lang)} />
      {p.floorPlan && <button type="button" className="btn btn-sm" onClick={goPlan}><LayoutDashboard size={14} />{a.viewFloorPlan}</button>}
      <Link className="btn btn-sm" href={href(`/map?select=${encodeURIComponent(p.id)}`)}><MapPin size={14} />{a.exploreLocation}</Link>
      {p.brochureUrl && <a className="btn btn-sm" href={p.brochureUrl} download><Download size={14} />{a.downloadBrochure}</a>}
    </div>
  );
}

/** Sticky bar for small screens: price + Schedule viewing + Save. Sits above the compare tray and hides over the footer. */
export function MobileActionBar() {
  const { t, compare } = useApp();
  const { property: p, openDialog } = usePropertyDetail();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const foot = document.querySelector("footer");
    if (!foot || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => setHidden(es[0]?.isIntersecting ?? false), { threshold: 0.05 });
    io.observe(foot);
    return () => io.disconnect();
  }, []);
  const lifted = compare.length > 0;
  return (
    <>
      <div aria-hidden className={`lg:hidden ${lifted ? "h-40" : "h-24"}`} />
      <div
        role="region"
        aria-label={t.property.bar.label}
        className={`fixed inset-x-0 z-40 border-t border-line bg-paper transition-transform duration-300 lg:hidden safe-b ${hidden ? "translate-y-full" : ""}`}
        style={{ bottom: lifted ? "calc(4.9rem + env(safe-area-inset-bottom))" : 0 }}
      >
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Price p={p} compact className="display min-w-0 grow truncate text-xl" />
          <FavButton id={p.id} className="!h-[44px] !w-[44px] shrink-0" />
          <button type="button" className="btn btn-primary shrink-0 !px-4" onClick={() => openDialog("viewing")}>{t.common.scheduleViewing}</button>
        </div>
      </div>
    </>
  );
}

/** Sticky desktop side card. */
export function SideCard() {
  const { t, lang } = useApp();
  const { property: p, agent } = usePropertyDetail();
  return (
    <aside className="sticky top-24 hidden border border-line bg-surface p-5 lg:grid lg:gap-4" aria-label={t.property.side.title}>
      <p className="annot">{t.property.side.title}</p>
      <Price p={p} className="display h-md" />
      {agent && <p className="text-sm text-soft">{tr(agent.name, lang)} · {tr(agent.role, lang)}</p>}
      <PrimaryActions stacked />
      <p className="annot annot-ar-ok border-s-2 border-copper ps-3">{t.property.side.note}</p>
    </aside>
  );
}
