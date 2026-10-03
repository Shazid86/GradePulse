import type { Metadata } from "next";
import Link from "next/link";

import { CalculatorForm } from "@/components/marketing/calculator/calculator-form";
import { DemoDataNotice } from "@/components/marketing/visuals/demo-data-notice";

export const metadata: Metadata = {
  title: "Required score calculator — GradePulse",
  description:
    "Enter your current marks, the course total and a target percentage to see exactly what you need from the marks that remain.",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
          Free tool
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          What do you need on the marks that are left?
        </h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Enter where you stand and where you want to finish. GradePulse returns
          the marks still required, and what that works out to as a percentage
          of everything that has not been graded yet.
        </p>
      </header>

      <div className="mt-10">
        <CalculatorForm />
      </div>

      <footer className="mt-10 space-y-6">
        <DemoDataNotice />
        <div className="gp-glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              This tool works on one course at a time.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              GradePulse keeps every semester, course, category and mark, and
              recalculates all of it as you go.
            </p>
          </div>
          <Link
            href="/auth/signup"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            Get Started
          </Link>
        </div>
      </footer>
    </div>
  );
}