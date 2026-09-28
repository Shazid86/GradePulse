import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  GraduationCap,
  Sigma,
  Target,
  Gauge,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "GradePulse — Personal Academic Performance Command Center",
  description:
    "Stop guessing your academic performance. Know where you stand, what remains, and what you need next.",
};

const FEATURES = [
  {
    icon: Gauge,
    title: "Performance tracking",
    body: "Every class test, assignment, midterm and final in one structured place.",
  },
  {
    icon: Target,
    title: "Target engine",
    body: "Set a grade target and see the exact marks you still need.",
  },
  {
    icon: FlaskConical,
    title: "What-if simulator",
    body: "Test different outcomes before they happen — projections, not predictions.",
  },
  {
    icon: Sigma,
    title: "GPA & CGPA",
    body: "Configurable grading scales, credit-weighted GPA, semester history.",
  },
];

const STEPS = [
  "Create semester",
  "Add courses",
  "Configure assessments",
  "Record marks",
  "Know your position",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 to-transparent"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="secondary" className="mb-5">
            Personal Academic Performance Command Center
          </Badge>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Stop guessing your{" "}
            <span className="text-primary">academic performance</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Know exactly where you stand, what remains, and what you need
            next — from the marks you already have.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Marks are recorded. Understanding is missing.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Most students collect scores across the semester but never see the
            full picture until it is too late to act.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: "Scattered records",
              body: "Scores live in notebooks, portals and memory — never in one reliable view.",
            },
            {
              title: "Unclear standing",
              body: "What is your actual percentage? Which course needs attention today?",
            },
            {
              title: "No plan for what is left",
              body: "Without a target and required marks, effort is guesswork.",
            },
          ].map((item) => (
            <Card key={item.title} className="glass border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works (summary) */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              How GradePulse works
            </h2>
            <p className="mt-3 text-muted-foreground">
              A simple loop: record, calculate, analyze, act.
            </p>
          </div>
          <ol className="mt-8 flex flex-col gap-3 md:flex-row md:items-stretch">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="glass flex flex-1 items-center gap-3 rounded-xl border border-border/70 p-4"
              >
                <span className="font-mono text-sm font-semibold text-primary">
                  0{index + 1}
                </span>
                <span className="text-sm font-medium">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 text-center">
            <Button variant="ghost" asChild>
              <Link href="/how-it-works">
                Full workflow
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Core features
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need between raw marks and real decisions.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/features">
              All features
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href="/features"
              className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card className="glass h-full border-border/70 transition-colors group-hover:border-primary/40">
                <CardHeader className="pb-2">
                  <feature.icon
                    className="mb-1 size-5 text-primary"
                    aria-hidden="true"
                  />
                  <CardTitle className="text-base font-medium">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {feature.body}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Calculation example */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-4">
              Academic calculation
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              From raw marks to a clear next step
            </h2>
            <p className="mt-3 text-muted-foreground">
              GradePulse combines your recorded marks into one current
              position, then tells you exactly what the remaining assessments
              must deliver for your target.
            </p>
          </div>
          <Card className="glass border-border/70">
            <CardHeader className="pb-2">
              <CardDescription>Illustrative example</CardDescription>
              <CardTitle className="text-base font-medium">
                Target: 80% · Current: 61 / 100
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-sm tabular-nums">
              <p className="text-muted-foreground">
                required = 80 − 61 ={" "}
                <span className="text-foreground">19 marks</span>
              </p>
              <p className="text-muted-foreground">
                remaining = 100 − 61 ={" "}
                <span className="text-foreground">39 marks</span>
              </p>
              <p className="text-primary">
                you need 19 / 39 → 48.7% of what is left
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Target / What-if example */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="glass border-border/70">
            <CardHeader>
              <Target className="mb-1 size-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base font-medium">
                Target engine
              </CardTitle>
              <CardDescription>
                Pass, a letter grade, or any custom percentage — the answer is
                arithmetic, not guesswork: achievable, already achieved, or
                out of reach, with the honest maximum shown.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass border-border/70">
            <CardHeader>
              <FlaskConical
                className="mb-1 size-5 text-primary"
                aria-hidden="true"
              />
              <CardTitle className="text-base font-medium">
                What-if simulator
              </CardTitle>
              <CardDescription>
                &ldquo;What if I score 30 on the final?&rdquo; — projected
                totals update instantly from your real course structure.
                Projections, not predictions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* GPA overview */}
        <Card className="glass mt-4 border-border/70">
          <CardHeader className="pb-2">
            <GraduationCap
              className="mb-1 size-5 text-primary"
              aria-hidden="true"
            />
            <CardTitle className="text-base font-medium">
              GPA &amp; CGPA
            </CardTitle>
            <CardDescription>
              Configure the grading scale your program actually uses — letter
              grades, grade points and credit weighting. Semester GPA and
              CGPA across completed semesters follow automatically.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <Card className="glass border-primary/30 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Start tracking your semester
            </CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Set up takes minutes. Every mark you record from then on turns
              into insight you can act on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
