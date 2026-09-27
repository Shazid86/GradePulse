import { roundTo } from "@/calculations/numbers";

/** Display formatting — thin wrappers over engine rounding (no new math). */

/** Marks for UI: "72", "8.5"; "—" when unknown. */
export function formatMarks(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return String(roundTo(n, 2));
}

/** Percentage for UI: "72%", "85.7%"; "—" when unknown. */
export function formatPercent(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${roundTo(n, 1)}%`;
}

/** GPA/grade point for UI: "3.70"; "—" when not available. */
export function formatGpa(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return Number(roundTo(n, 2)).toFixed(2);
}
