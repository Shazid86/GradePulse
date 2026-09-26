import { describe, expect, it } from "vitest";
import { analyzeTarget } from "./requirements";

const base = {
  securedMarks: 61,
  maxPossibleScore: 100,
  totalMarks: 100,
  targetPercentage: 80,
};

describe("analyzeTarget (§14)", () => {
  it("spec example: needs 19 of the remaining 39 (48.7%)", () => {
    const a = analyzeTarget(base);
    expect(a.status).toBe("achievable");
    expect(a.targetMarks).toBe(80);
    expect(a.requiredMarks).toBe(19);
    expect(a.remainingMarks).toBe(39);
    expect(a.requiredRemainingPercentage).toBe(48.717949); // 19/39
    expect(a.obtainableRemainingMarks).toBe(39); // maxPossible 100
  });

  it("target already achieved → required 0", () => {
    const a = analyzeTarget({ ...base, securedMarks: 90 });
    expect(a.status).toBe("achieved");
    expect(a.requiredMarks).toBe(0);
    expect(a.requiredRemainingPercentage).toBe(0);
  });

  it("target exactly achievable at the ceiling", () => {
    const a = analyzeTarget({
      ...base,
      securedMarks: 61,
      maxPossibleScore: 80, // exactly the target
    });
    expect(a.status).toBe("achievable");
    expect(a.requiredMarks).toBe(19);
    expect(a.obtainableRemainingMarks).toBe(19);
  });

  it("target impossible when max possible stays below it", () => {
    const a = analyzeTarget({ ...base, maxPossibleScore: 70 });
    expect(a.status).toBe("impossible");
    expect(a.requiredMarks).toBe(19);
    expect(a.obtainableRemainingMarks).toBe(9);
    // required/remaining ≤ 100 even though impossible → ceiling decides
    expect(a.requiredRemainingPercentage).toBeLessThanOrEqual(100);
  });

  it("zero remaining marks: completed course is achieved", () => {
    const a = analyzeTarget({
      securedMarks: 100,
      maxPossibleScore: 100,
      totalMarks: 100,
      targetPercentage: 100,
    });
    expect(a.status).toBe("achieved");
    expect(a.remainingMarks).toBe(0);
    expect(a.requiredRemainingPercentage).toBe(0);
  });

  it("decimal scores", () => {
    const a = analyzeTarget({ ...base, securedMarks: 61.5 });
    expect(a.requiredMarks).toBe(18.5);
    expect(a.remainingMarks).toBe(38.5);
    expect(a.requiredRemainingPercentage).toBe(48.051948); // 18.5/38.5
  });

  it("100% target beyond the ceiling is impossible", () => {
    const a = analyzeTarget({ ...base, targetPercentage: 100, maxPossibleScore: 91 });
    expect(a.status).toBe("impossible");
    expect(a.targetMarks).toBe(100);
  });

  it("100% target achieved on a perfect course", () => {
    const a = analyzeTarget({
      securedMarks: 100,
      maxPossibleScore: 100,
      totalMarks: 100,
      targetPercentage: 100,
    });
    expect(a.status).toBe("achieved");
  });

  it("invalid inputs are clamped, never NaN", () => {
    const a = analyzeTarget({
      securedMarks: -10,
      maxPossibleScore: Number.NaN,
      totalMarks: 100,
      targetPercentage: 150, // clamped to 100%
    });
    expect(a.securedMarks).toBe(0);
    expect(a.targetMarks).toBe(100);
    // NaN ceiling → treated as 0 → honest "impossible", never a false promise
    expect(a.status).toBe("impossible");
    expect(Number.isNaN(a.requiredRemainingPercentage)).toBe(false);

    const zero = analyzeTarget({
      securedMarks: Number.POSITIVE_INFINITY,
      maxPossibleScore: 50,
      totalMarks: 0,
      targetPercentage: 0,
    });
    // Infinity → treated as 0 by toFiniteNumber; target 0 → achieved
    expect(zero.status).toBe("achieved");
  });
});
