"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyContactButtons } from "@/components/layout/StickyContactButtons";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    let previousFocus: HTMLElement | null = null;
    let activeDialog: HTMLElement | null = null;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const observer = new MutationObserver(() => {
      const dialog = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-modal="true"]'
      );
      if (dialog === activeDialog) return;

      if (activeDialog && !dialog) {
        if (previousFocus?.isConnected) previousFocus.focus();
        previousFocus = null;
      } else if (dialog && !activeDialog) {
        previousFocus =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const firstFocusable =
          dialog.querySelector<HTMLElement>(focusableSelector);
        firstFocusable?.focus();
      }
      activeDialog = dialog;
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const trapDialogFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-modal="true"]'
      );
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.tabIndex = -1;
        dialog.focus();
      } else if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === focusable[focusable.length - 1]
      ) {
        event.preventDefault();
        focusable[0].focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        focusable[0].focus();
      }
    };

    document.addEventListener("keydown", trapDialogFocus);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", trapDialogFocus);
    };
  }, []);

  const isDashboardRoute =
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname?.startsWith("/e/");

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Skip to content — first focusable element for public pages */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer />
      <StickyContactButtons />
    </>
  );
}
