"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useApp } from "@/components/providers/AppProvider";

export interface TabDef<K extends string> { key: K; label: string; badge?: ReactNode }

/**
 * Accessible tabs: sidebar on desktop, horizontally scrollable strip on mobile.
 * Arrow keys / Home / End move between tabs (RTL aware).
 */
export function Tabs<K extends string>({ tabs, value, onChange, label, children }: {
  tabs: TabDef<K>[]; value: K; onChange: (k: K) => void; label: string; children: ReactNode;
}) {
  const { dir } = useApp();
  const uid = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const idx = tabs.findIndex((x) => x.key === value);

  const go = (i: number) => {
    const n = tabs[(i + tabs.length) % tabs.length];
    onChange(n.key);
    refs.current[n.key]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (e.key === "ArrowDown" || e.key === fwd) { e.preventDefault(); go(idx + 1); }
    else if (e.key === "ArrowUp" || e.key === back) { e.preventDefault(); go(idx - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(tabs.length - 1); }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10">
      <div role="tablist" aria-label={label} onKeyDown={onKey}
        className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 md:mx-0 md:flex-col md:self-start md:border-b-0 md:border-e md:px-0 md:pe-4">
        {tabs.map((tab) => {
          const on = tab.key === value;
          return (
            <button key={tab.key} ref={(el) => { refs.current[tab.key] = el; }} type="button" role="tab"
              id={`${uid}-t-${tab.key}`} aria-selected={on} aria-controls={`${uid}-p-${tab.key}`} tabIndex={on ? 0 : -1}
              onClick={() => onChange(tab.key)}
              className={`flex min-h-11 shrink-0 items-center justify-between gap-3 px-3 py-2 text-start text-sm transition-colors md:w-full ${on ? "bg-ink text-paper" : "text-soft hover:bg-paper2 hover:text-ink"}`}>
              <span>{tab.label}</span>
              {tab.badge !== undefined && <span className="annot !text-current">{tab.badge}</span>}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${uid}-p-${value}`} aria-labelledby={`${uid}-t-${value}`} tabIndex={0} className="min-w-0">
        {children}
      </div>
    </div>
  );
}
