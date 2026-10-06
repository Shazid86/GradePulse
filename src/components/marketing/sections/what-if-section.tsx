"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import {
  DEMO_COURSE,
  DEMO_TARGET,
  DEMO_WHAT_IF,
} from "@/components/marketing/visuals/demo-data";

/**
 * What-if simulator over the locked fixture: 60 secured of 100, 40 remaining.
 * Deterministic initial state (25 = the target row), so the prerendered HTML
 * matches hydration exactly. No clock, no randomness, useState only.
 */
export function WhatIfSection() {
  const [obtained, setObtained] = useState<number>(DEMO_TARGET.required);

  const total = DEMO_COURSE.secured + obtained;
  const hitsTarget = total >= DEMO_TARGET.marks;

  return (
    <Section
      eyebrow="What-if"
      title="Test the outcomes before they happen."
      lead="Drag what you expect on the remaining marks and read the course total it produces — before the exam exists."
      width="wide"
    >
      <Reveal variant="scale">
        <div className="gp-card gp-card-no-lift rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                If you score
              </p>
              <p className="gp-figure mt-1 text-3xl font-medium sm:text-4xl">
                {obtained} / {DEMO_TARGET.remaining}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Projected total
              </p>
              <p
                className={`gp-figure mt-1 text-3xl font-semibold sm:text-4xl ${
                  hitsTarget ? "text-primary" : ""
                }`}
              >
                {total} / {DEMO_COURSE.total}
              </p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="sr-only">
              Marks you expect on the remaining assessments
            </span>
            <input
              type="range"
              min={0}
              max={DEMO_TARGET.remaining}
              step={1}
              value={obtained}
              onChange={(event) => setObtained(Number(event.target.value))}
              aria-valuetext={`${obtained} of ${DEMO_TARGET.remaining} remaining marks`}
              className="h-11 w-full cursor-pointer accent-primary"
            />
          </label>

          <ul className="mt-4 flex flex-wrap gap-2">
            {DEMO_WHAT_IF.map((row) => {
              const active = row.finalObtained === obtained;
              return (
                <li key={row.finalObtained}>
                  <button
                    type="button"
                    onClick={() => setObtained(row.finalObtained)}
                    aria-pressed={active}
                    className={`gp-figure inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                      active
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {row.finalObtained} / {DEMO_TARGET.remaining} → {row.total}
                    {row.hitsTarget ? (
                      <Check aria-hidden className="size-3.5" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-xs leading-relaxed text-muted-foreground/80">
            {DEMO_TARGET.required} of {DEMO_TARGET.remaining} hits the{" "}
            {DEMO_TARGET.percent}% target — {DEMO_TARGET.requiredOfRemaining} of
            what is left.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
