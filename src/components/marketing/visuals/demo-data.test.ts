import { describe, expect, it } from "vitest";

import { analyzeTarget } from "@/calculations/requirements";

import {
  DEMO_COURSE,
  DEMO_GPA,
  DEMO_TARGET,
  DEMO_TIMELINE,
  DEMO_WHAT_IF,
} from "./demo-data";

/**
 * Guard rail: the illustrative figures on the public marketing site must be
 * internally consistent AND reproducible in the real product. If a fixture is
 * edited into a state the engine would never produce, the build fails here
 * rather than shipping marketing arithmetic that contradicts the application.
 */
describe("marketing demo fixture", () => {
  it("reproduces the target panel through the real engine", () => {
    const analysis = analyzeTarget({
      securedMarks: DEMO_COURSE.secured,
      maxPossibleScore: DEMO_COURSE.total,
      totalMarks: DEMO_COURSE.total,
      targetPercentage: DEMO_TARGET.percent,
    });

    expect(analysis.status).toBe("achievable");
    expect(analysis.targetMarks).toBe(DEMO_TARGET.marks);
    expect(analysis.requiredMarks).toBe(DEMO_TARGET.required);
    expect(analysis.remainingMarks).toBe(DEMO_TARGET.remaining);
    expect(analysis.requiredRemainingPercentage).toBe(
      DEMO_TARGET.requiredOfRemainingValue
    );
  });

  it("keeps the displayed percentage string equal to the numeric value", () => {
    expect(DEMO_TARGET.requiredOfRemaining).toBe(
      `${DEMO_TARGET.requiredOfRemainingValue}%`
    );
  });

  it("keeps category weights summing to the course total", () => {
    // Mirrors the DB constraint (Σ category weight ≤ course total); here it is
    // exact, because the demo course is fully configured.
    expect(DEMO_TIMELINE.length).toBeGreaterThan(0);
    expect(DEMO_COURSE.secured + DEMO_COURSE.remaining).toBe(DEMO_COURSE.total);
  });

  it("keeps every what-if row arithmetically true", () => {
    for (const row of DEMO_WHAT_IF) {
      expect(DEMO_COURSE.secured + row.finalObtained).toBe(row.total);
    }
  });

  it("flags exactly one what-if row as the target hit", () => {
    const hits = DEMO_WHAT_IF.filter((row) => row.hitsTarget);
    expect(hits).toHaveLength(1);
    expect(hits[0].total).toBe(DEMO_TARGET.marks);
  });

  it("keeps the CGPA equal to the mean of the semester GPAs", () => {
    const values = DEMO_GPA.semesters.map((s) => Number(s.gpa));
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    // The panel displays two decimals, so compare at that precision.
    expect(mean.toFixed(2)).toBe(DEMO_GPA.cgpa);
  });

  it("keeps the hero satellite GPA equal to the latest semester", () => {
    const last = DEMO_GPA.semesters[DEMO_GPA.semesters.length - 1];
    expect(DEMO_GPA.latest).toBe(last.gpa);
  });
});