import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { deleteCourse } from "@/features/courses/actions";
import { getCourse } from "@/features/courses/queries";
import { listCategories } from "@/features/categories/queries";
import { listAssessments } from "@/features/assessments/queries";
import { buildCourseAnalytics } from "@/features/scores/analytics";
import { getCourseTarget } from "@/features/targets/queries";
import { buildTargetPresets } from "@/features/targets/presets";
import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { GradingScaleDialog } from "@/components/courses/grading-scale-dialog";
import { Scale } from "lucide-react";
import { CourseSummary } from "@/components/courses/course-summary";
import { CategoryBreakdown } from "@/components/courses/category-breakdown";
import { ChartCard } from "@/components/analytics/chart-card";
import { PerformanceTrendChart } from "@/components/analytics/performance-trend-chart";
import { CategoryComparisonChart } from "@/components/analytics/category-comparison-chart";
import { AssessmentProgressionChart } from "@/components/analytics/assessment-progression-chart";
import { TargetAnalysis } from "@/components/targets/target-analysis";
import { WhatIfSimulator } from "@/components/targets/what-if-simulator";
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
  const [course, categories, assessments, target] = await Promise.all([
    getCourse(courseId),
    listCategories(courseId),
    listAssessments(courseId),
    getCourseTarget(courseId),
  ]);
  if (!course) notFound();

  const assessmentCountByCategory = new Map<string, number>();
  for (const assessment of assessments) {
    assessmentCountByCategory.set(
      assessment.category_id,
      (assessmentCountByCategory.get(assessment.category_id) ?? 0) + 1
    );
  }
  const analytics = buildCourseAnalytics(course, categories, assessments);
  const { score } = analytics;

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
            <GradingScaleDialog
              course={course}
              trigger={
                <Button variant="outline" size="sm">
                  <Scale aria-hidden="true" />
                  Grading scale
                </Button>
              }
            />
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

      <CourseSummary
        score={score}
        status={analytics.status}
        trend={analytics.trend}
        grade={analytics.grade}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Performance over time"
          description="Each dated, graded assessment"
          isEmpty={analytics.series.length < 2}
          emptyMessage="Record at least two dated assessments to see your performance over time."
        >
          <PerformanceTrendChart points={analytics.series} />
        </ChartCard>

        <ChartCard
          title="Category comparison"
          description="Graded categories, percentage of marks earned"
          isEmpty={!analytics.score.categories.some((c) => c.percentage !== null)}
          emptyMessage="Grade assessments to compare your categories."
        >
          <CategoryComparisonChart categories={analytics.score.categories} />
        </ChartCard>
      </div>

      <ChartCard
        title="Assessment progression"
        description="Cumulative secured marks over time"
        isEmpty={analytics.progression.length < 1}
        emptyMessage="Dated, graded assessments will build your progression curve."
      >
        <AssessmentProgressionChart
          points={analytics.progression}
          totalMarks={score.totalMarks}
        />
      </ChartCard>

      <TargetAnalysis
        course={course}
        target={target}
        score={score}
        presets={buildTargetPresets(course)}
      />

      <WhatIfSimulator input={analytics.input} current={score} />

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
