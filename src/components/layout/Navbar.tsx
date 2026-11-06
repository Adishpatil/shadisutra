"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, siteLinks, hasSiteValue } from "@/config/site";
import { Sheet } from "@/components/ui/Dialog";
import { BrandLogo } from "@/components/ui/BrandLogo";

const emptySubscribe = () => () => {};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileEnquiryTrigger = useRef(false);

  const closeEnquiry = useCallback(() => {
    setEnquiryOpen(false);
    if (mobileEnquiryTrigger.current) {
      mobileEnquiryTrigger.current = false;
      window.requestAnimationFrame(() => toggleRef.current?.focus());
    }
  }, []);

  // Keep the hero navigation transparent until the hero has left the viewport.
  useEffect(() => {
    let previousY = window.scrollY;
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>(".home-hero");
      setScrolled(!hero || window.scrollY >= hero.offsetHeight - 80);
    };
    const onDirection = () => {
      if (mobileOpen) {
        setHidden(false);
        return;
      }
      const currentY = window.scrollY;
      setHidden(currentY > previousY && currentY > 120);
      if (currentY < 40 || currentY < previousY) setHidden(false);
      previousY = currentY;
    };
    onScroll();
    window.addEventListener("scroll", onDirection, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onDirection);
    };
  }, [pathname, mobileOpen]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Focus trap inside mobile menu
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!mobileOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setMobileOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [mobileOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    if (mobileOpen) {
      // Focus first focusable item in mobile menu
      window.requestAnimationFrame(() => {
        menuRef.current
          ?.querySelector<HTMLElement>("button, a[href]")
          ?.focus();
      });
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, mobileOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.classList.toggle("menu-open", mobileOpen);
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [mobileOpen]);

  // Do not render marketing navigation in the admin console.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const transparentOverHero = pathname === "/" && !scrolled && !mobileOpen;

  const mobileMenuPortal =
    mounted && mobileOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="mobile-nav-panel fixed inset-0 z-[120] flex h-[100dvh] w-full flex-col bg-ink text-bg lg:hidden overflow-y-auto"
          >
            {/* Header row: logo left, close button right */}
            <div className="flex items-center justify-between px-5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 border-b border-white/10">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-2 rounded-xl font-heading text-xl font-bold tracking-tight text-bg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime"
                aria-label={`${site.name} – Home`}
              >
                <BrandLogo badge={false} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  toggleRef.current?.focus();
                }}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-bg transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime"
                aria-label="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav Links in large Bricolage Grotesque, warm white, active page in lime */}
            <div className="flex-1 flex flex-col justify-start px-6 pt-6 gap-1">
              {navLinks.map((link, index) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`mobile-nav-link flex min-h-[52px] items-center border-b border-white/10 px-1 py-3 text-3xl font-heading font-semibold transition-colors ${
                      isActive
                        ? "text-lime"
                        : "text-bg hover:text-lime"
                    }`}
                    data-index={index + 1}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Plan Your Event lime pill */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    mobileEnquiryTrigger.current = true;
                    setMobileOpen(false);
                    setEnquiryOpen(true);
                  }}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-lime px-6 py-3.5 text-base font-heading font-semibold text-ink transition-colors hover:bg-brand focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime"
                >
                  Plan Your Event
                </button>
              </div>
            </div>

            {/* WhatsApp and Call pills at bottom with safe-area padding */}
            <div className="mt-auto px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
              <div className="flex items-center gap-3">
                {hasSiteValue(site.whatsapp) && (
                  <a
                    href={siteLinks.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-bg transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime"
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}
                {hasSiteValue(site.phone) && (
                  <a
                    href={siteLinks.phoneUrl}
                    className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-bg transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const sheetPortal =
    mounted && typeof document !== "undefined"
      ? createPortal(
          <Sheet
            open={enquiryOpen}
            onClose={closeEnquiry}
            title="Plan your event"
          >
            <p className="text-base leading-relaxed text-ink-muted">
              Share your date, venue and ideas, and we&apos;ll be in touch.
            </p>
            <Link
              href="/contact"
              onClick={closeEnquiry}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-3 text-base font-semibold text-bg transition-colors hover:bg-ink/85 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Send Event Enquiry
            </Link>
          </Sheet>,
          document.body
        )
      : null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)] transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          transparentOverHero
            ? "hero-navbar border-transparent bg-transparent"
            : "border-border bg-bg shadow-[var(--shadow-sm)]"
        }`}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 rounded-xl font-heading text-xl font-bold tracking-tight focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            aria-label={`${site.name} – Home`}
          >
            <BrandLogo badge={!transparentOverHero} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex min-h-11 items-center rounded-radius-md px-4 py-2 text-base font-medium transition-colors ${
                    transparentOverHero
                      ? isActive
                        ? "text-bg underline decoration-lime decoration-2 underline-offset-8"
                        : "text-bg hover:bg-bg/10 hover:underline hover:decoration-lime underline-offset-8"
                      : isActive
                        ? "bg-ink/5 text-ink underline decoration-lime decoration-2 underline-offset-8"
                        : "text-ink-muted hover:text-ink hover:bg-ink/5 hover:underline hover:decoration-lime underline-offset-8"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className={`ml-4 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                transparentOverHero
                  ? "bg-lime text-ink hover:bg-brand"
                  : "bg-ink text-bg hover:bg-brand hover:text-ink"
              }`}
            >
              Plan Your Event
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            ref={toggleRef}
            type="button"
            className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md transition-colors lg:hidden ${
              transparentOverHero
                ? "text-bg hover:bg-bg/15"
                : "text-ink hover:bg-ink/5"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </header>

      {mobileMenuPortal}
      {sheetPortal}
    </>
  );
}
