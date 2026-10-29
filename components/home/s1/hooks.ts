"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useMedia } from "@/lib/hooks";

const PIN = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/** True only on desktop-width screens without reduced-motion. False on the server (static composition first). */
export const usePinned = () => useMedia(PIN);

let webgl: boolean | undefined;
function detectWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
      webgl = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
const noopSub = () => () => {};
export const useWebGL = () => useSyncExternalStore(noopSub, detectWebGL, () => false);

/** Becomes true once the browser is idle (or after a short timeout). */
export function useIdle(delay = 600): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const go = () => setIdle(true);
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(go, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(go, delay);
    return () => clearTimeout(id);
  }, [delay]);
  return idle;
}
