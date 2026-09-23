import { createClient } from "@/lib/supabase/server";
import type { CourseRow } from "@/types/database";

export interface CourseWithMeta extends CourseRow {
  semester_id: string;
  categoryCount: number;
}

/** Courses of one semester (RLS-scoped), creation order. */
export async function listCoursesForSemester(
  semesterId: string
): Promise<CourseWithMeta[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, categories:assessment_categories(id)")
    .eq("semester_id", semesterId)
    .order("created_at", { ascending: true });

  return ((data ?? []) as (CourseRow & { categories: { id: string }[] })[])
    .map(({ categories, ...course }) => ({
      ...course,
      categoryCount: categories.length,
    }));
}

export interface CourseDetail extends CourseRow {
  semester: { id: string; name: string; academic_year: string };
}

/** One course with its semester breadcrumb (RLS-scoped). */
export async function getCourse(id: string): Promise<CourseDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, semester:semesters(id, name, academic_year)")
    .eq("id", id)
    .maybeSingle();

  return (data as CourseDetail | null) ?? null;
}
