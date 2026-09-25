import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  COURSE_STATUS_LABELS,
  type CourseStatus,
} from "@/calculations/status";

/** Visual mapping for §18 statuses — visible, documented, consistent. */
const STATUS_STYLES: Record<CourseStatus, string> = {
  strong: "border-primary/40 bg-primary/10 text-primary",
  stable: "border-border bg-secondary text-secondary-foreground",
  needs_attention:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  at_risk: "border-destructive/40 bg-destructive/10 text-destructive",
};

/** Renders nothing when the course has no graded assessments. */
export function StatusBadge({
  status,
  className,
}: {
  status: CourseStatus | null;
  className?: string;
}) {
  if (!status) return null;
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status], className)}
    >
      {COURSE_STATUS_LABELS[status]}
    </Badge>
  );
}
