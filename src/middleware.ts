import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/navigation";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase env is not configured, allow public navigation without breaking
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Read authenticated user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = pathname === "/login";
  const isChangePasswordRoute = pathname === "/change-password";
  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");

  // 1. Unauthenticated users trying to access protected routes
  if (!user) {
    if (isAdminRoute || isPortalRoute || isChangePasswordRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // 2. Fetch profile details for authenticated user
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, access_enabled, must_change_password")
    .eq("id", user.id)
    .single();

  // If user has no profile or is a customer with disabled access
  if (profile && profile.role === "customer" && !profile.access_enabled) {
    // Sign out customer with disabled access
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "access_disabled");
    return NextResponse.redirect(url);
  }

  // 3. User is forced to change password
  if (profile?.must_change_password) {
    if (!isChangePasswordRoute && (isPortalRoute || isAdminRoute || isAuthRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = "/change-password";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // 4. Authenticated user visiting /login
  if (isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "admin" ? "/admin" : "/portal";
    return NextResponse.redirect(url);
  }

  // 5. Customer trying to access /admin routes
  if (isAdminRoute && profile?.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/portal";
    return NextResponse.redirect(url);
  }

  // 6. Admin MFA Check for /admin
  if (isAdminRoute && profile?.role === "admin") {
    const { data: mfaData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    // If admin has enrolled in MFA (nextLevel === 'aal2') but hasn't verified this session (currentLevel === 'aal1')
    if (mfaData && mfaData.nextLevel === "aal2" && mfaData.currentLevel === "aal1") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("mfa", "required");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/login",
    "/change-password",
  ],
};
