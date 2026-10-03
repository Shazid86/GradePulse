"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { CountUp } from "@/components/marketing/motion/count-up";
import { MetricFill } from "@/components/marketing/motion/metric-fill";
import { cn } from "@/lib/utils";

import { CategoryStrip } from "./category-strip";
import { DEMO_COURSE, DEMO_TREND } from "./demo-data";

const TREND_ICON = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
} as const;

/**
 * The hero anchor card: the GradePulse course view, reduced to its essential
 * four numbers plus the category strip. This is the composition the whole
 * marketing surface reuses, so the site and the product share one language.
 */
export function PerformanceOverview({ className }: { className?: string }) {
  const TrendIcon = TREND_ICON[DEMO_TREND.direction];

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{DEMO_COURSE.name}</p>
          <p className="gp-figure mt-0.5 text-xs text-muted-foreground">
            {DEMO_COURSE.code}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 px-2 py-0.5 text-xs text-muted-foreground"
          aria-label={`Trend: ${DEMO_TREND.label}`}
        >
          <TrendIcon aria-hidden className="size-3" />
          {DEMO_TREND.label}
        </span>
      </div>

      <div>
        <div className="flex items-end justify-between gap-3">
          <p className="gp-figure text-3xl font-semibold leading-none sm:text-4xl">
            <CountUp value={DEMO_COURSE.secured} />
            <span className="text-muted-foreground">
              /{DEMO_COURSE.total}
            </span>
          </p>
          <span className="gp-figure text-sm text-primary">
            <CountUp value={DEMO_COURSE.percent} suffix="%" />
          </span>
        </div>
        <MetricFill
          value={DEMO_COURSE.percent}
          className="mt-3"
          label={`${DEMO_COURSE.percent}% of the course total secured`}
        />
      </div>

      <CategoryStrip />

      <p className="border-t border-border/50 pt-3 text-xs text-muted-foreground">
        {DEMO_TREND.detail}
      </p>
    </div>
  );
}