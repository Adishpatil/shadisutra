import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = getCanonicalUrl("/sitemap.xml");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/api/", "/e/"],
      },
    ],
    ...(sitemapUrl ? { sitemap: sitemapUrl } : {}),
  };
}
