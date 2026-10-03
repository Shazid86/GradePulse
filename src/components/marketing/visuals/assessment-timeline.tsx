import { cn } from "@/lib/utils";

import { DEMO_TIMELINE } from "./demo-data";

/**
 * Assessment progression: the semester's graded items in order, with the
 * pending one trailing. Rendered as connecting nodes rather than a list so the
 * sequence reads as a timeline without a charting dependency.
 */
export function AssessmentTimeline({ className }: { className?: string }) {
  return (
    <ol className={cn("relative flex flex-col gap-4 sm:flex-row sm:gap-0", className)}>
      {DEMO_TIMELINE.map((item, index) => (
        <li
          key={item.label}
          className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
        >
          {/* Connector — vertical on mobile, horizontal from sm up. */}
          {index < DEMO_TIMELINE.length - 1 ? (
            <span
              aria-hidden
              className={cn(
                "absolute bg-border",
                "left-[0.1875rem] top-6 h-[calc(100%+0.5rem)] w-px",
                "sm:left-1/2 sm:top-1.5 sm:h-px sm:w-full"
              )}
            />
          ) : null}

          <span
            aria-hidden
            className={cn(
              "relative z-10 mt-0.5 block size-1.5 shrink-0 rounded-full ring-4 ring-background",
              item.done ? "bg-primary" : "bg-muted-foreground/30",
              "sm:mt-0"
            )}
          />
          <div className="min-w-0 sm:pb-1">
            <p className="text-sm font-medium">{item.label}</p>
            <p
              className={cn(
                "gp-figure text-xs",
                item.done ? "text-muted-foreground" : "text-muted-foreground/70"
              )}
            >
              {item.marks}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}