/**
 * Central API configuration. Everything here is safe to evaluate on the server;
 * only NEXT_PUBLIC_* values are visible in the browser.
 */
/** Real production deployment — used when no env var provides the site URL. */
export const PRODUCTION_SITE_URL = "https://new-real-estate-jade.vercel.app";

/**
 * Absolute origin used for canonical/hreflang/sitemap/robots/OG URLs.
 * Order: explicit NEXT_PUBLIC_SITE_URL → Vercel's production domain → hard-coded production URL.
 * Never falls back to localhost, so a missing env var can't leak localhost URLs into production SEO tags.
 */
function resolveSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    PRODUCTION_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export const apiConfig = {
  /** "demo" serves bundled sample data; "remote" proxies to BACKEND_API_URL. */
  dataSource: (process.env.DATA_SOURCE === "remote" ? "remote" : "demo") as "demo" | "remote",
  /** Server-only secrets — never expose through NEXT_PUBLIC_*. */
  backendUrl: process.env.BACKEND_API_URL ?? "",
  backendKey: process.env.BACKEND_API_KEY ?? "",
  inquiryWebhook: process.env.INQUIRY_WEBHOOK_URL ?? "",
  siteUrl: resolveSiteUrl(),
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? "USD",
  mapProvider: process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "demo",
  pageSize: 12,
  maxPageSize: 100,
};

export const DEMO_NOTICE = {
  en: "Demo data — sample listings for a fictional city. Nothing here is a real offer.",
  ar: "بيانات تجريبية — عقارات توضيحية لمدينة خيالية. لا شيء هنا عرض حقيقي.",
};
