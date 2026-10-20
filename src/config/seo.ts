import type { Metadata } from "next";
import { site, siteLinks, hasSiteValue } from "@/config/site";

const siteUrl = process.env.SITE_URL?.replace(/\/+$/, "");

export function getCanonicalUrl(path: string): string | undefined {
  if (!hasSiteValue(siteUrl)) return undefined;
  return new URL(path, `${siteUrl}/`).toString();
}

export function pageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const canonical = getCanonicalUrl(path);
  const socialImage = getCanonicalUrl("/images/hero/hero-01.webp");

  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      siteName: site.name,
      locale: "en_IN",
      type: "website",
      ...(socialImage ? { images: [socialImage] } : {}),
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  };
}

const businessDetails = {
  telephone: site.phone,
  email: site.email,
  address: site.address,
  openingHours: site.hours,
};

export function localBusinessJsonLd(): Record<string, unknown> | null {
  if (!hasSiteValue(site.name)) return null;

  const sameAs = [
    siteLinks.instagramUrl,
    siteLinks.facebookUrl,
    siteLinks.youtubeUrl,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    ...(hasSiteValue(businessDetails.telephone)
      ? { telephone: businessDetails.telephone }
      : {}),
    ...(hasSiteValue(businessDetails.email)
      ? { email: businessDetails.email }
      : {}),
    ...(hasSiteValue(businessDetails.address)
      ? { address: businessDetails.address }
      : {}),
    ...(hasSiteValue(businessDetails.openingHours)
      ? { openingHours: businessDetails.openingHours }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}
