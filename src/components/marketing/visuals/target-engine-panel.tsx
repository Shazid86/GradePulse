"use client";

import { CountUp } from "@/components/marketing/motion/count-up";
import { MetricFill } from "@/components/marketing/motion/metric-fill";
import { Reveal } from "@/components/marketing/motion/reveal";
import { cn } from "@/lib/utils";

import { DEMO_COURSE, DEMO_TARGET } from "./demo-data";
import { MetricRow } from "./metric-row";

/**
 * The target engine, rendered as a worked calculation.
 *
 * The "Required" line fills in last, after a short beat, because it is the
 * answer the section exists to deliver — and 62.5% carries the strongest
 * visual weight of any figure on the page.
 */
export function TargetEnginePanel({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <MetricRow
          label="Current score"
          value={`${DEMO_COURSE.secured} / ${DEMO_COURSE.total}`}
        />
        <MetricRow
          label="Remaining marks"
          value={`${DEMO_TARGET.remaining}`}
          hint="1 assessment"
        />
        <MetricRow
          label="Target"
          value={`${DEMO_TARGET.percent}%`}
          hint={`${DEMO_TARGET.marks} marks`}
        />
      </div>

      <Reveal delay={220} variant="scale" className="space-y-3 pt-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Required</span>
          <span className="gp-figure text-lg font-semibold">
            <CountUp value={DEMO_TARGET.required} />
            <span className="text-muted-foreground">
              {" "}
              / {DEMO_TARGET.remaining}
            </span>
          </span>
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-xs text-muted-foreground">
              of the remaining marks
            </span>
            <span className="gp-figure text-2xl font-semibold leading-none text-primary sm:text-3xl">
              {DEMO_TARGET.requiredOfRemaining}
            </span>
          </div>
          <MetricFill
            value={DEMO_TARGET.requiredOfRemainingValue}
            className="mt-3 h-2"
            label={`${DEMO_TARGET.requiredOfRemaining} of the remaining marks required`}
          />
          <p className="gp-figure mt-2 text-xs text-muted-foreground">
            {DEMO_TARGET.required} ÷ {DEMO_TARGET.remaining} ={" "}
            {DEMO_TARGET.requiredOfRemaining}
          </p>
        </div>
      </Reveal>
    </div>
  );
}