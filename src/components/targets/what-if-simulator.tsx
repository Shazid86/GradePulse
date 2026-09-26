"use client";

import { useMemo, useState } from "react";
import {
  projectCourseScore,
  type WhatIfAssumptions,
} from "@/calculations/projection";
import type { CourseScore, CourseScoreInput } from "@/calculations/score";
import { formatMarks, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function buildAssumptions(values: Record<string, string>): WhatIfAssumptions {
  const assessments: NonNullable<WhatIfAssumptions["assessments"]> = [];
  const categories: NonNullable<WhatIfAssumptions["categories"]> = [];
  for (const [key, raw] of Object.entries(values)) {
    if (raw.trim() === "") continue;
    if (key.startsWith("a:")) {
      assessments.push({
        index: Number(key.slice(2)),
        obtainedMarks: Number(raw),
      });
    } else if (key.startsWith("c:")) {
      categories.push({ categoryId: key.slice(2), assumedMarks: Number(raw) });
    }
  }
  return { assessments, categories };
}

/**
 * What-if simulator (spec §15): type hypothetical marks for pending
 * assessments (and unassessed categories) and watch the projected total.
 * Runs the shared calculation engine client-side — no duplicated formulas.
 */
export function WhatIfSimulator({
  input,
  current,
}: {
  input: CourseScoreInput;
  current: CourseScore;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  const pending = input.assessments
    .map((assessment, index) => ({ assessment, index }))
    .filter((x) => x.assessment.status === "pending");
  const unassessed = current.categories.filter(
    (c) => c.definedCount === 0 && c.obtainableMarks > 0
  );

  const projection = useMemo(
    () => projectCourseScore(input, buildAssumptions(values)),
    [input, values]
  );

  const hasEntries = Object.values(values).some((v) => v.trim() !== "");
  const categoryName = (id: string) =>
    input.categories.find((c) => c.id === id)?.name ?? "Category";

  if (pending.length === 0 && unassessed.length === 0) {
    return (
      <Card className="glass border-border/70">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base font-medium">
            What-if simulator
          </CardTitle>
          <CardDescription>
            All marks are final — nothing left to simulate.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/70">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">
            What-if simulator
          </CardTitle>
          <CardDescription>
            Try different outcomes — projections use your real course
            structure. Not predictions.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasEntries}
          onClick={() => setValues({})}
        >
          Reset
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pending.map(({ assessment, index }) => (
            <div key={`a-${index}`} className="space-y-1.5">
              <label
                htmlFor={`sim-a-${index}`}
                className="text-sm font-medium"
              >
                {assessment.title ?? "Assessment"}{" "}
                <span className="font-normal text-muted-foreground">
                  · {categoryName(assessment.category_id)}
                </span>
              </label>
              <div className="relative">
                <Input
                  id={`sim-a-${index}`}
                  type="number"
                  min={0}
                  max={assessment.maximum_marks}
                  step="any"
                  inputMode="decimal"
                  placeholder={`0–${assessment.maximum_marks}`}
                  value={values[`a:${index}`] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [`a:${index}`]: e.target.value }))
                  }
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
                  / {assessment.maximum_marks}
                </span>
              </div>
            </div>
          ))}

          {unassessed.map((category) => (
            <div key={category.categoryId} className="space-y-1.5">
              <label
                htmlFor={`sim-c-${category.categoryId}`}
                className="text-sm font-medium"
              >
                {category.name}{" "}
                <span className="font-normal text-muted-foreground">
                  · no assessments yet
                </span>
              </label>
              <div className="relative">
                <Input
                  id={`sim-c-${category.categoryId}`}
                  type="number"
                  min={0}
                  max={category.obtainableMarks}
                  step="any"
                  inputMode="decimal"
                  placeholder={`0–${category.obtainableMarks}`}
                  value={values[`c:${category.categoryId}`] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      [`c:${category.categoryId}`]: e.target.value,
                    }))
                  }
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
                  / {category.obtainableMarks}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-background/40 p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatMarks(current.securedMarks)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {formatMarks(current.totalMarks)}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Projected</p>
            <p className="text-lg font-semibold text-primary tabular-nums">
              {formatMarks(projection.projectedMarks)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {formatMarks(current.totalMarks)}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Projected %</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatPercent(projection.projectedPercentage)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Change</p>
            <p className="text-lg font-semibold tabular-nums">
              {projection.deltaMarks > 0 ? "+" : ""}
              {formatMarks(projection.deltaMarks)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
