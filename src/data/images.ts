// Add new photos as WebP at the exact listed path and filename.
// Update alt text, dimensions, aspect ratio, and focal point here.
const focalPoint = { x: 50, y: 50 } as const;

export const imageSlots = {
  hero: {
    src: "/images/hero/hero-2.webp",
    alt: "White floral stage set against dark curtains with a matching dance-floor monogram",
    width: 1280,
    height: 597,
    aspectRatio: 1280 / 597,
    focalPoint: { x: 50, y: 48 },
  },
  heroMobile: {
    src: "/images/hero/hero-1-mobile.webp",
    alt: "Mobile crop of a wedding stage set against dark curtains",
    width: 900,
    height: 1200,
    aspectRatio: 3 / 4,
    focalPoint: { x: 50, y: 48 },
  },
  about: {
    src: "/images/about/about-1.png",
    alt: "Shadi Sutra event photo",
    width: 1536,
    height: 1024,
    aspectRatio: 3 / 2,
    focalPoint,
  },
  homeWedding: {
    src: "/images/gallery/weddings/weddings-1.webp",
    alt: "Wedding celebration decor",
    width: 1280,
    height: 591,
    aspectRatio: 1280 / 591,
    focalPoint,
  },
  homeBirthday: {
    src: "/images/gallery/birthdays/birthdays-1.webp",
    alt: "Birthday celebration setup",
    width: 591,
    height: 1280,
    aspectRatio: 591 / 1280,
    focalPoint,
  },
  homeFunction: {
    src: "/images/gallery/functions/functions-1.webp",
    alt: "Function venue setup",
    width: 736,
    height: 981,
    aspectRatio: 736 / 981,
    focalPoint,
  },
  introWedding: {
    src: "/images/gallery/weddings/weddings-2.webp",
    alt: "Wedding venue decorations",
    width: 1280,
    height: 597,
    aspectRatio: 1280 / 597,
    focalPoint,
  },
  introBirthday: {
    src: "/images/gallery/birthdays/birthdays-2.webp",
    alt: "Birthday celebration decor",
    width: 591,
    height: 1280,
    aspectRatio: 591 / 1280,
    focalPoint,
  },
  introFunction: {
    src: "/images/gallery/functions/functions-2.webp",
    alt: "Layered arched entryway with chandeliers and patterned carpet",
    width: 591,
    height: 1280,
    aspectRatio: 591 / 1280,
    focalPoint,
  },
  serviceWedding: {
    src: "/images/gallery/weddings/weddings-3.webp",
    alt: "Hanging floral arrangements and brass vessels beneath a tree at an outdoor celebration",
    width: 591,
    height: 1280,
    aspectRatio: 591 / 1280,
    focalPoint,
  },
  serviceBirthday: {
    src: "/images/gallery/birthdays/birthdays-3.webp",
    alt: "Birthday venue decorations",
    width: 736,
    height: 1349,
    aspectRatio: 736 / 1349,
    focalPoint,
  },
  serviceFunction: {
    src: "/images/gallery/functions/functions-3.webp",
    alt: "Round banquet tables arranged across a rooftop lawn during event setup",
    width: 1280,
    height: 591,
    aspectRatio: 1280 / 591,
    focalPoint,
  },
  recentWedding: {
    src: "/images/gallery/weddings/weddings-4.webp",
    alt: "A garden walkway under a canopy of warm string lights and a crystal chandelier",
    width: 591,
    height: 1280,
    aspectRatio: 591 / 1280,
    focalPoint,
  },
  recentBirthday: {
    src: "/images/gallery/birthdays/birthdays-4.webp",
    alt: "Peach roses and greenery beside a banquet walkway lined with warm string lights",
    width: 597,
    height: 1280,
    aspectRatio: 597 / 1280,
    focalPoint,
  },
  recentFunction: {
    src: "/images/gallery/functions/functions-4.webp",
    alt: "Function tables arranged inside an event venue",
    width: 1280,
    height: 597,
    aspectRatio: 1280 / 597,
    focalPoint,
  },
  aboutDetailWedding: {
    src: "/images/gallery/weddings/weddings-5.webp",
    alt: "Wedding venue decor",
    width: 1280,
    height: 591,
    aspectRatio: 1280 / 591,
    focalPoint,
  },
  aboutDetailVenue: {
    src: "/images/gallery/weddings/weddings-6.webp",
    alt: "Outdoor ceremony stage beneath a tree, framed by white drapes and floral arrangements",
    width: 1280,
    height: 591,
    aspectRatio: 1280 / 591,
    focalPoint,
  },
  galleryBirthday5: {
    src: "/images/gallery/birthdays/birthdays-5.webp",
    alt: "Floral arrangements lining an event walkway beneath a canopy of warm string lights",
    width: 1280,
    height: 597,
    aspectRatio: 1280 / 597,
    focalPoint,
  },
} as const;

export type ImageSlot = keyof typeof imageSlots;
export type GalleryCategory = "weddings" | "birthdays" | "functions";

export const homeEventImages = [
  { ...imageSlots.homeWedding, imageSlot: "homeWedding", category: "weddings" },
  { ...imageSlots.homeBirthday, imageSlot: "homeBirthday", category: "birthdays" },
  { ...imageSlots.homeFunction, imageSlot: "homeFunction", category: "functions" },
] as const;

export const introImages = [
  { ...imageSlots.introWedding, imageSlot: "introWedding", category: "weddings" },
  { ...imageSlots.introBirthday, imageSlot: "introBirthday", category: "birthdays" },
  { ...imageSlots.introFunction, imageSlot: "introFunction", category: "functions" },
] as const;

export const serviceImages = [
  { ...imageSlots.serviceWedding, imageSlot: "serviceWedding", category: "weddings" },
  { ...imageSlots.serviceBirthday, imageSlot: "serviceBirthday", category: "birthdays" },
  { ...imageSlots.serviceFunction, imageSlot: "serviceFunction", category: "functions" },
] as const;

export const recentImages = [
  { ...imageSlots.recentWedding, imageSlot: "recentWedding", category: "weddings" },
  { ...imageSlots.recentBirthday, imageSlot: "recentBirthday", category: "birthdays" },
  { ...imageSlots.recentFunction, imageSlot: "recentFunction", category: "functions" },
] as const;

export const galleryImages = [
  ...introImages,
  ...recentImages,
  { ...imageSlots.galleryBirthday5, imageSlot: "galleryBirthday5", category: "birthdays" },
] as const;
