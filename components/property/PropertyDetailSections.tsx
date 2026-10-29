import Link from "next/link";
import { Armchair, Bath, BedDouble, Building2, Calendar, Check, Compass, Flame, Landmark, Layers, Ruler, Sparkles, Waves, type LucideIcon } from "lucide-react";
import { Flower2, Dumbbell, Car, ShieldCheck, Sun, Cpu, Mountain, Building, ArrowUpDown, UserRound, Sailboat, ConciergeBell } from "lucide-react";
import type { Amenity, Development, Neighborhood, Property, PropertyStory } from "@/lib/api/types";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { MapView } from "@/components/atlas/MapView";
import { LazyFloorPlanViewer } from "./LazyFloorPlanViewer";
import { getDictionary, fmt } from "@/lib/i18n";
import { href as hrefFor, tr, type Locale } from "@/lib/i18n/config";
import { formatArea, formatDate, formatMoney, formatNumber } from "@/lib/i18n/format";

const AMENITY_ICON: Record<Amenity, LucideIcon> = {
  pool: Waves, garden: Flower2, gym: Dumbbell, parking: Car, security: ShieldCheck, balcony: Building, terrace: Sun,
  "smart-home": Cpu, "sea-view": Sailboat, "city-view": Building2, elevator: ArrowUpDown, "maid-room": UserRound,
  spa: Sparkles, concierge: ConciergeBell, rooftop: Mountain, fireplace: Flame,
};

/* ------------------------------------------------------------------ essentials */
export function EssentialsSection({ p, lang }: { p: Property; lang: Locale }) {
  const t = getDictionary(lang);
  const e = t.property.essentials;
  const land = p.type === "land";
  const perYear = p.pricePeriod === "year";
  const rows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Landmark, label: e.type, value: t.labels.type[p.type] },
    { icon: Compass, label: e.purpose, value: p.purpose === "sale" ? t.labels.purpose.sale : t.labels.purpose.rent },
    { icon: Layers, label: e.price, value: `${formatMoney(p.price, lang, p.currency)}${p.purpose === "rent" ? ` ${perYear ? t.common.perYear : t.common.perMonth}` : ""}` },
  ];
  if (!land) {
    rows.push({ icon: BedDouble, label: e.bedrooms, value: formatNumber(p.bedrooms, lang) });
    rows.push({ icon: Bath, label: e.bathrooms, value: formatNumber(p.bathrooms, lang) });
  }
  rows.push({ icon: Ruler, label: land ? e.plotArea : e.builtArea, value: formatArea(p.area, lang) });
  if (p.plotArea && !land) rows.push({ icon: Ruler, label: e.plotArea, value: formatArea(p.plotArea, lang) });
  if (p.floor !== undefined) rows.push({ icon: Building2, label: e.floor, value: formatNumber(p.floor, lang) });
  if (p.furnished !== "na") rows.push({ icon: Armchair, label: e.furnishing, value: t.labels.furnished[p.furnished] });
  rows.push({ icon: Check, label: e.completion, value: t.labels.completion[p.completion] });
  if (p.completionDate) rows.push({ icon: Calendar, label: e.completionDate, value: formatDate(p.completionDate, lang) });
  rows.push({ icon: Check, label: e.availability, value: t.labels.availability[p.availability] });
  if (p.availableFrom) rows.push({ icon: Calendar, label: e.availableFrom, value: formatDate(p.availableFrom, lang) });

  return (
    <section id="essentials" aria-labelledby="essentials-h" className="scroll-mt-24 py-16 md:py-24">
      <div className="grid gap-10 xl:grid-cols-12">
        <header className="xl:col-span-4">
          <p className="annot !text-copper">01 · {e.eyebrow}</p>
          <h2 id="essentials-h" className="display h-lg mt-3">{e.title}</h2>
        </header>
        <div className="xl:col-span-8">
          <dl className="grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                <dt className="flex items-center gap-2 text-sm text-soft"><r.icon size={15} aria-hidden className="text-mute" />{r.label}</dt>
                <dd className="num text-end font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
          <h3 className="annot mt-10">{e.description}</h3>
          <p className="mt-3 max-w-[64ch] text-lg text-pretty text-soft first-letter:float-start first-letter:me-2 first-letter:font-[var(--f-display)] first-letter:text-6xl first-letter:leading-[0.9] first-letter:text-ink">{tr(p.description, lang)}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ storytelling */
type StoryKey = keyof PropertyStory;
const STORY_ORDER: StoryKey[] = ["exterior", "interior", "materials", "light", "outdoor"];

export function StorySections({ p, lang }: { p: Property; lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.property.story;
  const story = p.story;
  if (!story) return null;
  const present = STORY_ORDER.filter((k) => story[k]);
  if (!present.length) return null;
  const imgs = p.images;
  const pic = (i: number) => imgs[(i + 3) % imgs.length] ?? imgs[0];
  const num = (i: number) => formatNumber(i + 2, lang, { minimumIntegerDigits: 2 });

  return (
    <div className="grid gap-20 md:gap-32 py-8" id="architecture">
      <p className="annot !text-copper">{s.eyebrow}</p>
      {present.map((k, i) => {
        const text = tr(story[k], lang);
        const title = s[k];
        const im = pic(i);
        const head = (
          <header>
            <p className="annot annot-ar-ok !text-copper">{num(i)} · {fmt(s.annotation, { n: formatNumber(i + 1, lang, { minimumIntegerDigits: 2 }) })}</p>
            <h2 className="display h-md mt-3">{title}</h2>
          </header>
        );
        const frame = (cls: string, sizes: string) => im && (
          <div className={`relative overflow-hidden bg-paper2 ${cls}`}>
            <AtlasImage src={im.src} alt={tr(im.alt, lang)} fill sizes={sizes} className="object-cover" />
          </div>
        );
        if (k === "exterior")
          return (
            <Reveal key={k} as="article" className="grid gap-6">
              {frame("aspect-[21/9] w-full", "(min-width: 1440px) 1300px, 100vw")}
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-5">{head}</div>
                <p className="reveal text-lg text-soft text-pretty md:col-span-6 md:col-start-7">{text}</p>
              </div>
            </Reveal>
          );
        if (k === "interior")
          return (
            <Reveal key={k} as="article" className="grid items-center gap-8 md:grid-cols-12">
              {frame("aspect-[4/5] md:col-span-5", "(min-width: 768px) 40vw, 100vw")}
              <div className="grid gap-5 md:col-span-6 md:col-start-7">
                {head}
                <p className="reveal text-soft text-pretty max-w-[52ch]">{text}</p>
              </div>
            </Reveal>
          );
        if (k === "materials")
          return (
            <Reveal key={k} as="article" className="grid gap-6 border-y border-line py-10 md:grid-cols-12">
              <div className="md:col-span-4">{head}</div>
              <p aria-hidden className="numeral num hidden text-[9rem] text-[var(--line)] md:col-span-3 md:block md:text-center">{formatNumber(i + 1, lang)}</p>
              <p className="reveal text-lg text-pretty md:col-span-5">{text}</p>
            </Reveal>
          );
        if (k === "light")
          return (
            <Reveal key={k} as="article" className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-8 md:col-start-3">
                {head}
                <blockquote className="reveal display h-md mt-6 border-s-2 border-copper ps-6 text-pretty !leading-snug">{text}</blockquote>
              </div>
            </Reveal>
          );
        return (
          <Reveal key={k} as="article" className="grid items-end gap-8 md:grid-cols-12">
            <div className="grid gap-5 md:col-span-5">
              {head}
              <p className="reveal text-soft text-pretty">{text}</p>
            </div>
            {frame("aspect-[3/2] md:col-span-6 md:col-start-7", "(min-width: 768px) 50vw, 100vw")}
          </Reveal>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ plans */
export function PlansSection({ p, lang }: { p: Property; lang: Locale }) {
  if (!p.floorPlan) return null;
  const t = getDictionary(lang);
  return (
    <section id="plans" aria-labelledby="plans-h" className="scroll-mt-24 py-16 md:py-24">
      <header className="mb-8 grid gap-3">
        <p className="annot !text-copper">{t.property.plans.eyebrow}</p>
        <h2 id="plans-h" className="display h-lg">{t.property.plans.title}</h2>
        <p className="max-w-[56ch] text-soft">{t.property.plans.intro}</p>
      </header>
      <LazyFloorPlanViewer plan={p.floorPlan} propertyTitle={tr(p.title, lang)} />
    </section>
  );
}

/* ------------------------------------------------------------------ neighborhood */
export function NeighborhoodSection({ p, hood, lang }: { p: Property; hood: Neighborhood | null; lang: Locale }) {
  const t = getDictionary(lang);
  const h = t.property.hood;
  const bars: [string, number][] = hood
    ? [[h.walkability, hood.sample.walkability], [h.greenery, hood.sample.greenery], [h.nightlife, hood.sample.nightlife], [h.quiet, hood.sample.quiet]]
    : [];
  return (
    <section id="neighborhood" aria-labelledby="hood-h" className="scroll-mt-24 py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="grid content-start gap-5 lg:col-span-5">
          <p className="annot !text-copper">{h.eyebrow}</p>
          <h2 id="hood-h" className="display h-lg">{hood ? tr(hood.name, lang) : tr(p.location, lang)}</h2>
          {hood && <p className="display h-sm text-soft">{tr(hood.tagline, lang)}</p>}
          {hood && <p className="text-soft text-pretty">{tr(hood.description, lang)}</p>}
          {hood && (
            <ul className="flex flex-wrap gap-1.5" aria-label={h.character}>
              {hood.character.map((c) => <li key={c.en} className="chip cursor-default">{tr(c, lang)}</li>)}
            </ul>
          )}
          {bars.length > 0 && hood && (
            <div className="grid gap-3 border-t border-line pt-4">
              <p className="annot annot-ar-ok">{h.sample} · {h.sampleNote}</p>
              {bars.map(([label, v]) => (
                <div key={label} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-sm">
                  <span>{label}</span>
                  <span className="relative h-px bg-line" aria-hidden><span className="absolute inset-y-[-2px] start-0 bg-copper" style={{ width: `${v * 10}%` }} /></span>
                  <span className="num annot annot-ar-ok">{formatNumber(v, lang)}/{formatNumber(10, lang)}</span>
                </div>
              ))}
              <p className="text-sm text-soft">{h.avgPrice}: <span className="num">{formatMoney(hood.sampleAvgPricePerM2, lang, p.currency)}</span> <span className="annot annot-ar-ok">({h.sample})</span></p>
            </div>
          )}
          <Link className="btn justify-self-start" href={hrefFor(lang, `/map?select=${encodeURIComponent(p.id)}`)}>{h.openMap}<Arrow /></Link>
        </div>
        <div className="lg:col-span-7">
          <MapView
            className="h-[26rem] w-full border border-line lg:h-[34rem]"
            markers={[{ id: p.id, x: p.geo.x, y: p.geo.y, label: p.ref, title: tr(p.title, lang), kind: "property" }]}
            areas={hood ? [hood] : []}
            activeArea={hood?.slug ?? null}
            selectedId={p.id}
            interactive={false}
            controls={false}
            cluster={false}
            label={h.mapLabel}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ specs */
export function SpecsSection({ p, lang }: { p: Property; lang: Locale }) {
  const t = getDictionary(lang);
  const s = t.property.specs;
  const e = t.property.essentials;
  const rows: [string, string][] = [
    [e.reference, p.ref],
    [e.type, t.labels.type[p.type]],
    [e.style, t.labels.style[p.style]],
    [e.neighborhood, tr(p.location, lang)],
    [e.completion, t.labels.completion[p.completion]],
  ];
  if (p.type !== "land") rows.push([e.bedrooms, formatNumber(p.bedrooms, lang)], [e.bathrooms, formatNumber(p.bathrooms, lang)]);
  rows.push([p.type === "land" ? e.plotArea : e.builtArea, formatArea(p.area, lang)]);
  if (p.plotArea) rows.push([e.plotArea, formatArea(p.plotArea, lang)]);
  if (p.floor !== undefined) rows.push([e.floor, formatNumber(p.floor, lang)]);
  if (p.furnished !== "na") rows.push([e.furnishing, t.labels.furnished[p.furnished]]);
  if (p.purpose === "sale") rows.push([e.perM2, formatMoney(Math.round(p.price / p.area), lang, p.currency)]);
  return (
    <section id="specs" aria-labelledby="specs-h" className="scroll-mt-24 py-16 md:py-24">
      <header className="mb-8 grid gap-3">
        <p className="annot !text-copper">{s.eyebrow}</p>
        <h2 id="specs-h" className="display h-lg">{s.title}</h2>
      </header>
      <div className="grid gap-10 lg:grid-cols-2">
        <table className="w-full border-t border-line text-sm">
          <caption className="annot mb-2 text-start">{s.details}</caption>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b border-line">
                <th scope="row" className="py-3 pe-4 text-start font-normal text-soft">{k}</th>
                <td className="num py-3 text-end font-medium">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h3 className="annot mb-2">{s.amenities}</h3>
          {p.amenities.length ? (
            <ul className="grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
              {p.amenities.map((a) => {
                const Icon = AMENITY_ICON[a];
                return (
                  <li key={a} className="flex items-center gap-3 border-b border-line py-3 text-sm">
                    <Icon size={18} aria-hidden className="text-copper" />{t.labels.amenity[a]}
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-soft">{s.none}</p>}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ development link */
export function DevelopmentLink({ dev, lang }: { dev: Development; lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <Link href={hrefFor(lang, `/developments/${dev.slug}`)} className="group my-8 flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-5 hover:border-ink">
      <span>
        <span className="annot annot-ar-ok block">{t.property.development.eyebrow} · {t.common.sample}</span>
        <span className="display h-sm">{fmt(t.property.development.title, { name: tr(dev.name, lang) })}</span>
      </span>
      <span className="btn btn-sm">{t.property.development.view}<Arrow /></span>
    </Link>
  );
}
