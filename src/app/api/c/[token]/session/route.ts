import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveClientLink } from "@/lib/events/client-share";
import { createClientSessionCookie, verifyClientPin } from "@/lib/events/client-link-access";
import { consumeRateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import {
  CLIENT_PIN_LOCK_SECONDS,
  CLIENT_PIN_MAX_ATTEMPTS,
  isPinAttemptAllowed,
} from "@/lib/security/pin-lockout";

export const dynamic = "force-dynamic";

const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/);
const pinSchema = z.union([z.literal(""), z.string().regex(/^\d{4,6}$/)]);

function redirectToGate(request: Request, token: string, invalid: boolean) {
  const url = new URL(`/c/${token}${invalid ? "?invalid=1" : ""}`, request.url);
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token: rawToken } = await params;
  const tokenResult = tokenSchema.safeParse(rawToken);
  if (!tokenResult.success) return redirectToGate(request, "", true);
  const token = tokenResult.data;
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return redirectToGate(request, token, true);
  }

  const allowed = await consumeRateLimit(
    rateLimitKey(request.headers, "client-link-pin", token),
    CLIENT_PIN_MAX_ATTEMPTS,
    CLIENT_PIN_LOCK_SECONDS
  );
  if (!isPinAttemptAllowed(allowed)) return redirectToGate(request, token, true);

  const formData = await request.formData();
  const pinResult = pinSchema.safeParse(String(formData.get("pin") ?? ""));
  if (!pinResult.success) return redirectToGate(request, token, true);

  const link = await getActiveClientLink(token);
  if (!link) return redirectToGate(request, token, true);
  const pinMatches = link.pin_hash
    ? pinResult.data.length > 0 && await verifyClientPin(pinResult.data, link.pin_hash)
    : pinResult.data.length === 0;
  if (!pinMatches) return redirectToGate(request, token, true);

  const cookie = createClientSessionCookie(token, link.expires_at);
  const response = NextResponse.redirect(new URL(`/c/${token}`, request.url), 303);
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
