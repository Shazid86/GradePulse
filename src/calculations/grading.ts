import type { CourseScore } from "./score";
import { roundTo, toFiniteNumber } from "./numbers";

/**
 * Grading scales & GPA (spec §21) — fully configurable per course.
 * Nothing about any university's system is hard-coded: scales come from the
 * course's grading_scale jsonb, grade points are whatever the student
 * configured (4.0, 5.0, 10.0, 100 …).
 */

export interface GradingScaleEntry {
  grade: string;
  min_percentage: number;
  grade_point: number;
}

/** Defensive parse of the course grading_scale jsonb (invalid rows dropped). */
export function parseGradingScale(raw: unknown): GradingScaleEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: GradingScaleEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const e = item as {
      grade?: unknown;
      min_percentage?: unknown;
      grade_point?: unknown;
    };
    const min = Number(e.min_percentage);
    const point = Number(e.grade_point);
    if (typeof e.grade !== "string" || !e.grade.trim()) continue;
    if (!Number.isFinite(min) || min < 0 || min > 100) continue;
    if (!Number.isFinite(point) || point < 0 || point > 100) continue;
    entries.push({
      grade: e.grade.trim().slice(0, 12),
      min_percentage: min,
      grade_point: point,
    });
  }
  return entries.sort((a, b) => b.min_percentage - a.min_percentage);
}

/** Entry with the highest min_percentage ≤ percentage; null below the scale. */
export function gradeForPercentage(
  scale: GradingScaleEntry[],
  percentage: number | null
): GradingScaleEntry | null {
  if (percentage === null || !Number.isFinite(percentage)) return null;
  const ordered = [...scale].sort((a, b) => b.min_percentage - a.min_percentage);
  for (const entry of ordered) {
    if (percentage >= entry.min_percentage) return entry;
  }
  return null;
}

/**
 * Grade for a course score. Ungraded courses (no completed assessments)
 * never receive a grade — partial percentages are not graded outcomes.
 */
export function gradeForCourse(
  score: Pick<CourseScore, "percentage" | "categories">,
  rawScale: unknown
): { grade: string; gradePoint: number } | null {
  const hasGrades = score.categories.some((c) => c.percentage !== null);
  if (!hasGrades) return null;
  const entry = gradeForPercentage(
    parseGradingScale(rawScale),
    score.percentage
  );
  return entry
    ? { grade: entry.grade, gradePoint: entry.grade_point }
    : null;
}

export interface GpaResult {
  /** Credit-weighted GPA; null when no course carries a grade yet. */
  gpa: number | null;
  /** Sum of credits of graded courses (GPA denominator). */
  gradedCredits: number;
  gradedCourses: number;
}

/**
 * Credit-weighted GPA (spec §21): Σ(grade point × credits) / Σ credits.
 * Courses without a grade (incomplete / scale not configured / below scale)
 * are excluded from numerator AND denominator. Safe on empty input.
 * Used for semester GPA — and, over completed semesters' courses, for CGPA.
 */
export function calculateGpa(
  courses: { credits: number | string; gradePoint: number | null }[]
): GpaResult {
  let pointsSum = 0;
  let gradedCredits = 0;
  let gradedCourses = 0;

  for (const course of courses) {
    if (course.gradePoint === null || !Number.isFinite(course.gradePoint)) {
      continue;
    }
    const credits = toFiniteNumber(course.credits);
    if (credits <= 0) continue;
    pointsSum += course.gradePoint * credits;
    gradedCredits += credits;
    gradedCourses += 1;
  }

  gradedCredits = roundTo(gradedCredits, 3);

  return {
    gpa:
      gradedCredits > 0
        ? roundTo(pointsSum / gradedCredits)
        : null,
    gradedCredits,
    gradedCourses,
  };
}
