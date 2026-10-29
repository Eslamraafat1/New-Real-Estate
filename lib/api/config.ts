/**
 * Central API configuration. Everything here is safe to evaluate on the server;
 * only NEXT_PUBLIC_* values are visible in the browser.
 */
export const apiConfig = {
  /** "demo" serves bundled sample data; "remote" proxies to BACKEND_API_URL. */
  dataSource: (process.env.DATA_SOURCE === "remote" ? "remote" : "demo") as "demo" | "remote",
  /** Server-only secrets — never expose through NEXT_PUBLIC_*. */
  backendUrl: process.env.BACKEND_API_URL ?? "",
  backendKey: process.env.BACKEND_API_KEY ?? "",
  inquiryWebhook: process.env.INQUIRY_WEBHOOK_URL ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? "USD",
  mapProvider: process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "demo",
  pageSize: 12,
  maxPageSize: 100,
};

export const DEMO_NOTICE = {
  en: "Demo data — sample listings for a fictional city. Nothing here is a real offer.",
  ar: "بيانات تجريبية — عقارات توضيحية لمدينة خيالية. لا شيء هنا عرض حقيقي.",
};
