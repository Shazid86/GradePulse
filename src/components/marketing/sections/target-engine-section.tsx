import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import {
  DEMO_COURSE,
  DEMO_TARGET,
} from "@/components/marketing/visuals/demo-data";

/**
 * Target-engine explainer: the fixture's worked chain
 * 60 secured → 85 target → 25 required → 25 / 40 = 62.5%.
 * 62.5% carries the strongest visual weight — it is the answer the section
 * exists to show. Engine-verified by demo-data.test.ts.
 */
const STEPS = [
  { value: `${DEMO_COURSE.secured}`, label: "secured so far" },
  { value: `${DEMO_TARGET.marks}`, label: "target total" },
  { value: `${DEMO_TARGET.required}`, label: "still required" },
] as const;

export function TargetEngineSection() {
  return (
    <Section
      id="target-engine"
      eyebrow="Target engine"
      title="Know exactly what you need."
      lead="A target is only useful when it resolves to a number you can act on."
      width="wide"
    >
      <Reveal variant="scale">
        <div className="gp-glass-deep overflow-hidden rounded-2xl p-6 sm:p-8">
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.label}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/60 p-4 sm:block sm:border-0 sm:bg-transparent sm:p-0"
              >
                <span className="gp-figure block text-3xl font-medium sm:text-4xl">
                  {step.value}
                </span>
                <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground sm:mt-2">
                  {index < STEPS.length - 1 ? `${step.label} →` : step.label}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="gp-figure text-lg font-medium sm:text-xl">
              {DEMO_TARGET.required} / {DEMO_TARGET.remaining} remaining marks
            </p>
            <p className="gp-figure text-4xl font-semibold text-primary sm:text-5xl">
              {DEMO_TARGET.requiredOfRemaining}
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

