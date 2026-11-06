"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

const emptySubscribe = () => () => {};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: "dialog" | "sheet";
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  variant = "dialog",
  className = "",
}: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!open) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.classList.contains("dialog-open");
    document.body.classList.add("dialog-open");

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        focusableSelector
      );
      (first ?? panelRef.current)?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
      } else if (
        event.shiftKey &&
        document.activeElement === focusable[0]
      ) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === focusable[focusable.length - 1]
      ) {
        event.preventDefault();
        focusable[0].focus();
      } else if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        focusable[0].focus();
      }
    };

    const frame = window.requestAnimationFrame(focusFirst);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      if (!previousOverflow) document.body.classList.remove("dialog-open");
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      className="dialog-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-ink/55 p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`dialog-panel relative max-h-[92dvh] w-full overflow-y-auto border border-border-strong bg-surface text-ink shadow-[var(--shadow-lg)] focus:outline-none sm:max-w-xl ${
          variant === "sheet"
            ? "rounded-t-[28px] sm:rounded-[28px]"
            : "my-auto rounded-[28px]"
        } ${className}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border-strong bg-surface px-5 py-4 sm:px-7">
          <h2 id={titleId} className="text-2xl text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-strong text-ink transition-colors hover:bg-bg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            aria-label="Close dialog"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5 sm:px-7 sm:py-7">{children}</div>
      </div>
    </div>
  );

  return mounted && typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
}

export function Sheet(props: Omit<DialogProps, "variant">) {
  return <Dialog {...props} variant="sheet" />;
}
