import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "@/validations/auth";
import { semesterFormSchema } from "@/features/semesters/validations";
import {
  courseFormSchema,
  gradingScaleSchema,
} from "@/features/courses/validations";
import { categoryFormSchema } from "@/features/categories/validations";
import { assessmentFormSchema } from "@/features/assessments/validations";
import { targetFormSchema } from "@/features/targets/validations";
import { eventFormSchema } from "@/features/events/validations";

const UUID = "11111111-2222-4333-8444-555555555555";

describe("auth schemas", () => {
  it("rejects malformed emails and short passwords", () => {
    expect(signInSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(
      signUpSchema.safeParse({ email: "a@b.co", password: "short", confirmPassword: "short" })
        .success
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        email: "a@b.co",
        password: "longenough1",
        confirmPassword: "different1",
      }).success
    ).toBe(false);
    expect(signInSchema.safeParse({ email: " a@b.co ", password: "pw" }).success).toBe(true);
  });
});

describe("semester schema", () => {
  const base = {
    name: "Fall 2026",
    academic_year: "2026-2027",
    start_date: "2026-09-01",
    end_date: "2026-12-31",
    status: "active",
  };
  it("accepts a valid semester", () => {
    expect(semesterFormSchema.safeParse(base).success).toBe(true);
  });
  it("rejects end before start", () => {
    expect(
      semesterFormSchema.safeParse({ ...base, end_date: "2026-08-01" }).success
    ).toBe(false);
  });
  it("rejects impossible dates and blank fields", () => {
    expect(semesterFormSchema.safeParse({ ...base, start_date: "2026-02-31" }).success).toBe(false);
    expect(semesterFormSchema.safeParse({ ...base, name: "   " }).success).toBe(false);
    expect(semesterFormSchema.safeParse({ ...base, status: "whatever" }).success).toBe(false);
  });
});

describe("course + grading scale schemas", () => {
  const base = {
    semester_id: UUID,
    name: "DBMS",
    code: "CS-341",
    credits: 3,
    instructor: "",
    total_marks: 100,
    passing_marks: 50,
  };
  it("rejects passing > total, non-positive credits/marks", () => {
    expect(courseFormSchema.safeParse(base).success).toBe(true);
    expect(courseFormSchema.safeParse({ ...base, passing_marks: 120 }).success).toBe(false);
    expect(courseFormSchema.safeParse({ ...base, credits: 0 }).success).toBe(false);
    expect(courseFormSchema.safeParse({ ...base, total_marks: -5 }).success).toBe(false);
    expect(courseFormSchema.safeParse({ ...base, code: "" }).success).toBe(false);
  });
  it("enforces unique thresholds and bounded values in a grading scale", () => {
    const good = [
      { grade: "A", min_percentage: 80, grade_point: 4 },
      { grade: "B", min_percentage: 70, grade_point: 3 },
    ];
    expect(gradingScaleSchema.safeParse(good).success).toBe(true);
    expect(
      gradingScaleSchema.safeParse([...good, { grade: "C", min_percentage: 80, grade_point: 2 }])
        .success
    ).toBe(false);
    expect(
      gradingScaleSchema.safeParse([{ grade: "A", min_percentage: 150, grade_point: 4 }]).success
    ).toBe(false);
    expect(
      gradingScaleSchema.safeParse([{ grade: "", min_percentage: 80, grade_point: 4 }]).success
    ).toBe(false);
    expect(gradingScaleSchema.safeParse([]).success).toBe(true);
  });
});

describe("category & assessment schemas", () => {
  it("rejects negative weights and blank names", () => {
    expect(
      categoryFormSchema.safeParse({ course_id: UUID, name: "Tests", weight: 20 }).success
    ).toBe(true);
    expect(
      categoryFormSchema.safeParse({ course_id: UUID, name: "Tests", weight: -1 }).success
    ).toBe(false);
    expect(
      categoryFormSchema.safeParse({ course_id: UUID, name: " ", weight: 5 }).success
    ).toBe(false);
  });

  const asm = {
    category_id: UUID,
    title: "CT 1",
    maximum_marks: 10,
    obtained_marks: 8,
    date: "2026-09-10",
    notes: "",
    status: "completed",
  };
  it("enforces obtained ≤ maximum and completed ⇒ marks present", () => {
    expect(assessmentFormSchema.safeParse(asm).success).toBe(true);
    expect(assessmentFormSchema.safeParse({ ...asm, obtained_marks: 12 }).success).toBe(false);
    expect(assessmentFormSchema.safeParse({ ...asm, obtained_marks: null }).success).toBe(false);
    expect(assessmentFormSchema.safeParse({ ...asm, maximum_marks: 0 }).success).toBe(false);
    expect(
      assessmentFormSchema.safeParse({ ...asm, status: "pending", obtained_marks: null }).success
    ).toBe(true);
    expect(assessmentFormSchema.safeParse({ ...asm, obtained_marks: -1 }).success).toBe(false);
  });
});

describe("target & event schemas", () => {
  it("bounds the target percentage to (0, 100]", () => {
    const t = { course_id: UUID, kind: "custom", label: "Custom", percentage: 80 };
    expect(targetFormSchema.safeParse(t).success).toBe(true);
    expect(targetFormSchema.safeParse({ ...t, percentage: 0 }).success).toBe(false);
    expect(targetFormSchema.safeParse({ ...t, percentage: 101 }).success).toBe(false);
    expect(targetFormSchema.safeParse({ ...t, kind: "other" }).success).toBe(false);
  });

  it("validates event title/type limits and date shape", () => {
    const e = {
      course_id: UUID,
      title: "Midterm",
      event_date: "2026-10-15",
      type: "Midterm",
      notes: "",
    };
    expect(eventFormSchema.safeParse(e).success).toBe(true);
    expect(eventFormSchema.safeParse({ ...e, title: "" }).success).toBe(false);
    expect(eventFormSchema.safeParse({ ...e, event_date: "15/10/2026" }).success).toBe(false);
    expect(eventFormSchema.safeParse({ ...e, type: "x".repeat(41) }).success).toBe(false);
    expect(eventFormSchema.safeParse({ ...e, notes: "n".repeat(2001) }).success).toBe(false);
  });
});

