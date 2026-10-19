import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { createAdminClient } from "@/lib/supabase/admin";

export function rateLimitKey(
  requestHeaders: Headers,
  scope: string,
  identifier = ""
): string {
  const realIp = requestHeaders.get("x-real-ip")?.trim();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const forwardedValues = forwarded?.split(",").map((value) => value.trim());
  const forwardedIp = forwardedValues?.[forwardedValues.length - 1];
  const candidate = realIp || forwardedIp || "";
  const ip = isIP(candidate) ? candidate : "unknown";
  return `${scope}:${ip}:${identifier}`;
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Supabase service configuration is required for rate limiting.");
  }

  const keyHash = createHmac("sha256", serviceRoleKey)
    .update(key)
    .digest("base64url");
  const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new Error(`Rate limit check failed: ${error.message}`);
  return data === true;
}
