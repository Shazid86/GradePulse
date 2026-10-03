import { cn } from "@/lib/utils";

/**
 * One labelled metric line — the atom of every marketing visualisation.
 * Values are always set in tabular figures so columns of numbers align, the
 * way the real dashboard renders them.
 */
export function MetricRow({
  label,
  value,
  hint,
  emphasis = false,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  /** Draws the row as the payoff line of its card. */
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-3 border-b border-border/50 py-2 last:border-b-0",
        emphasis && "border-border/70",
        className
      )}
    >
      <span
        className={cn(
          "text-sm",
          emphasis ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span className="flex items-baseline gap-2 text-right">
        {hint ? (
          <span className="text-xs text-muted-foreground/80">{hint}</span>
        ) : null}
        <span
          className={cn(
            "gp-figure tabular-nums",
            emphasis
              ? "text-base font-semibold text-primary"
              : "text-sm font-medium text-foreground"
          )}
        >
          {value}
        </span>
      </span>
    </div>
  );
}