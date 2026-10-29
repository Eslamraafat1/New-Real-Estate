"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { Arrow } from "@/components/ui/Arrow";

export default function NotFound() {
  const { t, href } = useApp();
  return (
    <div className="wrap section grid min-h-[60vh] content-center gap-5">
      <p className="annot !text-copper">{t.property.notFoundEyebrow}</p>
      <h1 className="display h-lg max-w-[18ch] text-balance">{t.property.notFoundDevTitle}</h1>
      <p className="max-w-[52ch] text-soft">{t.property.notFoundDevBody}</p>
      <Link href={href("/developments")} className="btn btn-primary justify-self-start">{t.property.backToDevelopments}<Arrow /></Link>
    </div>
  );
}
