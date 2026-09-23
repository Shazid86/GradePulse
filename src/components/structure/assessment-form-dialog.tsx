"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  createAssessment,
  updateAssessment,
} from "@/features/assessments/actions";
import type { AssessmentCategoryRow, AssessmentRow } from "@/types/database";
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

export function AssessmentFormDialog({
  categories,
  assessment,
  trigger,
}: {
  categories: AssessmentCategoryRow[];
  assessment?: AssessmentRow;
  trigger: ReactNode;
}) {
  const isEdit = Boolean(assessment);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(
    assessment?.category_id ?? categories[0]?.id ?? ""
  );
  const [completed, setCompleted] = useState(
    assessment?.status === "completed"
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (isEdit && assessment) formData.set("id", assessment.id);
    startTransition(async () => {
      const result = isEdit
        ? await updateAssessment(formData)
        : await createAssessment(formData);
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
          <DialogTitle>
            {isEdit ? "Edit assessment" : "New assessment"}
          </DialogTitle>
          <DialogDescription>
            Leave marks empty while the assessment is pending.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="category_id" value={categoryId} />
          <input
            type="hidden"
            name="status"
            value={completed ? "completed" : "pending"}
          />

          <div className="space-y-2">
            <Label htmlFor="assessment-title">Title</Label>
            <Input
              id="assessment-title"
              name="title"
              placeholder="CT 1"
              defaultValue={assessment?.title ?? ""}
              required
              maxLength={160}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessment-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="assessment-category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.weight} marks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="assessment-max">Maximum</Label>
              <Input
                id="assessment-max"
                name="maximum_marks"
                type="number"
                min={0.01}
                step="any"
                defaultValue={assessment?.maximum_marks ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessment-obtained">Obtained</Label>
              <Input
                id="assessment-obtained"
                name="obtained_marks"
                type="number"
                min={0}
                step="any"
                placeholder="—"
                defaultValue={assessment?.obtained_marks ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessment-date">Date</Label>
              <Input
                id="assessment-date"
                name="date"
                type="date"
                defaultValue={assessment?.date ?? ""}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="assessment-status"
              checked={completed}
              onCheckedChange={(v) => setCompleted(v === true)}
            />
            <Label htmlFor="assessment-status" className="cursor-pointer">
              Completed (marks are final)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessment-notes">Notes (optional)</Label>
            <Textarea
              id="assessment-notes"
              name="notes"
              defaultValue={assessment?.notes ?? ""}
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
            <Button type="submit" disabled={isPending || !categoryId}>
              {isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Add assessment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
