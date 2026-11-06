import type { HTMLAttributes } from "react";

export type SectionTone = "white" | "soft" | "red" | "lime" | "ink";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
}

export function Section({
  tone = "white",
  className = "",
  ...props
}: SectionProps) {
  return (
    <section
      data-tone={tone}
      className={`ss-section ${className}`.trim()}
      {...props}
    />
  );
}
