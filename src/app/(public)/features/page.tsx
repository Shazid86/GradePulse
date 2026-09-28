import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Gauge,
  PenLine,
  Sigma,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Performance tracking, course analytics, the target engine, what-if simulation, GPA/CGPA and the academic calendar.",
};

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Academic performance tracking",
    body: "Record class tests, quizzes, assignments, attendance, midterms, finals, labs, presentations, viva and custom assessments. Every course carries its own assessment structure — no university format is hard-coded.",
  },
  {
    icon: Gauge,
    title: "Course analytics",
    body: "Current score, percentage, remaining marks, strongest and weakest categories, course status and a numerical performance trend — all derived from your stored marks.",
  },
  {
    icon: PenLine,
    title: "Assessment tracking",
    body: "Each assessment carries marks, a maximum, a date and completion status. Chronological progression shows how your secured marks accumulate over the semester.",
  },
  {
    icon: Target,
    title: "Target engine",
    body: "Choose Pass, a letter from your grading scale, or a custom percentage. GradePulse returns the exact required marks, the required percentage of what remains, and whether the target is achievable, achieved or out of reach.",
  },
  {
    icon: FlaskConical,
    title: "What-if simulator",
    body: "Enter hypothetical marks for pending assessments and unassessed categories to see the projected total instantly. Mathematical projection — never a prediction.",
  },
  {
    icon: Sigma,
    title: "GPA & CGPA",
    body: "Configure your own grading scale with letters, thresholds and grade points. Credit-weighted semester GPA and CGPA across completed semesters follow automatically.",
  },
  {
    icon: CalendarDays,
    title: "Academic calendar",
    body: "Upcoming tests, assignments, midterms and finals in one view — with completion states so you always know what is next.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Features
        </h1>
        <p className="mt-3 text-muted-foreground">
          One system from raw marks to decisions — built around your courses,
          not someone else&rsquo;s template.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="glass border-border/70">
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
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button size="lg" asChild>
          <Link href="/auth/signup">
            Get Started
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
