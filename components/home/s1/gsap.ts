import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Client-only. Registers ScrollTrigger once and re-exports both. */
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** Pinned / scrubbed scenes run only when this matches; everything else gets a static composition. */
export const PIN_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
