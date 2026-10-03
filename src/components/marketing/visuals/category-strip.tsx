import { cn } from "@/lib/utils";

import { DEMO_CATEGORIES } from "./demo-data";

/**
 * Compact category breakdown strip: one segment per assessment category,
 * weighted by its contribution to the course total and filled in proportion to
 * the marks secured. Pending categories stay hollow — the same read the
 * dashboard's breakdown gives.
 *
 * Presentational only; all values arrive display-ready from demo-data.
 */
export function CategoryStrip({
  className,
  labels = true,
}: {
  className?: string;
  /** Show the per-category caption row beneath the strip. */
  labels?: boolean;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-1">
        {DEMO_CATEGORIES.map((category) => (
          <div
            key={category.name}
            className="min-w-0"
            style={{ flexGrow: category.weight, flexBasis: 0 }}
          >
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  category.done ? "bg-primary" : "bg-transparent"
                )}
                style={{
                  width: category.done
                    ? `${(category.secured / category.weight) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {labels ? (
        <dl className="grid grid-cols-5 gap-1 text-center">
          {DEMO_CATEGORIES.map((category) => (
            <div key={category.name} className="min-w-0">
              <dt className="truncate text-[0.6875rem] leading-tight text-muted-foreground">
                {category.name}
              </dt>
              <dd
                className={cn(
                  "gp-figure mt-0.5 text-[0.6875rem] font-medium",
                  category.done ? "text-foreground" : "text-muted-foreground/70"
                )}
              >
                {category.done ? `${category.secured} / ${category.weight}` : "—"}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}