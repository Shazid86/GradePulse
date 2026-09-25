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
      <CardContent className="space-y-4">
        {categories.map((category) => {
          const pct = category.percentage;
          return (
            <div key={category.categoryId} className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
                <span className="font-medium">{category.name}</span>
                <span className="tabular-nums">
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
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${pct === null ? 0 : Math.min(100, Math.max(0, pct))}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {category.completedCount} of {category.definedCount} completed
                {category.pendingCount > 0
                  ? ` · ${category.pendingCount} pending`
                  : ""}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
