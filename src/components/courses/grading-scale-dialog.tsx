"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveGradingScale } from "@/features/courses/actions";
import { parseGradingScale } from "@/calculations/grading";
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

interface Row {
  grade: string;
  min: string;
  point: string;
}

/**
 * Configurable grading scale editor (spec §21): grade letter, minimum
 * percentage, grade point — any scale (4.0 / 5.0 / 10.0 / 100 …).
 */
export function GradingScaleDialog({
  course,
  trigger,
}: {
  course: { id: string; grading_scale: unknown };
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>(() => {
    const parsed = parseGradingScale(course.grading_scale);
    return parsed.length > 0
      ? parsed.map((e) => ({
          grade: e.grade,
          min: String(e.min_percentage),
          point: String(e.grade_point),
        }))
      : [{ grade: "", min: "", point: "" }];
  });

  const update = (index: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  function save() {
    const payload = rows.map((r) => ({
      grade: r.grade,
      min_percentage: r.min,
      grade_point: r.point,
    }));
    const fd = new FormData();
    fd.set("course_id", course.id);
    fd.set("scale", JSON.stringify(payload));
    startTransition(async () => {
      const result = await saveGradingScale(fd);
      if (result?.error) setError(result.error);
      else {
        setError(null);
        setOpen(false);
      }
    });
  }

  function clearScale() {
    const fd = new FormData();
    fd.set("course_id", course.id);
    fd.set("scale", "[]");
    startTransition(async () => {
      const result = await saveGradingScale(fd);
      if (result?.error) setError(result.error);
      else {
        setError(null);
        setRows([{ grade: "", min: "", point: "" }]);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Grading scale</DialogTitle>
          <DialogDescription>
            Grade letters, minimum percentages and grade points — configure any
            scale your program uses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_80px_80px_32px] gap-2 text-xs font-medium text-muted-foreground">
            <span>Grade</span>
            <span>Min %</span>
            <span>Point</span>
            <span className="sr-only">Remove</span>
          </div>

          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_80px_80px_32px] items-center gap-2"
            >
              <Input
                aria-label={`Grade ${index + 1}`}
                placeholder="A-"
                value={row.grade}
                maxLength={12}
                onChange={(e) => update(index, { grade: e.target.value })}
              />
              <Input
                aria-label={`Minimum percentage ${index + 1}`}
                type="number"
                min={0}
                max={100}
                step="any"
                placeholder="80"
                value={row.min}
                onChange={(e) => update(index, { min: e.target.value })}
              />
              <Input
                aria-label={`Grade point ${index + 1}`}
                type="number"
                min={0}
                max={100}
                step="any"
                placeholder="3.7"
                value={row.point}
                onChange={(e) => update(index, { point: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove row ${index + 1}`}
                disabled={rows.length === 1}
                onClick={() =>
                  setRows((rs) => rs.filter((_, i) => i !== index))
                }
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setRows((rs) => [...rs, { grade: "", min: "", point: "" }])
            }
          >
            <Plus aria-hidden="true" />
            Add row
          </Button>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={clearScale}
          >
            Clear scale
          </Button>
          <Button type="button" disabled={isPending} onClick={save}>
            {isPending ? "Saving…" : "Save scale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
