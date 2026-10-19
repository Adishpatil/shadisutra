import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("../lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { getPublicEventShowcase } from "../lib/events/public-data";

describe("Public event showcase data", () => {
  beforeEach(() => createClientMock.mockReset());

  it("does not disclose events denied by row-level security", async () => {
    const eventQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    eventQuery.select.mockReturnValue(eventQuery);
    eventQuery.eq.mockReturnValue(eventQuery);
    createClientMock.mockResolvedValue({
      from: vi.fn(() => eventQuery),
    });

    await expect(getPublicEventShowcase("some-event-id")).resolves.toBeNull();
  });

  it("surfaces database errors instead of returning demonstration data", async () => {
    const eventQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Database unavailable." } }),
    };
    eventQuery.select.mockReturnValue(eventQuery);
    eventQuery.eq.mockReturnValue(eventQuery);
    createClientMock.mockResolvedValue({
      from: vi.fn(() => eventQuery),
    });

    await expect(getPublicEventShowcase("some-event-id")).rejects.toThrow(
      "Database unavailable."
    );
  });
});
