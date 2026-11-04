import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "brand";
};

const buttonStyles = {
  primary:
    "bg-ink text-bg hover:bg-ink/85 focus-visible:outline-ink",
  secondary:
    "border border-ink/25 bg-transparent text-ink hover:bg-ink/5 focus-visible:outline-ink",
  brand:
    "bg-brand-strong text-bg hover:bg-brand hover:text-ink focus-visible:outline-ink",
} as const;

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Pill({
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border border-ink/15 px-3 py-1 text-sm text-ink ${className}`}
      {...props}
    />
  );
}

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`overflow-hidden rounded-[24px] border border-border bg-surface ${className}`}
      {...props}
    />
  );
}
