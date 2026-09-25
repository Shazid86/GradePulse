import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { deleteCourse } from "@/features/courses/actions";
import { getCourse } from "@/features/courses/queries";
import { listCategories } from "@/features/categories/queries";
import { listAssessments } from "@/features/assessments/queries";
import { buildCourseScore } from "@/features/scores/assembly";
import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { CourseSummary } from "@/components/courses/course-summary";
import { CategoryBreakdown } from "@/components/courses/category-breakdown";
import { StructureCard } from "@/components/structure/structure-card";
import { AssessmentsCard } from "@/components/structure/assessments-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Course" };

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [course, categories, assessments] = await Promise.all([
    getCourse(courseId),
    listCategories(courseId),
    listAssessments(courseId),
  ]);
  if (!course) notFound();

  const assessmentCountByCategory = new Map<string, number>();
  for (const assessment of assessments) {
    assessmentCountByCategory.set(
      assessment.category_id,
      (assessmentCountByCategory.get(assessment.category_id) ?? 0) + 1
    );
  }
  const score = buildCourseScore(course, categories, assessments);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="space-y-4">
        <Link
          href={`/semesters/${course.semester.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {course.semester.name}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {course.name}
              </h1>
              <Badge variant="outline" className="font-mono text-[11px]">
                {course.code}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {course.credits} credits · {course.total_marks} marks · pass at{" "}
              {course.passing_marks}
              {course.instructor ? ` · ${course.instructor}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CourseFormDialog
              semesterId={course.semester_id}
              course={course}
              trigger={
                <Button variant="outline" size="sm">
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
              }
            />
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label="Delete course">
                  <Trash2 aria-hidden="true" />
                </Button>
              }
              title="Delete course?"
              description={`“${course.name}” and its assessment structure and assessments will be permanently deleted.`}
              onConfirm={deleteCourse.bind(
                null,
                course.id,
                `/semesters/${course.semester_id}`
              )}
            />
          </div>
        </div>
      </header>

      <CourseSummary score={score} />

      <CategoryBreakdown categories={score.categories} />

      <StructureCard
        courseId={course.id}
        totalMarks={Number(course.total_marks)}
        categories={categories}
        assessmentCountByCategory={assessmentCountByCategory}
      />

      <AssessmentsCard
        categories={categories}
        assessments={assessments}
      />
    </div>
  );
}
