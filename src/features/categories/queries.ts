import { createClient } from "@/lib/supabase/server";
import type { AssessmentCategoryRow } from "@/types/database";

/** Categories of one course (RLS-scoped) in display order. */
export async function listCategories(
  courseId: string
): Promise<AssessmentCategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assessment_categories")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as AssessmentCategoryRow[];
}
