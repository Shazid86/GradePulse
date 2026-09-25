import Link from "next/link";
import { formatMarks, formatPercent } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/analytics/status-badge";
import type { CourseCard as CourseCardData } from "@/features/dashboard/queries";

/** Course card for dashboard/semester overview (spec §22/§23). */
export function CourseCard({ course }: { course: CourseCardData }) {
  const { score } = course;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="block outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label={`Open ${course.name}`}
    >
      <Card className="glass h-full border-border/70 transition-colors hover:border-primary/40">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{course.name}</p>
              <p className="text-xs text-muted-foreground">
                {course.credits} credits
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
              {course.code}
            </Badge>
          </div>

          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatMarks(score.securedMarks)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {formatMarks(score.totalMarks)}
              </span>
            </p>
            <p className="text-lg font-semibold text-primary tabular-nums">
              {formatPercent(score.percentage)}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Remaining {formatMarks(score.remainingMarks)} · Max possible{" "}
            {formatMarks(score.maxPossibleScore)}
          </p>

          <StatusBadge status={course.status} className="w-fit" />
        </CardContent>
      </Card>
    </Link>
  );
}
