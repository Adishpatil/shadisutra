import { existsSync } from "node:fs";
import { cwd } from "node:process";
import path from "node:path";
import { pageMetadata } from "@/config/seo";
import { HomeExperience } from "@/components/sections/HomeExperience";
import { galleryImages, imageSlots, type ImageSlot } from "@/data/images";

export const metadata = pageMetadata(
  "Shadi Sutra | Wedding & Event Management",
  "Shadi Sutra plans and styles weddings, birthday parties and family functions, with decor, lighting, flowers, music and on-the-day coordination.",
  "/"
);

function imageExists(source: string) {
  return existsSync(path.join(cwd(), "public", source.replace(/^\//, "")));
}

export default function HomePage() {
  const availableImages: Record<ImageSlot, boolean> = {
    hero: imageExists(imageSlots.hero.src),
    about: imageExists(imageSlots.about.src),
    galleryWedding3: imageExists(imageSlots.galleryWedding3.src),
    galleryWedding4: imageExists(imageSlots.galleryWedding4.src),
    galleryWedding6: imageExists(imageSlots.galleryWedding6.src),
    galleryBirthday4: imageExists(imageSlots.galleryBirthday4.src),
    galleryBirthday5: imageExists(imageSlots.galleryBirthday5.src),
    galleryFunction2: imageExists(imageSlots.galleryFunction2.src),
  };
  const hasMobileHero = imageExists(imageSlots.hero.mobileSrc);

  return (
    <HomeExperience
      availableImages={availableImages}
      hasMobileHero={hasMobileHero}
    />
  );
}
