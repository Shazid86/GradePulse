import { Pencil, Trash2 } from "lucide-react";
import { toggleEventCompletion, deleteEvent } from "@/features/events/actions";
import type { EventWithCourse } from "@/features/events/queries";
import { CountdownBadge } from "./countdown-badge";
import { EventFormDialog } from "./event-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** One calendar row: date, details, countdown/status, actions. */
export function EventRow({
  event,
  courses,
}: {
  event: EventWithCourse;
  courses: { id: string; name: string; code: string }[];
}) {
  return (
    <li>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border/60 bg-background/40 p-3">
        <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
          {formatDate(event.event_date)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                event.is_completed
                  ? "truncate text-sm font-medium text-muted-foreground line-through"
                  : "truncate text-sm font-medium"
              }
            >
              {event.title}
            </span>
            <Badge variant="secondary" className="shrink-0">
              {event.type}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {event.course.name} ({event.course.code})
            {event.notes ? ` · ${event.notes}` : ""}
          </p>
        </div>

        <CountdownBadge date={event.event_date} completed={event.is_completed} />

        <div className="flex items-center gap-1">
          <form action={toggleEventCompletion}>
            <input type="hidden" name="id" value={event.id} />
            <input
              type="hidden"
              name="completed"
              value={String(!event.is_completed)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label={
                event.is_completed
                  ? `Mark ${event.title} as not completed`
                  : `Mark ${event.title} as completed`
              }
            >
              <CircleCheckBig
                className={
                  event.is_completed ? "text-primary" : "text-muted-foreground"
                }
                aria-hidden="true"
              />
            </Button>
          </form>
          <EventFormDialog
            courses={courses}
            event={event}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${event.title}`}
              >
                <Pencil aria-hidden="true" />
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${event.title}`}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            }
            title="Delete event?"
            description={`“${event.title}” will be permanently deleted.`}
            onConfirm={deleteEvent.bind(null, event.id)}
          />
        </div>
      </div>
    </li>
  );
}
