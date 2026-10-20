import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/config/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ["/", "weekly", 1],
    ["/about", "monthly", 0.8],
    ["/services", "monthly", 0.8],
    ["/services/weddings", "monthly", 0.7],
    ["/services/birthdays", "monthly", 0.7],
    ["/services/functions", "monthly", 0.7],
    ["/gallery", "weekly", 0.8],
    ["/contact", "monthly", 0.9],
    ["/privacy", "yearly", 0.3],
    ["/terms", "yearly", 0.3],
  ] as const;

  return routes.flatMap(([path, changeFrequency, priority]) => {
    const url = getCanonicalUrl(path);
    return url ? [{ url, lastModified: new Date(), changeFrequency, priority }] : [];
  });
}
