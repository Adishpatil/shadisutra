import type { Metadata, Viewport } from "next";
import { cormorant, dmSans } from "@/lib/fonts";
import { site } from "@/config/site";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
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
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF8F5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-bg text-ink font-body">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
