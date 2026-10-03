"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { CountUp } from "@/components/marketing/motion/count-up";
import { cn } from "@/lib/utils";

import { DEMO_COURSE, DEMO_TARGET, DEMO_WHAT_IF } from "./demo-data";

const STOPS = DEMO_WHAT_IF.map((row) => row.finalObtained);

/**
 * What-if simulator.
 *
 * A native range input stepped to the four worked outcomes in the fixture, so
 * the component performs no arithmetic of its own — it looks a row up. The
 * real simulator (and its maths) lives in the authenticated course page; this
 * one demonstrates the interaction without restating the formula.
 */
export function WhatIfPanel({ className }: { className?: string }) {
  const [obtained, setObtained] = useState<number>(DEMO_TARGET.required);
  const row =
    DEMO_WHAT_IF.find((candidate) => candidate.finalObtained === obtained) ??
    DEMO_WHAT_IF[0];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            If the Final returns
          </p>
          <p className="gp-figure mt-1 text-2xl font-semibold leading-none sm:text-3xl">
            <CountUp key={row.finalObtained} value={row.finalObtained} />
            <span className="text-muted-foreground">
              {" "}
              / {DEMO_TARGET.remaining}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Course total
          </p>
          <p className="gp-figure mt-1 text-2xl font-semibold leading-none text-primary sm:text-3xl">
            <CountUp key={row.total} value={row.total} />
            <span className="text-muted-foreground">
              {" "}
              / {DEMO_COURSE.total}
            </span>
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="what-if-slider" className="sr-only">
          Marks obtained in the Final
        </label>
        <input
          id="what-if-slider"
          type="range"
          min={STOPS[0]}
          max={STOPS[STOPS.length - 1]}
          step={5}
          value={obtained}
          onChange={(event) => setObtained(Number(event.target.value))}
          aria-valuetext={`${row.finalObtained} of ${DEMO_TARGET.remaining} marks`}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DEMO_WHAT_IF.map((candidate) => {
          const active = candidate.finalObtained === row.finalObtained;
          return (
            <li key={candidate.finalObtained}>
              <button
                type="button"
                onClick={() => setObtained(candidate.finalObtained)}
                aria-pressed={active}
                className={cn(
                  "w-full rounded-lg border px-2.5 py-2 text-left transition-colors duration-150",
                  active
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/60 hover:border-border hover:bg-muted/40"
                )}
              >
                <span className="gp-figure block text-xs text-muted-foreground">
                  {candidate.finalObtained} / {DEMO_TARGET.remaining}
                </span>
                <span
                  className={cn(
                    "gp-figure mt-0.5 block text-sm font-medium",
                    active ? "text-primary" : "text-foreground"
                  )}
                >
                  {candidate.total}
                </span>
                {candidate.hitsTarget ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-[0.6875rem] text-primary">
                    <Check aria-hidden className="size-3" />
                    target
                  </span>
                ) : (
                  <span className="mt-1 block text-[0.6875rem] text-transparent">
                    &nbsp;
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}