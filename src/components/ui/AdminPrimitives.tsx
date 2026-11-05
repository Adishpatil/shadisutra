"use client";

import {
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Sheet as SharedSheet } from "@/components/ui/Dialog";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-ink text-white hover:bg-ink/85",
    secondary: "border border-border-strong bg-surface text-ink hover:border-ink",
    quiet: "text-ink-muted hover:bg-bg hover:text-ink",
    danger: "border border-danger bg-danger-light text-danger hover:bg-danger hover:text-bg",
  };

  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-base font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const variants: Record<BadgeVariant, string> = {
    neutral: "bg-bg text-ink-muted",
    accent: "bg-brand-soft text-brand-strong",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    danger: "bg-danger-light text-danger",
  };

  return (
    <span className={`inline-flex min-h-7 items-center rounded-radius-full px-2.5 py-1 text-sm font-semibold capitalize ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Sheet({
  open,
  title,
  onClose,
  children,
  className = "",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SharedSheet
      open={open}
      title={title}
      onClose={onClose}
      className={`admin-sheet-panel max-w-2xl ${className}`}
    >
      {children}
    </SharedSheet>
  );
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]'
    );
    tabs?.[nextIndex]?.focus();
    onChange(items[nextIndex].value);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="sticky top-[calc(4rem+var(--safe-top))] z-30 -mx-4 flex snap-x gap-1 overflow-x-auto border-b border-border bg-bg/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 md:top-16"
    >
      {items.map((item, index) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          tabIndex={value === item.value ? 0 : -1}
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => handleTabKeyDown(event, index)}
          className={`min-h-11 shrink-0 snap-start rounded-radius-full px-4 text-base font-semibold transition-colors ${
            value === item.value
              ? "bg-ink text-white"
              : "text-ink-muted hover:bg-brand-soft hover:text-ink"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-radius-lg bg-surface px-5 py-10 text-center shadow-[var(--shadow-sm)]">
      <h3 className="text-xl font-heading font-bold text-ink">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-base text-ink-muted">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Toast({
  message,
  kind = "status",
}: {
  message: string;
  kind?: "status" | "alert";
}) {
  return (
    <p
      role={kind}
      className={`rounded-radius-md px-4 py-3 text-base font-medium ${
        kind === "alert"
          ? "bg-danger-light text-danger"
          : "bg-success-light text-success"
      }`}
    >
      {message}
    </p>
  );
}
