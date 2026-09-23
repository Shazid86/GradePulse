"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { ActionResult } from "@/features/types";
import { firstIssue } from "@/validations/common";
import { assessmentFormSchema, emptyToNull } from "./validations";

function readForm(formData: FormData) {
  return {
    category_id: formData.get("category_id"),
    title: formData.get("title"),
    maximum_marks: formData.get("maximum_marks"),
    obtained_marks: emptyToNull(formData.get("obtained_marks")),
    date: emptyToNull(formData.get("date")),
    notes: emptyToNull(formData.get("notes")),
    status: formData.get("status") === "completed" ? "completed" : "pending",
  };
}

async function categoryCourseId(
  supabase: SupabaseClient,
  categoryId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("assessment_categories")
    .select("id, course_id")
    .eq("id", categoryId)
    .maybeSingle();
  return data?.course_id ?? null;
}

export async function createAssessment(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = assessmentFormSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const courseId = await categoryCourseId(ctx.supabase, parsed.data.category_id);
  if (!courseId) return { error: "Category not found or not yours." };

  const { error } = await ctx.supabase.from("assessments").insert({
    user_id: ctx.userId,
    ...parsed.data,
  });
  if (error) return { error: "Could not create the assessment." };

  revalidatePath(`/courses/${courseId}`);
  return {};
}

export async function updateAssessment(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Invalid assessment." };

  const parsed = assessmentFormSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const courseId = await categoryCourseId(ctx.supabase, parsed.data.category_id);
  if (!courseId) return { error: "Category not found or not yours." };

  const { data, error } = await ctx.supabase
    .from("assessments")
    .update(parsed.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Could not update the assessment." };
  if (!data) return { error: "Assessment not found or not yours." };

  revalidatePath(`/courses/${courseId}`);
  return {};
}

export async function deleteAssessment(id: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const assessment = await ctx.supabase
    .from("assessments")
    .select("id, category:assessment_categories!inner(course_id)")
    .eq("id", id)
    .maybeSingle();
  if (!assessment.data) return { error: "Assessment not found or not yours." };

  const { error } = await ctx.supabase
    .from("assessments")
    .delete()
    .eq("id", id);
  if (error) return { error: "Could not delete the assessment." };

  const category = assessment.data.category as
    | { course_id: string }
    | { course_id: string }[];
  const courseId = Array.isArray(category)
    ? category[0]?.course_id
    : category?.course_id;

  if (courseId) revalidatePath(`/courses/${courseId}`);
  return {};
}
