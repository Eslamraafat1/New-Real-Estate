"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useT } from "@/components/providers/AppProvider";

/** Accessible modal built on the native <dialog> (focus trap, Esc, inert background). */
export function Modal({ open, onClose, title, children, className = "", fullscreen = false, hideHeader = false }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string; fullscreen?: boolean; hideHeader?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = useT();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={`m-auto max-h-[100dvh] max-w-[100vw] bg-paper p-0 text-ink backdrop:bg-[var(--scrim)] backdrop:backdrop-blur-sm ${fullscreen ? "h-[100dvh] w-[100vw]" : "w-[min(92vw,720px)] border border-line shadow-2xl"} ${className}`}
    >
      {open && (
        <div className="flex max-h-[100dvh] min-h-0 flex-col">
          {!hideHeader && (
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 safe-t">
              <h2 className="display h-sm">{title}</h2>
              <button type="button" className="icon-btn icon-btn-sm" onClick={onClose} aria-label={t.common.close}><X size={18} /></button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        </div>
      )}
    </dialog>
  );
}
