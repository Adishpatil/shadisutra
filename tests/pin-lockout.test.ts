import { describe, expect, it } from "vitest";
import {
  CLIENT_PIN_LOCK_SECONDS,
  CLIENT_PIN_MAX_ATTEMPTS,
  isPinAttemptAllowed,
} from "../src/lib/security/pin-lockout";

describe("client PIN lockout policy", () => {
  it("allows the database limiter's first five attempts and rejects further attempts for 15 minutes", () => {
    expect(CLIENT_PIN_MAX_ATTEMPTS).toBe(5);
    expect(CLIENT_PIN_LOCK_SECONDS).toBe(900);
    expect(isPinAttemptAllowed(true)).toBe(true);
    expect(isPinAttemptAllowed(false)).toBe(false);
  });
});
