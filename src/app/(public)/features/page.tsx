import type { Metadata } from "next";
import {
  BellRing,
  CalendarDays,
  GraduationCap,
  ListChecks,
  Sigma,
  Target,
  TrendingUp,
} from "lucide-react";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import { DemoDataNotice } from "@/components/marketing/visuals/demo-data-notice";
import { PerformanceOverview } from "@/components/marketing/visuals/performance-overview";
import { ProductFrame } from "@/components/marketing/visuals/product-frame";

export const metadata: Metadata = {
  title: "Features — GradePulse",
  description:
    "Academic performance tracking, course analytics, assessment tracking, a target engine, a what-if simulator, GPA and CGPA, and an academic calendar.",
};

const MODULES = [
  {
    icon: ListChecks,
    title: "Academic performance tracking",
    body: "Record class tests, quizzes, assignments, labs, presentations, viva, projects and finals. Every course carries its own assessment structure, so the weighting matches how you are actually graded.",
  },
  {
    icon: TrendingUp,
    title: "Course analytics",
    body: "Weighted totals, category comparisons and a chronological performance trend built from the dates on your records. Strongest and weakest categories are named from the data, not inferred.",
  },
  {
    icon: BellRing,
    title: "Assessment tracking",
    body: "Each assessment holds its own marks, maximum, date, notes and completion state. Pending items are visibly distinct from graded ones, and incomplete categories never distort the total.",
  },
  {
    icon: Target,
    title: "Target engine",
    body: "Set a pass mark, a letter grade or a custom percentage. GradePulse reports the marks still required, what that represents as a share of the marks that remain, and whether the target is achievable at all.",
  },
  {
    icon: Sigma,
    title: "What-if simulator",
    body: "Try an outcome for the assessments that are still open and see the projected course total. Nothing is written to your records — it is a calculation on top of them.",
  },
  {
    icon: GraduationCap,
    title: "GPA and CGPA",
    body: "Define the grading scale each course uses, and GradePulse converts percentages into grade points weighted by credit. Semester GPA covers a term; CGPA rolls up completed semesters.",
  },
  {
    icon: CalendarDays,
    title: "Academic calendar",
    body: "Upcoming tests, assignments and exams with countdowns and completion state, plus a dashboard section showing what is next across the whole semester.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Features
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Know exactly where you stand.
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            GradePulse keeps one structured record of your semester and derives
            every answer from it. Nothing is estimated, and nothing is stored
            twice.
          </p>
        </Reveal>
      </div>

      {/* Featured block: the dashboard composition, at a larger size. */}
      <Section className="pb-0 pt-10 sm:pt-12">
        <Reveal variant="scale">
          <ProductFrame
            title="Course overview"
            meta="Weighted · 100 marks"
            bodyClassName="p-5 sm:p-7"
          >
            <div className="grid gap-7 lg:grid-cols-2 lg:items-center">
              <PerformanceOverview />
              <div className="space-y-4">
                <p className="text-sm font-medium">One view, four answers.</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  How many marks you have secured, what percentage that
                  represents, how many marks are still open, and the highest
                  total you can still reach — calculated from the categories and
                  weights you configured.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Weighted by category, not averaged naively.",
                    "Pending assessments counted as still obtainable.",
                    "Rounded for display, exact underneath.",
                  ].map((line) => (
                    <li key={line} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 block size-1 shrink-0 rounded-full bg-primary"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ProductFrame>
          <DemoDataNotice className="mt-4" />
        </Reveal>
      </Section>

      <Section
        eyebrow="Modules"
        title="Seven parts, one record."
        lead="Each module reads the same stored marks, so the answers stay consistent across the application."
        width="wide"
        className="border-b-0"
      >
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 md:grid-cols-2">
          {MODULES.map((module, index) => (
            <li key={module.title} className="bg-background/80 backdrop-blur-sm">
              <Reveal delay={(index % 2) * 70} className="h-full">
                <div className="flex h-full flex-col p-5 sm:p-6">
                  <module.icon aria-hidden className="size-4 text-primary" />
                  <p className="mt-3 text-sm font-medium">{module.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {module.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}