import type { AssessmentStatus } from "@/types/database";
import { roundTo, toFiniteNumber } from "./numbers";

/**
 * Pure calculation engine — no React, no Supabase, no I/O.
 *
 * Category model (spec §12/§13):
 *   Each assessment holds a share of its category proportional to its
 *   maximum marks:  share_i = maximum_i / Σ maximum(all defined in category)
 *   A completed assessment secures  obtained_i × weight / Σ maximum.
 *   Pending assessments secure nothing yet but reserve their share, so:
 *     secured     = (Σ obtained of completed / Σ maximum of all defined) × weight
 *     bestFinal   = (Σ obtained of completed + Σ maximum of pending)
 *                   / Σ maximum × weight
 *     maxPossible = min(weight, bestFinal)
 *     obtainable  = maxPossible − secured
 *   A category with no assessments defined yet can earn its full weight.
 */

export interface CategoryInput {
  id: string;
  name: string;
  weight: number;
}

export interface AssessmentInput {
  category_id: string;
  obtained_marks: number | null;
  maximum_marks: number;
  status: AssessmentStatus;
}

export interface CategoryScore {
  categoryId: string;
  name: string;
  /** Course marks this category contributes. */
  weight: number;
  /** Course marks secured so far from completed assessments. */
  securedMarks: number;
  /** Course marks still earnable from pending/undefined assessments. */
  obtainableMarks: number;
  /** Highest attainable final contribution: secured + obtainable. */
  maxPossibleMarks: number;
  /** Pooled percentage over graded assessments; null when none graded. */
  percentage: number | null;
  definedCount: number;
  completedCount: number;
  pendingCount: number;
}

export interface CourseScoreInput {
  totalMarks: number;
  categories: CategoryInput[];
  assessments: AssessmentInput[];
}

export interface CourseScore {
  totalMarks: number;
  securedMarks: number;
  /** Spec §12: total − secured (distance to full marks). */
  remainingMarks: number;
  /** Spec §12: secured + still-obtainable marks. */
  maxPossibleScore: number;
  obtainableRemainingMarks: number;
  /** Secured percentage of the course total, 0 when total ≤ 0. */
  percentage: number;
  categories: CategoryScore[];
}

/** Percentage in [0, 100], 0 when maximum ≤ 0, rounded (no float artifacts). */
export function percentage(obtained: unknown, maximum: unknown): number {
  const max = toFiniteNumber(maximum);
  if (max <= 0) return 0;
  const obtainedNum = toFiniteNumber(obtained);
  const raw = (obtainedNum / max) * 100;
  return roundTo(Math.min(100, Math.max(0, raw)));
}

/** Attendance Method B: 24/28 classes → 85.714286%. */
export function ratioToPercentage(part: unknown, whole: unknown): number {
  return percentage(part, whole);
}

/** Converts a percentage into course marks for a configured weight (§11). */
export function percentageToMarks(
  pct: unknown,
  categoryWeight: unknown
): number {
  const weight = toFiniteNumber(categoryWeight);
  if (weight <= 0) return 0;
  const clamped = Math.min(100, Math.max(0, toFiniteNumber(pct)));
  return roundTo((clamped / 100) * weight);
}

/** Sum of category weights (structure validation + UI display share it). */
export function totalWeight(categories: { weight: number }[]): number {
  return roundTo(
    categories.reduce(
      (sum, c) => sum + Math.max(0, toFiniteNumber(c.weight)),
      0
    )
  );
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function calculateCategoryScore(
  category: CategoryInput,
  assessments: AssessmentInput[]
): CategoryScore {
  const weight = Math.max(0, toFiniteNumber(category.weight));
  const inCategory = assessments.filter((a) => a.category_id === category.id);

  const defined = inCategory.filter(
    (a) => toFiniteNumber(a.maximum_marks) > 0
  );
  const completed = defined.filter(
    (a) => a.status === "completed" && a.obtained_marks !== null
  );
  const pending = defined.filter((a) => !completed.includes(a));

  const definedMax = sum(defined.map((a) => toFiniteNumber(a.maximum_marks)));
  const completedMax = sum(
    completed.map((a) => toFiniteNumber(a.maximum_marks))
  );
  const pendingMax = sum(pending.map((a) => toFiniteNumber(a.maximum_marks)));
  const obtainedSum = sum(
    completed.map((a) => toFiniteNumber(a.obtained_marks))
  );

  if (defined.length === 0 || definedMax <= 0) {
    // Nothing defined yet: the full weight is still earnable.
    return {
      categoryId: category.id,
      name: category.name,
      weight,
      securedMarks: 0,
      obtainableMarks: roundTo(weight),
      maxPossibleMarks: roundTo(weight),
      percentage: null,
      definedCount: inCategory.length,
      completedCount: 0,
      pendingCount: 0,
    };
  }

  const secured = roundTo((obtainedSum / definedMax) * weight);
  const bestFinal = roundTo(
    ((obtainedSum + pendingMax) / definedMax) * weight
  );
  const maxPossible = roundTo(Math.min(weight, Math.max(secured, bestFinal)));

  return {
    categoryId: category.id,
    name: category.name,
    weight,
    securedMarks: secured,
    obtainableMarks: roundTo(Math.max(0, maxPossible - secured)),
    maxPossibleMarks: maxPossible,
    percentage:
      completed.length > 0 ? percentage(obtainedSum, completedMax) : null,
    definedCount: defined.length,
    completedCount: completed.length,
    pendingCount: pending.length,
  };
}

export function calculateCourseScore(input: CourseScoreInput): CourseScore {
  const totalMarks = Math.max(0, toFiniteNumber(input.totalMarks));
  const categories = input.categories.map((category) =>
    calculateCategoryScore(category, input.assessments)
  );

  const securedMarks = roundTo(sum(categories.map((c) => c.securedMarks)));
  const obtainableRemainingMarks = roundTo(
    sum(categories.map((c) => c.obtainableMarks))
  );
  const maxPossibleScore = roundTo(
    Math.min(totalMarks, securedMarks + obtainableRemainingMarks)
  );

  return {
    totalMarks,
    securedMarks,
    remainingMarks: roundTo(Math.max(0, totalMarks - securedMarks)),
    maxPossibleScore,
    obtainableRemainingMarks,
    percentage: percentage(securedMarks, totalMarks),
    categories,
  };
}
