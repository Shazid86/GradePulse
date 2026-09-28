import type { Metadata } from "next";
import Link from "next/link";
import {
  findCurrentSemester,
  getSemesterOverview,
} from "@/features/dashboard/queries";
import { SemesterOverviewView } from "@/components/dashboard/semester-overview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand";

export const metadata: Metadata = { title: "Dashboard" };

const ONBOARDING_STEPS = [
  {
    step: "01",
    title: "Create a semester",
    detail: "e.g. Fall 2026 with its academic year and dates",
  },
  {
    step: "02",
    title: "Add your courses",
    detail: "Credits, total marks, passing marks, grading scale",
  },
  {
    step: "03",
    title: "Define assessment structure",
    detail: "Categories and their weights — e.g. Final = 40",
  },
  {
    step: "04",
    title: "Record assessments",
    detail: "Marks, dates, attendance — as they happen",
  },
  {
    step: "05",
    title: "See your performance",
    detail: "Scores, targets, required marks and trends",
  },
];

function Onboarding() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card className="glass border-border/70">
        <CardHeader className="space-y-2 text-center sm:text-left">
          <BrandMark className="size-9 rounded-xl" />
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Start tracking your semester
          </CardTitle>
          <CardDescription className="text-balance">
            GradePulse turns your raw marks into academic intelligence. Set up
            your semester in five steps — your dashboard fills in as you record
            real assessments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {ONBOARDING_STEPS.map((item) => (
              <li key={item.step} className="flex gap-3">
                <Badge
                  variant="secondary"
                  className="h-7 shrink-0 font-mono tabular-nums"
                  aria-hidden="true"
                >
                  {item.step}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button asChild className="mt-6 w-full sm:w-auto">
            <Link href="/semesters">Go to Semesters</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mx-auto w-full max-w-md rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

export default async function DashboardPage() {
  const current = await findCurrentSemester();

  if (current.error) return <LoadError message={current.error} />;
  if (!current.hasAny || !current.semesterId) return <Onboarding />;

  const { overview, error } = await getSemesterOverview(current.semesterId);
  if (error || !overview) {
    return <LoadError message={error ?? "Could not load the semester."} />;
  }

  return <SemesterOverviewView overview={overview} />;
}
