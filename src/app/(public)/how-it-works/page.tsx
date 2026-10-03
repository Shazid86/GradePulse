import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import { DemoDataNotice } from "@/components/marketing/visuals/demo-data-notice";
import { ProductFrame } from "@/components/marketing/visuals/product-frame";
import { TargetEnginePanel } from "@/components/marketing/visuals/target-engine-panel";
import { WorkflowFlow } from "@/components/marketing/visuals/workflow-flow";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works — GradePulse",
  description:
    "Create a semester, add courses, configure assessments, record marks, and let GradePulse calculate where you stand and what you need next.",
};

const STEPS = [
  {
    title: "Create a semester",
    detail: "A name, an academic year and a date range.",
  },
  {
    title: "Add courses",
    detail: "Course code, credits, total marks and passing marks.",
  },
  {
    title: "Configure assessments",
    detail: "Categories and their weight — attendance 10, class tests 20, final 40.",
  },
  {
    title: "Record marks",
    detail: "Each test, assignment and exam with its own maximum and date.",
  },
  {
    title: "Calculate current position",
    detail: "Weighted totals, percentage and the marks still open.",
  },
  {
    title: "Analyse performance",
    detail: "Category comparison, trend over time, strongest and weakest areas.",
  },
  {
    title: "Set a target",
    detail: "A grade, a pass mark, or any custom percentage.",
  },
  {
    title: "Calculate required marks",
    detail: "Exactly what the remaining assessments have to deliver.",
  },
  {
    title: "Take action",
    detail: "Study the gap the numbers actually identify.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            How it works
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Nine steps, repeated until the semester ends.
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Setting up takes a few minutes. After that, each new mark simply
            updates the answer.
          </p>
        </Reveal>
      </div>

      <Section className="pt-10 sm:pt-12">
        <WorkflowFlow />
      </Section>

      <Section
        eyebrow="The sequence"
        title="What you actually do, in order."
        width="wide"
      >
        <ol className="relative">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[0.9375rem] top-8 h-[calc(100%-1.5rem)] w-px bg-border"
                />
              ) : null}
              <span
                aria-hidden
                className="gp-figure relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-medium text-muted-foreground"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <Reveal delay={index * 50} className="min-w-0 pt-1">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.detail}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        eyebrow="Step 8, in detail"
        title="The answer the whole sequence is building toward."
        lead="Required marks, expressed both as a number and as a share of everything still open."
        width="wide"
        className="border-b-0"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <Reveal variant="scale">
            <ProductFrame title="Target analysis" meta="Database Systems">
              <TargetEnginePanel />
            </ProductFrame>
            <DemoDataNotice className="mt-4" />
          </Reveal>
          <Reveal delay={120} className="space-y-5">
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              The same figure appears on the course page once a target is set,
              and it recalculates every time a mark is added or edited.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/calculator">Try the calculator</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/features">See all features</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}