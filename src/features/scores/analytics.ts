import { buildCourseScore } from "./assembly";
import {
  pickStrongestWeakest,
  type CategoryScore,
  type CourseScore,
} from "@/calculations/score";
import {
  analyzeTrend,
  buildPerformanceSeries,
  type PerformancePoint,
  type TrendAnalysis,
} from "@/calculations/trend";
import {
  assessCourseStatus,
  type CourseStatus,
} from "@/calculations/status";
import {
  calculateAssessmentProgression,
  type ProgressionPoint,
} from "@/calculations/progression";
import type {
  AssessmentCategoryRow,
  AssessmentRow,
} from "@/types/database";

export interface CourseAnalytics {
  score: CourseScore;
  status: CourseStatus | null;
  series: PerformancePoint[];
  trend: TrendAnalysis;
  progression: ProgressionPoint[];
  strongestCategory: CategoryScore | null;
  weakestCategory: CategoryScore | null;
}

interface CourseLike {
  id: string;
  total_marks: number | string;
  passing_marks: number | string;
}

/**
 * One call that turns stored rows into every analytics value the course
 * dashboard shows — status, trend, progression, extremes — all engine math.
 */
export function buildCourseAnalytics(
  course: CourseLike,
  categories: AssessmentCategoryRow[],
  assessments: AssessmentRow[]
): CourseAnalytics {
  const score = buildCourseScore(course, categories, assessments);

  const series = buildPerformanceSeries(assessments);
  const trend = analyzeTrend(series);

  const courseCategories = categories.filter((c) => c.course_id === course.id);
  const progression = calculateAssessmentProgression({
    course: { totalMarks: Number(course.total_marks) },
    categories: courseCategories.map((c) => ({
      id: c.id,
      weight: Number(c.weight),
    })),
    assessments,
  });

  const { strongest, weakest } = pickStrongestWeakest(
    score.categories,
    (c) => c.percentage
  );

  return {
    score,
    status: assessCourseStatus(score, Number(course.passing_marks)),
    series,
    trend,
    progression,
    strongestCategory: strongest,
    weakestCategory: weakest,
  };
}
