"use client";

import {
  useEffect,
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-accent text-accent-ink hover:bg-accent-hover",
    secondary: "border border-border bg-surface text-ink hover:border-accent",
    quiet: "text-ink-muted hover:bg-accent-light hover:text-ink",
    danger: "border border-danger/30 bg-danger-light text-danger hover:border-danger",
  };

  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-radius-md px-4 py-2 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
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
    <section className={`rounded-radius-lg bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-6 ${className}`}>
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
    accent: "bg-accent-light text-accent",
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
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-sheet-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-0 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className={`admin-sheet-panel flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden bg-surface shadow-xl sm:rounded-radius-lg ${className}`}>
        <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
          <h2 id="admin-sheet-title" className="text-xl font-heading font-bold text-ink">
            {title}
          </h2>
          <Button type="button" variant="quiet" onClick={onClose} aria-label="Close sheet" className="w-11 px-0 text-2xl">
            <span aria-hidden="true">×</span>
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </section>
    </div>
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
              : "text-ink-muted hover:bg-accent-light hover:text-ink"
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
