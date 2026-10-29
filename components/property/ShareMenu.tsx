"use client";

import { Copy, Share2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Share (Web Share API when available, else copy link) and an explicit Copy-link button. */
export function ShareMenu({ title, className = "" }: { title: string; className?: string }) {
  const { t, toast } = useApp();

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    if (await copy(url)) toast(t.common.copied);
  };
  const copyLink = async () => { if (await copy(window.location.href)) toast(t.common.copied); };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button type="button" className="btn btn-sm" onClick={share}><Share2 size={14} />{t.common.share}</button>
      <button type="button" className="btn btn-sm" onClick={copyLink}><Copy size={14} />{t.common.copyLink}</button>
    </div>
  );
}
