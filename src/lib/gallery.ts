import galleryData from "@/data/gallery.json";
import type { GalleryImage, GalleryCategory } from "@/lib/types";

const images: GalleryImage[] = galleryData as GalleryImage[];

/** Get all gallery images, optionally filtered by category. */
export function getGalleryImages(category: GalleryCategory = "all"): GalleryImage[] {
  if (category === "all") return images;
  return images.filter((img) => img.category === category);
}

/** Get only featured images for the home page strip. */
export function getFeaturedImages(): GalleryImage[] {
  return images.filter((img) => img.featured);
}
