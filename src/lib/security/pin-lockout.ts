export const CLIENT_PIN_MAX_ATTEMPTS = 5;
export const CLIENT_PIN_LOCK_SECONDS = 15 * 60;

export function isPinAttemptAllowed(consumeRateLimitResult: boolean): boolean {
  return consumeRateLimitResult;
}
