import { describe, expect, it } from "vitest";
import {
  COURSE_STATUS_LABELS,
  COURSE_STATUS_THRESHOLDS,
  assessCourseStatus,
} from "./status";
import {
  TREND_STABLE_THRESHOLD,
  analyzeTrend,
  buildPerformanceSeries,
} from "./trend";
import type { CourseScore } from "./score";

const cat = (percentage: number | null) => ({
  categoryId: "a",
  name: "A",
  weight: 100,
  securedMarks: 0,
  obtainableMarks: 0,
  maxPossibleMarks: 0,
  percentage,
  definedCount: 1,
  completedCount: percentage === null ? 0 : 1,
  pendingCount: 0,
});

const score = (
  percentage: number,
  maxPossibleScore: number,
  graded = true
): Pick<CourseScore, "percentage" | "maxPossibleScore" | "categories"> => ({
  percentage,
  maxPossibleScore,
  categories: [cat(graded ? percentage : null)],
});

describe("assessCourseStatus (§18)", () => {
  it("maps percentages to the documented thresholds", () => {
    const t = COURSE_STATUS_THRESHOLDS;
    expect(assessCourseStatus(score(t.strong, 100), 50)).toBe("strong");
    expect(assessCourseStatus(score(t.stable, 100), 50)).toBe("stable");
    expect(assessCourseStatus(score(t.needsAttention, 100), 50)).toBe(
      "needs_attention"
    );
    expect(assessCourseStatus(score(t.needsAttention - 0.1, 100), 50)).toBe(
      "at_risk"
    );
  });

  it("returns null when nothing is graded (no fake states)", () => {
    expect(assessCourseStatus(score(0, 100, false), 50)).toBeNull();
  });

  it("flags courses that mathematically cannot pass as At Risk", () => {
    expect(assessCourseStatus(score(85, 90), 95)).toBe("at_risk");
  });

  it("labels cover every status", () => {
    expect(Object.keys(COURSE_STATUS_LABELS)).toHaveLength(4);
    expect(COURSE_STATUS_LABELS.needs_attention).toBe("Needs Attention");
  });
});

describe("buildPerformanceSeries + analyzeTrend (§17)", () => {
  const assessments = [
    { title: "CT1", date: "2026-09-10", obtained_marks: 8, maximum_marks: 10, status: "completed" as const },
    { title: "Asg", date: "2026-09-05", obtained_marks: 9, maximum_marks: 10, status: "completed" as const },
    { title: "Pending", date: "2026-09-12", obtained_marks: null, maximum_marks: 10, status: "pending" as const },
    { title: "Undated", date: null, obtained_marks: 5, maximum_marks: 10, status: "completed" as const },
  ];

  it("filters to graded+dated items and sorts chronologically", () => {
    const series = buildPerformanceSeries(assessments);
    expect(series.map((p) => p.title)).toEqual(["Asg", "CT1"]);
    expect(series[0].percentage).toBe(90);
    expect(series[1].percentage).toBe(80);
  });

  it("classifies the spec example as declining (80, 90, 70, 73)", () => {
    const trend = analyzeTrend([
      { percentage: 80 },
      { percentage: 90 },
      { percentage: 70 },
      { percentage: 73 },
    ]);
    expect(trend.direction).toBe("declining");
    expect(trend.slope).toBe(-4.1);
    expect(trend.sampleSize).toBe(4);
  });

  it("classifies improving and stable series", () => {
    expect(
      analyzeTrend([{ percentage: 60 }, { percentage: 70 }, { percentage: 78 }])
        .direction
    ).toBe("improving");
    expect(
      analyzeTrend([{ percentage: 70 }, { percentage: 71 }, { percentage: 70.5 }])
        .direction
    ).toBe("stable");
  });

  it("uses the documented stable threshold (strict comparison)", () => {
    expect(TREND_STABLE_THRESHOLD).toBe(1);
    expect(
      analyzeTrend([{ percentage: 70 }, { percentage: 71 }]).direction
    ).toBe("stable"); // slope exactly 1 → stable
    expect(
      analyzeTrend([{ percentage: 70 }, { percentage: 72 }]).direction
    ).toBe("improving");
  });

  it("handles insufficient data without inventing direction", () => {
    expect(analyzeTrend([])).toEqual({
      direction: "stable",
      slope: 0,
      sampleSize: 0,
    });
    expect(analyzeTrend([{ percentage: 50 }]).sampleSize).toBe(1);
  });
});
