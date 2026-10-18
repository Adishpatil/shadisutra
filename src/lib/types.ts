export interface GalleryImage {
  src: string;
  category: "weddings" | "birthdays" | "functions";
  alt: string;
  width: number;
  height: number;
  featured: boolean;
}

export type GalleryCategory = GalleryImage["category"] | "all";
