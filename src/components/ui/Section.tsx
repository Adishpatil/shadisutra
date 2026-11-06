import type { HTMLAttributes } from "react";
import { LineArt } from "@/components/ui/LineArt";

export type SectionTone = "white" | "soft" | "red" | "lime" | "ink";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  accent?: boolean;
}

export function Section({
  tone = "white",
  accent = true,
  className = "",
  children,
  ...props
}: SectionProps) {
  const sectionArt = {
    white: { id: "monogram-frame", tone: "brand" },
    soft: { id: "rings", tone: "brand" },
    red: { id: "heart-line", tone: "white" },
    lime: { id: "sun-lines", tone: "ink" },
    ink: { id: "arch", tone: "white" },
  } as const;
  const art = sectionArt[tone];

  return (
    <section
      data-tone={tone}
      className={`ss-section ${className}`.trim()}
      {...props}
    >
      {accent && (
        <LineArt
          id={art.id}
          tone={art.tone}
          size="small"
          className="section-tone-art"
        />
      )}
      {children}
    </section>
  );
}
