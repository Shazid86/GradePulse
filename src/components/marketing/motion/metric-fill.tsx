"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { useReveal } from "./use-reveal";

const clamp = (n: number, min = 0, max = 100) => {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

/**
 * Progress bar that fills once, on first reveal.
 *
 * Same contract as CountUp: SSR renders the final width, so the value is
 * correct with JS disabled and under prefers-reduced-motion. The fill is a
 * two-frame reset (0 → final) so the CSS transition has something to animate.
 * Tracked in whole percent so the markup stays stable.
 */
export function MetricFill({
  value,
  className,
  barClassName,
  label,
}: {
  /** 0–100 */
  value: number;
  className?: string;
  barClassName?: string;
  /** Accessible description of the same value; the bar is decorative. */
  label?: string;
}) {
  const { ref, visible, motion } = useReveal<HTMLDivElement>();
  const target = clamp(value);
  const [width, setWidth] = useState(target);

  useEffect(() => {
    if (!visible || motion.current.reduced) return;

    let first = 0;
    let second = 0;
    first = requestAnimationFrame(() => {
      setWidth(0);
      second = requestAnimationFrame(() => setWidth(target));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [visible, motion, target]);

  return (
    <div
      ref={ref}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      role="presentation"
      title={label}
    >
      <div
        className={cn("gp-fill h-full rounded-full bg-primary", barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}