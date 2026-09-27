import { formatMarks, formatGpa, formatPercent } from "@/lib/format";
import type { SemesterOverview } from "@/features/dashboard/queries";
import { StatCard } from "@/components/dashboard/stat-card";

/** Compact computed summary strip for the semester detail page. */
export function SemesterSummary({
  overview,
}: {
  overview: SemesterOverview;
}) {
  const { semesterScore, strongestCourse, weakestCourse } = overview;

  return (
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
            ? `${overview.gpa.gradedCourses} graded courses`
            : "no grades yet"
        }
      />
      <StatCard
        label="Remaining"
        value={formatMarks(semesterScore.remainingMarks)}
        hint="marks across courses"
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
        label="Needs attention"
        value={weakestCourse ? weakestCourse.name : "—"}
        hint={
          weakestCourse
            ? formatPercent(weakestCourse.score.percentage)
            : "Nothing graded yet"
        }
      />
    </div>
  );
}
