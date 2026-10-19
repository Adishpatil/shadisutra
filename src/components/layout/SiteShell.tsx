"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyContactButtons } from "@/components/layout/StickyContactButtons";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/portal");

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Skip to content — first focusable element for public pages */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer />
      <StickyContactButtons />
    </>
  );
}
