import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteAssessment } from "@/features/assessments/actions";
import type {
  AssessmentCategoryRow,
  AssessmentRow,
} from "@/types/database";
import { AssessmentFormDialog } from "@/components/structure/assessment-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(value: string | null): string {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Assessments card: list with marks/status + assessment CRUD. */
export function AssessmentsCard({
  categories,
  assessments,
}: {
  categories: AssessmentCategoryRow[];
  assessments: AssessmentRow[];
}) {
  const hasCategories = categories.length > 0;

  return (
    <Card className="glass border-border/70">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">Assessments</CardTitle>
          <p className="text-sm text-muted-foreground">
            {assessments.length} recorded
          </p>
        </div>
        {hasCategories ? (
          <AssessmentFormDialog
            categories={categories}
            trigger={
              <Button size="sm">
                <Plus aria-hidden="true" />
                Add assessment
              </Button>
            }
          />
        ) : (
          <Button size="sm" disabled>
            <Plus aria-hidden="true" />
            Add assessment
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasCategories ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Add an assessment category before recording assessments.
          </p>
        ) : assessments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No assessments yet — record your first graded item.
          </p>
        ) : (
          <ul className="space-y-2">
            {assessments.map((assessment) => {
              const categoryName =
                categories.find((c) => c.id === assessment.category_id)
                  ?.name ?? "Category";
              const isCompleted = assessment.status === "completed";
              return (
                <li key={assessment.id}>
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
                    <Badge variant="secondary" className="shrink-0">
                      {categoryName}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {assessment.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(assessment.date)}
                      </p>
                    </div>
                    <span
                      className={
                        isCompleted
                          ? "font-mono text-sm font-medium text-primary tabular-nums"
                          : "font-mono text-sm text-muted-foreground tabular-nums"
                      }
                    >
                      {isCompleted
                        ? `${assessment.obtained_marks} / ${assessment.maximum_marks}`
                        : `Pending / ${assessment.maximum_marks}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <AssessmentFormDialog
                        categories={categories}
                        assessment={assessment}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${assessment.title}`}
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
                            aria-label={`Delete ${assessment.title}`}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        }
                        title="Delete assessment?"
                        description={`“${assessment.title}” will be permanently deleted.`}
                        onConfirm={deleteAssessment.bind(null, assessment.id)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
