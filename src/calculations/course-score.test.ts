import { describe, expect, it } from "vitest";
import { calculateCourseScore, type AssessmentInput } from "./score";

const done = (
  category_id: string,
  obtained_marks: number,
  maximum_marks: number
): AssessmentInput => ({
  category_id,
  obtained_marks,
  maximum_marks,
  status: "completed",
});

describe("calculateCourseScore", () => {
  it("combines categories: secured, remaining, max possible (§12)", () => {
    const score = calculateCourseScore({
      totalMarks: 100,
      categories: [
        { id: "mid", name: "Midterm", weight: 60 },
        { id: "fin", name: "Final", weight: 40 },
      ],
      assessments: [done("mid", 48, 60)],
    });
    expect(score.securedMarks).toBe(48);
    expect(score.remainingMarks).toBe(52); // total − secured
    expect(score.maxPossibleScore).toBe(88); // 48 + 40 still earnable
    expect(score.obtainableRemainingMarks).toBe(40);
    expect(score.percentage).toBe(48);
    expect(score.categories).toHaveLength(2);
  });

  it("closed categories stop contributing to max possible", () => {
    const score = calculateCourseScore({
      totalMarks: 100,
      categories: [{ id: "a", name: "A", weight: 50 }],
      assessments: [done("a", 40, 50)],
    });
    expect(score.securedMarks).toBe(40);
    expect(score.maxPossibleScore).toBe(40); // nothing pending
    expect(score.obtainableRemainingMarks).toBe(0);
    expect(score.remainingMarks).toBe(60); // distance to full marks
  });

  it("handles zero total safely", () => {
    const score = calculateCourseScore({
      totalMarks: 0,
      categories: [{ id: "a", name: "A", weight: 100 }],
      assessments: [],
    });
    expect(score.percentage).toBe(0);
    expect(score.remainingMarks).toBe(0);
    expect(score.maxPossibleScore).toBe(0);
  });

  it("coerces negative totals to 0", () => {
    const score = calculateCourseScore({
      totalMarks: -5,
      categories: [],
      assessments: [],
    });
    expect(score.totalMarks).toBe(0);
    expect(score.percentage).toBe(0);
  });

  it("caps max possible at the course total", () => {
    const score = calculateCourseScore({
      totalMarks: 100,
      categories: [
        { id: "a", name: "A", weight: 80 },
        { id: "b", name: "B", weight: 30 }, // over-weighted structure
      ],
      assessments: [],
    });
    expect(score.maxPossibleScore).toBe(100);
  });
});
