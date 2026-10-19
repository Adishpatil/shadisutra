import { describe, it, expect } from "vitest";
import { getPublicEventShowcase } from "../lib/events/public-data";

describe("Public Event QR Showcase Data", () => {
  it("allows guests to fetch finalized events with ceremonies itinerary", async () => {
    const event = await getPublicEventShowcase("e1-sharma-wedding");
    expect(event).not.toBeNull();
    expect(event?.name).toBe("Sharma Royal Wedding Celebrations");
    expect(event?.status).toBe("finalized");
    expect(event?.functions.length).toBeGreaterThan(0);
    expect(event?.functions[0].name).toBe("Vibrant Haldi & Phoolon Ki Holi");
  });

  it("does not allow unfinalized or non-existent events to be viewed", async () => {
    const nonExistent = await getPublicEventShowcase("non-existent-id");
    expect(nonExistent).toBeNull();
  });
});
