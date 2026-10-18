import type { Metadata, Viewport } from "next";
import { cormorant, dmSans } from "@/lib/fonts";
import { site } from "@/config/site";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyContactButtons } from "@/components/layout/StickyContactButtons";
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
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-bg text-ink font-body">
        {/* Skip to content — first focusable element */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>

        <Navbar />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer />
        <StickyContactButtons />
      </body>
    </html>
  );
}
