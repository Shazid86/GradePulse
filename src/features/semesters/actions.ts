"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import type { ActionResult } from "@/features/types";
import { firstIssue } from "@/validations/common";
import { semesterFormSchema } from "./validations";

function duplicateMessage(error: { code?: string }): string | null {
  return error.code === "23505"
    ? "A semester with this name already exists for that academic year."
    : null;
}

export async function createSemester(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = semesterFormSchema.safeParse({
    name: formData.get("name"),
    academic_year: formData.get("academic_year"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { error } = await ctx.supabase.from("semesters").insert({
    user_id: ctx.userId,
    ...parsed.data,
  });
  if (error) return { error: duplicateMessage(error) ?? "Could not create the semester." };

  revalidatePath("/semesters");
  return {};
}

export async function updateSemester(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const id = formData.get("id");
  const parsed = semesterFormSchema.safeParse({
    name: formData.get("name"),
    academic_year: formData.get("academic_year"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  if (typeof id !== "string") return { error: "Invalid semester." };

  const { data, error } = await ctx.supabase
    .from("semesters")
    .update(parsed.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: duplicateMessage(error) ?? "Could not update the semester." };
  if (!data) return { error: "Semester not found or not yours." };

  revalidatePath("/semesters");
  revalidatePath(`/semesters/${id}`);
  return {};
}

export async function deleteSemester(
  id: string,
  redirectTo?: string
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const { data, error } = await ctx.supabase
    .from("semesters")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Could not delete the semester." };
  if (!data) return { error: "Semester not found or not yours." };

  revalidatePath("/semesters");
  if (redirectTo) redirect(redirectTo);
  return {};
}
