import { describe, expect, it } from "vitest";
import { projectCourseScore } from "./projection";
import type { CourseScoreInput } from "./score";

// Course A: Attendance10 (9/10 closed), ClassTests20 (CT1 8/10 done,
// CT2 pending 10), Assignments30 (closed 24/30), Final40 (undefined).
// Current secured: 9 + 8 + 24 = 41 → 41%; maxPossible 91.
const input: CourseScoreInput = {
  totalMarks: 100,
  categories: [
    { id: "att", name: "Attendance", weight: 10 },
    { id: "ct", name: "Class Tests", weight: 20 },
    { id: "asg", name: "Assignments", weight: 30 },
    { id: "fin", name: "Final", weight: 40 },
  ],
  assessments: [
    { category_id: "att", obtained_marks: 9, maximum_marks: 10, status: "completed" },
    { category_id: "ct", obtained_marks: 8, maximum_marks: 10, status: "completed" },
    { category_id: "ct", obtained_marks: null, maximum_marks: 10, status: "pending" },
    { category_id: "asg", obtained_marks: 24, maximum_marks: 30, status: "completed" },
  ],
};

describe("projectCourseScore (§15)", () => {
  it("no assumptions → projection equals current state", () => {
    const p = projectCourseScore(input, {});
    expect(p.projectedMarks).toBe(41);
    expect(p.projectedPercentage).toBe(41);
    expect(p.deltaMarks).toBe(0);
  });

  it("pending assessment entered → secure its share", () => {
    // CT2 = 10/10 → (8+10)/20 × 20 = 18 → 9+18+24 = 51
    const p = projectCourseScore(input, {
      assessments: [{ index: 2, obtainedMarks: 10 }],
    });
    expect(p.projectedMarks).toBe(51);
    expect(p.deltaMarks).toBe(10);
    expect(p.projectedPercentage).toBe(51);
  });

  it("clamps entered marks to [0, maximum]", () => {
    const high = projectCourseScore(input, {
      assessments: [{ index: 2, obtainedMarks: 999 }],
    });
    expect(high.projectedMarks).toBe(51); // clamped to 10

    const low = projectCourseScore(input, {
      assessments: [{ index: 2, obtainedMarks: -50 }],
    });
    expect(low.projectedMarks).toBe(41); // clamped to 0 → +0

    const dec = projectCourseScore(input, {
      assessments: [{ index: 2, obtainedMarks: 5.5 }],
    });
    expect(dec.projectedMarks).toBe(46.5); // (8+5.5)/20×20 = 13.5 → 46.5
  });

  it("unassessed category pool covers undefined capacity", () => {
    // Final undefined: 40 marks earnable; assume 30 → 41 + 30 = 71
    const p = projectCourseScore(input, {
      categories: [{ categoryId: "fin", assumedMarks: 30 }],
    });
    expect(p.projectedMarks).toBe(71);
    expect(p.projectedPercentage).toBe(71);
  });

  it("category assumption clamps to that category's obtainable", () => {
    const p = projectCourseScore(input, {
      categories: [{ categoryId: "fin", assumedMarks: 999 }],
    });
    expect(p.projectedMarks).toBe(81); // 41 + 40 (capped)
  });

  it("ignores invalid inputs (bad index, unknown category, NaN)", () => {
    const p = projectCourseScore(input, {
      assessments: [
        { index: 99, obtainedMarks: 10 },
        { index: -1, obtainedMarks: 10 },
        { index: 1.5, obtainedMarks: 10 },
        { index: 0, obtainedMarks: Number.NaN },
      ],
      categories: [{ categoryId: "ghost", assumedMarks: 10 }],
    });
    expect(p.projectedMarks).toBe(41);
    expect(Number.isNaN(p.projectedPercentage)).toBe(false);
  });

  it("projection never exceeds the course total", () => {
    const p = projectCourseScore(input, {
      assessments: [{ index: 2, obtainedMarks: 10 }],
      categories: [{ categoryId: "fin", assumedMarks: 40 }],
    });
    expect(p.projectedMarks).toBe(91); // honest ceiling, not 100
    expect(p.deltaMarks).toBe(50);
  });
});
