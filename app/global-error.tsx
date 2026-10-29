"use client";

/** Last-resort boundary: replaces the root layout, so it renders its own <html>/<body> with inline styles. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const ink = "#15130f";
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#efeae0", color: ink, fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px" }}>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.14em", color: "#a55a28", textTransform: "uppercase" }}>ATLAS ESTATES · 500</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 40, lineHeight: 1.1, margin: "16px 0" }}>Something went wrong.</h1>
          <p dir="rtl" lang="ar" style={{ fontFamily: "serif", fontSize: 24, margin: "0 0 16px", color: "#4d483f" }}>حدث خطأ غير متوقع.</p>
          <p style={{ color: "#4d483f", lineHeight: 1.6 }}>An unexpected error stopped the page from loading. Please try again. / يرجى المحاولة مرة أخرى.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ marginTop: 24, padding: "12px 20px", background: "#1f3b2d", color: "#f1ede2", border: "1px solid #1f3b2d", cursor: "pointer", font: "inherit" }}
          >
            Try again / حاول مجدداً
          </button>
        </main>
      </body>
    </html>
  );
}
