"use client";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useReveal } from "./use-reveal";

/**
 * Declarative scroll-reveal wrapper.
 *
 * `delay` staggers children of a group (60–90ms apart). Reveal the group and
 * stagger its items — never reveal body copy line by line.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "scale" | "card";
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  const base =
    variant === "scale"
      ? "gp-reveal-scale"
      : variant === "card"
        ? "gp-reveal-card"
        : "gp-reveal";

  return (
    <div
      ref={ref}
      style={{ "--gp-delay": `${delay}ms` } as CSSProperties}
      className={cn(base, visible && "gp-reveal-in", className)}
    >
      {children}
    </div>
  );
}