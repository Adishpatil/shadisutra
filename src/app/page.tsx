import { existsSync } from "node:fs";
import { cwd } from "node:process";
import path from "node:path";
import { pageMetadata } from "@/config/seo";
import { HomeExperience } from "@/components/sections/HomeExperience";
import { imageSlots, type ImageSlot } from "@/data/images";
import galleryImages from "@/data/gallery.json";

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
    wedding: imageExists(imageSlots.wedding.src),
    birthday: imageExists(imageSlots.birthday.src),
    function: imageExists(imageSlots.function.src),
    introOne: imageExists(imageSlots.introOne.src),
    introTwo: imageExists(imageSlots.introTwo.src),
    introThree: imageExists(imageSlots.introThree.src),
    about: imageExists(imageSlots.about.src),
  };
  const hasMobileHero = imageExists(imageSlots.hero.mobileSrc);
  const availableGalleryPhotos = galleryImages
    .filter((image) => imageExists(image.src))
    .map((image) => image.src);

  return (
    <HomeExperience
      availableImages={availableImages}
      availableGalleryPhotos={availableGalleryPhotos}
      hasMobileHero={hasMobileHero}
    />
  );
}
