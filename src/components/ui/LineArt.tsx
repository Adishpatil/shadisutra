import { existsSync } from "node:fs";
import path from "node:path";
import type { GraphicId } from "@/data/graphics";
import { graphics } from "@/data/graphics";

type GraphicTone = "ink" | "brand" | "lime" | "white";

interface LineArtProps {
  id: GraphicId;
  tone?: GraphicTone;
  size?: "small" | "medium" | "large";
  className?: string;
}

export function LineArt({
  id,
  tone = "ink",
  size,
  className = "",
}: LineArtProps) {
  const graphic = graphics[id];
  const present = existsSync(
    path.join(process.cwd(), "public", graphic.path.replace(/^\/+/, ""))
  );

  if (!present && !("fallback" in graphic && graphic.fallback)) return null;

  const toneClass = {
    ink: "text-ink",
    brand: "text-brand",
    lime: "text-lime",
    white: "text-white",
  }[tone];
  const classes = `line-art ${toneClass} ${className}`.trim();
  const dimensions = size ?? graphic.size;

  if (present) {
    return (
      <span
        aria-hidden="true"
        className={classes}
        data-line-art={id}
        data-size={dimensions}
        data-rotation={graphic.rotation}
      />
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={classes}
      data-line-art={id}
      data-size={dimensions}
      data-rotation={graphic.rotation}
      data-inline-fallback="true"
      viewBox={id === "divider-line" ? "0 0 320 64" : "0 0 240 240"}
      fill="none"
      focusable="false"
    >
      {id === "arch" && (
        <>
          <path d="M22 220V130a98 98 0 0 1 196 0v90" />
          <path d="M38 220V132a82 82 0 0 1 164 0v88" />
        </>
      )}
      {id === "divider-line" && <path d="M4 34c68-27 116 22 172-1 48-20 87-9 140 0" />}
      {id === "heart-line" && (
        <path d="M120 210 36 130C-8 87 56 24 103 69l17 17 17-17c47-45 111 18 67 61z" />
      )}
      {id === "sun-lines" && (
        <>
          <path d="M120 68a52 52 0 1 0 0 104 52 52 0 0 0 0-104Z" />
          <path d="M120 12v30M120 198v30M12 120h30m156 0h30M44 44l22 22m108 108 22 22M196 44l-22 22M66 174l-22 22" />
        </>
      )}
    </svg>
  );
}
