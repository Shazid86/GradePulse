import { describe, expect, it } from "vitest";
import {
  calculateSemesterScore,
  pickStrongestWeakest,
  type CourseScore,
} from "./score";

const course = (
  totalMarks: number,
  securedMarks: number
): Pick<CourseScore, "totalMarks" | "securedMarks"> => ({
  totalMarks,
  securedMarks,
});

describe("calculateSemesterScore (§22)", () => {
  it("aggregates secured and total marks across courses", () => {
    const score = calculateSemesterScore([
      course(100, 72),
      course(100, 61),
      course(50, 30),
    ]);
    expect(score.courseCount).toBe(3);
    expect(score.totalMarks).toBe(250);
    expect(score.securedMarks).toBe(163);
    expect(score.remainingMarks).toBe(87);
    expect(score.percentage).toBe(65.2); // 163/250
  });

  it("returns zeros for an empty semester", () => {
    const score = calculateSemesterScore([]);
    expect(score.courseCount).toBe(0);
    expect(score.percentage).toBe(0);
    expect(score.remainingMarks).toBe(0);
  });

  it("returns 0% when all course totals are 0 (no NaN/Infinity)", () => {
    const score = calculateSemesterScore([course(0, 0), course(0, 5)]);
    expect(score.percentage).toBe(0);
    expect(score.totalMarks).toBe(0);
  });

  it("clamps negative inputs", () => {
    const score = calculateSemesterScore([course(-10, -5)]);
    expect(score.totalMarks).toBe(0);
    expect(score.securedMarks).toBe(0);
  });
});

interface Named {
  name: string;
  pct: number | null;
}

const a: Named = { name: "Assignments", pct: 91 };
const b: Named = { name: "Class Tests", pct: 68 };
const c: Named = { name: "Final", pct: null };

describe("pickStrongestWeakest (§19)", () => {
  const scoreOf = (item: Named) => item.pct;

  it("picks strongest and weakest by percentage", () => {
    const { strongest, weakest } = pickStrongestWeakest(
      [b, a, c],
      scoreOf
    );
    expect(strongest).toBe(a);
    expect(weakest).toBe(b);
  });

  it("excludes null (ungraded) entries", () => {
    const { strongest, weakest } = pickStrongestWeakest([c], scoreOf);
    expect(strongest).toBeNull();
    expect(weakest).toBeNull();
  });

  it("returns nulls for an empty list", () => {
    const { strongest, weakest } = pickStrongestWeakest([], scoreOf);
    expect(strongest).toBeNull();
    expect(weakest).toBeNull();
  });

  it("points both at the single graded entry", () => {
    const { strongest, weakest } = pickStrongestWeakest([a, c], scoreOf);
    expect(strongest).toBe(a);
    expect(weakest).toBe(a);
  });

  it("keeps the first item on ties", () => {
    const first: Named = { name: "Lab", pct: 80 };
    const second: Named = { name: "Quiz", pct: 80 };
    const { strongest, weakest } = pickStrongestWeakest(
      [first, second],
      scoreOf
    );
    expect(strongest).toBe(first);
    expect(weakest).toBe(first); // both strict comparisons → first wins ties
  });

  it("skips non-finite scores", () => {
    const bad: Named = { name: "Bad", pct: Number.NaN };
    const { strongest } = pickStrongestWeakest([bad, b], scoreOf);
    expect(strongest).toBe(b);
  });
});
