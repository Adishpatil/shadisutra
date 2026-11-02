import { describe, expect, it } from "vitest";
import {
  CLIENT_PIN_LOCK_SECONDS,
  CLIENT_PIN_MAX_ATTEMPTS,
  isPinAttemptAllowed,
} from "../src/lib/security/pin-lockout";

describe("client PIN lockout policy", () => {
  it("allows the database limiter's first five attempts and rejects further attempts for 15 minutes", () => {
    const limiterResults = Array.from(
      { length: CLIENT_PIN_MAX_ATTEMPTS + 1 },
      (_, attempt) => isPinAttemptAllowed(attempt < CLIENT_PIN_MAX_ATTEMPTS)
    );
    expect(limiterResults).toEqual([true, true, true, true, true, false]);
    expect(CLIENT_PIN_LOCK_SECONDS).toBe(15 * 60);
  });
});
