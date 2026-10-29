"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { FloorPlanViewer as Viewer } from "./FloorPlanViewer";

const Inner = dynamic(() => import("./FloorPlanViewer").then((m) => m.FloorPlanViewer), {
  ssr: false,
  loading: () => <div className="atlas-grid aspect-[10/7] w-full animate-pulse border border-line bg-paper2" aria-hidden />,
});

/** Code-split wrapper: the viewer (framer-motion, pointer logic) loads only when a plan is shown. */
export function LazyFloorPlanViewer(props: ComponentProps<typeof Viewer> & { onShowGallery?: () => void }) {
  return <Inner {...props} />;
}
