import { describe, expect, it } from "vitest";
import { calculateAssessmentProgression } from "./progression";

const categories = [
  { id: "ct", weight: 20 },
  { id: "asg", weight: 30 },
];
const assessments = [
  { category_id: "ct", title: "CT1", date: "2026-09-10", obtained_marks: 8, maximum_marks: 10, status: "completed" as const },
  { category_id: "ct", title: "CT2", date: "2026-09-20", obtained_marks: null, maximum_marks: 10, status: "pending" as const },
  { category_id: "asg", title: "A1", date: "2026-09-05", obtained_marks: 24, maximum_marks: 30, status: "completed" as const },
  { category_id: "asg", title: "A2", date: null, obtained_marks: 30, maximum_marks: 30, status: "completed" as const },
];

describe("calculateAssessmentProgression (§16)", () => {
  it("orders chronologically and accumulates secured marks", () => {
    const points = calculateAssessmentProgression({
      course: { totalMarks: 100 },
      categories,
      assessments,
    });
    // definedMax(asg) = A1+A2 = 60 (undated still counts in the model)
    // A1: 24/60 × 30 = 12 → 12; CT1: 8/20 × 20 = 8 → 20
    expect(points.map((p) => p.title)).toEqual(["A1", "CT1"]);
    expect(points[0].contribution).toBe(12);
    expect(points[1].contribution).toBe(8);
    expect(points[1].cumulative).toBe(20);
  });

  it("matches course securedMarks when all completed items are dated", () => {
    const points = calculateAssessmentProgression({
      course: { totalMarks: 100 },
      categories,
      assessments: assessments.filter((a) => a.date !== null),
    });
    expect(points.at(-1)?.cumulative).toBe(32); // 24 + 8
  });

  it("returns empty for no graded dated assessments", () => {
    expect(
      calculateAssessmentProgression({
        course: { totalMarks: 100 },
        categories: [{ id: "ct", weight: 20 }],
        assessments: [],
      })
    ).toEqual([]);
  });

  it("guards unknown categories (contribution 0)", () => {
    const points = calculateAssessmentProgression({
      course: { totalMarks: 50 },
      categories: [],
      assessments: [
        { category_id: "ghost", title: "X", date: "2026-01-01", obtained_marks: 5, maximum_marks: 10, status: "completed" },
      ],
    });
    expect(points).toHaveLength(1);
    expect(points[0].contribution).toBe(0);
    expect(points[0].cumulative).toBe(0);
  });
});
