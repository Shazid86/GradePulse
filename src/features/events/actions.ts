"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { ActionResult } from "@/features/types";
import { firstIssue } from "@/validations/common";
import { eventFormSchema } from "./validations";

function readForm(formData: FormData) {
  const completedRaw = formData.get("is_completed");
  return {
    course_id: formData.get("course_id"),
    title: formData.get("title"),
    event_date: formData.get("event_date"),
    type: formData.get("type"),
    notes: formData.get("notes") ?? "",
    // Controlled checkbox → hidden input carries "true"/"false"; absent = untouched.
    is_completed:
      completedRaw === null
        ? undefined
        : completedRaw === "true" || completedRaw === "on",
  };
}

function revalidateCalendar() {
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/semesters");
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = eventFormSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const course = await ctx.supabase
    .from("courses")
    .select("id")
    .eq("id", parsed.data.course_id)
    .maybeSingle();
  if (!course.data) return { error: "Course not found or not yours." };

  const { error } = await ctx.supabase.from("academic_events").insert({
    user_id: ctx.userId,
    ...parsed.data,
  });
  if (error) return { error: "Could not create the event." };

  revalidateCalendar();
  return {};
}

export async function updateEvent(formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Invalid event." };

  const parsed = eventFormSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { course_id, ...updates } = parsed.data;
  void course_id;
  const { data, error } = await ctx.supabase
    .from("academic_events")
    .update(updates)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Could not update the event." };
  if (!data) return { error: "Event not found or not yours." };

  revalidateCalendar();
  return {};
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const { data, error } = await ctx.supabase
    .from("academic_events")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Could not delete the event." };
  if (!data) return { error: "Event not found or not yours." };

  revalidateCalendar();
  return {};
}

/** Quick completion toggle from the calendar / dashboard lists. */
export async function setEventCompletion(
  id: string,
  completed: boolean
): Promise<ActionResult> {
  const ctx = await requireUser();
  if ("error" in ctx) return { error: ctx.error };

  const { data, error } = await ctx.supabase
    .from("academic_events")
    .update({ is_completed: completed })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Could not update the event." };
  if (!data) return { error: "Event not found or not yours." };

  revalidateCalendar();
  return {};
}

/**
 * FormData wrapper around {@link setEventCompletion} so the list toggle works
 * as a plain `<form>` submit (no client JS, no bound arguments).
 */
export async function toggleEventCompletion(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const completed = formData.get("completed") === "true";
  if (typeof id !== "string" || id.length === 0) return;

  await setEventCompletion(id, completed);
}
