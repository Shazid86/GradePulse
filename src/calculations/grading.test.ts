import { describe, expect, it } from "vitest";
import {
  calculateGpa,
  gradeForCourse,
  gradeForPercentage,
  parseGradingScale,
} from "./grading";
import type { CourseScore } from "./score";

const scale4 = [
  { grade: "A", min_percentage: 80, grade_point: 4 },
  { grade: "B", min_percentage: 70, grade_point: 3 },
  { grade: "C", min_percentage: 60, grade_point: 2 },
  { grade: "D", min_percentage: 50, grade_point: 1 },
];

describe("parseGradingScale", () => {
  it("parses valid entries and sorts by threshold desc", () => {
    const parsed = parseGradingScale([
      { grade: "D", min_percentage: 50, grade_point: 1 },
      { grade: "A", min_percentage: 80, grade_point: 4 },
    ]);
    expect(parsed.map((e) => e.grade)).toEqual(["A", "D"]);
  });

  it("drops invalid rows and non-arrays", () => {
    expect(parseGradingScale("junk")).toEqual([]);
    expect(parseGradingScale(null)).toEqual([]);
    expect(
      parseGradingScale([
        { grade: "", min_percentage: 50, grade_point: 1 },
        { grade: "X", min_percentage: 150, grade_point: 1 },
        { grade: "Y", min_percentage: 50, grade_point: -1 },
        "not-an-object",
        null,
        { grade: "OK", min_percentage: 40, grade_point: 2.5 },
      ])
    ).toEqual([{ grade: "OK", min_percentage: 40, grade_point: 2.5 }]);
  });

  it("accepts decimal grade points (any scale magnitude)", () => {
    const parsed = parseGradingScale([
      { grade: "A+", min_percentage: 90, grade_point: 10 },
      { grade: "A", min_percentage: 80, grade_point: 3.75 },
    ]);
    expect(parsed[1].grade_point).toBe(3.75);
  });
});

describe("gradeForPercentage", () => {
  it("picks the highest threshold ≤ percentage (inclusive)", () => {
    const scale = parseGradingScale(scale4);
    expect(gradeForPercentage(scale, 80)?.grade).toBe("A"); // exact boundary
    expect(gradeForPercentage(scale, 79.999)?.grade).toBe("B"); // decimal below
    expect(gradeForPercentage(scale, 70)?.grade).toBe("B");
    expect(gradeForPercentage(scale, 100)?.grade).toBe("A");
  });

  it("returns null below the lowest threshold (no hard-coded F)", () => {
    const scale = parseGradingScale(scale4);
    expect(gradeForPercentage(scale, 49.9)).toBeNull();
  });

  it("returns null for empty scale or ungraded percentage", () => {
    expect(gradeForPercentage([], 95)).toBeNull();
    expect(gradeForPercentage(scale4, null)).toBeNull();
    expect(gradeForPercentage(scale4, Number.NaN)).toBeNull();
  });
});

describe("gradeForCourse", () => {
  const score = (percentage: number | null): Pick<
    CourseScore,
    "percentage" | "categories"
  > => ({
    percentage: percentage ?? 0,
    categories: [
      {
        categoryId: "c",
        name: "C",
        weight: 100,
        securedMarks: 41,
        obtainableMarks: 0,
        maxPossibleMarks: 41,
        percentage,
        definedCount: 1,
        completedCount: percentage === null ? 0 : 1,
        pendingCount: 0,
      },
    ],
  });

  it("never grades an ungraded course", () => {
    expect(gradeForCourse(score(null), scale4)).toBeNull();
  });

  it("grades a graded course from its configured scale", () => {
    expect(gradeForCourse(score(55), scale4)).toEqual({
      grade: "D",
      gradePoint: 1,
    });
    expect(gradeForCourse(score(41), scale4)).toBeNull(); // below the scale
    expect(gradeForCourse(score(55), [])).toBeNull(); // no scale yet
  });
});

describe("calculateGpa (§21)", () => {
  it("weights grade points by credits", () => {
    // A(4.0)×3 + B(3.0)×1 → (12+3)/4 = 3.75
    const r = calculateGpa([
      { credits: 3, gradePoint: 4 },
      { credits: 1, gradePoint: 3 },
    ]);
    expect(r.gpa).toBe(3.75);
    expect(r.gradedCredits).toBe(4);
    expect(r.gradedCourses).toBe(2);
  });

  it("excludes incomplete courses from both sides", () => {
    // Only the graded 3-credit course counts → 3.0, not dragged by the other
    const r = calculateGpa([
      { credits: 3, gradePoint: 3 },
      { credits: 4, gradePoint: null },
    ]);
    expect(r.gpa).toBe(3);
    expect(r.gradedCredits).toBe(3);
    expect(r.gradedCourses).toBe(1);
  });

  it("returns null when nothing is graded", () => {
    const r = calculateGpa([
      { credits: 3, gradePoint: null },
      { credits: 0, gradePoint: 4 }, // zero credits ignored
    ]);
    expect(r.gpa).toBeNull();
    expect(r.gradedCredits).toBe(0);
    expect(calculateGpa([]).gpa).toBeNull();
  });

  it("handles decimal grade points", () => {
    const r = calculateGpa([
      { credits: 3, gradePoint: 3.75 },
      { credits: 3, gradePoint: 3.25 },
    ]);
    expect(r.gpa).toBe(3.5);
  });

  it("CGPA: one flat list across completed semesters", () => {
    // Semester1: A4×3; Semester2: B3×3 + A4×3 → (12 + 9 + 12)/9 = 3.666…
    const cgpa = calculateGpa([
      { credits: 3, gradePoint: 4 },
      { credits: 3, gradePoint: 3 },
      { credits: 3, gradePoint: 4 },
    ]);
    expect(cgpa.gpa).toBe(3.666667);
    expect(cgpa.gradedCredits).toBe(9);
    expect(cgpa.gradedCourses).toBe(3);
  });

  it("ignores non-finite grade points", () => {
    const r = calculateGpa([
      { credits: 3, gradePoint: Number.NaN },
      { credits: 2, gradePoint: 4 },
    ]);
    expect(r.gpa).toBe(4);
    expect(r.gradedCourses).toBe(1);
  });
});
