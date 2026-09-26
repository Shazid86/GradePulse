import { roundTo, toFiniteNumber } from "./numbers";

/**
 * Target / requirement math (spec §12, §14).
 * Pure projections — no prediction, only arithmetic.
 */

/** The target percentage expressed in course marks, clamped to [0, 100]%. */
export function targetMarks(
  targetPercentage: unknown,
  totalMarks: unknown
): number {
  const total = Math.max(0, toFiniteNumber(totalMarks));
  const pct = Math.min(100, Math.max(0, toFiniteNumber(targetPercentage)));
  return roundTo((pct / 100) * total);
}

/**
 * Marks still needed to reach the target: max(0, target − secured).
 * Returns 0 when the target is already achieved.
 */
export function requiredMarks(input: {
  securedMarks: unknown;
  targetPercentage: unknown;
  totalMarks: unknown;
}): number {
  const target = targetMarks(input.targetPercentage, input.totalMarks);
  return roundTo(Math.max(0, target - toFiniteNumber(input.securedMarks)));
}

/**
 * required / remaining × 100 (spec §12).
 * Returns 0 when nothing is required or nothing remains to be graded.
 * May exceed 100 — that signals an unattainable target (surfaced in Phase 5).
 */
export function requiredRemainingPercentage(input: {
  required: unknown;
  remaining: unknown;
}): number {
  const required = toFiniteNumber(input.required);
  if (required <= 0) return 0;
  const remaining = toFiniteNumber(input.remaining);
  if (remaining <= 0) return 0;
  return roundTo((required / remaining) * 100);
}

/**
 * Target analysis (spec §14): achieved / achievable / impossible.
 * Impossible is decided by the honest ceiling (maxPossibleScore), NOT by
 * the required percentage — lost marks can make a target unreachable even
 * when required/remaining ≤ 100%.
 */
export type TargetStatus = "achieved" | "achievable" | "impossible";

export interface TargetAnalysis {
  status: TargetStatus;
  /** Target expressed in course marks. */
  targetMarks: number;
  securedMarks: number;
  /** 0 when the target is already achieved. */
  requiredMarks: number;
  /** total − secured (distance to full marks). */
  remainingMarks: number;
  /** required / remaining × 100 (0 when remaining is 0). */
  requiredRemainingPercentage: number;
  /** Still-earnable marks (maxPossible − secured). */
  obtainableRemainingMarks: number;
}

export function analyzeTarget(input: {
  securedMarks: unknown;
  maxPossibleScore: unknown;
  totalMarks: unknown;
  targetPercentage: unknown;
}): TargetAnalysis {
  const total = Math.max(0, toFiniteNumber(input.totalMarks));
  const secured = Math.max(0, toFiniteNumber(input.securedMarks));
  const maxPossible = Math.max(0, toFiniteNumber(input.maxPossibleScore));
  const target = targetMarks(input.targetPercentage, total);

  const required = roundTo(Math.max(0, target - secured));
  const remaining = roundTo(Math.max(0, total - secured));
  const obtainable = roundTo(Math.max(0, maxPossible - secured));

  const status: TargetStatus =
    required <= 0 ? "achieved" : maxPossible < target ? "impossible" : "achievable";

  return {
    status,
    targetMarks: roundTo(target),
    securedMarks: roundTo(secured),
    requiredMarks: required,
    remainingMarks: remaining,
    requiredRemainingPercentage: requiredRemainingPercentage({
      required,
      remaining,
    }),
    obtainableRemainingMarks: obtainable,
  };
}
