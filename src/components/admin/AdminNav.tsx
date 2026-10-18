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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/enquiries",
    label: "Enquiries",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
      {/* Tablet (768-1023px): compact rail (w-20)                      */}
      {/* Desktop (>=1024px): full sidebar (w-64)                       */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-surface border-r border-border md:w-20 lg:w-64 transition-all">
        {/* Brand */}
        <div className="h-16 flex items-center px-4 lg:px-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <span className="w-9 h-9 rounded-radius-md bg-accent text-accent-ink flex items-center justify-center font-heading font-bold text-lg shrink-0">
              SS
            </span>
            <div className="hidden lg:block truncate">
              <span className="font-heading font-bold text-lg text-ink block leading-none">
                {site.name}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block mt-1">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-radius-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-accent-ink shadow-[var(--shadow-sm)]"
                    : "text-ink-muted hover:text-ink hover:bg-bg"
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

        {/* User Footer / Sign Out */}
        <div className="p-3 border-t border-border">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-radius-md text-sm font-medium text-danger hover:bg-danger-light transition-colors min-h-[44px]"
              title="Sign Out"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-surface border-b border-border flex items-center justify-between px-4"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-radius-sm bg-accent text-accent-ink flex items-center justify-center font-heading font-bold text-sm">
            SS
          </span>
          <span className="font-heading font-bold text-base text-ink">
            {site.name} Admin
          </span>
        </Link>

        <form action={signOutAction}>
          <button
            type="submit"
            className="text-xs font-semibold text-danger px-3 py-1.5 rounded-radius-sm hover:bg-danger-light transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Mobile Bottom Tab Bar (<768px)                             */}
      {/* Fixed at bottom, thumb-reachable touch targets                */}
      {/* ------------------------------------------------------------- */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex items-center justify-around h-16 shadow-lg"
        style={{ paddingBottom: "var(--safe-bottom)" }}
        aria-label="Mobile Admin Navigation"
      >
        {navItems.map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-colors ${
                active ? "text-accent font-semibold" : "text-ink-muted hover:text-ink"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
