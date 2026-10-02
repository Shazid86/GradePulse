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

function formatUtcDate(
  value: string | null | undefined,
  withYear: boolean
): string {
  if (!value) return "No date";
  // Date-only column: force UTC midnight and format in UTC so the rendered
  // calendar date is identical in every timezone (no off-by-one shifts).
  const ms = Date.parse(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(ms)) return "No date";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

/** Date-only string → "Sep 30, 2026"; null/invalid → "No date". */
export function formatDate(value: string | null | undefined): string {
  return formatUtcDate(value, true);
}

/** Date-only string → "Sep 30"; null/invalid → "No date". */
export function formatDateShort(value: string | null | undefined): string {
  return formatUtcDate(value, false);
}
