import { createClient } from "@/lib/supabase/server";
import { todayIso } from "@/lib/dates";
import type { AcademicEventRow } from "@/types/database";

export interface EventWithCourse extends AcademicEventRow {
  course: { id: string; name: string; code: string };
}

/** All events for the signed-in user (RLS), soonest first. */
export async function listEvents(): Promise<EventWithCourse[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("academic_events")
    .select(
      "*, course:courses!inner(id, name, code)"
    )
    .order("event_date", { ascending: true });

  return ((data ?? []) as unknown as (AcademicEventRow & {
    course: { id: string; name: string; code: string };
  })[]).map(({ course, ...event }) => ({ ...event, course }));
}

/**
 * Next `limit` incomplete events for the given courses (dashboard
 * upcoming-events section). Returns soonest-first, from today onward.
 */
export async function listUpcomingForCourses(
  courseIds: string[],
  limit = 5
): Promise<EventWithCourse[]> {
  if (courseIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("academic_events")
    .select("*, course:courses!inner(id, name, code)")
    .in("course_id", courseIds)
    .gte("event_date", todayIso())
    .eq("is_completed", false)
    .order("event_date", { ascending: true })
    .limit(limit);

  return ((data ?? []) as unknown as (AcademicEventRow & {
    course: { id: string; name: string; code: string };
  })[]).map(({ course, ...event }) => ({ ...event, course }));
}
