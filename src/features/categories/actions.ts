"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { ActionResult } from "@/features/types";
import { totalWeight } from "@/calculations/score";
import { firstIssue } from "@/validations/common";
import { categoryFormSchema } from "./validations";

/**
 * Spec §26: category weights must respect the course structure —
 * the sum of all weights may not exceed the course's total marks.
 */
async function validateWeightBudget(
  supabase: SupabaseClient,
  courseId: string,
  newWeight: number,
  excludeCategoryId?: string
): Promise<string | null> {
  const course = await supabase
    .from("courses")
    .select("id, total_marks")
    .eq("id", courseId)
    .maybeSingle();
  if (!course.data) return "Course not found or not yours.";

  const siblings = await supabase
    .from("assessment_categories")
    .select("id, weight")
    .eq("course_id", courseId);
  if (siblings.error) return "Could not verify the assessment structure.";

  const others = (siblings.data ?? []).filter(
    (c) => c.id !== excludeCategoryId
  );
  const projected = totalWeight([...others, { weight: newWeight }]);
  const total = Number(course.data.total_marks);

  if (projected > total) {
    return `Category weights would total ${projected}, exceeding the course total of ${total}.`;
  }
  return null;
}

export async function createCategory(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = categoryFormSchema.safeParse({
    course_id: formData.get("course_id"),
    name: formData.get("name"),
    weight: formData.get("weight"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const budgetError = await validateWeightBudget(
    ctx.supabase,
    parsed.data.course_id,
    parsed.data.weight
  );
  if (budgetError) return { error: budgetError };

  const existing = await ctx.supabase
    .from("assessment_categories")
    .select("id")
    .eq("course_id", parsed.data.course_id);

  const { error } = await ctx.supabase.from("assessment_categories").insert({
    user_id: ctx.userId,
    ...parsed.data,
    sort_order: existing.data?.length ?? 0,
  });
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "A category with this name already exists in this course."
          : "Could not create the category.",
    };
  }

  revalidatePath(`/courses/${parsed.data.course_id}`);
  return {};
}

export async function updateCategory(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Invalid category." };

  const parsed = categoryFormSchema.safeParse({
    course_id: formData.get("course_id"),
    name: formData.get("name"),
    weight: formData.get("weight"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const budgetError = await validateWeightBudget(
    ctx.supabase,
    parsed.data.course_id,
    parsed.data.weight,
    id
  );
  if (budgetError) return { error: budgetError };

  const { course_id, ...updates } = parsed.data;
  void course_id;
  const { data, error } = await ctx.supabase
    .from("assessment_categories")
    .update(updates)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "A category with this name already exists in this course."
          : "Could not update the category.",
    };
  }
  if (!data) return { error: "Category not found or not yours." };

  revalidatePath(`/courses/${parsed.data.course_id}`);
  return {};
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const category = await ctx.supabase
    .from("assessment_categories")
    .select("id, course_id")
    .eq("id", id)
    .maybeSingle();
  if (!category.data) return { error: "Category not found or not yours." };

  const { error } = await ctx.supabase
    .from("assessment_categories")
    .delete()
    .eq("id", id);
  if (error) return { error: "Could not delete the category." };

  revalidatePath(`/courses/${category.data.course_id}`);
  return {};
}
