/**
 * Auth island helpers — PURE, DOM-free, dependency-free.
 *
 * The public marketing surface must not import a Supabase client (enforced by
 * the qa:invariants build guard, rule D). Detecting "is this visitor signed
 * in?" therefore comes down to one question: is a Supabase session cookie
 * present? These helpers answer that from a cookie string the caller reads
 * inside an effect, which keeps every browser API at the component edge and
 * makes the logic unit-testable without a DOM.
 *
 * Verified live by `npm run verify:auth-cookie`:
 *   name = `sb-<projectRef>-auth-token`, httpOnly = false, Path=/, SameSite=Lax.
 */

export const EXPECT_SIGNED_IN_KEY = "gp:expect-auth";

/**
 * `https://abcdefghijklmnop.supabase.co` → `sb-abcdefghijklmnop-auth-token`.
 * Mirrors the storage key the Supabase client derives (supabase-js
 * `defaultStorageKey`), so the name never has to be guessed or hard-coded.
 */
export function sessionCookieName(supabaseUrl?: string): string | null {
  if (!supabaseUrl) return null;
  try {
    const ref = new URL(supabaseUrl).hostname.split(".")[0];
    if (!ref) return null;
    return `sb-${ref}-auth-token`;
  } catch {
    return null;
  }
}

/**
 * True when a session cookie (or one of its `.0`, `.1` … chunks) is present.
 *
 * Anchored on the exact name so the PKCE siblings — `-code-verifier`,
 * `-flows-code-verifier`, `-flow-<id>-code-verifier` — cannot be mistaken for
 * a session. A stale verifier from an abandoned email-confirmation flow would
 * otherwise show a logged-out visitor a "Dashboard" button.
 */
export function hasSessionCookie(cookieString: string, expectedName: string): boolean {
  if (!cookieString || !expectedName) return false;
  for (const pair of cookieString.split(";")) {
    const name = pair.split("=")[0]?.trim();
    if (!name) continue;
    if (name === expectedName) return true;
    if (name.startsWith(`${expectedName}.`)) {
      const suffix = name.slice(expectedName.length + 1);
      if (/^\d+$/.test(suffix)) return true;
    }
  }
  return false;
}

/** Message used by the island's dev-only diagnostic. */
export function missingCookieWarning(expectedName: string): string {
  return (
    `[GradePulse] auth island: a signed-in session was expected but no readable ` +
    `"${expectedName}" cookie is present. If Supabase set HttpOnly the public ` +
    `"Dashboard" swap fails silently. Verify: npm run verify:auth-cookie`
  );
}