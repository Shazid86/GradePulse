"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createEvent, updateEvent } from "@/features/events/actions";
import { EVENT_TYPES } from "@/features/events/validations";
import type { EventWithCourse } from "@/features/events/queries";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CourseOption {
  id: string;
  name: string;
  code: string;
}

/** Create/edit an academic event (spec §20). */
export function EventFormDialog({
  courses,
  event,
  trigger,
}: {
  courses: CourseOption[];
  event?: EventWithCourse;
  trigger: ReactNode;
}) {
  const isEdit = Boolean(event);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const knownType =
    event != null &&
    event.type !== "Custom" &&
    (EVENT_TYPES as readonly string[]).includes(event.type);

  const [courseId, setCourseId] = useState(
    event?.course_id ?? courses[0]?.id ?? ""
  );
  const [typeChoice, setTypeChoice] = useState<string>(
    event ? (knownType ? event.type : "Custom") : "Assignment"
  );
  const [customType, setCustomType] = useState(
    event && !knownType && event.type !== "Custom" ? event.type : ""
  );
  const [completed, setCompleted] = useState(event?.is_completed ?? false);

  const effectiveType =
    typeChoice === "Custom" ? customType.trim() || "Custom" : typeChoice;

  function handleSubmit(formData: FormData) {
    if (isEdit && event) formData.set("id", event.id);
    formData.set("course_id", courseId);
    formData.set("type", effectiveType);
    startTransition(async () => {
      const result = isEdit
        ? await updateEvent(formData)
        : await createEvent(formData);
      if (result?.error) setError(result.error);
      else {
        setError(null);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>
            Tests, assignments, exams — anything with a date.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-course">Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger id="event-course" className="w-full">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              name="title"
              placeholder="Midterm exam"
              defaultValue={event?.title ?? ""}
              required
              maxLength={160}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                name="event_date"
                type="date"
                defaultValue={event?.event_date ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Type</Label>
              <Select value={typeChoice} onValueChange={setTypeChoice}>
                <SelectTrigger id="event-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {typeChoice === "Custom" && (
            <div className="space-y-2">
              <Label htmlFor="event-custom-type">Custom type</Label>
              <Input
                id="event-custom-type"
                placeholder="e.g. Lab make-up"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                maxLength={40}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* The checkbox is controlled, so its state travels to the action
                through this hidden field. */}
            <input
              type="hidden"
              name="is_completed"
              value={String(completed)}
            />
            <Checkbox
              id="event-completed"
              checked={completed}
              onCheckedChange={(v) => setCompleted(v === true)}
            />
            <Label htmlFor="event-completed" className="cursor-pointer">
              Completed
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-notes">Notes (optional)</Label>
            <Textarea
              id="event-notes"
              name="notes"
              defaultValue={event?.notes ?? ""}
              maxLength={2000}
              rows={2}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                isPending ||
                !courseId ||
                (typeChoice === "Custom" && !customType.trim())
              }
            >
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
