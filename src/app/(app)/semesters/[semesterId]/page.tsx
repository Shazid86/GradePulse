import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { deleteSemester } from "@/features/semesters/actions";
import { getSemester } from "@/features/semesters/queries";
import { SemesterFormDialog } from "@/components/semesters/semester-form-dialog";
import { SemesterCourses } from "@/components/semesters/semester-courses";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Semester" };

export default async function SemesterDetailPage({
  params,
}: {
  params: Promise<{ semesterId: string }>;
}) {
  const { semesterId } = await params;
  const semester = await getSemester(semesterId);
  if (!semester) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="space-y-4">
        <Link
          href="/semesters"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Semesters
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {semester.name}
              </h1>
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
              {semester.academic_year} · {semester.courses.length}{" "}
              {semester.courses.length === 1 ? "course" : "courses"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SemesterFormDialog
              semester={semester}
              trigger={
                <Button variant="outline" size="sm">
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
              }
            />
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label="Delete semester">
                  <Trash2 aria-hidden="true" />
                </Button>
              }
              title="Delete semester?"
              description={`“${semester.name}” and all of its courses, categories and assessments will be permanently deleted.`}
              onConfirm={deleteSemester.bind(null, semester.id, "/semesters")}
            />
          </div>
        </div>
      </header>

      <SemesterCourses semesterId={semester.id} courses={semester.courses} />
    </div>
  );
}
