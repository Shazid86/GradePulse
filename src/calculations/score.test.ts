import { describe, expect, it } from "vitest";
import {
  calculateCategoryScore,
  percentage,
  percentageToMarks,
  ratioToPercentage,
  totalWeight,
  type AssessmentInput,
  type CategoryInput,
} from "./score";

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

const pending = (
  category_id: string,
  maximum_marks: number
): AssessmentInput => ({
  category_id,
  obtained_marks: null,
  maximum_marks,
  status: "pending",
});

describe("percentage", () => {
  it("computes basic percentages", () => {
    expect(percentage(8, 10)).toBe(80);
    expect(percentage(0, 10)).toBe(0);
    expect(percentage(10, 10)).toBe(100);
  });

  it("returns 0 instead of NaN/Infinity for zero or invalid maximum", () => {
    expect(percentage(5, 0)).toBe(0);
    expect(percentage(0, 0)).toBe(0);
    expect(percentage(5, -10)).toBe(0);
  });

  it("handles decimals without artifacts", () => {
    expect(percentage(2, 3)).toBe(66.666667);
    expect(percentage(64, 81)).toBe(79.012346);
  });

  it("clamps out-of-range input", () => {
    expect(percentage(15, 10)).toBe(100);
    expect(percentage(-5, 10)).toBe(0);
  });
});

describe("attendance conversion (§11)", () => {
  it("converts attended/total to a percentage", () => {
    expect(ratioToPercentage(24, 28)).toBe(85.714286);
    expect(ratioToPercentage(0, 28)).toBe(0);
    expect(ratioToPercentage(28, 28)).toBe(100);
  });

  it("returns 0 when total classes is 0", () => {
    expect(ratioToPercentage(0, 0)).toBe(0);
  });

  it("converts a percentage to the configured weight", () => {
    expect(percentageToMarks(85.714286, 10)).toBe(8.571429);
    expect(percentageToMarks(80, 20)).toBe(16);
    expect(percentageToMarks(80, 0)).toBe(0);
    expect(percentageToMarks(150, 20)).toBe(20); // clamped
    expect(percentageToMarks(-10, 20)).toBe(0); // clamped
  });
});

describe("totalWeight", () => {
  it("sums weights and treats negatives as 0", () => {
    expect(totalWeight([{ weight: 20 }, { weight: 60.5 }])).toBe(80.5);
    expect(totalWeight([{ weight: -5 }, { weight: 10 }])).toBe(10);
    expect(totalWeight([])).toBe(0);
  });
});

describe("calculateCategoryScore", () => {
  const ct: CategoryInput = { id: "ct", name: "Class Tests", weight: 20 };

  it("§13: equal multi-assessment aggregation (8/10 + 7/10 → 15/20)", () => {
    const score = calculateCategoryScore(ct, [
      done("ct", 8, 10),
      done("ct", 7, 10),
    ]);
    expect(score.securedMarks).toBe(15);
    expect(score.percentage).toBe(75);
    expect(score.obtainableMarks).toBe(0); // category closed
    expect(score.maxPossibleMarks).toBe(15);
    expect(score.completedCount).toBe(2);
    expect(score.pendingCount).toBe(0);
  });

  it("secures only completed shares while assessments are pending", () => {
    const score = calculateCategoryScore(ct, [
      done("ct", 8, 10),
      pending("ct", 10),
    ]);
    expect(score.securedMarks).toBe(8); // 8/20 × 20
    expect(score.percentage).toBe(80); // graded performance so far
    expect(score.maxPossibleMarks).toBe(18); // (8+10)/20 × 20
    expect(score.obtainableMarks).toBe(10);
    expect(score.pendingCount).toBe(1);
  });

  it("treats a category with no assessments as fully earnable", () => {
    const score = calculateCategoryScore(ct, []);
    expect(score.securedMarks).toBe(0);
    expect(score.obtainableMarks).toBe(20);
    expect(score.maxPossibleMarks).toBe(20);
    expect(score.percentage).toBeNull();
    expect(score.definedCount).toBe(0);
  });

  it("aggregates three assessments without cross-category leakage", () => {
    const score = calculateCategoryScore(ct, [
      done("ct", 10, 10),
      done("ct", 9, 10),
      pending("ct", 10),
      done("asg", 5, 10), // different category — must not leak in
    ]);
    expect(score.definedCount).toBe(3);
    expect(score.completedCount).toBe(2);
    expect(score.securedMarks).toBe(12.666667); // 19/30 × 20
    expect(score.percentage).toBe(95); // 19/20 graded
    expect(score.maxPossibleMarks).toBe(19.333333); // (19+10)/30 × 20
    expect(score.obtainableMarks).toBe(6.666666); // still earnable
  });

  it("supports custom fractional weights", () => {
    const frac: CategoryInput = { id: "lab", name: "Lab", weight: 7.5 };
    const score = calculateCategoryScore(frac, [
      done("lab", 3, 4),
      pending("lab", 6),
    ]);
    expect(score.securedMarks).toBe(2.25); // 3/10 × 7.5
    expect(score.maxPossibleMarks).toBe(6.75); // 9/10 × 7.5
    expect(score.obtainableMarks).toBe(4.5);
  });

  it("never allows obtainable marks below 0 when everything is graded", () => {
    const score = calculateCategoryScore(ct, [
      done("ct", 3, 10),
      done("ct", 0, 10),
    ]);
    expect(score.obtainableMarks).toBe(0);
    expect(score.maxPossibleMarks).toBe(3);
  });
});
