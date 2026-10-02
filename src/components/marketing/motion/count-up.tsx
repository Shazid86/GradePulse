"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { useReveal } from "./use-reveal";

/**
 * Metric that counts up once, on first reveal.
 *
 * SSR and the client's first render both output the FINAL value, so hydration
 * always matches, no-JS and reduced-motion visitors read the real number, and
 * nothing is ever "0" on first paint. The count-up only starts when motion is
 * allowed and the element has actually scrolled into view.
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  duration = 700,
  className,
  prefix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, visible, motion } = useReveal<HTMLSpanElement>();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!visible || motion.current.reduced) return;

    let frame = 0;
    const started = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(value * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
        else setShown(value);
      };
      frame = requestAnimationFrame(tick);
    };
    started();
    return () => cancelAnimationFrame(frame);
  }, [visible, motion, value, duration]);

  return (
    <span ref={ref} className={cn("gp-figure", className)}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}