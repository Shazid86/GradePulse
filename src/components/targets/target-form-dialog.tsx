"use client";

import { useState, useTransition, type ReactNode } from "react";
import { saveTarget } from "@/features/targets/actions";
import type { TargetPreset } from "@/features/targets/presets";
import type { TargetRow } from "@/types/database";
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

interface CourseShape {
  id: string;
}

/**
 * Target selection (spec §14): Pass + letter presets (from the course's
 * configurable grading scale) + custom percentage. Nothing is hard-coded —
 * presets come from buildTargetPresets().
 */
export function TargetFormDialog({
  course,
  target,
  presets,
  trigger,
}: {
  course: CourseShape;
  target?: TargetRow | null;
  presets: TargetPreset[];
  trigger: ReactNode;
}) {
  const isEdit = Boolean(target);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [kind, setKind] = useState<"preset" | "custom">(target?.kind ?? "custom");
  const [label, setLabel] = useState(target?.label ?? "Custom");
  const [gradeLabel, setGradeLabel] = useState(target?.grade_label ?? "");
  const [percentage, setPercentage] = useState(
    target ? String(target.percentage) : ""
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    target?.kind === "preset" ? target.label : null
  );

  function choosePreset(p: TargetPreset) {
    setKind("preset");
    setLabel(p.label);
    setGradeLabel(p.gradeLabel ?? "");
    setPercentage(String(p.percentage));
    setSelectedKey(p.label);
    setError(null);
  }

  function chooseCustom() {
    setKind("custom");
    setLabel("Custom");
    setGradeLabel("");
    setSelectedKey(null);
    setError(null);
  }

  function handleSubmit(formData: FormData) {
    formData.set("course_id", course.id);
    formData.set("kind", kind);
    formData.set("label", label);
    formData.set("grade_label", gradeLabel);
    startTransition(async () => {
      const result = await saveTarget(formData);
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
          <DialogTitle>{isEdit ? "Change target" : "Set target"}</DialogTitle>
          <DialogDescription>
            Choose a preset or enter your own percentage.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {presets.length > 0 && (
            <div className="space-y-2">
              <Label>Presets</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <Button
                    key={`${p.label}-${p.percentage}`}
                    type="button"
                    size="sm"
                    variant={
                      selectedKey === p.label && kind === "preset"
                        ? "default"
                        : "outline"
                    }
                    aria-pressed={selectedKey === p.label && kind === "preset"}
                    onClick={() => choosePreset(p)}
                  >
                    {p.label} · {p.percentage}%
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant={kind === "custom" && !selectedKey ? "default" : "outline"}
                  aria-pressed={kind === "custom" && !selectedKey}
                  onClick={chooseCustom}
                >
                  Custom
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="target-percentage">Target percentage</Label>
            <div className="relative">
              <Input
                id="target-percentage"
                name="percentage"
                type="number"
                min={1}
                max={100}
                step="any"
                inputMode="decimal"
                placeholder="80"
                value={percentage}
                onChange={(e) => {
                  setPercentage(e.target.value);
                  setKind("custom");
                  setSelectedKey(null);
                  setLabel("Custom");
                  setGradeLabel("");
                }}
                required
                className="pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {percentage && !Number.isNaN(Number(percentage))
                ? `Target: ${Number(percentage)}%${label !== "Custom" ? ` · ${label}` : ""}`
                : "Pick a preset or type a percentage between 1 and 100."}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Update target" : "Save target"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
