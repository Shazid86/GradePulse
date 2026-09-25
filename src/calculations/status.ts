import type { CourseScore } from "./score";

/**
 * Course health/status (spec §18) — measurable, documented thresholds.
 * Change the numbers here to retune every status in the app at once.
 * Status describes academic standing only; it makes no claims beyond
 * the stored marks.
 */
export const COURSE_STATUS_THRESHOLDS = {
  /** Percentage ≥ this → Strong */
  strong: 80,
  /** Percentage ≥ this → Stable */
  stable: 65,
  /** Percentage ≥ this → Needs Attention (below → At Risk) */
  needsAttention: 50,
} as const;

export type CourseStatus = "strong" | "stable" | "needs_attention" | "at_risk";

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  needs_attention: "Needs Attention",
  at_risk: "At Risk",
};

/**
 * Returns null when nothing is graded yet — no fake states for empty data.
 * A course that mathematically cannot reach its passing marks is At Risk
 * regardless of the current percentage.
 */
export function assessCourseStatus(
  score: Pick<CourseScore, "percentage" | "maxPossibleScore" | "categories">,
  passingMarks: number
): CourseStatus | null {
  const hasGrades = score.categories.some((c) => c.percentage !== null);
  if (!hasGrades) return null;

  const passing = Math.max(0, passingMarks);
  if (score.maxPossibleScore < passing) return "at_risk";

  const pct = score.percentage;
  if (pct >= COURSE_STATUS_THRESHOLDS.strong) return "strong";
  if (pct >= COURSE_STATUS_THRESHOLDS.stable) return "stable";
  if (pct >= COURSE_STATUS_THRESHOLDS.needsAttention) return "needs_attention";
  return "at_risk";
}
