import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "The GradePulse workflow: create a semester, record marks, analyze, set a target and act.",
};

const WORKFLOW = [
  {
    title: "Create semester",
    body: "Name the term, set its academic year and dates — e.g. Fall 2026.",
  },
  {
    title: "Add courses",
    body: "Credits, total marks and passing marks for each course you are taking.",
  },
  {
    title: "Configure assessments",
    body: "Define each course's own structure — Attendance 10, Class Tests 20, Midterm 20, Final 40, or anything else.",
  },
  {
    title: "Record marks",
    body: "Enter scores as they happen: obtained marks, maximum, date, completion.",
  },
  {
    title: "Calculate current position",
    body: "GradePulse computes your secured score, percentage, remaining marks and maximum possible — automatically.",
  },
  {
    title: "Analyze performance",
    body: "Strongest and weakest categories, course status, and a numerical trend from your dated assessments.",
  },
  {
    title: "Set target",
    body: "Pass, a letter grade from your scale, or a custom percentage.",
  },
  {
    title: "Calculate required marks",
    body: "The exact marks you need — and the percentage of what remains that must be earned.",
  },
  {
    title: "Take action",
    body: "Focus on what moves the number. Record new marks and the cycle continues.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          How it works
        </h1>
        <p className="mt-3 text-muted-foreground">
          GradePulse follows a simple loop — data in, understanding out, action
          forward.
        </p>
      </div>

      <ol className="mt-10 space-y-4">
        {WORKFLOW.map((step, index) => (
          <li key={step.title}>
            <Card className="glass border-border/70">
              <CardHeader className="flex-row items-start gap-4 space-y-0">
                <Badge
                  variant="secondary"
                  className="h-7 shrink-0 font-mono tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </Badge>
                <div className="min-w-0">
                  <CardTitle className="text-base font-medium">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {step.body}
                  </CardDescription>
                </div>
                {index === WORKFLOW.length - 1 && (
                  <Check
                    className="ml-auto hidden size-5 shrink-0 text-primary sm:block"
                    aria-hidden="true"
                  />
                )}
              </CardHeader>
            </Card>
          </li>
        ))}
      </ol>

      <Card className="glass mt-8 border-primary/30 text-center">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Ready to know where you stand?
          </CardTitle>
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
    </div>
  );
}
