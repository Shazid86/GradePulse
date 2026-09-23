import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteCategory } from "@/features/categories/actions";
import { totalWeight } from "@/calculations/score";
import type { AssessmentCategoryRow } from "@/types/database";
import { CategoryFormDialog } from "@/components/structure/category-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Assessment structure card: weight summary + category CRUD. */
export function StructureCard({
  courseId,
  totalMarks,
  categories,
  assessmentCountByCategory,
}: {
  courseId: string;
  totalMarks: number;
  categories: AssessmentCategoryRow[];
  assessmentCountByCategory: Map<string, number>;
}) {
  const configured = totalWeight(categories);

  return (
    <Card className="glass border-border/70">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">
            Assessment structure
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {configured} of {totalMarks} marks configured
          </p>
        </div>
        <CategoryFormDialog
          courseId={courseId}
          trigger={
            <Button size="sm">
              <Plus aria-hidden="true" />
              Add category
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Define how this course is assessed — e.g. Attendance 10, Class Tests
            20, Assignments 10, Midterm 20, Final 40.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => {
              const count = assessmentCountByCategory.get(category.id) ?? 0;
              return (
                <li key={category.id}>
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.weight} marks · {count} assessment
                        {count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <CategoryFormDialog
                        courseId={courseId}
                        category={category}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${category.name}`}
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
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        }
                        title="Delete category?"
                        description={`“${category.name}” and every assessment inside it will be permanently deleted.`}
                        onConfirm={deleteCategory.bind(null, category.id)}
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
