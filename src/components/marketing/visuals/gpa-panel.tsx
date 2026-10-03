import { cn } from "@/lib/utils";

import { DEMO_GPA } from "./demo-data";

/**
 * GPA / CGPA across semesters. Equal credits make the CGPA checkable:
 * (3.52 + 3.68 + 3.74) / 3 → 3.65.
 *
 * Server component — static figures, no state.
 */
export function GpaPanel({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <ul className="space-y-2">
        {DEMO_GPA.semesters.map((semester) => (
          <li
            key={semester.name}
            className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-2 last:border-b-0"
          >
            <span className="text-sm text-muted-foreground">
              {semester.name}
            </span>
            <span className="gp-figure text-sm font-medium">
              {semester.gpa}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-xl border border-primary/25 bg-primary/5 p-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Cumulative GPA
        </span>
        <span className="gp-figure text-2xl font-semibold leading-none text-primary">
          {DEMO_GPA.cgpa}
        </span>
      </div>

      <p className="gp-figure text-xs text-muted-foreground">
        Σ (grade point × credits) ÷ total credits
      </p>
    </div>
  );
}