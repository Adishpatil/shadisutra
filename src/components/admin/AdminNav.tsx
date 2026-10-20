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
    href: "/admin/enquiries",
    label: "Enquiries",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
] as const;

function pageTitle(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/events/")) return "Event details";
  if (pathname.startsWith("/admin/events")) return "Events";
  if (pathname.startsWith("/admin/enquiries")) return "Enquiries";
  return "Admin";
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const isItemActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-surface md:flex">
        <Link
          href="/admin"
          className="flex min-h-20 items-center gap-3 px-6"
          aria-label={`${site.name} admin dashboard`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-accent font-heading text-xl font-bold text-accent-ink">
            SS
          </span>
          <span className="min-w-0">
            <span className="block truncate font-heading text-lg font-bold text-ink">{site.name}</span>
            <span className="block text-base text-ink-muted">Admin workspace</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-2 px-3 py-6" aria-label="Admin navigation">
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 items-center gap-3 rounded-radius-md px-4 text-base font-semibold transition-colors ${
                  active ? "bg-accent-light text-accent" : "text-ink-muted hover:bg-bg hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={signOutAction} className="p-4">
          <Button type="submit" variant="quiet" className="w-full justify-start text-danger">
            Sign out
          </Button>
        </form>
      </aside>

      <header
        className="fixed inset-x-0 top-0 z-40 flex h-[calc(4rem+var(--safe-top))] items-center justify-between border-b border-border bg-bg/95 px-4 pt-[var(--safe-top)] backdrop-blur md:left-60 md:px-6"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-ink">{pageTitle(pathname)}</p>
          <p className="hidden text-base text-ink-muted sm:block">{site.name} · Admin</p>
        </div>
        <Button type="button" variant="primary" onClick={() => setCreateOpen(true)} className="min-h-11 px-4">
          <span aria-hidden="true">+</span>
          <span className="hidden sm:inline">New event</span>
          <span className="sm:hidden">New</span>
        </Button>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex h-[calc(3.5rem+var(--safe-bottom))] items-stretch border-t border-border bg-surface/95 pb-[var(--safe-bottom)] backdrop-blur md:hidden"
        aria-label="Admin tabs"
      >
        {navItems.map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-base font-semibold ${
                active ? "text-accent" : "text-ink-muted"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-base font-semibold ${
            moreOpen ? "text-accent" : "text-ink-muted"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="5" cy="12" r="1" strokeWidth="2" />
            <circle cx="12" cy="12" r="1" strokeWidth="2" />
            <circle cx="19" cy="12" r="1" strokeWidth="2" />
          </svg>
          More
        </button>
      </nav>

      <Sheet open={moreOpen} title="More" onClose={() => setMoreOpen(false)} className="sm:max-w-md">
        <div className="space-y-3">
          <Link href="/admin/events" onClick={() => setMoreOpen(false)} className="flex min-h-12 items-center rounded-radius-md px-4 text-base font-semibold text-ink hover:bg-bg">
            All events
          </Link>
          <Link href="/admin/enquiries" onClick={() => setMoreOpen(false)} className="flex min-h-12 items-center rounded-radius-md px-4 text-base font-semibold text-ink hover:bg-bg">
            Website enquiries
          </Link>
          <form action={signOutAction} className="border-t border-border pt-3">
            <Button type="submit" variant="danger" className="w-full justify-start">
              Sign out
            </Button>
          </form>
        </div>
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
