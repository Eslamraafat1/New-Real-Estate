"use client";

import { useState, type KeyboardEvent } from "react";
import { ExternalLink, Maximize2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { AtlasImage } from "@/components/ui/AtlasImage";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n";
import { LazyFloorPlanViewer } from "./LazyFloorPlanViewer";
import { usePropertyDetail, type MediaTab } from "./PropertyDetailContext";

const isFile = (u: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(u);

/** Media gallery: Photos / Floor plan / Video / Virtual tour (tabs only when the data exists). */
export function PropertyGallery() {
  const { t, lang } = useApp();
  const g = t.property.gallery;
  const { property: p, tab, setTab, openLightbox } = usePropertyDetail();
  const [cur, setCur] = useState(0);
  const title = tr(p.title, lang);

  const tabs: { id: MediaTab; label: string }[] = [{ id: "photos", label: g.tabs.photos }];
  if (p.floorPlan) tabs.push({ id: "plan", label: g.tabs.plan });
  if (p.videoUrl) tabs.push({ id: "video", label: g.tabs.video });
  if (p.virtualTourUrl) tabs.push({ id: "tour", label: g.tabs.tour });
  const active = tabs.some((x) => x.id === tab) ? tab : "photos";

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((x) => x.id === active);
    const rtl = document.documentElement.dir === "rtl";
    const fwd = e.key === (rtl ? "ArrowLeft" : "ArrowRight");
    const back = e.key === (rtl ? "ArrowRight" : "ArrowLeft");
    if (!fwd && !back) return;
    e.preventDefault();
    const next = tabs[(i + (fwd ? 1 : -1) + tabs.length) % tabs.length];
    setTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  const img = p.images[cur] ?? p.images[0];

  return (
    <section id="gallery" aria-labelledby="gallery-h" className="wrap section scroll-mt-20 !pb-0">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="annot !text-copper">{g.eyebrow}</p>
          <h2 id="gallery-h" className="display h-lg mt-3">{g.title}</h2>
        </div>
        {tabs.length > 1 && (
          <div role="tablist" aria-label={g.label} onKeyDown={onTabKey} className="flex flex-wrap gap-1">
            {tabs.map((x) => (
              <button key={x.id} id={`tab-${x.id}`} role="tab" aria-selected={x.id === active} aria-controls="gallery-panel" tabIndex={x.id === active ? 0 : -1} className="chip min-h-[44px]" data-active={x.id === active} onClick={() => setTab(x.id)}>{x.label}</button>
            ))}
          </div>
        )}
      </div>

      <div id="gallery-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
        {active === "photos" && img && (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_7.5rem]">
            <figure className="group relative m-0">
              <button type="button" className="relative block aspect-[3/2] w-full overflow-hidden bg-paper2" onClick={() => openLightbox(cur)} aria-label={fmt(g.open, { n: cur + 1 })}>
                <AtlasImage key={img.src} src={img.src} alt={tr(img.alt, lang)} fill sizes="(min-width: 1024px) 80vw, 100vw" className="img-hover object-cover" />
                <span className="absolute end-3 top-3 grid h-9 w-9 place-items-center bg-paper/90 text-ink" aria-hidden><Maximize2 size={16} /></span>
              </button>
              {img.caption && <figcaption className="annot annot-ar-ok mt-2">{tr(img.caption, lang)}</figcaption>}
            </figure>
            <ul aria-label={g.thumbs} className="no-scrollbar flex gap-2 overflow-x-auto lg:max-h-[34rem] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
              {p.images.map((im, i) => (
                <li key={`${i}-${im.src}`} className="shrink-0">
                  <button type="button" aria-label={fmt(g.open, { n: i + 1 })} aria-current={i === cur} onClick={() => setCur(i)} onDoubleClick={() => openLightbox(i)} className={`relative block h-20 w-28 overflow-hidden border-2 lg:h-[5rem] lg:w-full ${i === cur ? "border-copper" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <AtlasImage src={im.src} alt="" fill sizes="120px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {active === "plan" && p.floorPlan && (
          <LazyFloorPlanViewer plan={p.floorPlan} propertyTitle={title} onShowGallery={() => setTab("photos")} />
        )}
        {active === "video" && p.videoUrl && (
          isFile(p.videoUrl) ? (
            <video controls preload="metadata" className="aspect-video w-full bg-ink" src={p.videoUrl} />
          ) : (
            <a className="btn" href={p.videoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />{g.openVideo}</a>
          )
        )}
        {active === "tour" && p.virtualTourUrl && (
          <div className="grid justify-items-start gap-2">
            <a className="btn" href={p.virtualTourUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />{g.openTour}</a>
            <p className="annot annot-ar-ok">{g.externalNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}
