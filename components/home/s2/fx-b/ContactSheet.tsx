"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Mail, Phone, X } from "lucide-react";
import { InView } from "./InView";

export type SheetPerson = { id: string; nameEn: string; name: string; role: string; phone: string; email: string; profileHref: string };
export type SheetLabels = { contact: string; close: string; call: string; email: string; profile: string; sample: string };

const TONES = [
  "bg-forest text-onforest",
  "bg-ink text-paper",
  "border border-line bg-surface text-ink",
  "border border-line bg-paper2 text-copper",
];
/** Offset / rotated placement from lg up (rotation mirrors in RTL). */
const PLACE = [
  "lg:mt-0 lg:-rotate-[2.5deg] lg:rtl:rotate-[2.5deg]",
  "lg:mt-20 lg:rotate-[1.5deg] lg:rtl:-rotate-[1.5deg]",
  "lg:mt-6 lg:-rotate-1 lg:rtl:rotate-1",
  "lg:mt-28 lg:rotate-[2.5deg] lg:rtl:-rotate-[2.5deg]",
];
const MOBILE_OFFSET = ["", "mt-10 sm:mt-14", "", "mt-10 sm:mt-14"];

function Portrait({ p, i, labels }: { p: SheetPerson; i: number; labels: SheetLabels }) {
  const [open, setOpen] = useState(false);
  const initials = p.nameEn.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  const words = p.name.split(/\s+/);
  const reveal = "translate-y-full opacity-0 pointer-events-none data-[open=true]:translate-y-0 data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto";
  return (
    <li className={`${MOBILE_OFFSET[i % 4]} ${PLACE[i % 4]} lg:w-1/4 lg:-ms-8 lg:first:ms-0 lg:transition-transform lg:duration-500 lg:hover:z-30 lg:hover:rotate-0 lg:focus-within:z-30 lg:focus-within:rotate-0`} style={{ zIndex: 4 - i }}>
      <div className="fxb-rise" style={{ "--d": `${i * 140}ms` } as CSSProperties}>
        <div className={`group relative aspect-[3/4] overflow-hidden shadow-[0_14px_40px_rgba(0,0,0,0.14)] ${TONES[i % 4]}`}>
          {/* frame furniture: contact-sheet rails */}
          <span aria-hidden className="annot absolute start-2.5 top-2.5 !text-current opacity-70">{String(i + 1).padStart(2, "0")}A · {labels.sample}</span>
          <span aria-hidden className="absolute inset-2 border border-current opacity-20" />
          <span aria-hidden className="display absolute inset-x-0 top-[14%] text-center text-[clamp(4.5rem,17vw,9rem)] leading-none opacity-90 lg:text-[clamp(4.5rem,8.5vw,8.5rem)]">{initials}</span>

          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <h3 className="display text-[clamp(1.25rem,5vw,1.7rem)] leading-[1.1] text-balance lg:text-[clamp(1.3rem,2.1vw,2rem)]">
              <Link href={p.profileHref} className="after:absolute after:inset-0 after:content-['']" aria-label={`${p.name} — ${labels.profile}`}>
                {words.map((w, k) => <span key={k} className="block">{w}</span>)}
              </Link>
            </h3>
            <p className="mt-1.5 text-xs opacity-80 sm:text-sm">{p.role}</p>
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? labels.close : labels.contact}
            onClick={() => setOpen((o) => !o)}
            className="absolute end-2 top-2 z-20 grid size-10 place-items-center border border-current bg-paper/90 text-ink transition-colors hover:bg-copper focus-visible:bg-copper"
          >
            {open ? <X size={16} aria-hidden /> : <Phone size={16} aria-hidden />}
          </button>

          <div data-open={open} className={`absolute inset-x-0 bottom-0 z-10 grid gap-2 bg-paper p-3 text-ink transition duration-300 ${reveal}`}>
            <a className="btn btn-sm !justify-start" href={`tel:${p.phone.replace(/\s/g, "")}`}><Phone size={14} aria-hidden /><span className="num truncate">{p.phone}</span></a>
            <a className="btn btn-sm !justify-start" href={`mailto:${p.email}`}><Mail size={14} aria-hidden />{labels.email}</a>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Overlapping, rotated "contact sheet" of monogram portraits. Tap/click, hover or keyboard focus reveals phone + email. */
export function ContactSheet({ people, labels, label }: { people: SheetPerson[]; labels: SheetLabels; label: string }) {
  return (
    <InView as="div" threshold={0.1}>
      <ul aria-label={label} className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 lg:flex lg:items-start lg:gap-0">
        {people.map((p, i) => <Portrait key={p.id} p={p} i={i} labels={labels} />)}
      </ul>
    </InView>
  );
}
