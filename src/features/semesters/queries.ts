import { createClient } from "@/lib/supabase/server";
import type { SemesterRow } from "@/types/database";

export interface SemesterWithCount extends SemesterRow {
  courseCount: number;
}

export interface SemesterDetail extends SemesterRow {
  courses: {
    id: string;
    name: string;
    code: string;
    credits: number;
    total_marks: number;
    passing_marks: number;
    instructor: string | null;
  }[];
}

/** All semesters for the signed-in user (RLS-scoped), newest term first. */
export async function listSemesters(): Promise<{
  semesters: SemesterWithCount[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("semesters")
    .select("*, courses:courses(id)")
    .order("start_date", { ascending: false });

  if (error) return { semesters: [], error: "Could not load semesters." };

  const semesters = ((data ?? []) as (SemesterRow & { courses: { id: string }[] })[])
    .map(({ courses, ...semester }) => ({
      ...semester,
      courseCount: courses.length,
    }));

  return { semesters };
}

/** One semester with its courses (RLS-scoped); null when not found. */
export async function getSemester(id: string): Promise<SemesterDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("semesters")
    .select(
      "*, courses:courses(id, name, code, credits, total_marks, passing_marks, instructor)"
    )
    .eq("id", id)
    .order("created_at", { ascending: true, referencedTable: "courses" })
    .maybeSingle();

  return (data as SemesterDetail | null) ?? null;
}
