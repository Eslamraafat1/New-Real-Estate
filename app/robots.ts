import type { MetadataRoute } from "next";
import { apiConfig } from "@/lib/api/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // Demo-only pages (/login, /account, /admin, /saved, /compare) are not blocked here on purpose:
    // they carry `robots: noindex`, and crawlers must be able to fetch a page to see that tag.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${apiConfig.siteUrl}/sitemap.xml`,
  };
}
