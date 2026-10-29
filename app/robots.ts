import type { MetadataRoute } from "next";
import { apiConfig } from "@/lib/api/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/en/admin", "/ar/admin", "/en/account", "/ar/account", "/en/login", "/ar/login"] }],
    sitemap: `${apiConfig.siteUrl}/sitemap.xml`,
  };
}
