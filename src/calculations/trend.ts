import { percentage } from "./score";
import { roundTo } from "./numbers";

/**
 * Trend analysis (spec §17): numerical direction only —
 * improving / declining / stable — never claims about the student.
 */

export type TrendDirection = "improving" | "declining" | "stable";

/**
 * Slope (percentage points per assessment step) below which the trend is
 * considered stable. Documented and tunable — no hidden rules.
 */
export const TREND_STABLE_THRESHOLD = 1;

export interface PerformancePoint {
  date: string;
  title: string;
  percentage: number;
}

export interface TrendAnalysis {
  direction: TrendDirection;
  /** Least-squares slope in percentage points per step (3 dp). */
  slope: number;
  sampleSize: number;
}

interface AssessLike {
  title: string;
  date: string | null;
  obtained_marks: number | null;
  maximum_marks: number;
  status: "pending" | "completed";
}

/**
 * Chronological series of graded, dated assessments for charts/trends.
 * Undated or ungraded items are excluded (no fabricated x-positions).
 */
export function buildPerformanceSeries(
  assessments: AssessLike[]
): PerformancePoint[] {
  return assessments
    .filter(
      (a) => a.status === "completed" && a.obtained_marks !== null && !!a.date
    )
    .map((a) => ({
      date: a.date as string,
      title: a.title,
      percentage: percentage(a.obtained_marks, a.maximum_marks),
    }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * Classifies the direction of a percentage series via least-squares slope.
 * Fewer than 2 points → stable with sampleSize recorded (UI hides it).
 */
export function analyzeTrend(
  points: { percentage: number }[]
): TrendAnalysis {
  const n = points.length;
  if (n < 2) {
    return { direction: "stable", slope: 0, sampleSize: n };
  }

  const meanX = (n - 1) / 2;
  const meanY = points.reduce((sum, p) => sum + p.percentage, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (i - meanX) * (points[i].percentage - meanY);
    sxx += (i - meanX) ** 2;
  }
  const slope = roundTo(sxx === 0 ? 0 : sxy / sxx, 3);

  const direction: TrendDirection =
    slope > TREND_STABLE_THRESHOLD
      ? "improving"
      : slope < -TREND_STABLE_THRESHOLD
        ? "declining"
        : "stable";

  return { direction, slope, sampleSize: n };
}
