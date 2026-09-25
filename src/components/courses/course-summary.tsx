import { pickStrongestWeakest, type CourseScore } from "@/calculations/score";
import { formatMarks, formatPercent } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";

/**
 * Course score summary (spec §23): current score, percentage, remaining,
 * maximum possible + strongest/weakest graded category (§19).
 */
export function CourseSummary({ score }: { score: CourseScore }) {
  const { strongest, weakest } = pickStrongestWeakest(
    score.categories,
    (category) => category.percentage
  );

  return (
    <section aria-label="Score summary" className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Current score"
          value={`${formatMarks(score.securedMarks)} / ${formatMarks(score.totalMarks)}`}
          hint="marks secured"
        />
        <StatCard
          label="Percentage"
          value={formatPercent(score.percentage)}
          hint="of course total"
        />
        <StatCard
          label="Remaining"
          value={formatMarks(score.remainingMarks)}
          hint="marks to full"
        />
        <StatCard
          label="Maximum possible"
          value={formatMarks(score.maxPossibleScore)}
          hint={
            score.maxPossibleScore < score.totalMarks
              ? "attainable ceiling"
              : "still fully attainable"
          }
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          Strongest:{" "}
          <span className="font-medium text-foreground">
            {strongest
              ? `${strongest.name} ${formatPercent(strongest.percentage)}`
              : "—"}
          </span>
        </span>
        <span className="text-muted-foreground">
          Weakest:{" "}
          <span className="font-medium text-foreground">
            {weakest ? `${weakest.name} ${formatPercent(weakest.percentage)}` : "—"}
          </span>
        </span>
        {!strongest && (
          <span className="text-muted-foreground">
            Grade an assessment to compare categories.
          </span>
        )}
      </div>
    </section>
  );
}
