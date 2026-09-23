import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";
import { isSupabaseConfigured } from "./env";

export type AuthContext =
  | { supabase: SupabaseClient; userId: string }
  | { error: string };

/**
 * Resolves the authenticated user inside a server action / server component.
 * Every mutation uses this so rows always carry a trustworthy user_id —
 * RLS remains the enforcement layer on top.
 */
export async function requireUser(): Promise<AuthContext> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Check your .env.local." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "You must be signed in to do that." };
  }

  return { supabase, userId: user.id };
}
