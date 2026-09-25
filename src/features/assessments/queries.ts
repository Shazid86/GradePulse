import { createClient } from "@/lib/supabase/server";
import type { AssessmentRow } from "@/types/database";

/**
 * Assessments of one course (RLS-scoped), soonest first,
 * undated items last, then creation order.
 */
export async function listAssessments(
  courseId: string
): Promise<AssessmentRow[]> {
  return listAssessmentsForCourses([courseId]);
}

/** Assessments for many courses in one query (dashboard/semester overview). */
export async function listAssessmentsForCourses(
  courseIds: string[]
): Promise<AssessmentRow[]> {
  if (courseIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("assessments")
    .select(
      "id, user_id, category_id, title, obtained_marks, maximum_marks, date, notes, status, created_at, updated_at, category:assessment_categories!inner(course_id)"
    )
    .in("category.course_id", courseIds)
    .order("date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  return ((data ?? []) as unknown as (AssessmentRow & {
    category: { course_id: string } | { course_id: string }[];
  })[]).map((row) => {
    const { category, ...assessment } = row;
    void category;
    return assessment;
  });
}
