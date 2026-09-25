import { createClient } from "@/lib/supabase/server";
import { getSemester, type SemesterDetail } from "@/features/semesters/queries";
import { listCategoriesForCourses } from "@/features/categories/queries";
import { listAssessmentsForCourses } from "@/features/assessments/queries";
import { buildCourseScore } from "@/features/scores/assembly";
import {
  calculateSemesterScore,
  pickStrongestWeakest,
  type CourseScore,
  type SemesterScore,
} from "@/calculations/score";

export interface CourseCard {
  id: string;
  name: string;
  code: string;
  credits: number;
  totalMarks: number;
  score: CourseScore;
}

export interface SemesterOverview {
  semester: SemesterDetail;
  semesterScore: SemesterScore;
  courseCards: CourseCard[];
  strongestCourse: CourseCard | null;
  weakestCourse: CourseCard | null;
}

/**
 * Picks the dashboard semester: the active one, else the most recent term.
 * Returns whether any semester exists at all (drives the onboarding state).
 */
export async function findCurrentSemester(): Promise<{
  semesterId: string | null;
  hasAny: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("semesters")
    .select("id, status, start_date")
    .order("start_date", { ascending: false });

  if (error) {
    return { semesterId: null, hasAny: false, error: "Could not load semesters." };
  }

  const rows = data ?? [];
  const active = rows.find((r) => r.status === "active");
  return { semesterId: (active ?? rows[0])?.id ?? null, hasAny: rows.length > 0 };
}

/**
 * Full semester overview: all courses scored through the calculation engine,
 * semester aggregate, strongest/weakest graded course (§19, ungraded skipped).
 */
export async function getSemesterOverview(
  semesterId: string
): Promise<{ overview: SemesterOverview | null; error?: string }> {
  const semester = await getSemester(semesterId);
  if (!semester) {
    return { overview: null, error: "Semester not found." };
  }

  const courseIds = semester.courses.map((c) => c.id);
  const [categories, assessments] = await Promise.all([
    listCategoriesForCourses(courseIds),
    listAssessmentsForCourses(courseIds),
  ]);

  const courseCards: CourseCard[] = semester.courses.map((course) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    credits: Number(course.credits),
    totalMarks: Number(course.total_marks),
    score: buildCourseScore(course, categories, assessments),
  }));

  const semesterScore = calculateSemesterScore(
    courseCards.map((c) => c.score)
  );

  const hasGrades = (card: CourseCard) =>
    card.score.categories.some((c) => c.percentage !== null);
  const { strongest, weakest } = pickStrongestWeakest(
    courseCards,
    (card) => (hasGrades(card) ? card.score.percentage : null)
  );

  return {
    overview: {
      semester,
      semesterScore,
      courseCards,
      strongestCourse: strongest,
      weakestCourse: weakest,
    },
  };
}
