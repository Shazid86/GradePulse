"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Slow vertical float for the hero cluster only.
 *
 * `delay` phase-shifts satellites against the anchor so the group never
 * pulses in unison. Banned everywhere else — an idle animation on a
 * non-hero element is noise. Disabled by CSS under prefers-reduced-motion.
 */
export function Float({
  children,
  className,
  delay = 0,
  duration = 9,
}: {
  children: ReactNode;
  className?: string;
  /** ms */
  delay?: number;
  /** seconds */
  duration?: number;
}) {
  return (
    <div
      className={cn("gp-float", className)}
      style={{ animationDelay: `${delay}ms`, animationDuration: `${duration}s` }}
    >
      {children}
    </div>
  );
}