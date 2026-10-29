import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { href, tr, type Locale } from "@/lib/i18n/config";
import { ContactSheet, type SheetPerson } from "./fx-b/ContactSheet";
import type { HomeData } from "../types";

/** Q — Meet the people: an overlapping contact sheet of monogram portraits (demo identities). */
export function MeetPeople({ data, lang }: { data: HomeData; lang: Locale }) {
  const dict = getDictionary(lang);
  const t = dict.home2;
  const x = dict.home3.people;
  const agents = data.agents.slice(0, 4);
  if (agents.length === 0) return null;
  const people: SheetPerson[] = agents.map((a) => ({
    id: a.id,
    nameEn: a.name.en,
    name: tr(a.name, lang),
    role: tr(a.role, lang),
    phone: a.phone,
    email: a.email,
    profileHref: href(lang, `/agents/${a.slug}`),
  }));
  return (
    <section id="meet-the-people" aria-labelledby="people-h" className="section overflow-x-clip bg-paper2">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div id="people-h"><SectionHead num={t.people.num} eyebrow={t.people.eyebrow} title={t.people.title} intro={t.people.intro} /></div>
          <Link href={href(lang, "/agents")} className="btn w-fit">{t.people.cta}<Arrow /></Link>
        </div>
        <p className="annot mt-8 !text-copper">{t.people.demo}</p>
        <div className="mt-10 pb-6 md:mt-16 lg:pb-28">
          <ContactSheet
            people={people}
            label={x.sheet}
            labels={{ contact: x.contact, close: x.close, call: x.call, email: dict.footer.email, profile: x.profile, sample: dict.common.sample }}
          />
        </div>
      </div>
    </section>
  );
}
