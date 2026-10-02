import { createClient } from "@/lib/supabase/server";
import { todayIso } from "@/lib/dates";
import type { AcademicEventRow } from "@/types/database";

export interface EventWithCourse extends AcademicEventRow {
  course: { id: string; name: string; code: string };
}

type EventRowWithCourse = AcademicEventRow & {
  course: { id: string; name: string; code: string };
};

function toEvents(data: EventRowWithCourse[] | null): EventWithCourse[] {
  return (data ?? []).map(({ course, ...event }) => ({ ...event, course }));
}

/** All events for the signed-in user (RLS), soonest first. */
export async function listEvents(): Promise<{
  events: EventWithCourse[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academic_events")
    .select(
      "*, course:courses!inner(id, name, code)"
    )
    .order("event_date", { ascending: true });

  if (error) return { events: [], error: "Could not load calendar events." };
  return { events: toEvents(data as EventRowWithCourse[] | null) };
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
  const { data, error } = await supabase
    .from("academic_events")
    .select("*, course:courses!inner(id, name, code)")
    .in("course_id", courseIds)
    .gte("event_date", todayIso())
    .eq("is_completed", false)
    .order("event_date", { ascending: true })
    .limit(limit);

  if (error) return [];
  return toEvents(data as EventRowWithCourse[] | null);
}
