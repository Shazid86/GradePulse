import type { ReactNode } from "react";

import { Reveal } from "@/components/marketing/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Section shell for the marketing pages.
 *
 * The heading group reveals as one unit (never line by line); sections that
 * need their body revealed separately wrap it in their own <Reveal>.
 */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
  contentClassName,
  width = "default",
}: {
  id?: string;
  eyebrow?: string;
  /** Omit for a shell-only section (spacing wrapper with no heading). */
  title?: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  width?: "default" | "wide";
}) {
  return (
    <section
      id={id}
      className={cn("border-b border-border/40 py-16 md:py-24", className)}
    >
      <div
        className={cn(
          "mx-auto w-full px-4 sm:px-6",
          width === "wide" ? "max-w-6xl" : "max-w-5xl"
        )}
      >
        <Reveal className={cn("max-w-2xl", contentClassName)}>
          {eyebrow ? (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
          ) : null}
          {lead ? (
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {lead}
            </p>
          ) : null}
        </Reveal>
        {children ? (
          <div className={title || eyebrow || lead ? "mt-10" : undefined}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}