import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { listEvents } from "@/features/events/queries";
import { listAllCourses } from "@/features/courses/queries";
import { daysUntil, todayIso } from "@/lib/dates";
import { EventRow } from "@/components/events/event-row";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const [eventResult, courses] = await Promise.all([
    listEvents(),
    listAllCourses(),
  ]);
  const events = eventResult.events;

  if (eventResult.error) {
    return (
      <div
        role="alert"
        className="mx-auto w-full max-w-md rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
      >
        {eventResult.error}
      </div>
    );
  }

  const today = todayIso();
  const upcoming = events.filter(
    (e) =>
      !e.is_completed &&
      e.event_date >= today &&
      daysUntil(e.event_date, today) !== null
  );
  const earlier = events
    .filter((e) => !upcoming.includes(e))
    .sort((a, b) => (a.event_date < b.event_date ? 1 : -1));

  const trigger =
    courses.length > 0 ? (
      <EventFormDialog
        courses={courses}
        trigger={
          <Button size="sm">
            <Plus aria-hidden="true" />
            New event
          </Button>
        }
      />
    ) : (
      <Button size="sm" disabled>
        <Plus aria-hidden="true" />
        New event
      </Button>
    );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Tests, assignments and exams — with countdowns and completion
            state.
          </p>
        </div>
        {trigger}
      </header>

      {courses.length === 0 ? (
        <Card className="glass border-border/70">
          <CardContent className="space-y-2 py-10 text-center">
            <h2 className="font-medium">No courses yet</h2>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Add a course first — every event belongs to one.
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/semesters">Go to Semesters</Link>
            </Button>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card className="glass border-border/70">
          <CardContent className="space-y-2 py-10 text-center">
            <CalendarDays
              className="mx-auto size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="font-medium">No calendar events yet</h2>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Add your first test, assignment or exam to start tracking
              countdowns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <section aria-labelledby="upcoming-events" className="space-y-3">
            <h2 id="upcoming-events" className="text-lg font-medium">
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <Card className="glass border-border/70">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  Nothing scheduled right now.
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((event) => (
                  <EventRow key={event.id} event={event} courses={courses} />
                ))}
              </ul>
            )}
          </section>

          {earlier.length > 0 && (
            <section aria-labelledby="earlier-events" className="space-y-3">
              <h2 id="earlier-events" className="text-lg font-medium">
                Earlier &amp; completed
              </h2>
              <ul className="space-y-2 opacity-90">
                {earlier.map((event) => (
                  <EventRow key={event.id} event={event} courses={courses} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
