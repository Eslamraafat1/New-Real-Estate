import Link from "next/link";
import type { ReactNode } from "react";
import { Armchair, Calendar, Check, Compass, Flame, Landmark, Layers, Sparkles, Waves, type LucideIcon } from "lucide-react";
import { Flower2, Dumbbell, Car, ShieldCheck, Sun, Cpu, Mountain, Building, Building2, ArrowUpDown, UserRound, Sailboat, ConciergeBell } from "lucide-react";
import type { Amenity, Development, Neighborhood, Property, PropertyImage, PropertyStory } from "@/lib/api/types";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { MapView } from "@/components/atlas/MapView";
import { MortgageCalculator } from "@/components/finance/MortgageCalculator";
import { LazyFloorPlanViewer } from "./LazyFloorPlanViewer";
import { Ledger, type LedgerCell } from "./Ledger";
import { LightStudy } from "./LightStudy";
import { SectionRule } from "./SectionRule";
import { getDictionary, fmt } from "@/lib/i18n";
import { href as hrefFor, tr, type Locale } from "@/lib/i18n/config";
import { formatArea, formatDate, formatMoney, formatNumber } from "@/lib/i18n/format";

const AMENITY_ICON: Record<Amenity, LucideIcon> = {
  pool: Waves, garden: Flower2, gym: Dumbbell, parking: Car, security: ShieldCheck, balcony: Building, terrace: Sun,
  "smart-home": Cpu, "sea-view": Sailboat, "city-view": Building2, elevator: ArrowUpDown, "maid-room": UserRound,
  spa: Sparkles, concierge: ConciergeBell, rooftop: Mountain, fireplace: Flame,
};

type StoryKey = keyof PropertyStory;
const STORY_ORDER: StoryKey[] = ["exterior", "interior", "materials", "light", "outdoor"];

/* ------------------------------------------------------------------ section registry */
export type SectionDef = { id: string; label: string };

/** The sections that actually render for this property, in page order (drives the atlas index and the 01–0N numbers). */
export function buildSections(p: Property, lang: Locale, opts: { hasAgent: boolean }): SectionDef[] {
  const n = getDictionary(lang).property.cine.nav;
  const out: SectionDef[] = [{ id: "gallery", label: n.gallery }, { id: "essentials", label: n.essentials }];
  STORY_ORDER.forEach((k) => { if (p.story?.[k]) out.push({ id: `story-${k}`, label: n[k] }); });
  if (p.floorPlan) out.push({ id: "plans", label: n.plans });
  if (p.purpose === "sale" && p.type !== "land") out.push({ id: "finance", label: n.finance });
  out.push({ id: "neighborhood", label: n.neighborhood }, { id: "specs", label: n.specs });
  if (opts.hasAgent) out.push({ id: "agent", label: n.agent });
  return out;
}
export function sectionNumbers(sections: SectionDef[], lang: Locale): Record<string, string> {
  return Object.fromEntries(sections.map((s, i) => [s.id, formatNumber(i + 1, lang, { minimumIntegerDigits: 2 })]));
}

/* ------------------------------------------------------------------ essentials: the ledger */
export function EssentialsSection({ p, lang, num }: { p: Property; lang: Locale; num: string }) {
  const t = getDictionary(lang);
  const e = t.property.essentials;
  const lg = t.property.cine.ledger;
  const land = p.type === "land";
  const perYear = p.pricePeriod === "year";

  const cells: LedgerCell[] = [];
  if (!land) {
    cells.push({ label: e.bedrooms, note: lg.sleeping, value: p.bedrooms, kind: "num" });
    cells.push({ label: e.bathrooms, note: lg.washing, value: p.bathrooms, kind: "num" });
  }
  cells.push({ label: land ? e.plotArea : e.builtArea, note: lg.built, value: p.area, kind: "area" });
  if (p.plotArea && !land) cells.push({ label: e.plotArea, note: lg.plot, value: p.plotArea, kind: "area" });
  if (p.floor !== undefined) cells.push({ label: e.floor, note: lg.level, value: p.floor, kind: "num" });

  const rows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Landmark, label: e.type, value: t.labels.type[p.type] },
    { icon: Compass, label: e.purpose, value: p.purpose === "sale" ? t.labels.purpose.sale : t.labels.purpose.rent },
    { icon: Layers, label: e.price, value: `${formatMoney(p.price, lang, p.currency)}${p.purpose === "rent" ? ` ${perYear ? t.common.perYear : t.common.perMonth}` : ""}` },
  ];
  if (p.furnished !== "na") rows.push({ icon: Armchair, label: e.furnishing, value: t.labels.furnished[p.furnished] });
  rows.push({ icon: Check, label: e.completion, value: t.labels.completion[p.completion] });
  if (p.completionDate) rows.push({ icon: Calendar, label: e.completionDate, value: formatDate(p.completionDate, lang) });
  rows.push({ icon: Check, label: e.availability, value: t.labels.availability[p.availability] });
  if (p.availableFrom) rows.push({ icon: Calendar, label: e.availableFrom, value: formatDate(p.availableFrom, lang) });

  return (
    <section id="essentials" aria-labelledby="essentials-h" className="scroll-mt-32 pt-16 md:pt-24">
      <SectionRule className="mb-10" />
      <header className="mb-8 grid gap-3">
        <p className="annot !text-copper">{num} · {e.eyebrow}</p>
        <h2 id="essentials-h" className="display h-lg">{e.title}</h2>
      </header>
      <Ledger cells={cells} />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h3 className="annot mb-2">{lg.more}</h3>
          <dl className="grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                <dt className="flex items-center gap-2 text-sm text-soft"><r.icon size={15} aria-hidden className="shrink-0 text-mute" />{r.label}</dt>
                <dd className="num min-w-0 text-end font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-5">
          <h3 className="annot">{e.description}</h3>
          <p className="mt-3 max-w-[64ch] text-lg text-pretty text-soft ltr:first-letter:float-start ltr:first-letter:me-2 ltr:first-letter:font-[var(--f-display)] ltr:first-letter:text-6xl ltr:first-letter:leading-[0.9] ltr:first-letter:text-ink">{tr(p.description, lang)}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ storytelling */
function Pull({ text, lang, big = false, className = "" }: { text: string; lang: Locale; big?: boolean; className?: string }) {
  return (
    <blockquote className={`pd-rise relative border-s-2 border-copper ps-5 md:ps-7 ${className}`}>
      <span aria-hidden className="pd-qmark absolute -top-3 end-0 text-6xl opacity-60 md:text-7xl">{lang === "ar" ? "»" : "”"}</span>
      <p className={`display text-pretty !leading-snug ${big ? "h-md" : "h-sm"}`}>{text}</p>
    </blockquote>
  );
}

function Frame({ im, lang, mask, cls, sizes, decorative = false }: { im: PropertyImage; lang: Locale; mask: "pd-mask" | "pd-mask-x" | "pd-mask-circle"; cls: string; sizes: string; decorative?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-paper2 ${mask} ${cls}`}>
      <div className="pd-mask-img absolute inset-0">
        <AtlasImage src={im.src} alt={decorative ? "" : tr(im.alt, lang)} fill sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}

function Chapter({ id, num, children }: { id: string; num: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-32">
      <Reveal as="article" className="grid gap-x-8 gap-y-6 lg:grid-cols-[6.5rem_minmax(0,1fr)]">
        <div aria-hidden className="self-start lg:sticky lg:top-36">
          <span className="numeral num pd-outline block text-[clamp(4.5rem,9vw,6.5rem)]">{num}</span>
        </div>
        <div className="min-w-0">{children}</div>
      </Reveal>
    </section>
  );
}

export function StorySections({ p, lang, nums }: { p: Property; lang: Locale; nums: Record<string, string> }) {
  const t = getDictionary(lang);
  const s = t.property.story;
  const story = p.story;
  if (!story) return null;
  const present = STORY_ORDER.filter((k) => story[k]);
  if (!present.length) return null;
  const imgs = p.images;
  let j = 0; // non-light chapters walk the gallery starting after the cover; the light study owns the cover
  const next = () => imgs[(++j) % imgs.length] ?? imgs[0];

  return (
    <div className="grid gap-24 py-16 md:gap-36 md:py-24" id="architecture">
      <SectionRule />
      <header className="-mb-12 grid gap-3 md:-mb-20">
        <p className="annot !text-copper">{s.eyebrow}</p>
      </header>
      {present.map((k, i) => {
        const id = `story-${k}`;
        const num = nums[id];
        const head = (
          <header>
            <p className="annot annot-ar-ok !text-copper">{fmt(s.annotation, { n: formatNumber(i + 1, lang, { minimumIntegerDigits: 2 }) })}</p>
            <h2 id={`${id}-h`} className="display h-md mt-3">{s[k]}</h2>
          </header>
        );
        if (k === "light") return <LightStudy key={k} property={p} num={num} />;
        const text = tr(story[k]!, lang);
        const im = next();

        if (k === "exterior")
          return (
            <Chapter key={k} id={id} num={num}>
              <div className="grid gap-6">
                {im && <Frame im={im} lang={lang} mask="pd-mask-x" cls="aspect-[4/3] md:aspect-[21/9]" sizes="(min-width: 1280px) 900px, 100vw" />}
                <div className="grid gap-6 md:grid-cols-12">
                  <div className="md:col-span-5">{head}</div>
                  <Pull text={text} lang={lang} big className="md:col-span-7" />
                </div>
              </div>
            </Chapter>
          );
        if (k === "interior")
          return (
            <Chapter key={k} id={id} num={num}>
              <div className="grid items-center gap-8 md:grid-cols-12">
                {im && <Frame im={im} lang={lang} mask="pd-mask" cls="aspect-[4/5] md:col-span-5" sizes="(min-width: 768px) 35vw, 100vw" />}
                <div className="grid gap-6 md:col-span-7">
                  {head}
                  <Pull text={text} lang={lang} big />
                </div>
              </div>
            </Chapter>
          );
        if (k === "materials")
          return (
            <Chapter key={k} id={id} num={num}>
              <div className="grid gap-8">
                <div className="grid items-end gap-6 border-b border-line pb-6 md:grid-cols-12">
                  <div className="md:col-span-5">{head}</div>
                  <Pull text={text} lang={lang} className="md:col-span-7" />
                </div>
                {im && (
                  <div className="grid grid-cols-3 gap-2 md:gap-4" aria-hidden>
                    {["start-0", "-start-full", "-start-[200%]"].map((pos, n) => (
                      <div key={pos} className="pd-mask relative aspect-[2/3] overflow-hidden bg-paper2" style={{ transitionDelay: `${n * 160}ms` }}>
                        <div className={`pd-mask-img absolute inset-y-0 w-[300%] ${pos}`} style={{ transitionDelay: `${n * 160}ms` }}>
                          <AtlasImage src={im.src} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Chapter>
          );
        return (
          <Chapter key={k} id={id} num={num}>
            <div className="grid items-end gap-8 md:grid-cols-12">
              <div className="grid gap-6 md:col-span-5">
                {head}
                <Pull text={text} lang={lang} />
              </div>
              {im && <Frame im={im} lang={lang} mask="pd-mask-circle" cls="aspect-[3/2] md:col-span-7" sizes="(min-width: 768px) 50vw, 100vw" />}
            </div>
          </Chapter>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ plans */
export function PlansSection({ p, lang, num }: { p: Property; lang: Locale; num: string }) {
  if (!p.floorPlan) return null;
  const t = getDictionary(lang);
  return (
    <section id="plans" aria-labelledby="plans-h" className="scroll-mt-32 pt-16 md:pt-24">
      <SectionRule className="mb-10" />
      <header className="mb-8 grid gap-3">
        <p className="annot !text-copper">{num} · {t.property.plans.eyebrow}</p>
        <h2 id="plans-h" className="display h-lg">{t.property.plans.title}</h2>
        <p className="max-w-[56ch] text-soft">{t.property.plans.intro}</p>
      </header>
      <LazyFloorPlanViewer plan={p.floorPlan} propertyTitle={tr(p.title, lang)} />
    </section>
  );
}

/* ------------------------------------------------------------------ finance */
export function FinanceSection({ p, lang, num }: { p: Property; lang: Locale; num: string }) {
  if (p.purpose !== "sale" || p.type === "land") return null;
  const f = getDictionary(lang).property.cine.finance;
  return (
    <section id="finance" aria-labelledby="finance-h" className="scroll-mt-32 pt-16 md:pt-24">
      <SectionRule className="mb-10" />
      <header className="mb-8 grid gap-3">
        <p className="annot !text-copper">{num} · {f.eyebrow}</p>
        <h2 id="finance-h" className="display h-lg">{f.title}</h2>
        <p className="max-w-[56ch] text-soft">{f.intro}</p>
      </header>
      <div className="atlas-grid relative border border-ink bg-paper2 p-3 md:p-6">
        <span aria-hidden className="absolute -start-px -top-px h-4 w-4 border-s-2 border-t-2 border-copper" />
        <span aria-hidden className="absolute -end-px -bottom-px h-4 w-4 border-e-2 border-b-2 border-copper" />
        <MortgageCalculator initialPrice={p.price} currency={p.currency} compact />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ neighborhood */
export function NeighborhoodSection({ p, hood, lang, num }: { p: Property; hood: Neighborhood | null; lang: Locale; num: string }) {
  const t = getDictionary(lang);
  const h = t.property.hood;
  const bars: [string, number][] = hood
    ? [[h.walkability, hood.sample.walkability], [h.greenery, hood.sample.greenery], [h.nightlife, hood.sample.nightlife], [h.quiet, hood.sample.quiet]]
    : [];
  return (
    <section id="neighborhood" aria-labelledby="hood-h" className="scroll-mt-32 pt-16 md:pt-24">
      <SectionRule className="mb-10" />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="grid content-start gap-5 lg:col-span-5">
          <p className="annot !text-copper">{num} · {h.eyebrow}</p>
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
                <div key={label} className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-3 text-sm">
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
        <div className="min-w-0 lg:col-span-7">
          {/* Map centres on the selected property; the rings are a decorative overlay centred on it. */}
          <div className="pd-rings relative h-[26rem] w-full overflow-hidden border border-line lg:h-[34rem]">
            <MapView
              className="h-full w-full"
              markers={[{ id: p.id, x: p.geo.x, y: p.geo.y, label: p.ref, title: tr(p.title, lang), kind: "property" }]}
              areas={hood ? [hood] : []}
              selectedId={p.id}
              interactive={false}
              controls={false}
              cluster={false}
              label={h.mapLabel}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {["30cqmin", "52cqmin", "74cqmin"].map((d) => <span key={d} className="pd-ring pd-ring--static" style={{ width: d, height: d }} />)}
              {[0, 1.8, 3.6].map((delay) => <span key={delay} className="pd-ring pd-ring--pulse" style={{ width: "74cqmin", height: "74cqmin", animationDelay: `${delay}s` }} />)}
            </div>
            <p className="annot annot-ar-ok pointer-events-none absolute start-3 top-3 max-w-[calc(100%-1.5rem)] border border-line bg-paper/90 px-2 py-1 !text-ink">{t.property.cine.rings.label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ specs */
export function SpecsSection({ p, lang, num }: { p: Property; lang: Locale; num: string }) {
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
    <section id="specs" aria-labelledby="specs-h" className="scroll-mt-32 py-16 md:py-24">
      <SectionRule className="mb-10" />
      <header className="mb-8 grid gap-3">
        <p className="annot !text-copper">{num} · {s.eyebrow}</p>
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
                    <Icon size={18} aria-hidden className="shrink-0 text-copper" />{t.labels.amenity[a]}
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
    <Link href={hrefFor(lang, `/developments/${dev.slug}`)} className="group mt-12 flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-5 hover:border-ink focus-visible:border-ink">
      <span>
        <span className="annot annot-ar-ok block">{t.property.development.eyebrow} · {t.common.sample}</span>
        <span className="display h-sm">{fmt(t.property.development.title, { name: tr(dev.name, lang) })}</span>
      </span>
      <span className="btn btn-sm">{t.property.development.view}<Arrow /></span>
    </Link>
  );
}

