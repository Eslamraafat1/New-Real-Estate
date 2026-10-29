"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useApp } from "@/components/providers/AppProvider";

/** next/link that prefixes the active locale: <LocLink to="/buy"> becomes /en/buy */
export function LocLink({ to, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { to: string }) {
  const { href } = useApp();
  return <Link href={href(to)} {...rest} />;
}
