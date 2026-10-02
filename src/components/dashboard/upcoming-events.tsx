import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EventWithCourse } from "@/features/events/queries";
import { formatDateShort } from "@/lib/format";
import { CountdownBadge } from "@/components/events/countdown-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

/** Dashboard "upcoming assessments" section (spec §22) for the current semester. */
export function UpcomingEvents({ events }: { events: EventWithCourse[] }) {
  return (
    <section aria-labelledby="upcoming-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="upcoming-heading" className="text-lg font-medium">
          Upcoming assessments
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/calendar">
            Open calendar
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <Card className="glass border-border/70">
        <CardHeader className="pb-2">
          <CardDescription>
            Next tests and deadlines in this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No upcoming assessments — add one from the calendar.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3"
                >
                  <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                    {formatDateShort(event.event_date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {event.title}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {event.course.code}
                  </span>
                  <CountdownBadge date={event.event_date} completed={false} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
