/**
 * Illustrative figures for the public marketing surface only.
 *
 * Every number in this file obeys three rules:
 *   1. it is demo data — never fetched, never persisted, never labelled "your"
 *   2. it is internally consistent, because a visitor can check the arithmetic
 *   3. it is reproducible in the real product — enter 60 / 100 with an 85%
 *      target in /calculator and the engine returns the same 25-of-40, 62.5%
 *
 * Values are stored display-ready so that no marketing component performs
 * arithmetic of its own.
 */

export const DEMO_COURSE = {
  name: "Database Systems",
  code: "CSE-3101",
  total: 100,
  /** Obtained so far. */
  secured: 60,
  /** Still obtainable — the Final carries this weight. */
  remaining: 40,
  /** secured / total × 100, precomputed. */
  percent: 60,
} as const;

/**
 * Weights sum to the course total (10 + 20 + 10 + 20 + 40 = 100) and the four
 * completed categories sum to `secured` (10 + 20 + 10 + 20 = 60). So the demo
 * adds up: 60 obtained, 40 still open, all of it in the Final.
 */
export const DEMO_CATEGORIES = [
  { name: "Attendance", weight: 10, secured: 10, done: true },
  { name: "Class Tests", weight: 20, secured: 20, done: true },
  { name: "Assignments", weight: 10, secured: 10, done: true },
  { name: "Midterm", weight: 20, secured: 20, done: true },
  { name: "Final", weight: 40, secured: 0, done: false },
] as const;

export const DEMO_TARGET = {
  /** Requested overall percentage. */
  percent: 85,
  /** Same target expressed in course marks (85% of 100). */
  marks: 85,
  /** 85 − 60 */
  required: 25,
  /** Secure / percentage of the remaining marks: 25 / 40 → 62.5% */
  requiredOfRemaining: "62.5%",
  /** The same value numerically, for bar widths. */
  requiredOfRemainingValue: 62.5,
  remaining: 40,
} as const;

/**
 * The demo run is perfect so far (60 of 60), which is the honest scenario for
 * "60 secured, 40 remaining": the whole story is what the Final now demands.
 */
export const DEMO_TREND = {
  direction: "stable",
  label: "Stable",
  detail: "60 of 60 marks so far",
} as const;

export const DEMO_TIMELINE = [
  { label: "CT 1", marks: "10 / 10", done: true },
  { label: "CT 2", marks: "10 / 10", done: true },
  { label: "Assignment", marks: "10 / 10", done: true },
  { label: "Midterm", marks: "20 / 20", done: true },
  { label: "Final", marks: "pending", done: false },
] as const;

/**
 * Each row is one worked outcome: `finalObtained` of the 40 remaining marks
 * gives `total` out of 100. The 25/40 row is the target: 60 + 25 = 85.
 */
export const DEMO_WHAT_IF = [
  { finalObtained: 20, total: 80, hitsTarget: false },
  { finalObtained: 25, total: 85, hitsTarget: true },
  { finalObtained: 30, total: 90, hitsTarget: false },
  { finalObtained: 35, total: 95, hitsTarget: false },
] as const;

/**
 * Equal credits across three semesters, so the CGPA is checkable:
 * (3.52 + 3.68 + 3.74) / 3 = 3.6467 → 3.65
 */
export const DEMO_GPA = {
  semesters: [
    { name: "Semester 1", gpa: "3.52" },
    { name: "Semester 2", gpa: "3.68" },
    { name: "Semester 3", gpa: "3.74" },
  ],
  cgpa: "3.65",
  /** Latest semester — the value the hero satellite shows. */
  latest: "3.74",
} as const;

export const DEMO_NOTICE =
  "Illustrative figures, not real student data.";