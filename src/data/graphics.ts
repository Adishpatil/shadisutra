export const graphics = {
  rings: {
    path: "/images/graphics/rings.svg",
    alt: "",
    size: "large",
    rotation: "-12deg",
  },
  couple: {
    path: "/images/graphics/couple.svg",
    alt: "",
    size: "large",
    rotation: "8deg",
  },
  hands: {
    path: "/images/graphics/hands.svg",
    alt: "",
    size: "medium",
    rotation: "0deg",
  },
  "monogram-frame": {
    path: "/images/graphics/monogram-frame.svg",
    alt: "",
    size: "medium",
    rotation: "0deg",
  },
  doves: {
    path: "/images/graphics/doves.svg",
    alt: "",
    size: "large",
    rotation: "0deg",
  },
  arch: {
    path: "/images/graphics/arch.svg",
    alt: "",
    size: "large",
    rotation: "0deg",
    fallback: true,
  },
  "heart-line": {
    path: "/images/graphics/heart-line.svg",
    alt: "",
    size: "small",
    rotation: "0deg",
    fallback: true,
  },
  "divider-line": {
    path: "/images/graphics/divider-line.svg",
    alt: "",
    size: "medium",
    rotation: "0deg",
    fallback: true,
  },
  "sun-lines": {
    path: "/images/graphics/sun-lines.svg",
    alt: "",
    size: "large",
    rotation: "0deg",
    fallback: true,
  },
} as const;

export type GraphicId = keyof typeof graphics;
