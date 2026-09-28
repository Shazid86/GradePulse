import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

/**
 * Explicit public allowlist (Phase 6.5). Every path NOT listed here is
 * PRIVATE BY DEFAULT, so future application routes (e.g. /calendar) stay
 * protected automatically. Do not broaden this list without review.
 */
const PUBLIC_PATHS = new Set([
  "/",
  "/features",
  "/how-it-works",
  "/about",
  "/contact",
]);

/**
 * Refreshes the Supabase auth session on every matched request and enforces
 * route protection. Runs in the proxy layer (edge), before rendering.
 *
 * When Supabase env vars are missing the check is skipped so the app still
 * boots and shows a clear "not configured" state instead of crashing.
 */
export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabaseEnv();
  const supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do not run code between createServerClient and auth.getUser()
  // — it can cause random sign-outs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  // /auth/login, /auth/signup, /auth/callback — the whole segment is public.
  const isAuthSegment = pathname.startsWith("/auth/");
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";
  const isPublic = PUBLIC_PATHS.has(pathname) || isAuthSegment;

  // Unauthenticated → login (remembering the intended destination).
  // Default-deny: anything outside the allowlist requires a session.
  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated away from the auth pages → dashboard.
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
