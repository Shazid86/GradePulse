import { formatPercent } from "@/lib/format";
import type { TargetRow } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Target-progress visualization (§16) — renders only when a target exists
 * (selection/required-score logic is a later phase). Pure display of two
 * stored numbers: target % vs secured %, with a marker on the bar.
 */
export function TargetProgress({
  target,
  securedPercentage,
}: {
  target: TargetRow | null;
  securedPercentage: number;
}) {
  if (!target) return null;

  const secured = Math.min(100, Math.max(0, securedPercentage));
  const goal = Math.min(100, Math.max(0, Number(target.percentage)));

  return (
    <Card className="glass border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-medium">Target progress</CardTitle>
        <CardDescription>
          {target.label} · marker shows {formatPercent(goal)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Secured</span>
          <span className="font-semibold text-primary tabular-nums">
            {formatPercent(secured)}
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${secured}%` }}
          />
          <div
            className="absolute inset-y-0 w-0.5 bg-foreground"
            style={{ left: `calc(${goal}% - 1px)` }}
            aria-hidden="true"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          The vertical marker is your target; the bar is what you have secured.
        </p>
      </CardContent>
    </Card>
  );
}
