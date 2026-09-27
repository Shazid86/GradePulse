import { formatMarks, formatGpa, formatPercent } from "@/lib/format";
import type { SemesterOverview } from "@/features/dashboard/queries";
import { StatCard } from "./stat-card";
import { CourseCard } from "./course-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Semester overview for the main dashboard (spec §22):
 * overall percentage, course count, strongest / needs-attention course,
 * and the course card grid. All numbers come from the calculation engine.
 */
export function SemesterOverviewView({
  overview,
}: {
  overview: SemesterOverview;
}) {
  const { semester, semesterScore, courseCards, strongestCourse, weakestCourse } =
    overview;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
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
          {semester.academic_year} · Current semester overview
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Overall"
          value={formatPercent(semesterScore.percentage)}
          hint={`${formatMarks(semesterScore.securedMarks)} / ${formatMarks(semesterScore.totalMarks)} marks`}
        />
        <StatCard
          label="Semester GPA"
          value={formatGpa(overview.gpa.gpa)}
          hint={
            overview.gpa.gradedCredits > 0
              ? `over ${overview.gpa.gradedCredits} graded credits`
              : "no grades yet"
          }
        />
        <StatCard
          label="Courses"
          value={String(semesterScore.courseCount)}
          hint={semester.academic_year}
        />
        <StatCard
          label="Strongest course"
          value={strongestCourse ? strongestCourse.name : "—"}
          hint={
            strongestCourse
              ? formatPercent(strongestCourse.score.percentage)
              : "Nothing graded yet"
          }
        />
        <StatCard
          label="Course needing attention"
          value={weakestCourse ? weakestCourse.name : "—"}
          hint={
            weakestCourse
              ? formatPercent(weakestCourse.score.percentage)
              : "Nothing graded yet"
          }
        />
      </div>

      <section aria-labelledby="dashboard-courses" className="space-y-3">
        <h2 id="dashboard-courses" className="text-lg font-medium">
          Courses
        </h2>
        {courseCards.length === 0 ? (
          <Card className="glass border-border/70">
            <CardContent className="space-y-2 py-8 text-center">
              <h3 className="font-medium">No courses in this semester</h3>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Add courses from the semester page to start seeing your
                performance here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {courseCards.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
