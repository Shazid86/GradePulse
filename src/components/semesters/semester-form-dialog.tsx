"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createSemester, updateSemester } from "@/features/semesters/actions";
import type { SemesterRow, SemesterStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
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

const STATUS_LABELS: Record<SemesterStatus, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
};

export function SemesterFormDialog({
  semester,
  trigger,
}: {
  semester?: SemesterRow;
  trigger: ReactNode;
}) {
  const isEdit = Boolean(semester);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SemesterStatus>(
    semester?.status ?? "upcoming"
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (isEdit && semester) formData.set("id", semester.id);
    startTransition(async () => {
      const result = isEdit
        ? await updateSemester(formData)
        : await createSemester(formData);
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
          <DialogTitle>{isEdit ? "Edit semester" : "New semester"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the semester details."
              : "Name the term, set its academic year and dates."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {isEdit && semester && (
            <input type="hidden" name="id" value={semester.id} />
          )}
          <input type="hidden" name="status" value={status} />

          <div className="space-y-2">
            <Label htmlFor="semester-name">Name</Label>
            <Input
              id="semester-name"
              name="name"
              placeholder="Fall 2026"
              defaultValue={semester?.name ?? ""}
              required
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester-year">Academic year</Label>
            <Input
              id="semester-year"
              name="academic_year"
              placeholder="2026-2027"
              defaultValue={semester?.academic_year ?? ""}
              required
              maxLength={40}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="semester-start">Start date</Label>
              <Input
                id="semester-start"
                name="start_date"
                type="date"
                defaultValue={semester?.start_date ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester-end">End date</Label>
              <Input
                id="semester-end"
                name="end_date"
                type="date"
                defaultValue={semester?.end_date ?? ""}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester-status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as SemesterStatus)}
            >
              <SelectTrigger id="semester-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as SemesterStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create semester"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
