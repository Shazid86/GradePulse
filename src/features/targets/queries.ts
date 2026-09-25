import { createClient } from "@/lib/supabase/server";
import type { TargetRow } from "@/types/database";

/** The course's target row if one exists (RLS-scoped). Read-only for now. */
export async function getCourseTarget(
  courseId: string
): Promise<TargetRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("targets")
    .select("*")
    .eq("course_id", courseId)
    .maybeSingle();

  return (data as TargetRow | null) ?? null;
}
