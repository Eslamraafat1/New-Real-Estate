"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Info, Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { fetchProperties } from "@/lib/api/client";
import { useAsync, useFormat } from "@/lib/hooks";
import { fmt } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/SectionHead";
import { LocLink } from "@/components/ui/LocLink";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Tabs } from "@/components/admin/Tabs";
import { Switch } from "@/components/admin/AdminUi";

type Section = "overview" | "saved" | "searches" | "viewings" | "profile" | "notifications";

export function AccountView() {
  const { t, favorites, compare, searches } = useApp();
  const a = t.admin.account;
  const [section, setSection] = useState<Section>("overview");
  const tabs: { key: Section; label: string; badge?: number }[] = [
    { key: "overview", label: a.nav.overview },
    { key: "saved", label: a.nav.saved, badge: favorites.length },
    { key: "searches", label: a.nav.searches, badge: searches.length },
    { key: "viewings", label: a.nav.viewings, badge: a.viewingItems.length },
    { key: "profile", label: a.nav.profile },
    { key: "notifications", label: a.nav.notifications },
  ];
  return (
    <>
      <PageHeader eyebrow={a.eyebrow} title={a.title} intro={a.intro} />
      <div className="wrap pb-20">
        <p role="note" className="mb-8 flex gap-3 border border-copper bg-surface p-4 text-sm font-semibold">
          <Info size={18} className="mt-0.5 shrink-0 text-copper" aria-hidden />{a.banner}
        </p>
        <Tabs tabs={tabs} value={section} onChange={setSection} label={a.navLabel}>
          {section === "overview" && <Overview count={{ saved: favorites.length, compare: compare.length, searches: searches.length }} />}
          {section === "saved" && <Saved />}
          {section === "searches" && <Searches />}
          {section === "viewings" && <Viewings />}
          {section === "profile" && <Profile />}
          {section === "notifications" && <Notifications />}
        </Tabs>
      </div>
    </>
  );
}

function Overview({ count }: { count: { saved: number; compare: number; searches: number } }) {
  const { t } = useApp();
  const a = t.admin.account;
  const f = useFormat();
  const tiles = [
    { label: a.tiles.saved, n: count.saved },
    { label: a.tiles.compare, n: count.compare },
    { label: a.tiles.searches, n: count.searches },
    { label: a.tiles.viewings, n: a.viewingItems.length },
  ];
  return (
    <div className="grid gap-8">
      <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {tiles.map((x) => (
          <div key={x.label} className="bg-paper p-5">
            <dd className="numeral">{f.num(x.n)}</dd>
            <dt className="annot mt-2">{x.label}</dt>
          </div>
        ))}
      </dl>
      <p className="annot border-s-2 border-copper ps-3">{a.overviewNote}</p>
      <div className="flex flex-wrap gap-3">
        <LocLink to="/properties" className="btn btn-primary">{a.browse}</LocLink>
        <LocLink to="/compare" className="btn">{a.openCompare}</LocLink>
      </div>
    </div>
  );
}

function Saved() {
  const { t, favorites } = useApp();
  const a = t.admin.account;
  const key = favorites.join(",");
  const { loading, data, error } = useAsync(`acc-saved:${key}`, async (signal) =>
    favorites.length ? (await fetchProperties({ ids: favorites, pageSize: 100 }, signal)).items : [],
  );
  if (!favorites.length) return <Empty title={a.savedEmpty} hint={a.savedEmptyHint} cta={a.browse} />;
  if (loading) return <p role="status" className="annot">{t.common.loading}</p>;
  if (error || !data) return <p role="alert" className="err">{a.savedError}</p>;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((p) => <li key={p.id}><PropertyCard p={p} variant="standard" sizes="(min-width: 1280px) 25vw, (min-width: 640px) 40vw, 90vw" /></li>)}
    </ul>
  );
}

function Empty({ title, hint, cta }: { title: string; hint: string; cta: string }) {
  return (
    <div className="grid gap-3 border border-dashed border-line p-8">
      <p className="display h-sm">{title}</p>
      <p className="text-sm text-soft">{hint}</p>
      <LocLink to="/properties" className="btn btn-sm justify-self-start">{cta}</LocLink>
    </div>
  );
}

function Searches() {
  const { t, searches, deleteSearch, href } = useApp();
  const a = t.admin.account;
  const f = useFormat();
  if (!searches.length) return <Empty title={a.searchesEmpty} hint={a.searchesEmptyHint} cta={a.browse} />;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {searches.map((s) => {
        const q = s.query.replace(/^\?/, "");
        return (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="font-semibold">{s.name}</p>
              <p className="annot mt-1 break-all">{q || a.noFilters}</p>
              <p className="annot mt-1">{fmt(a.savedOn, { date: f.date(s.createdAt) })}</p>
            </div>
            <div className="flex gap-2">
              <Link href={href(`/properties${q ? `?${q}` : ""}`)} className="btn btn-sm btn-primary">{a.openSearch}</Link>
              <button type="button" className="btn btn-sm" onClick={() => deleteSearch(s.id)} aria-label={fmt(a.deleteSearchLabel, { name: s.name })}>
                <Trash2 size={14} aria-hidden />{a.deleteSearch}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Viewings() {
  const { t } = useApp();
  const a = t.admin.account;
  return (
    <div className="grid gap-5">
      <p className="annot border-s-2 border-copper ps-3">{a.viewingsNote}</p>
      <ul className="divide-y divide-line border-y border-line">
        {a.viewingItems.map((v) => (
          <li key={v.title} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-semibold">{v.title}</p>
              <p className="annot mt-1">{v.when} · {v.mode === "video" ? a.viewingMode.video : a.viewingMode.inPerson}</p>
            </div>
            <span className="chip" data-active="false">{a.viewingsSampleTag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Profile() {
  const { t, lang } = useApp();
  const a = t.admin.account;
  const [name, setName] = useState(a.sampleName);
  const [email, setEmail] = useState("member@example.com");
  const [language, setLanguage] = useState<string>(lang);
  const [currency, setCurrency] = useState("USD");
  const [saved, setSaved] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); setSaved(true); };
  const change = <T,>(set: (v: T) => void) => (v: T) => { set(v); setSaved(false); };
  return (
    <form onSubmit={submit} className="grid max-w-xl gap-5">
      <h2 className="display h-md">{a.profileTitle}</h2>
      <p className="annot border-s-2 border-copper ps-3">{a.profileNote}</p>
      <div><label className="label" htmlFor="pf-name">{a.name}</label>
        <input id="pf-name" className="field" value={name} onChange={(e) => change(setName)(e.target.value)} autoComplete="off" /></div>
      <div><label className="label" htmlFor="pf-email">{a.email}</label>
        <input id="pf-email" type="email" className="field" value={email} onChange={(e) => change(setEmail)(e.target.value)} autoComplete="off" /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="pf-lang">{a.language}</label>
          <select id="pf-lang" className="field" value={language} onChange={(e) => change(setLanguage)(e.target.value)}>
            <option value="en">{a.langEn}</option><option value="ar">{a.langAr}</option>
          </select></div>
        <div><label className="label" htmlFor="pf-cur">{a.currency}</label>
          <select id="pf-cur" className="field" value={currency} onChange={(e) => change(setCurrency)(e.target.value)}>
            {["USD", "EUR", "GBP", "AED", "SAR"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select></div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary">{a.saveProfile}</button>
        {saved && <p role="status" className="annot">{a.profileSaved}</p>}
      </div>
    </form>
  );
}

function Notifications() {
  const { t } = useApp();
  const a = t.admin.account;
  const keys = ["newListings", "priceDrops", "viewings", "journal"] as const;
  const [on, setOn] = useState<Record<(typeof keys)[number], boolean>>({ newListings: true, priceDrops: false, viewings: true, journal: false });
  return (
    <div className="grid max-w-xl gap-5">
      <h2 className="display h-md">{a.notifTitle}</h2>
      <p className="annot border-s-2 border-copper ps-3">{a.notifNote}</p>
      <ul className="divide-y divide-line border-y border-line">
        {keys.map((k) => (
          <li key={k} className="flex items-center justify-between gap-4 py-4">
            <span id={`nf-${k}`} className="text-sm">{a.notif[k]}</span>
            <Switch checked={on[k]} onChange={(v) => setOn((s) => ({ ...s, [k]: v }))} labelledBy={`nf-${k}`} onText={a.on} offText={a.off} />
          </li>
        ))}
      </ul>
    </div>
  );
}
