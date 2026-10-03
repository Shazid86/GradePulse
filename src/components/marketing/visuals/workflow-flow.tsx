import { Reveal } from "@/components/marketing/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * The GradePulse loop, as a connected process flow rather than a row of cards.
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
        "relative grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {STEPS.map((step, index) => (
        <li key={step.label} className="bg-background/80 backdrop-blur-sm">
          <Reveal delay={index * 80} className="h-full">
            <div className="flex h-full items-start gap-3 p-4 sm:p-5">
              <span
                aria-hidden
                className={cn(
                  "gp-figure mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-[0.6875rem] font-medium",
                  step.accent
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/70 text-muted-foreground"
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
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