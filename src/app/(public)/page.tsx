import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  GraduationCap,
  ListChecks,
  Sigma,
  Target,
  TrendingUp,
} from "lucide-react";

import { HeroActions } from "@/components/marketing/auth/hero-actions";
import { Float } from "@/components/marketing/motion/float";
import { Reveal } from "@/components/marketing/motion/reveal";
import { Tilt } from "@/components/marketing/motion/tilt";
import { Section } from "@/components/marketing/section";
import { AssessmentTimeline } from "@/components/marketing/visuals/assessment-timeline";
import { DemoDataNotice } from "@/components/marketing/visuals/demo-data-notice";
import { DEMO_GPA, DEMO_TARGET } from "@/components/marketing/visuals/demo-data";
import { GpaPanel } from "@/components/marketing/visuals/gpa-panel";
import { PerformanceOverview } from "@/components/marketing/visuals/performance-overview";
import { ProductFrame } from "@/components/marketing/visuals/product-frame";
import { TargetEnginePanel } from "@/components/marketing/visuals/target-engine-panel";
import { WhatIfPanel } from "@/components/marketing/visuals/what-if-panel";
import { WorkflowFlow } from "@/components/marketing/visuals/workflow-flow";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "GradePulse — Personal Academic Performance Command Center",
  description:
    "Stop guessing your academic performance. Know exactly where you stand, what remains, and what you need next.",
};

const PROBLEMS = [
  {
    title: "Marks live in ten places",
    body: "Class tests in a notebook, assignments in a folder, the midterm in an email. Nothing adds up on its own.",
  },
  {
    title: "Percentages are guessed",
    body: "Weighted categories rarely resolve into a number you can trust, so the running total stays approximate.",
  },
  {
    title: "The remaining marks are unknown",
    body: "Without a current total there is no way to say what the final actually demands.",
  },
];

const SUPPORTING = [
  {
    icon: ListChecks,
    title: "Track every mark",
    body: "Class tests, quizzes, assignments, labs, midterms, finals — recorded against the structure your course actually uses.",
  },
  {
    icon: TrendingUp,
    title: "Understand course performance",
    body: "Weighted totals, category comparisons and a dated performance trend, all from the same set of records.",
  },
  {
    icon: Target,
    title: "Set measurable targets",
    body: "Choose a grade or a custom percentage and see the exact marks still required to reach it.",
  },
  {
    icon: Sigma,
    title: "What-if scenarios",
    body: "Try an outcome on the assessments that remain and see the projected course total before it happens.",
  },
  {
    icon: GraduationCap,
    title: "GPA and CGPA",
    body: "Configurable grading scales, credit weighting, semester GPA and a CGPA across completed semesters.",
  },
  {
    icon: CalendarDays,
    title: "Academic calendar",
    body: "Tests, assignments and exams with countdowns and completion state, so nothing arrives unannounced.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16 lg:pt-24">
          <div>
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Academic Performance Command Center
              </p>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl">
                Stop guessing your academic performance.
              </h1>
              <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
                Know exactly where you stand, what remains, and what you need
                next.
              </p>
            </Reveal>

            <Reveal delay={120} className="mt-8 flex flex-wrap items-center gap-3">
              <HeroActions />
            </Reveal>

            <Reveal delay={200} className="mt-10 max-w-sm">
              <DemoDataNotice />
            </Reveal>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <Reveal variant="scale" delay={80}>
              <Tilt>
                <Float duration={10}>
                  <ProductFrame
                    title="Course overview"
                    meta={`${DEMO_TARGET.percent}% target`}
                  >
                    <PerformanceOverview />
                  </ProductFrame>
                </Float>
              </Tilt>
            </Reveal>

            {/* Satellites: separate depths, phase-shifted, hidden on mobile. */}
            <Float
              delay={1200}
              duration={11}
              className="pointer-events-none absolute -left-6 -top-8 hidden w-44 sm:block lg:-left-10"
            >
              <div className="gp-glass rounded-xl p-3">
                <p className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                  Required
                </p>
                <p className="gp-figure mt-1 text-lg font-semibold leading-none text-primary">
                  {DEMO_TARGET.required} / {DEMO_TARGET.remaining}
                </p>
                <p className="gp-figure mt-1 text-[0.6875rem] text-muted-foreground">
                  {DEMO_TARGET.requiredOfRemaining} of remaining
                </p>
              </div>
            </Float>

            <Float
              delay={2400}
              duration={12}
              className="pointer-events-none absolute -bottom-8 -right-4 hidden w-36 sm:block lg:-right-8"
            >
              <div className="gp-glass rounded-xl p-3">
                <p className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                  GPA
                </p>
                <p className="gp-figure mt-1 text-lg font-semibold leading-none">
                  {DEMO_GPA.latest}
                </p>
                <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                  Latest semester
                </p>
              </div>
            </Float>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- PROBLEM */}
      <Section
        eyebrow="The problem"
        title="A semester produces a lot of numbers and very little clarity."
        lead="GradePulse exists because the arithmetic between raw marks and a useful answer is the part students are left to do by hand."
      >
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 md:grid-cols-3">
          {PROBLEMS.map((problem, index) => (
            <li key={problem.title} className="bg-background/80 p-5 backdrop-blur-sm">
              <Reveal delay={index * 70}>
                <p className="text-sm font-medium">{problem.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {problem.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------ HOW IT WORKS (short) */}
      <Section
        eyebrow="How it works"
        title="One loop, repeated every time a mark arrives."
        lead="Each step feeds the next, and every new record recalculates the answer."
      >
        <WorkflowFlow />
      </Section>

      {/* -------------------------------------------------------------- TARGET */}
      <Section
        eyebrow="Target engine"
        title="Know what the remaining marks have to be."
        lead="GradePulse tells you exactly what you need on the marks that are left."
        width="wide"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <Reveal variant="scale">
            <ProductFrame title="Target analysis" meta="Database Systems">
              <TargetEnginePanel />
            </ProductFrame>
            <DemoDataNotice className="mt-4" />
          </Reveal>

          <Reveal delay={120} className="space-y-5">
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Set a target from a grade or a custom percentage. GradePulse
              subtracts what you have already secured and expresses the
              remainder as marks — and as a share of everything still open.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Achieved targets resolve to zero required marks.",
                "Targets beyond the maximum possible score are flagged as out of reach.",
                "The projection is arithmetic on your records — never a prediction.",
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
            <ProductFrame title="Assessment progression" meta="Semester 3">
              <AssessmentTimeline />
            </ProductFrame>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------------ WHAT-IF */}
      <Section
        eyebrow="What-if simulator"
        title="Test an outcome before it happens."
        lead="Enter a mark for the assessments that remain and see where the course total lands."
        width="wide"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <Reveal variant="scale">
            <ProductFrame title="Simulator" meta="Final · 40 marks">
              <WhatIfPanel />
            </ProductFrame>
            <DemoDataNotice className="mt-4" />
          </Reveal>
          <Reveal delay={120}>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Move the slider and the projected total updates immediately. The
              same engine powers the simulator inside the application, so the
              numbers shown here are the numbers the product produces.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- GPA */}
      <Section
        eyebrow="GPA and CGPA"
        title="Semester grades, weighted by credit."
        lead="Configure the grading scale your institution uses — 4.0, 5.0, 10.0 or a custom table — and GradePulse converts the same marks into grade points."
        width="wide"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <Reveal variant="scale">
            <ProductFrame title="Grade point average" meta="3 semesters">
              <GpaPanel />
            </ProductFrame>
            <DemoDataNotice className="mt-4" />
          </Reveal>
          <Reveal delay={120} className="space-y-5">
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Semester GPA covers the courses you have graded. CGPA rolls those
              semesters up once they are complete, so past performance stays
              comparable with the present.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "No grading scale is hard-coded — every course can carry its own.",
                "Ungraded courses are excluded from the calculation rather than counted as zero.",
                "Decimal grade points are preserved, not rounded away.",
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
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------------ FEATURES */}
      <Section
        eyebrow="Everything else"
        title="Built around the record, not around the form."
        lead="Every module reads the same stored marks, so course analytics, targets, simulations and GPA always agree."
        width="wide"
      >
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORTING.map((item, index) => (
            <li key={item.title} className="bg-background/80 backdrop-blur-sm">
              <Reveal delay={(index % 3) * 70} className="h-full">
                <div className="flex h-full flex-col p-5">
                  <item.icon aria-hidden className="size-4 text-primary" />
                  <p className="mt-3 text-sm font-medium">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* ----------------------------------------------------------------- CTA */}
      <Section
        title="Start with one semester."
        lead="Add a course, describe how it is assessed, and record the first mark. The dashboard fills in from there."
        className="border-b-0"
      >
        <Reveal className="gp-glass flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">GradePulse is free to start.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No marks required to look around — the calculator works on its
              own.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/calculator">Try the calculator</Link>
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}