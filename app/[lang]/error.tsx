"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useApp } from "@/components/providers/AppProvider";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, href } = useApp();
  const p = t.pages.error;
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="wrap py-24 md:py-40">
      <p className="annot !text-copper">{p.eyebrow}</p>
      <h1 className="display h-lg mt-3 max-w-[16ch] text-balance">{p.title}</h1>
      <p className="mt-5 max-w-[50ch] text-soft">{p.text}</p>
      {error.digest && <p className="annot mt-4">{p.ref}: <span className="num">{error.digest}</span></p>}
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={() => reset()}>{p.retry}</button>
        <Link className="btn" href={href("/")}>{p.home}</Link>
      </div>
    </section>
  );
}
