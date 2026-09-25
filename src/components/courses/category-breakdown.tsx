import { formatMarks, formatPercent } from "@/lib/format";
import type { CategoryScore } from "@/calculations/score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Assessment breakdown by category (§16/§19): factual bars + marks.
 * Values are engine outputs; the bar is presentational only.
 */
export function CategoryBreakdown({
  categories,
}: {
  categories: CategoryScore[];
}) {
  if (categories.length === 0) return null;

  return (
    <Card className="glass border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-medium">
          Category breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Performance per category of your assessment structure
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((category) => {
          const pct = category.percentage;
          return (
            <div
              key={category.categoryId}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {category.completedCount} of {category.definedCount} completed
                  {category.pendingCount > 0
                    ? ` · ${category.pendingCount} pending`
                    : ""}
                </p>
              </div>
              <p className="shrink-0 text-sm tabular-nums">
                <span
                  className={
                    pct === null
                      ? "text-muted-foreground"
                      : "font-medium text-primary"
                  }
                >
                  {pct === null ? "Not graded" : formatPercent(pct)}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {formatMarks(category.securedMarks)}/
                  {formatMarks(category.weight)}
                </span>
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
