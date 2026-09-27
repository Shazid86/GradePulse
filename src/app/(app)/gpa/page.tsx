import type { Metadata } from "next";
import Link from "next/link";
import { getGpaOverview } from "@/features/gpa/queries";
import { formatGpa, formatPercent } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "GPA" };

export default async function GpaPage() {
  const { overview, error } = await getGpaOverview();

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto w-full max-w-md rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
      >
        {error}
      </div>
    );
  }

  if (!overview || overview.semesters.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card className="glass border-border/70">
          <CardHeader className="space-y-2 text-center sm:text-left">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              GPA &amp; CGPA
            </CardTitle>
            <CardDescription>
              Grade points, semester GPA and CGPA appear once you have
              semesters and grading scales configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/semesters">Go to Semesters</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { cgpa, completedSemesters, semesters } = overview;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          GPA &amp; CGPA
        </h1>
        <p className="text-sm text-muted-foreground">
          Credit-weighted grade points from your configured scales
        </p>
      </header>

      <Card className="glass border-border/70">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base font-medium">
            Cumulative GPA
          </CardTitle>
          <CardDescription>
            {completedSemesters > 0
              ? `Across ${completedSemesters} completed ${completedSemesters === 1 ? "semester" : "semesters"} · ${cgpa.gradedCredits} graded credits`
              : "Complete a semester to build your CGPA"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {formatGpa(cgpa.gpa)}
          </p>
        </CardContent>
      </Card>

      <section aria-labelledby="gpa-history" className="space-y-3">
        <h2 id="gpa-history" className="text-lg font-medium">
          Semester history
        </h2>
        <ul className="space-y-3">
          {semesters.map((entry) => (
            <li key={entry.semester.id}>
              <Card className="glass border-border/70">
                <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {entry.semester.name}
                      </span>
                      <Badge
                        variant={
                          entry.semester.status === "active"
                            ? "default"
                            : entry.semester.status === "upcoming"
                              ? "secondary"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {entry.semester.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.semester.academic_year} · {entry.totalCourses}{" "}
                      {entry.totalCourses === 1 ? "course" : "courses"} ·{" "}
                      {entry.gradedCourses} graded
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">GPA</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatGpa(entry.gpa)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Overall</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatPercent(entry.overall.percentage)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
