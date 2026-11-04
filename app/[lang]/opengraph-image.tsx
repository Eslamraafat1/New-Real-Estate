import { ImageResponse } from "next/og";
import { getDictionary } from "@/lib/i18n";

// Branded default share image for every page that has no image of its own
// (property pages override it with their cover photo).
export const alt = "ATLAS ESTATES — Find Your Place in the World. Demo real-estate concept.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  // Latin copy only: the default OG font has no Arabic glyphs, and the brand name is Latin in both locales.
  const t = getDictionary("en");
  const lines = Array.from({ length: 9 }, (_, i) => i);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#efeae0", color: "#15130f", position: "relative" }}>
        {lines.map((i) => (
          <div key={i} style={{ position: "absolute", right: -260 + i * 34, top: -260 + i * 34, width: 760 - i * 68, height: 760 - i * 68, borderRadius: 9999, border: "2px solid rgba(165,90,40,0.28)", display: "flex" }} />
        ))}
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#a55a28" }}>AN INTERACTIVE ARCHITECTURAL ATLAS</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: 4 }}>{t.common.brand}</div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 12, color: "#4d483f" }}>{t.common.tagline}</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#7a7467" }}>Demo concept · sample listings for a fictional city</div>
      </div>
    ),
    size,
  );
}
