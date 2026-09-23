"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  createCategory,
  updateCategory,
} from "@/features/categories/actions";
import type { AssessmentCategoryRow } from "@/types/database";
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

export function CategoryFormDialog({
  courseId,
  category,
  trigger,
}: {
  courseId: string;
  category?: AssessmentCategoryRow;
  trigger: ReactNode;
}) {
  const isEdit = Boolean(category);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (isEdit && category) formData.set("id", category.id);
    startTransition(async () => {
      const result = isEdit
        ? await updateCategory(formData)
        : await createCategory(formData);
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            How many course marks this category is worth — e.g. Class Tests = 20.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="course_id" value={courseId} />
          {isEdit && category && (
            <input type="hidden" name="id" value={category.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor="category-name">Category name</Label>
            <Input
              id="category-name"
              name="name"
              placeholder="Class Tests"
              defaultValue={category?.name ?? ""}
              required
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-weight">Weight (course marks)</Label>
            <Input
              id="category-weight"
              name="weight"
              type="number"
              min={0}
              step="any"
              defaultValue={category?.weight ?? ""}
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
