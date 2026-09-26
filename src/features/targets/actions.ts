"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { ActionResult } from "@/features/types";
import { firstIssue } from "@/validations/common";
import { targetFormSchema } from "./validations";

/** Creates or replaces the course's single target (§14: one per course). */
export async function saveTarget(formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = targetFormSchema.safeParse({
    course_id: formData.get("course_id"),
    kind: formData.get("kind"),
    label: formData.get("label"),
    percentage: formData.get("percentage"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const course = await ctx.supabase
    .from("courses")
    .select("id")
    .eq("id", parsed.data.course_id)
    .maybeSingle();
  if (!course.data) return { error: "Course not found or not yours." };

  const gradeLabel = formData.get("grade_label");
  const payload = {
    user_id: ctx.userId,
    course_id: parsed.data.course_id,
    kind: parsed.data.kind,
    label: parsed.data.label,
    percentage: parsed.data.percentage,
    grade_label:
      typeof gradeLabel === "string" && gradeLabel.trim()
        ? gradeLabel.trim().slice(0, 12)
        : null,
  };

  const existing = await ctx.supabase
    .from("targets")
    .select("id")
    .eq("course_id", parsed.data.course_id)
    .maybeSingle();

  if (existing.data) {
    const { error } = await ctx.supabase
      .from("targets")
      .update(payload)
      .eq("id", existing.data.id);
    if (error) return { error: "Could not update the target." };
  } else {
    const { error } = await ctx.supabase.from("targets").insert(payload);
    if (error) return { error: "Could not save the target." };
  }

  revalidatePath(`/courses/${parsed.data.course_id}`);
  return {};
}

export async function deleteTarget(courseId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const target = await ctx.supabase
    .from("targets")
    .select("id")
    .eq("course_id", courseId)
    .maybeSingle();
  if (!target.data) return { error: "No target is set for this course." };

  const { error } = await ctx.supabase
    .from("targets")
    .delete()
    .eq("id", target.data.id);
  if (error) return { error: "Could not remove the target." };

  revalidatePath(`/courses/${courseId}`);
  return {};
}
