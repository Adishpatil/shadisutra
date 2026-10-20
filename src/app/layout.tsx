import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { cormorant, dmSans } from "@/lib/fonts";
import { site } from "@/config/site";
import { getCanonicalUrl, localBusinessJsonLd } from "@/config/seo";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

const siteUrl = process.env.SITE_URL?.trim();
const socialImage = getCanonicalUrl("/brand/logo.webp") ?? "/brand/logo.webp";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: `${site.name} — Event Management`,
    template: `%s | ${site.name}`,
  },
  description: `${site.name} — Premium event management for weddings, birthdays, and functions.`,
  openGraph: {
    title: site.name,
    description: `${site.name} — Premium event management for weddings, birthdays, and functions.`,
    siteName: site.name,
    locale: "en_IN",
    type: "website",
    ...(socialImage ? { images: [socialImage] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: `${site.name} — Event planning and management.`,
    ...(socialImage ? { images: [socialImage] } : {}),
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: site.accentColor,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const businessJsonLd = localBusinessJsonLd();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-bg text-ink font-body">
        {businessJsonLd && (
          <script
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(businessJsonLd).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
