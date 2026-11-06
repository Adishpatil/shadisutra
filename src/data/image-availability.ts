import { existsSync } from "node:fs";
import path from "node:path";
import { imageSlots, type ImageSlot } from "@/data/images";

export type ImageAvailability = Record<ImageSlot, boolean>;

export function getImageAvailability(): ImageAvailability {
  const availability = {} as ImageAvailability;
  for (const slot of Object.keys(imageSlots) as ImageSlot[]) {
    const source = imageSlots[slot].src;
    availability[slot] = existsSync(
      path.join(process.cwd(), "public", source.replace(/^\/+/, ""))
    );
  }
  return availability;
}
