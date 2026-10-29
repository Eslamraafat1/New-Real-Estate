"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image with a graceful architectural fallback: if the photo fails to load we show a
 * blueprint-style placeholder instead of a broken image icon.
 */
export function AtlasImage({ alt, className = "", ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={alt} className={`atlas-grid grid place-items-center bg-paper2 ${className}`} style={props.fill ? { position: "absolute", inset: 0 } : undefined}>
        <svg viewBox="0 0 120 80" className="w-1/2 opacity-60" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M10 70h100M20 70V30l30-18 30 18v40M50 70V45h20v25M85 70V40h25v30" />
        </svg>
      </div>
    );
  }
  return <Image alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}
