"use client";

import { useApp } from "@/components/providers/AppProvider";

export default function Loading() {
  const { t } = useApp();
  return (
    <div className="wrap pt-10 pb-24" role="status" aria-busy="true">
      <span className="sr-only">{t.property.loadingTitle}</span>
      <div className="grid gap-3 lg:grid-cols-12" aria-hidden>
        <div className="atlas-grid aspect-[4/3] animate-pulse bg-paper2 lg:col-span-8 lg:aspect-auto lg:min-h-[34rem]" />
        <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
          <div className="aspect-[4/3] animate-pulse bg-paper2" />
          <div className="aspect-[4/3] animate-pulse bg-paper2" />
        </div>
      </div>
      <div className="mt-10 grid max-w-xl gap-4" aria-hidden>
        <div className="h-4 w-32 animate-pulse bg-paper2" />
        <div className="h-16 w-full animate-pulse bg-paper2" />
        <div className="h-8 w-48 animate-pulse bg-paper2" />
      </div>
    </div>
  );
}
