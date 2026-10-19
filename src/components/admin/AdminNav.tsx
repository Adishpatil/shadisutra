"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";
import { signOutAction } from "@/lib/auth/admin-actions";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/enquiries",
    label: "Enquiries",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. Desktop & Tablet Sidebar (Hidden on mobile <768px)          */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-40 bg-surface border-r border-border md:w-20 lg:w-64 transition-all select-none">
        {/* Brand */}
        <div className="h-20 flex items-center px-4 lg:px-6 border-b border-border/80">
          <Link href="/admin" className="flex items-center gap-3.5 group">
            <span className="w-10 h-10 rounded-radius-md bg-accent text-accent-ink flex items-center justify-center font-heading font-bold text-xl shrink-0 shadow-[var(--shadow-sm)] group-hover:scale-105 transition-transform">
              SS
            </span>
            <div className="hidden lg:block truncate">
              <span className="font-heading font-bold text-lg text-ink block leading-none tracking-tight">
                {site.name}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block mt-1">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-radius-md text-sm font-medium transition-all ${
                  active
                    ? "bg-accent text-accent-ink shadow-[var(--shadow-sm)] font-semibold"
                    : "text-ink-muted hover:text-ink hover:bg-bg/80"
                }`}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer / Sign Out with clearance for Next.js dev indicator */}
        <div className="p-3.5 border-t border-border/80 mb-8 md:mb-12 lg:mb-2">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-radius-md text-xs font-semibold text-danger hover:bg-danger-light transition-colors min-h-[44px]"
              title="Sign Out"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. Mobile Top Bar (<768px)                                    */}
      {/* ------------------------------------------------------------- */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-surface/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 shadow-[var(--shadow-xs)]"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-radius-sm bg-accent text-accent-ink flex items-center justify-center font-heading font-bold text-base shadow-sm">
            SS
          </span>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base text-ink leading-tight">
              {site.name}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-accent font-semibold leading-tight">
              Admin
            </span>
          </div>
        </Link>

        <form action={signOutAction}>
          <button
            type="submit"
            className="text-xs font-semibold text-danger px-3 py-1.5 rounded-radius-sm border border-danger/20 hover:bg-danger-light transition-colors min-h-[36px]"
          >
            Sign Out
          </button>
        </form>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 3. Mobile Bottom Tab Bar (<768px)                             */}
      {/* ------------------------------------------------------------- */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around h-16 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "var(--safe-bottom)" }}
        aria-label="Mobile Admin Navigation"
      >
        {navItems.map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-colors relative ${
                active ? "text-accent font-semibold" : "text-ink-muted hover:text-ink"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {active && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
