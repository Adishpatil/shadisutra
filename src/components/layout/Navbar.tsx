"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";

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
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Track scroll for navbar background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Do not render marketing navigation in the admin console.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const transparentOverHero = pathname === "/" && !scrolled && !mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        transparentOverHero
        ? "bg-gradient-to-b from-ink/80 via-ink/75 to-ink/70"
          : "border-b border-border bg-bg/95 shadow-[var(--shadow-md)] backdrop-blur-md"
      }`}
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className={`flex min-h-11 items-center gap-2 font-heading text-xl font-bold tracking-tight ${
            transparentOverHero ? "text-white" : "text-ink"
          }`}
          aria-label={`${site.name} – Home`}
        >
          <Image
            src="/brand/logo.webp"
            alt={site.name}
            width={112}
            height={74}
            priority
            className="h-11 w-[66px] object-contain sm:h-12 sm:w-[72px]"
          />
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
                      ? "text-white underline decoration-accent-light decoration-2 underline-offset-8"
                      : "text-white hover:bg-white/10"
                    : isActive
                      ? "text-accent bg-accent-light"
                      : "text-ink-muted hover:text-ink hover:bg-accent-light/50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/contact"
            className="ml-4 inline-flex min-h-11 items-center justify-center rounded-radius-full bg-accent px-5 py-2 text-base font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Plan Your Event
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          ref={toggleRef}
          type="button"
          className={`flex h-11 w-11 items-center justify-center rounded-radius-md transition-colors lg:hidden ${
            transparentOverHero
              ? "text-white hover:bg-white/15"
              : "text-ink hover:bg-accent-light/50"
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
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
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
            className="fixed top-0 right-0 bottom-0 w-[min(85vw,320px)] bg-surface z-50 shadow-[var(--shadow-lg)] flex flex-col animate-fade-in lg:hidden"
            style={{ paddingTop: "var(--safe-top)" }}
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-11 h-11 rounded-radius-md text-ink hover:bg-accent-light/50 transition-colors"
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
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-radius-md transition-colors ${
                      isActive
                        ? "text-accent bg-accent-light"
                        : "text-ink hover:text-accent hover:bg-accent-light/50"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Primary action */}
            <div className="p-4 border-t border-border">
              <Link
                href="/contact"
                className="flex min-h-11 w-full items-center justify-center rounded-radius-full bg-accent px-5 py-3 text-base font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
              >
                Plan Your Event
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
