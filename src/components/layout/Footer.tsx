"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, siteLinks, hasSiteValue } from "@/config/site";

const footerLinks = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/services", label: "Services" },
      { href: "/gallery", label: "Gallery" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/services/weddings", label: "Weddings" },
      { href: "/services/birthdays", label: "Birthdays" },
      { href: "/services/functions", label: "Functions" },
    ],
  },
] as const;

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-ink text-white/80" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-heading text-2xl font-bold text-white tracking-tight"
            >
              {site.name}
            </Link>
            {hasSiteValue(site.tagline) && (
              <p className="mt-4 max-w-xs text-base leading-relaxed text-white/75">
                {site.tagline}
              </p>
            )}

            {/* Social links */}
            {(hasSiteValue(site.social.instagram) ||
              hasSiteValue(site.social.facebook) ||
              hasSiteValue(site.social.youtube)) && <div className="mt-6 flex items-center gap-3">
              {hasSiteValue(site.social.instagram) && (
                <a
                  href={siteLinks.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-radius-full bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-accent-ink"
                  aria-label="Follow us on Instagram"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {hasSiteValue(site.social.facebook) && (
                <a
                  href={siteLinks.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-radius-full bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-accent-ink"
                  aria-label="Follow us on Facebook"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.738-.9 10.126-5.864 10.126-11.854z" />
                  </svg>
                </a>
              )}
              {hasSiteValue(site.social.youtube) && siteLinks.youtubeUrl && (
                <a
                  href={siteLinks.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-radius-full bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-accent-ink"
                  aria-label="Watch us on YouTube"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>}
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-base font-semibold text-white uppercase tracking-wider">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-base text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          {(hasSiteValue(site.phone) ||
            hasSiteValue(site.email) ||
            hasSiteValue(site.address) ||
            hasSiteValue(site.hours)) && <div>
            <h3 className="text-base font-semibold text-white uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-4 space-y-1 text-base text-white/75">
              {hasSiteValue(site.phone) && (
                <li>
                  <a
                    href={siteLinks.phoneUrl}
                    className="inline-flex min-h-11 items-center transition-colors hover:text-white"
                  >
                    {site.phone}
                  </a>
                </li>
              )}
              {hasSiteValue(site.email) && (
                <li>
                  <a
                    href={siteLinks.emailUrl}
                    className="inline-flex min-h-11 items-center transition-colors hover:text-white"
                  >
                    {site.email}
                  </a>
                </li>
              )}
              {hasSiteValue(site.address) && (
                <li>{site.address}</li>
              )}
              {hasSiteValue(site.hours) && (
                <li>{site.hours}</li>
              )}
            </ul>
          </div>}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-4 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4">
            <p className="text-base text-white/75">
              © {currentYear} {site.name}. All rights reserved.
            </p>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center text-sm text-white/60 transition-colors hover:text-white"
            >
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-4 text-base text-white/75 sm:gap-6">
            <Link href="/privacy" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
