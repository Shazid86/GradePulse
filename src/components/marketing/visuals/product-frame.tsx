import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A GradePulse product surface rendered as a window: the same card language
 * the authenticated dashboard uses, so the marketing visuals read as the
 * actual tool rather than an illustration of it.
 *
 * Server component — no state, no browser APIs.
 */
export function ProductFrame({
  title,
  meta,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  /** Right-aligned secondary label, e.g. a course code or term. */
  meta?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("gp-glass-deep overflow-hidden rounded-2xl", className)}>
      <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="block size-2 rounded-full bg-primary/70" />
          <span className="block size-2 rounded-full bg-muted-foreground/25" />
          <span className="block size-2 rounded-full bg-muted-foreground/25" />
        </span>
        <span className="ml-2 truncate text-xs font-medium tracking-wide text-muted-foreground">
          {title}
        </span>
        {meta ? (
          <span className="gp-figure ml-auto shrink-0 text-xs text-muted-foreground/80">
            {meta}
          </span>
        ) : null}
      </div>
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </div>
  );
}