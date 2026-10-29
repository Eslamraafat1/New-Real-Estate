import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapView } from "@/components/atlas/MapView";
import { InquiryForm } from "@/components/forms/forms";
import { PageHeader } from "@/components/ui/SectionHead";
import { listNeighborhoods } from "@/lib/api/locations";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).pages.contact.meta;
  return { title: m.title, description: m.description };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.pages.contact;
  const areas = await listNeighborhoods();

  return (
    <>
      <PageHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <div className="wrap grid gap-14 pb-24 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="contact-form">
          <h2 id="contact-form" className="display h-md mb-6">{t.forms.agencyTitle}</h2>
          <InquiryForm kind="contact" />
        </section>

        <aside className="grid content-start gap-10 lg:col-span-4 lg:col-start-9">
          <section>
            <p className="annot mb-3 !text-copper">{p.officeTitle}</p>
            <address className="grid gap-4 border-t border-line pt-4 not-italic">
              <p className="display h-sm">{p.officeName}</p>
              <p className="text-soft">{p.address}</p>
              <p className="grid gap-1 text-sm">
                <span className="annot">{p.phoneLabel}</span>
                <a className="num hover:underline" dir="ltr" href={`tel:${p.phone.replace(/\s/g, "")}`}>{p.phone}</a>
              </p>
              <p className="grid gap-1 text-sm">
                <span className="annot">{p.emailLabel}</span>
                <a className="hover:underline" dir="ltr" href={`mailto:${p.email}`}>{p.email}</a>
              </p>
            </address>
            <p className="mt-4 text-xs text-mute">{p.notice}</p>
          </section>
          <section>
            <p className="annot mb-3 !text-copper">{p.hoursTitle}</p>
            <dl className="border-t border-line">
              {p.hours.map((h) => (
                <div key={h.d} className="flex items-baseline justify-between gap-4 border-b border-linesoft py-3 text-sm">
                  <dt className="text-soft">{h.d}</dt>
                  <dd className="num">{h.h}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>

        <section className="lg:col-span-12" aria-labelledby="contact-map">
          <h2 id="contact-map" className="annot mb-3 !text-copper">{p.mapTitle}</h2>
          <MapView
            className="h-[360px] w-full border border-line md:h-[460px]"
            markers={[{ id: "office", x: 300, y: 705, label: p.officePin, title: p.officeName }]}
            areas={areas}
            activeArea="harbor-row"
            interactive={false}
            controls={false}
            cluster={false}
            label={p.mapLabel}
          />
        </section>
      </div>
    </>
  );
}
