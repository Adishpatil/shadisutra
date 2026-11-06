"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, siteLinks, hasSiteValue } from "@/config/site";
import { BrandLogo } from "@/components/ui/BrandLogo";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/services/weddings", label: "Weddings" },
  { href: "/services/birthdays", label: "Birthdays" },
  { href: "/services/functions", label: "Functions" },
] as const;

export function Footer({ currentYear }: { currentYear: number }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="public-footer bg-ink text-bg/80" role="contentinfo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 py-10 sm:py-12 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.9fr)_minmax(0,1.2fr)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-2xl"
              aria-label={`${site.name} home`}
            >
              <BrandLogo />
            </Link>
            <div className="mt-4 flex flex-wrap gap-x-4 text-sm leading-relaxed text-bg/80">
              {hasSiteValue(site.phone) && (
                <a
                  className="footer-link inline-flex min-h-11 min-w-0 items-center"
                  href={siteLinks.phoneUrl}
                >
                  {site.phone}
                </a>
              )}
              {hasSiteValue(site.email) && (
                <a
                  className="footer-link inline-flex min-h-11 min-w-0 items-center break-all"
                  href={siteLinks.emailUrl}
                >
                  {site.email}
                </a>
              )}
            </div>
          </div>

          <address className="min-w-0 space-y-2 text-sm leading-relaxed not-italic text-bg/80">
            {hasSiteValue(site.address) && <p className="break-words">{site.address}</p>}
            {hasSiteValue(site.hours) && <p>{site.hours}</p>}
            {hasSiteValue(site.address) && (
              <a
                className="footer-link inline-flex min-h-11 items-center rounded-full border border-bg/40 px-4"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open map
              </a>
            )}
          </address>

          <nav className="min-w-0 md:col-span-2 lg:col-span-1" aria-label="Footer navigation">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 lg:justify-items-end">
              {footerLinks.map((link) => (
                <li key={link.href} className="min-w-0">
                  <Link href={link.href} className="footer-link inline-flex min-h-11 items-center text-sm text-bg/80">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-bg/20 py-3 sm:flex-row sm:items-center">
          <p className="text-sm text-bg/80">© {currentYear} {site.name}</p>
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5">
            <Link href="/privacy" className="footer-link inline-flex min-h-11 items-center text-sm text-bg/80">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link inline-flex min-h-11 items-center text-sm text-bg/80">
              Terms
            </Link>
            <Link
              href="/login"
              className="footer-link footer-admin inline-flex min-h-11 items-center text-sm text-bg/75"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
