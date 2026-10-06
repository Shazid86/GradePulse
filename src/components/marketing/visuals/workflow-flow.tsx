import { Reveal } from "@/components/marketing/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * The GradePulse loop as a floating-card process flow — independent nodes
 * (no shared borders), each with its own hover lift and staggered entrance.
 *
 * Nodes light up in sequence on first reveal (80ms apart) so the eye follows
 * the actual order of work. One short phrase per node — no paragraphs.
 */
const STEPS: ReadonlyArray<{
  label: string;
  detail: string;
  accent?: boolean;
}> = [
  { label: "Enter data", detail: "Record every mark" },
  { label: "Calculate", detail: "Weighted, to the mark" },
  { label: "Analyse", detail: "Category by category" },
  { label: "Set target", detail: "From pass to A+" },
  { label: "Know what you need", detail: "Marks still required", accent: true },
  { label: "Act", detail: "Close the gap" },
];

export function WorkflowFlow({ className }: { className?: string }) {
  return (
    <ol
      className={cn(
        "relative grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3",
        className
      )}
    >
      {STEPS.map((step, index) => (
        <li key={step.label}>
          <Reveal delay={index * 80} variant="card" className="h-full">
            <div className="gp-card group flex h-full items-start gap-3 rounded-xl p-4 sm:p-5">
              <span
                aria-hidden
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary/15",
                  step.accent && "border border-primary/40"
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 self-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.accent && "text-primary"
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}