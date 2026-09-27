import { createClient } from "@/lib/supabase/server";
import { listAllCourses } from "@/features/courses/queries";
import { listCategoriesForCourses } from "@/features/categories/queries";
import { listAssessmentsForCourses } from "@/features/assessments/queries";
import { buildCourseScore } from "@/features/scores/assembly";
import { calculateSemesterScore, type SemesterScore } from "@/calculations/score";
import {
  calculateGpa,
  gradeForCourse,
  type GpaResult,
} from "@/calculations/grading";
import type { SemesterRow } from "@/types/database";

export interface GradedCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  /** Percentage when the course has graded work; null otherwise. */
  percentage: number | null;
  grade: string | null;
  gradePoint: number | null;
}

export interface SemesterGpaEntry {
  semester: Pick<
    SemesterRow,
    "id" | "name" | "academic_year" | "status" | "start_date" | "end_date"
  >;
  gpa: number | null;
  gradedCredits: number;
  gradedCourses: number;
  totalCourses: number;
  overall: SemesterScore;
}

export interface GpaOverview {
  semesters: SemesterGpaEntry[];
  /** Credit-weighted CGPA across COMPLETED semesters (§21); null if none. */
  cgpa: GpaResult;
  completedSemesters: number;
}

/** GPA + CGPA + per-semester history from real stored data. */
export async function getGpaOverview(): Promise<{
  overview: GpaOverview | null;
  error?: string;
}> {
  const supabase = await createClient();
  const [{ data: semesterRows, error: semesterError }, courses] =
    await Promise.all([
      supabase
        .from("semesters")
        .select("*")
        .order("start_date", { ascending: false }),
      listAllCourses(),
    ]);

  if (semesterError) {
    return { overview: null, error: "Could not load semesters." };
  }

  const semesters = (semesterRows ?? []) as SemesterRow[];
  const courseIds = courses.map((c) => c.id);
  const [categories, assessments] = await Promise.all([
    listCategoriesForCourses(courseIds),
    listAssessmentsForCourses(courseIds),
  ]);

  const gradedByCourse = new Map<string, GradedCourse>();
  for (const course of courses) {
    const score = buildCourseScore(course, categories, assessments);
    const graded = gradeForCourse(score, course.grading_scale);
    const hasGrades = score.categories.some((c) => c.percentage !== null);
    gradedByCourse.set(course.id, {
      id: course.id,
      name: course.name,
      code: course.code,
      credits: Number(course.credits),
      percentage: hasGrades ? score.percentage : null,
      grade: graded?.grade ?? null,
      gradePoint: graded?.gradePoint ?? null,
    });
  }

  const entries: SemesterGpaEntry[] = [];
  for (const semester of semesters) {
    const semesterCourses = courses.filter(
      (c) => c.semester_id === semester.id
    );
    const scores = semesterCourses.map((c) =>
      buildCourseScore(c, categories, assessments)
    );
    const graded = semesterCourses.map((c) => gradedByCourse.get(c.id)!);

    const gpa = calculateGpa(
      graded.map((g) => ({
        credits: g.credits,
        gradePoint: g.gradePoint,
      }))
    );

    entries.push({
      semester: {
        id: semester.id,
        name: semester.name,
        academic_year: semester.academic_year,
        status: semester.status,
        start_date: semester.start_date,
        end_date: semester.end_date,
      },
      gpa: gpa.gpa,
      gradedCredits: gpa.gradedCredits,
      gradedCourses: gpa.gradedCourses,
      totalCourses: semesterCourses.length,
      overall: calculateSemesterScore(scores),
    });
  }

  const completedEntries = entries.filter(
    (e) => e.semester.status === "completed"
  );
  const completedCourseIds = courses
    .filter((c) =>
      completedEntries.some((e) => e.semester.id === c.semester_id)
    )
    .map((c) => c.id);
  const cgpaCourses = completedCourseIds.map((id) => {
    const g = gradedByCourse.get(id)!;
    const course = courses.find((c) => c.id === id)!;
    return { credits: g.credits, gradePoint: g.gradePoint, course };
  });

  return {
    overview: {
      semesters: entries,
      cgpa: calculateGpa(
        cgpaCourses.map(({ credits, gradePoint }) => ({ credits, gradePoint }))
      ),
      completedSemesters: completedEntries.length,
    },
  };
}
