import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { pickStrongestWeakest, type CourseScore } from "@/calculations/score";
import type { TrendAnalysis } from "@/calculations/trend";
import type { CourseStatus } from "@/calculations/status";
import { formatMarks, formatGpa, formatPercent } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/analytics/status-badge";
import { Badge } from "@/components/ui/badge";

const TREND_META = {
  improving: { label: "Improving", Icon: ArrowUpRight },
  declining: { label: "Declining", Icon: ArrowDownRight },
  stable: { label: "Stable", Icon: Minus },
} as const;

function TrendBadge({ trend }: { trend: TrendAnalysis | null }) {
  if (!trend || trend.sampleSize < 2) return null;
  const meta = TREND_META[trend.direction];
  const Icon = meta.Icon;
  const sign = trend.slope > 0 ? "+" : "";
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <Icon className="size-3" aria-hidden="true" />
      Trend: {meta.label} ({sign}
      {trend.slope} pts/step)
    </Badge>
  );
}

/**
 * Course score summary (spec §23): current score, percentage, remaining,
 * maximum possible + strongest/weakest (§19) + status (§18) + trend (§17).
 */
export function CourseSummary({
  score,
  status,
  trend,
  grade,
}: {
  score: CourseScore;
  status: CourseStatus | null;
  trend: TrendAnalysis | null;
  grade: { grade: string; gradePoint: number } | null;
}) {
  const { strongest, weakest } = pickStrongestWeakest(
    score.categories,
    (category) => category.percentage
  );

  return (
    <section aria-label="Score summary" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {grade && (
          <Badge variant="outline" className="border-primary/40 bg-primary/10 font-medium text-primary">
            Grade {grade.grade} · {formatGpa(grade.gradePoint)} GP
          </Badge>
        )}
        <StatusBadge status={status} />
        <TrendBadge trend={trend} />
      </div>

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
