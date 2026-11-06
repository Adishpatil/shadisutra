"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";
import { Sheet } from "@/components/ui/Dialog";
import { BrandLogo } from "@/components/ui/BrandLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
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
      setScrolled(
        !hero || window.scrollY >= hero.offsetHeight - 80
      );
    };
    const onDirection = () => {
      const currentY = window.scrollY;
      setHidden(currentY > previousY && currentY > 120 && !mobileOpen);
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
      menuRef.current
        ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
        ?.focus();
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

  return (
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
          <BrandLogo dark={transparentOverHero} />
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
          className={`flex h-11 w-11 items-center justify-center rounded-radius-md transition-colors lg:hidden ${
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

      {/* Mobile overlay + menu */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/20 z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="mobile-nav-panel animate-mobile-nav-in fixed inset-0 z-[70] flex flex-col bg-bg px-5 pb-[calc(1.5rem+var(--safe-bottom))] pt-[calc(1rem+var(--safe-top))] lg:hidden"
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-11 items-center"
                aria-label={`${site.name} - Home`}
              >
                <BrandLogo />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
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

            {/* Links */}
            <div className="flex-1 flex flex-col gap-1 px-4">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`mobile-nav-link flex min-h-14 items-center border-b border-border px-1 py-3 text-3xl font-semibold transition-colors ${
                      isActive
                          ? "text-ink underline decoration-ink/40 decoration-2 underline-offset-8"
                          : "text-ink hover:text-ink-muted"
                    }`}
                    data-index={navLinks.indexOf(link) + 1}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Primary action */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  mobileEnquiryTrigger.current = true;
                  setMobileOpen(false);
                  setEnquiryOpen(true);
                }}
                className="flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-base font-semibold text-bg transition-colors hover:bg-ink/85 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Plan Your Event
              </button>
            </div>
          </div>
        </>
      )}
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
      </Sheet>
    </header>
  );
}
