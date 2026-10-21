import { beforeEach, describe, expect, it, vi } from "vitest";

const { consumeRateLimit, rateLimitKey } = vi.hoisted(() => ({
  consumeRateLimit: vi.fn(),
  rateLimitKey: vi.fn(),
}));

vi.mock("../lib/security/rate-limit", () => ({
  consumeRateLimit,
  rateLimitKey,
}));

import { GET } from "../app/api/health/route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitKey.mockReturnValue("health-check:test");
  });

  it("returns only the health payload when under the rate limit", async () => {
    consumeRateLimit.mockResolvedValue(true);

    const response = await GET(new Request("https://example.test/api/health"));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('{"ok":true}');
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(rateLimitKey).toHaveBeenCalledWith(
      expect.any(Headers),
      "health-check"
    );
    expect(consumeRateLimit).toHaveBeenCalledWith(
      "health-check:test",
      60,
      60
    );
  });

  it("returns an empty 429 response when rate limited", async () => {
    consumeRateLimit.mockResolvedValue(false);

    const response = await GET(new Request("https://example.test/api/health"));

    expect(response.status).toBe(429);
    expect(await response.text()).toBe("");
    expect(response.headers.get("retry-after")).toBe("60");
  });

  it("fails closed without exposing internal details if rate limiting fails", async () => {
    consumeRateLimit.mockRejectedValue(new Error("private database error"));

    const response = await GET(new Request("https://example.test/api/health"));

    expect(response.status).toBe(503);
    expect(await response.text()).toBe("");
  });
});
