import { createClient } from "@/lib/supabase/server";
import type { AssessmentCategoryRow } from "@/types/database";

/** Categories of one course (RLS-scoped) in display order. */
export async function listCategories(
  courseId: string
): Promise<AssessmentCategoryRow[]> {
  return listCategoriesForCourses([courseId]);
}

/** Categories for many courses in one query (dashboard/semester overview). */
export async function listCategoriesForCourses(
  courseIds: string[]
): Promise<AssessmentCategoryRow[]> {
  if (courseIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("assessment_categories")
    .select("*")
    .in("course_id", courseIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as AssessmentCategoryRow[];
}
