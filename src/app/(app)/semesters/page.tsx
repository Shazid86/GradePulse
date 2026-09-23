import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteSemester } from "@/features/semesters/actions";
import { listSemesters } from "@/features/semesters/queries";
import { SemesterFormDialog } from "@/components/semesters/semester-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Semesters" };

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function SemestersPage() {
  const { semesters, error } = await listSemesters();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Semesters</h1>
          <p className="text-sm text-muted-foreground">
            Your academic terms and the courses inside them.
          </p>
        </div>
        <SemesterFormDialog
          trigger={
            <Button>
              <Plus aria-hidden="true" />
              New semester
            </Button>
          }
        />
      </header>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {!error && semesters.length === 0 && (
        <Card className="glass border-border/70">
          <CardContent className="space-y-2 py-10 text-center">
            <h2 className="font-medium">No semesters yet</h2>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Create your first semester — e.g. Fall 2026 — then add its
              courses and define how each one is assessed.
            </p>
          </CardContent>
        </Card>
      )}

      {semesters.length > 0 && (
        <ul className="space-y-3">
          {semesters.map((semester) => (
            <li key={semester.id}>
              <Card className="glass border-border/70">
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/semesters/${semester.id}`}
                        className="truncate font-medium underline-offset-4 hover:text-primary hover:underline"
                      >
                        {semester.name}
                      </Link>
                      <Badge
                        variant={
                          semester.status === "active"
                            ? "default"
                            : semester.status === "upcoming"
                              ? "secondary"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {semester.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {semester.academic_year} · {formatDate(semester.start_date)} –{" "}
                      {formatDate(semester.end_date)} ·{" "}
                      {semester.courseCount}{" "}
                      {semester.courseCount === 1 ? "course" : "courses"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <SemesterFormDialog
                      semester={semester}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${semester.name}`}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      }
                    />
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${semester.name}`}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      }
                      title="Delete semester?"
                      description={`“${semester.name}” and all of its courses, categories and assessments will be permanently deleted.`}
                      onConfirm={deleteSemester.bind(null, semester.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
