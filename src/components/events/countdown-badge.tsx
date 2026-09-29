import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { daysUntil, formatCountdown } from "@/lib/dates";

/**
 * Countdown chip for an event date (§20): Today/Tomorrow/In N days —
 * amber when ≤3 days out, red when past and unfinished, green when done.
 */
export function CountdownBadge({
  date,
  completed,
  className,
}: {
  date: string;
  completed: boolean;
  className?: string;
}) {
  if (completed) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-primary/40 bg-primary/10 text-primary",
          className
        )}
      >
        Completed
      </Badge>
    );
  }

  const days = daysUntil(date);
  const overdue = days !== null && days < 0;
  const soon = days !== null && days >= 0 && days <= 3;

  return (
    <Badge
      variant="outline"
      className={cn(
        overdue && "border-destructive/40 bg-destructive/10 text-destructive",
        soon &&
          "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        !overdue && !soon && "border-border bg-secondary text-secondary-foreground",
        className
      )}
    >
      {formatCountdown(days)}
    </Badge>
  );
}
