import { pageMetadata } from "@/config/seo";
import { HomeExperience } from "@/components/sections/HomeExperience";
import { getImageAvailability } from "@/data/image-availability";
import { LineArt } from "@/components/ui/LineArt";

export const metadata = pageMetadata(
  "Shadi Sutra | Wedding & Event Management",
  "Shadi Sutra plans and styles weddings, birthday parties and family functions, with decor, lighting, flowers, music and on-the-day coordination.",
  "/"
);

export default function HomePage() {
  return (
    <HomeExperience
      availableImages={getImageAvailability()}
      lineArt={{
        arch: <LineArt id="arch" tone="brand" />,
        heart: <LineArt id="heart-line" tone="lime" />,
      }}
    />
  );
}
