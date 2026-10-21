import { consumeRateLimit, rateLimitKey } from "../../../lib/security/rate-limit";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request): Promise<Response> {
  try {
    const allowed = await consumeRateLimit(
      rateLimitKey(request.headers, "health-check"),
      60,
      60
    );
    if (!allowed) {
      return new Response(null, {
        status: 429,
        headers: { ...responseHeaders, "Retry-After": "60" },
      });
    }

    return new Response('{"ok":true}', {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(
      "[Health] Rate-limit check failed.",
      error instanceof Error ? error.message : "Unknown server error."
    );
    return new Response(null, {
      status: 503,
      headers: responseHeaders,
    });
  }
}
