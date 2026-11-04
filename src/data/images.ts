// To add a photo, drop its WebP at the listed path with the exact file name,
// then update its alt text here.
export const imageSlots = {
  hero: {
    src: "/images/hero/hero-1.webp",
    mobileSrc: "/images/hero/hero-1-mobile.webp",
    alt: "White floral stage set against dark curtains with a matching dance-floor monogram",
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    focalPoint: { x: 50, y: 48 },
  },
  about: {
    src: "/images/about/about-1.png",
    alt: "Shadi Sutra event photo",
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },
  galleryWedding3: {
    src: "/images/gallery/weddings/weddings-3.webp",
    alt: "Hanging floral arrangements and brass vessels beneath a tree at an outdoor celebration",
    width: 591,
    height: 1280,
    aspectRatio: 591 / 1280,
    focalPoint: { x: 50, y: 50 },
  },
  galleryWedding4: {
    src: "/images/gallery/weddings/weddings-4.webp",
    alt: "A garden walkway under a canopy of warm string lights and a crystal chandelier",
    width: 591,
    height: 1280,
    aspectRatio: 591 / 1280,
    focalPoint: { x: 50, y: 50 },
  },
  galleryWedding6: {
    src: "/images/gallery/weddings/weddings-6.webp",
    alt: "Outdoor ceremony stage beneath a tree, framed by white drapes and floral arrangements",
    width: 1280,
    height: 591,
    aspectRatio: 1280 / 591,
    focalPoint: { x: 50, y: 50 },
  },
  galleryBirthday4: {
    src: "/images/gallery/birthdays/birthdays-4+.webp",
    alt: "Peach roses and greenery beside a banquet walkway lined with warm string lights",
    width: 597,
    height: 1280,
    aspectRatio: 597 / 1280,
    focalPoint: { x: 50, y: 50 },
  },
  galleryBirthday5: {
    src: "/images/gallery/birthdays/birthdays-5.webp",
    alt: "Floral arrangements lining an event walkway beneath a canopy of warm string lights",
    width: 1280,
    height: 597,
    aspectRatio: 1280 / 597,
    focalPoint: { x: 50, y: 50 },
  },
  galleryFunction2: {
    src: "/images/gallery/functions/functions-2.webp",
    alt: "Layered arched entryway with chandeliers and patterned carpet",
    width: 591,
    height: 1280,
    aspectRatio: 591 / 1280,
    focalPoint: { x: 50, y: 50 },
  },
} as const;

export type ImageSlot = keyof typeof imageSlots;

export const galleryImages = [
  { ...imageSlots.galleryWedding3, imageSlot: "galleryWedding3", category: "weddings", featured: true },
  { ...imageSlots.galleryWedding4, imageSlot: "galleryWedding4", category: "weddings", featured: true },
  { ...imageSlots.galleryWedding6, imageSlot: "galleryWedding6", category: "weddings", featured: true },
  { ...imageSlots.galleryBirthday4, imageSlot: "galleryBirthday4", category: "birthdays", featured: true },
  { ...imageSlots.galleryBirthday5, imageSlot: "galleryBirthday5", category: "birthdays", featured: true },
  { ...imageSlots.galleryFunction2, imageSlot: "galleryFunction2", category: "functions", featured: true },
] as const;
