"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Agent, Property } from "@/lib/api/types";
import { useApp } from "@/components/providers/AppProvider";
import { Modal } from "@/components/ui/Modal";
import { InquiryForm, ViewingForm } from "@/components/forms/forms";

const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

export type MediaTab = "photos" | "plan" | "video" | "tour";
type Dialog = "viewing" | "contact" | "info" | null;

interface Ctx {
  property: Property;
  agent: Agent | null;
  tab: MediaTab;
  setTab: (t: MediaTab) => void;
  openLightbox: (i: number) => void;
  openDialog: (d: Exclude<Dialog, null>) => void;
  /** Switch the gallery to the floor-plan tab and scroll to it. */
  goPlan: () => void;
}

const C = createContext<Ctx | null>(null);
export function usePropertyDetail() {
  const c = useContext(C);
  if (!c) throw new Error("usePropertyDetail must be used inside <PropertyDetailProvider>");
  return c;
}

/** Shared client state for the property page: gallery tab, lightbox and the three dialogs. */
export function PropertyDetailProvider({ property, agent, children }: { property: Property; agent: Agent | null; children: ReactNode }) {
  const { t } = useApp();
  const [tab, setTab] = useState<MediaTab>("photos");
  const [lb, setLb] = useState<number | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const remember = () => { lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; };
  const restore = () => { const el = lastFocus.current; lastFocus.current = null; if (el?.isConnected) requestAnimationFrame(() => el.focus()); };

  const openLightbox = useCallback((i: number) => { remember(); setLb(i); }, []);
  const openDialog = useCallback((d: Exclude<Dialog, null>) => { remember(); setDialog(d); }, []);
  const goPlan = useCallback(() => {
    setTab("plan");
    const el = document.getElementById("gallery");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  const value = useMemo<Ctx>(() => ({ property, agent, tab, setTab, openLightbox, openDialog, goPlan }), [property, agent, tab, openLightbox, openDialog, goPlan]);
  const a = t.property.actions;
  const title = dialog === "viewing" ? a.viewingTitle : dialog === "contact" ? a.contactTitle : a.infoTitle;
  const closeDialog = () => { setDialog(null); restore(); };

  return (
    <C.Provider value={value}>
      {children}
      {lb !== null && (
        <Lightbox images={property.images} index={lb} onIndex={setLb} onClose={() => { setLb(null); restore(); }} />
      )}
      <Modal open={dialog !== null} onClose={closeDialog} title={title}>
        <div className="p-5 md:p-6">
          {dialog === "viewing" && <ViewingForm propertyId={property.id} />}
          {dialog === "contact" && <InquiryForm kind="agent" propertyId={property.id} agentId={agent?.id ?? property.agentId} />}
          {dialog === "info" && <InquiryForm kind="details" propertyId={property.id} agentId={agent?.id ?? property.agentId} />}
        </div>
      </Modal>
    </C.Provider>
  );
}
