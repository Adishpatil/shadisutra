"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";
import { signOutAction } from "@/lib/auth/admin-actions";

interface PortalNavProps {
  userRole: "admin" | "customer";
}

export function PortalNav({ userRole }: PortalNavProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-surface/95 backdrop-blur-md border-b border-border shadow-[var(--shadow-sm)]">
      <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/portal" className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-radius-md bg-accent text-accent-ink flex items-center justify-center font-heading font-bold text-lg shrink-0">
            SS
          </span>
          <div>
            <span className="font-heading font-bold text-base sm:text-lg text-ink block leading-none">
              {site.name}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block mt-0.5">
              Event Portal
            </span>
          </div>
        </Link>

        {/* Right‑side controls */}
        <div className="flex items-center gap-3">
          {/* Admin link — only shown if the user is an admin previewing */}
          {userRole === "admin" && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent border border-accent/40 rounded-radius-md hover:bg-accent-light transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Admin Console
            </Link>
          )}

          {/* Sign Out */}
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-light rounded-radius-md transition-colors min-h-[36px]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
