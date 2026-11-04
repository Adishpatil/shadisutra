"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { site } from "@/config/site";
import { signOutAction } from "@/lib/auth/admin-actions";
import { CreateEventModal } from "@/components/admin/CreateEventModal";
import { Button, Sheet } from "@/components/ui/AdminPrimitives";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/money",
    label: "Money",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8c-2.21 0-4 1.12-4 2.5s1.79 2.5 4 2.5 4 1.12 4 2.5-1.79 2.5-4 2.5m0-10V5m0 12v2m9-7a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/enquiries",
    label: "Enquiries",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
] as const;

const mobileNavItems = navItems;

function pageTitle(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/events/")) return "Event details";
  if (pathname.startsWith("/admin/events")) return "Events";
  if (pathname.startsWith("/admin/money")) return "Money overview";
  if (pathname.startsWith("/admin/enquiries")) return "Enquiries";
  return "Admin";
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(false);

  const isItemActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const startQuickAction = (action: string) => {
    setQuickAddOpen(false);
    const eventDetail = /^\/admin\/events\/[^/]+$/.test(pathname);
    if (eventDetail || pathname === "/admin/events") {
      window.dispatchEvent(
        new CustomEvent("admin:quick-action", { detail: action })
      );
      return;
    }
    router.push(
      `/admin/events?quick=${action}`
    );
  };

  return (
    <>
      <aside data-expanded={railExpanded} className={`admin-rail fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface md:flex ${
        railExpanded ? "md:w-60" : "md:w-16"
      } lg:w-60`}>
        <Link
          href="/admin"
          className={`flex min-h-20 items-center gap-3 ${
            railExpanded ? "px-4 lg:px-6" : "justify-center px-2 lg:justify-start lg:px-6"
          }`}
          aria-label={`${site.name} admin dashboard`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-heading text-xl font-bold text-white">
            SS
          </span>
          <span className={`min-w-0 ${railExpanded ? "md:block" : "md:hidden lg:block"}`}>
            <span className="block truncate font-heading text-lg font-bold text-ink">{site.name}</span>
            <span className="block text-sm text-ink-muted">Admin workspace</span>
          </span>
        </Link>
        <nav className={`flex-1 space-y-2 py-6 ${railExpanded ? "px-3" : "px-2 lg:px-3"}`} aria-label="Admin navigation">
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!railExpanded ? item.label : undefined}
                className={`flex min-h-12 items-center rounded-xl text-base font-semibold transition-colors ${
                  railExpanded ? "gap-3 px-4" : "justify-center px-2 lg:justify-start lg:gap-3 lg:px-4"
                } ${
                  active ? "bg-bg text-ink" : "text-ink-muted hover:bg-bg hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.icon}
                <span className={railExpanded ? "md:inline" : "md:hidden lg:inline"}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <form action={signOutAction} className={railExpanded ? "p-4" : "p-2 lg:p-4"}>
          <Button type="submit" variant="quiet" aria-label="Sign out" className="w-full justify-start text-danger">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 012 2v14a2 2 0 01-2 2h-6" />
            </svg>
            <span className={railExpanded ? "md:inline" : "md:hidden lg:inline"}>Sign out</span>
          </Button>
        </form>
      </aside>

      <header
        className={`fixed inset-x-0 top-0 z-40 flex h-[calc(4rem+var(--safe-top))] items-center justify-between border-b border-border bg-bg/95 px-4 pt-[var(--safe-top)] backdrop-blur md:px-6 ${
          railExpanded ? "md:left-60" : "md:left-16 lg:left-60"
        }`}
      >
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-semibold text-ink">{pageTitle(pathname)}</p>
          <p className="hidden text-sm text-ink-muted sm:block">{site.name} admin</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            View website
          </Link>
          <button
            type="button"
            onClick={() => setRailExpanded((expanded) => !expanded)}
            aria-label={railExpanded ? "Collapse navigation" : "Expand navigation"}
            aria-expanded={railExpanded}
            className="hidden min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:inline-flex lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Button type="button" variant="primary" onClick={() => setCreateOpen(true)} className="hidden sm:inline-flex">
            New event
          </Button>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid h-[calc(4.25rem+var(--safe-bottom))] grid-cols-5 items-stretch border-t border-border bg-surface pb-[var(--safe-bottom)] md:hidden"
        aria-label="Admin navigation"
      >
        {mobileNavItems.slice(0, 2).map((item) => {
          const active = isItemActive(item.href);
          const label = item.href === "/admin" ? "Home" : item.label;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${active ? "text-ink" : "text-ink-muted"}`}>
              {item.icon}<span>{label}</span>
            </Link>
          );
        })}
        <button type="button" onClick={() => setQuickAddOpen(true)} aria-label="Open quick add" aria-expanded={quickAddOpen}
          className="mx-auto my-1 flex h-12 w-12 items-center justify-center self-center rounded-full bg-ink text-white shadow-[var(--shadow-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14" />
          </svg>
        </button>
        {mobileNavItems.slice(2).map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${active ? "text-ink" : "text-ink-muted"}`}>
              {item.icon}<span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Sheet open={quickAddOpen} title="Quick add" onClose={() => setQuickAddOpen(false)} className="sm:max-w-lg">
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => { setQuickAddOpen(false); setCreateOpen(true); }}
            className="flex min-h-14 items-center justify-between rounded-xl border border-border px-4 text-left font-semibold text-ink hover:bg-bg">
            New event <span aria-hidden="true">+</span>
          </button>
          {[
            ["payment", "Add payment"],
            ["expense", "Add expense"],
            ["guest", "Add guest"],
            ["share", "Share link"],
          ].map(([action, label]) => (
            <button key={action} type="button" onClick={() => startQuickAction(action)}
              className="flex min-h-14 items-center justify-between rounded-xl border border-border px-4 text-left font-semibold text-ink hover:bg-bg">
              {label}<span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <form action={signOutAction} className="mt-4 border-t border-border pt-4">
          <Button type="submit" variant="danger" className="w-full justify-center">
            Sign out
          </Button>
        </form>
      </Sheet>

      {createOpen && (
        <CreateEventModal
          onClose={() => setCreateOpen(false)}
          onSuccess={(eventId) => {
            setCreateOpen(false);
            router.push(`/admin/events/${eventId}`);
          }}
        />
      )}
    </>
  );
}
