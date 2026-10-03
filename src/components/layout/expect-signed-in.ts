import { EXPECT_SIGNED_IN_KEY } from "@/components/marketing/auth/session-cookie";

/**
 * Dev-only breadcrumb for the marketing auth island.
 *
 * Records that the next public page visit comes from a signed-in session, so
 * that the island's diagnostic can warn when it cannot read the session cookie
 * (the symptom of Supabase ever setting HttpOnly). The guard is inlined at
 * build time, so this compiles away entirely in production.
 */
export function markExpectSignedIn(): void {
  if (process.env.NODE_ENV === "production") return;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(EXPECT_SIGNED_IN_KEY, "1");
  } catch {
    /* sessionStorage unavailable — the diagnostic simply stays silent */
  }
}