import { calculateCourseScore, percentage, type CourseScoreInput } from "./score";
import { roundTo, toFiniteNumber } from "./numbers";

/**
 * What-if simulator engine (spec §15).
 *
 * Runs against the SAME category model as every other calculation:
 * - assessment assumptions replace a pending assessment's marks
 *   (clamped to its maximum, treated as graded);
 * - category assumptions cover capacity with nothing left to type into
 *   (categories with no assessments defined), clamped to what that category
 *   can still earn.
 * Invalid entries (out-of-range indices, unknown categories, non-finite
 * numbers) are ignored — never NaN, never Infinity.
 */

export interface WhatIfAssumptions {
  assessments?: { index: number; obtainedMarks: unknown }[];
  categories?: { categoryId: string; assumedMarks: unknown }[];
}

export interface Projection {
  /** Projected course marks after the assumptions. */
  projectedMarks: number;
  projectedPercentage: number;
  /** Projected − current secured (0 when nothing entered). */
  deltaMarks: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function finiteOrNull(value: unknown): number | null {
  if (typeof value === "number" && !Number.isFinite(value)) return null;
  const n = toFiniteNumber(value);
  return Number.isFinite(n) ? n : null;
}

export function projectCourseScore(
  input: CourseScoreInput,
  whatIf: WhatIfAssumptions
): Projection {
  const cloned = input.assessments.map((a) => ({ ...a }));

  for (const entry of whatIf.assessments ?? []) {
    const index = entry.index;
    if (!Number.isInteger(index) || index < 0 || index >= cloned.length) {
      continue;
    }
    const assumed = finiteOrNull(entry.obtainedMarks);
    if (assumed === null) continue;
    const max = toFiniteNumber(cloned[index].maximum_marks);
    if (max <= 0) continue;
    cloned[index] = {
      ...cloned[index],
      obtained_marks: clamp(assumed, 0, max),
      status: "completed",
    };
  }

  const base = calculateCourseScore({ ...input, assessments: cloned });

  let extra = 0;
  const byId = new Map(base.categories.map((c) => [c.categoryId, c]));
  for (const entry of whatIf.categories ?? []) {
    const category = byId.get(entry.categoryId);
    const assumed = finiteOrNull(entry.assumedMarks);
    if (!category || assumed === null) continue;
    extra += clamp(assumed, 0, category.obtainableMarks);
  }

  const projectedMarks = roundTo(
    Math.min(base.totalMarks, base.securedMarks + extra)
  );
  // Delta is measured against the CURRENT state (no assumptions), so
  // assessment entries count toward the change too.
  const currentSecured = calculateCourseScore(input).securedMarks;

  return {
    projectedMarks,
    projectedPercentage: percentage(projectedMarks, base.totalMarks),
    deltaMarks: roundTo(projectedMarks - currentSecured),
  };
}
