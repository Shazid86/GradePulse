"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import type { ActionResult } from "@/features/types";
import { firstIssue } from "@/validations/common";
import { courseFormSchema, gradingScaleSchema } from "./validations";

function readForm(formData: FormData) {
  return {
    semester_id: formData.get("semester_id"),
    name: formData.get("name"),
    code: formData.get("code"),
    credits: formData.get("credits"),
    instructor: formData.get("instructor") ?? "",
    total_marks: formData.get("total_marks"),
    passing_marks: formData.get("passing_marks"),
  };
}

function duplicateMessage(error: { code?: string }): string | null {
  return error.code === "23505"
    ? "A course with this code already exists in that semester."
    : null;
}

export async function createCourse(formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = courseFormSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  // The semester must exist and belong to this user (RLS backs this up).
  const semester = await ctx.supabase
    .from("semesters")
    .select("id")
    .eq("id", parsed.data.semester_id)
    .maybeSingle();
  if (!semester.data) return { error: "Semester not found or not yours." };

  const { error } = await ctx.supabase.from("courses").insert({
    user_id: ctx.userId,
    ...parsed.data,
    grading_scale: [], // configured in Phase 6 (GPA), never hard-coded
  });
  if (error) return { error: duplicateMessage(error) ?? "Could not create the course." };

  revalidatePath("/semesters");
  revalidatePath(`/semesters/${parsed.data.semester_id}`);
  return {};
}

export async function updateCourse(formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Invalid course." };

  const parsed = courseFormSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { semester_id, ...updates } = parsed.data;
  void semester_id;
  const { data, error } = await ctx.supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select("id, semester_id")
    .maybeSingle();

  if (error) return { error: duplicateMessage(error) ?? "Could not update the course." };
  if (!data) return { error: "Course not found or not yours." };

  revalidatePath("/semesters");
  revalidatePath(`/semesters/${data.semester_id}`);
  revalidatePath(`/courses/${id}`);
  return {};
}

export async function deleteCourse(
  id: string,
  redirectTo?: string
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const { data, error } = await ctx.supabase
    .from("courses")
    .delete()
    .eq("id", id)
    .select("id, semester_id")
    .maybeSingle();

  if (error) return { error: "Could not delete the course." };
  if (!data) return { error: "Course not found or not yours." };

  revalidatePath("/semesters");
  revalidatePath(`/semesters/${data.semester_id}`);
  if (redirectTo) redirect(redirectTo);
  return {};
}

/** Saves the course's configurable grading scale (§21). Rows as JSON. */
export async function saveGradingScale(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const id = formData.get("course_id");
  if (typeof id !== "string") return { error: "Invalid course." };

  let rows: unknown;
  try {
    rows = JSON.parse(String(formData.get("scale") ?? "[]"));
  } catch {
    return { error: "Invalid grading scale." };
  }

  const parsed = gradingScaleSchema.safeParse(rows);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { data, error } = await ctx.supabase
    .from("courses")
    .update({ grading_scale: parsed.data })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Could not save the grading scale." };
  if (!data) return { error: "Course not found or not yours." };

  revalidatePath(`/courses/${id}`);
  revalidatePath("/");
  revalidatePath("/gpa");
  revalidatePath("/semesters");
  return {};
}
