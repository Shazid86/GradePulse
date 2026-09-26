import { Pencil, Trash2 } from "lucide-react";
import {
  analyzeTarget,
  type TargetStatus,
} from "@/calculations/requirements";
import type { CourseScore } from "@/calculations/score";
import type { TargetRow } from "@/types/database";
import type { TargetPreset } from "@/features/targets/presets";
import { deleteTarget } from "@/features/targets/actions";
import { formatMarks, formatPercent } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TargetFormDialog } from "./target-form-dialog";

const STATUS_META: Record<TargetStatus, { label: string; className: string }> =
  {
    achieved: {
      label: "Target achieved",
      className: "border-primary/40 bg-primary/10 text-primary",
    },
    achievable: {
      label: "Target achievable",
      className:
        "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    impossible: {
      label: "Target impossible",
      className: "border-destructive/40 bg-destructive/10 text-destructive",
    },
  };

interface CourseShape {
  id: string;
  total_marks: number | string;
  passing_marks: number | string;
  grading_scale: unknown;
}

/**
 * Target analysis (spec §14) — the clearest statement in the app:
 * what you want, what you need, and whether it is still possible.
 */
export function TargetAnalysis({
  course,
  target,
  score,
  presets,
}: {
  course: CourseShape;
  target: TargetRow | null;
  score: CourseScore;
  presets: TargetPreset[];
}) {
  const actions = (
    <div className="flex items-center gap-1">
      <TargetFormDialog
        course={course}
        target={target}
        presets={presets}
        trigger={
          <Button variant="outline" size="sm">
            <Pencil aria-hidden="true" />
            {target ? "Change" : "Set target"}
          </Button>
        }
      />
      {target && (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="icon" aria-label="Clear target">
              <Trash2 aria-hidden="true" />
            </Button>
          }
          title="Clear target?"
          description="The target will be removed. You can set a new one at any time."
          confirmText="Clear"
          onConfirm={deleteTarget.bind(null, course.id)}
        />
      )}
    </div>
  );

  if (!target) {
    return (
      <Card className="glass border-border/70">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              Target analysis
            </CardTitle>
            <CardDescription>
              Set a target to see exactly what you need in the remaining
              assessments.
            </CardDescription>
          </div>
          {actions}
        </CardHeader>
      </Card>
    );
  }

  const analysis = analyzeTarget({
    securedMarks: score.securedMarks,
    maxPossibleScore: score.maxPossibleScore,
    totalMarks: score.totalMarks,
    targetPercentage: target.percentage,
  });
  const meta = STATUS_META[analysis.status];
  const secured = Math.min(100, Math.max(0, score.percentage));
  const goal = Math.min(100, Math.max(0, Number(target.percentage)));

  return (
    <Card className="glass border-border/70">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">
            Target analysis
          </CardTitle>
          <CardDescription>
            Target: {formatPercent(target.percentage)} (
            {formatMarks(analysis.targetMarks)} marks)
            {target.label ? ` · ${target.label}` : ""}
          </CardDescription>
        </div>
        {actions}
      </CardHeader>

      <CardContent className="space-y-4">
        <Badge variant="outline" className={meta.className}>
          {meta.label}
        </Badge>

        {analysis.status === "achievable" && (
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight">
              You need {formatMarks(analysis.requiredMarks)} /{" "}
              {formatMarks(analysis.remainingMarks)} remaining marks
            </p>
            <p className="font-mono text-sm text-muted-foreground tabular-nums">
              {formatMarks(analysis.requiredMarks)} ÷{" "}
              {formatMarks(analysis.remainingMarks)} ={" "}
              {formatPercent(analysis.requiredRemainingPercentage)} of what is
              left
            </p>
          </div>
        )}

        {analysis.status === "achieved" && (
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight">
              Already achieved
            </p>
            <p className="text-sm text-muted-foreground">
              You have secured {formatMarks(analysis.securedMarks)} marks; the
              target needs {formatMarks(analysis.targetMarks)}.
            </p>
          </div>
        )}

        {analysis.status === "impossible" && (
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight text-destructive">
              Out of reach
            </p>
            <p className="text-sm text-muted-foreground">
              Even the maximum possible score (
              {formatMarks(score.maxPossibleScore)} marks) stays below the
              target ({formatMarks(analysis.targetMarks)} marks).
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="relative h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${secured}%` }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-foreground"
              style={{ left: `calc(${goal}% - 1px)` }}
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Current {formatPercent(score.percentage)}</span>
            <span>
              Maximum possible {formatMarks(score.maxPossibleScore)}
            </span>
            <span>Target marker {formatPercent(goal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
