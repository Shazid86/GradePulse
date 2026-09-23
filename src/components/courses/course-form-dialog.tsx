"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createCourse, updateCourse } from "@/features/courses/actions";
import type { CourseRow } from "@/types/database";
import { Button } from "@/components/ui/button";

/** Fields the form actually edits — keeps callers free to pass subsets. */
type CourseFormValues = Pick<
  CourseRow,
  "id" | "name" | "code" | "credits" | "instructor" | "total_marks" | "passing_marks"
>;
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

export function CourseFormDialog({
  semesterId,
  course,
  trigger,
}: {
  semesterId: string;
  course?: CourseFormValues;
  trigger: ReactNode;
}) {
  const isEdit = Boolean(course);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (isEdit && course) formData.set("id", course.id);
    startTransition(async () => {
      const result = isEdit
        ? await updateCourse(formData)
        : await createCourse(formData);
      if (result?.error) {
        setError(result.error);
      } else {
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
          <DialogTitle>{isEdit ? "Edit course" : "New course"}</DialogTitle>
          <DialogDescription>
            Credits, marks and passing criteria — the structure stays yours.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="semester_id" value={semesterId} />
          {isEdit && course && <input type="hidden" name="id" value={course.id} />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:[grid-template-columns:1fr_140px]">
            <div className="space-y-2">
              <Label htmlFor="course-name">Course name</Label>
              <Input
                id="course-name"
                name="name"
                placeholder="Database Management Systems"
                defaultValue={course?.name ?? ""}
                required
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-code">Code</Label>
              <Input
                id="course-code"
                name="code"
                placeholder="CS-341"
                defaultValue={course?.code ?? ""}
                required
                maxLength={40}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-credits">Credits</Label>
              <Input
                id="course-credits"
                name="credits"
                type="number"
                min={0.5}
                step="any"
                defaultValue={course?.credits ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-total">Total marks</Label>
              <Input
                id="course-total"
                name="total_marks"
                type="number"
                min={1}
                step="any"
                defaultValue={course?.total_marks ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-passing">Passing</Label>
              <Input
                id="course-passing"
                name="passing_marks"
                type="number"
                min={0}
                step="any"
                defaultValue={course?.passing_marks ?? ""}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-instructor">Instructor (optional)</Label>
            <Input
              id="course-instructor"
              name="instructor"
              placeholder="Dr. Smith"
              defaultValue={course?.instructor ?? ""}
              maxLength={120}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Create course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
