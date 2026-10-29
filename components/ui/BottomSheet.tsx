"use client";

import { useRef, type ReactNode } from "react";

/**
 * Mobile bottom sheet. Non-modal (map stays interactive); drag the handle down — or tap it — to dismiss.
 * Respects the safe area and is hidden from md up (desktop uses a side panel instead).
 */
export function BottomSheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const startY = useRef<number | null>(null);
  const el = useRef<HTMLDivElement>(null);

  const onDown = (e: React.PointerEvent) => { startY.current = e.clientY; (e.target as Element).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => {
    if (startY.current === null || !el.current) return;
    const dy = Math.max(0, e.clientY - startY.current);
    el.current.style.transform = `translateY(${dy}px)`;
    el.current.style.transition = "none";
  };
  const onUp = (e: React.PointerEvent) => {
    if (startY.current === null || !el.current) return;
    const dy = e.clientY - startY.current;
    startY.current = null;
    el.current.style.transition = "";
    el.current.style.transform = "";
    if (dy > 80 || Math.abs(dy) < 4) onClose();
  };

  return (
    <div
      ref={el}
      role="dialog"
      aria-label={label}
      aria-hidden={!open}
      inert={!open}
      className={`safe-b fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.4)] transition-transform duration-300 md:hidden ${open ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="grid h-7 cursor-grab touch-none place-items-center" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <span className="h-1 w-10 rounded-full bg-line" />
      </div>
      <div className="max-h-[58dvh] overflow-auto px-4 pb-4">{children}</div>
    </div>
  );
}
