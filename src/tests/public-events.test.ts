import { beforeEach, describe, expect, it, vi } from "vitest";

const { consumeRateLimitMock, rateLimitKeyMock, createAdminClientMock } =
  vi.hoisted(() => ({
    consumeRateLimitMock: vi.fn(),
    rateLimitKeyMock: vi.fn(() => "hashed-rate-key"),
    createAdminClientMock: vi.fn(),
  }));

vi.mock("server-only", () => ({}));
vi.mock("../lib/security/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
  rateLimitKey: rateLimitKeyMock,
}));
vi.mock("../lib/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));

import {
  eventShareTokenSchema,
  getPublicSharedEvent,
} from "../lib/events/public-share";

describe("Public event share links", () => {
  beforeEach(() => {
    consumeRateLimitMock.mockReset().mockResolvedValue(true);
    rateLimitKeyMock.mockClear();
    createAdminClientMock.mockReset();
  });

  it("accepts only 24-byte base64url tokens", () => {
    expect(eventShareTokenSchema.safeParse("a".repeat(32)).success).toBe(true);
    expect(eventShareTokenSchema.safeParse("a".repeat(31)).success).toBe(false);
    expect(eventShareTokenSchema.safeParse("!".repeat(32)).success).toBe(false);
  });

  it("returns the same invalid result when a token has an invalid shape", async () => {
    const result = await getPublicSharedEvent("not-a-token", new Headers());

    expect(result).toBeNull();
    expect(consumeRateLimitMock).toHaveBeenCalledOnce();
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("returns the same invalid result when the requester is rate limited", async () => {
    consumeRateLimitMock.mockResolvedValue(false);

    const result = await getPublicSharedEvent("a".repeat(32), new Headers());

    expect(result).toBeNull();
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });
});
