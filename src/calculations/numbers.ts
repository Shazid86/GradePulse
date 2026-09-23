/**
 * Numeric safety helpers for the calculation engine.
 * All engine outputs pass through roundTo so floating-point artifacts
 * (e.g. 79.99999999999999) never reach the UI or tests.
 */

/** Default precision for derived academic values (marks, percentages). */
export const PRECISION = 6;

/** Coerces any runtime value to a finite number (0 for NaN/±Infinity). */
export function toFiniteNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Rounds to `decimals` places and normalizes -0 → 0. */
export function roundTo(value: number, decimals: number = PRECISION): number {
  const n = toFiniteNumber(value);
  if (!Number.isFinite(n)) return 0;
  const rounded = Number(n.toFixed(decimals));
  return rounded === 0 ? 0 : rounded;
}
