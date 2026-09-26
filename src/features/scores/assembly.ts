import {
  calculateCourseScore,
  type CourseScore,
  type CourseScoreInput,
} from "@/calculations/score";
import type {
  AssessmentCategoryRow,
  AssessmentRow,
} from "@/types/database";

interface CourseLike {
  id: string;
  total_marks: number | string;
}

/**
 * Maps database rows → calculation engine inputs.
 * The single place rows become numbers; UI never does arithmetic.
 * The returned input is serializable, so the client-side what-if
 * simulator runs the exact same engine on it.
 */
export function toCourseScoreInput(
  course: CourseLike,
  categories: AssessmentCategoryRow[],
  assessments: AssessmentRow[]
): CourseScoreInput {
  const courseCategories = categories.filter((c) => c.course_id === course.id);
  const categoryIds = new Set(courseCategories.map((c) => c.id));
  const courseAssessments = assessments.filter((a) =>
    categoryIds.has(a.category_id)
  );

  return {
    totalMarks: Number(course.total_marks),
    categories: courseCategories.map((c) => ({
      id: c.id,
      name: c.name,
      weight: Number(c.weight),
    })),
    assessments: courseAssessments.map((a) => ({
      category_id: a.category_id,
      obtained_marks:
        a.obtained_marks === null ? null : Number(a.obtained_marks),
      maximum_marks: Number(a.maximum_marks),
      status: a.status,
      title: a.title,
    })),
  };
}

export function buildCourseScore(
  course: CourseLike,
  categories: AssessmentCategoryRow[],
  assessments: AssessmentRow[]
): CourseScore {
  return calculateCourseScore(
    toCourseScoreInput(course, categories, assessments)
  );
}