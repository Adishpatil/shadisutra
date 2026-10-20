import { randomBytes } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function buildCsp(nonce: string): string {
  const sources = ["'self'"];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const origin = new URL(supabaseUrl).origin;
      if (origin.startsWith("https://")) {
        sources.push(origin, origin.replace(/^https:/, "wss:"));
      } else if (origin.startsWith("http://localhost")) {
        sources.push(origin, origin.replace(/^http:/, "ws:"));
      }
    } catch {
      // Invalid optional configuration adds no external source to the policy.
    }
  }

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${sources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (process.env.NODE_ENV === "production") {
    directives.push("upgrade-insecure-requests");
  }
  return directives.join("; ");
}

function applySecurityHeaders(
  response: NextResponse,
  contentSecurityPolicy: string,
  pathname: string
): NextResponse {
  const privateRoute =
    pathname === "/login" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/e" ||
    pathname.startsWith("/e/");
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Referrer-Policy",
    privateRoute ? "no-referrer" : "strict-origin-when-cross-origin"
  );
  if (privateRoute) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString("base64");
  const contentSecurityPolicy = buildCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminOrLoginRoute = isAdminRoute || request.nextUrl.pathname === "/login";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isAdminOrLoginRoute) {
    return applySecurityHeaders(
      response,
      contentSecurityPolicy,
      request.nextUrl.pathname
    );
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    response = isAdminRoute
      ? NextResponse.redirect(new URL("/login", request.url))
      : response;
    return applySecurityHeaders(
      response,
      contentSecurityPolicy,
      request.nextUrl.pathname
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        requestHeaders.set("cookie", request.cookies.toString());
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.getUser();
  if (error && isAdminRoute) {
    response = NextResponse.redirect(new URL("/login", request.url));
  }

  return applySecurityHeaders(
    response,
    contentSecurityPolicy,
    request.nextUrl.pathname
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
