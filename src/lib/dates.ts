/**
 * Date helpers for the academic calendar — local-timezone, date-only,
 * DST-safe (pure UTC arithmetic on parsed Y/M/D, no timezone math).
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Today as YYYY-MM-DD in the LOCAL timezone. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toUtcMs(dateStr: string): number | null {
  const match = ISO_DATE.exec(dateStr);
  if (!match) return null;
  const [, y, m, d] = match;
  const ms = Date.UTC(Number(y), Number(m) - 1, Number(d));
  const roundtrip = new Date(ms);
  // Reject impossible dates like 2026-02-31 (silently rolls over otherwise).
  if (
    roundtrip.getUTCFullYear() !== Number(y) ||
    roundtrip.getUTCMonth() !== Number(m) - 1 ||
    roundtrip.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return ms;
}

/** True for real calendar dates in YYYY-MM-DD form (rejects 2026-02-31). */
export function isValidIsoDate(dateStr: string): boolean {
  return toUtcMs(dateStr) !== null;
}

/** Whole days from `from` (default: today) to `dateStr`. Negative = past. */
export function daysUntil(
  dateStr: string,
  from: string = todayIso()
): number | null {
  const target = toUtcMs(dateStr);
  const origin = toUtcMs(from);
  if (target === null || origin === null) return null;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((target - origin) / MS_PER_DAY);
}

/** Human countdown label for a signed day count. */
export function formatCountdown(days: number | null): string {
  if (days === null) return "Date unknown";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "1 day ago";
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}
