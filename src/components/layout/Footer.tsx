"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { site, siteLinks, hasSiteValue } from "@/config/site";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/services/weddings", label: "Weddings" },
  { href: "/services/birthdays", label: "Birthdays" },
  { href: "/services/functions", label: "Functions" },
] as const;

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="public-footer bg-ink text-bg/80" role="contentinfo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-2xl bg-bg p-2.5"
              aria-label={`${site.name} home`}
            >
              <Image
                src="/brand/logo.webp"
                alt=""
                width={112}
                height={74}
                className="h-12 w-[72px] object-contain"
              />
            </Link>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm leading-relaxed text-bg/80">
              {hasSiteValue(site.phone) && (
                <a className="footer-link inline-flex min-h-11 items-center" href={siteLinks.phoneUrl}>{site.phone}</a>
              )}
              {hasSiteValue(site.email) && (
                <a className="footer-link inline-flex min-h-11 items-center" href={siteLinks.emailUrl}>{site.email}</a>
              )}
              {hasSiteValue(site.address) && <span>{site.address}</span>}
              {hasSiteValue(site.hours) && <span>{site.hours}</span>}
              {hasSiteValue(site.whatsapp) && (
                <a
                  className="footer-link md:hidden inline-flex min-h-11 items-center"
                  href={siteLinks.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              )}
              {hasSiteValue(site.address) && (
                <a
                  className="footer-link inline-flex min-h-11 items-center"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Map
                </a>
              )}
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 lg:flex lg:max-w-[34rem] lg:flex-wrap lg:justify-end lg:gap-x-5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link inline-flex min-h-11 items-center text-sm text-bg/80">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-bg/20 py-3 sm:flex-row">
          <p className="text-sm text-bg/80">© {currentYear} {site.name}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5">
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
