export const imageSlots = {
  hero: {
    src: "/images/hero/hero-1.webp",
    mobileSrc: "/images/hero/hero-1-mobile.webp",
    alt: "White floral stage set against dark curtains with a matching dance-floor monogram",
    width: 1920,
    height: 1080,
    focalPoint: { x: 50, y: 48 },
  },
  wedding: {
    src: "/images/events/weddings.webp",
    alt: "Wedding event photo",
    width: 800,
    height: 1000,
  },
  birthday: {
    src: "/images/events/birthdays.webp",
    alt: "Birthday event photo",
    width: 800,
    height: 1000,
  },
  function: {
    src: "/images/events/functions.webp",
    alt: "Family function event photo",
    width: 800,
    height: 1000,
  },
  introOne: {
    src: "/images/intro/intro-1.webp",
    alt: "Event planning photo",
    width: 900,
    height: 1200,
  },
  introTwo: {
    src: "/images/intro/intro-2.webp",
    alt: "Event decor photo",
    width: 1000,
    height: 1000,
  },
  introThree: {
    src: "/images/intro/intro-3.webp",
    alt: "Flowers and music event photo",
    width: 1200,
    height: 900,
  },
  about: {
    src: "/images/about/about-1.webp",
    alt: "Shadi Sutra event photo",
    width: 1200,
    height: 800,
  },
} as const;

export type ImageSlot = keyof typeof imageSlots;
