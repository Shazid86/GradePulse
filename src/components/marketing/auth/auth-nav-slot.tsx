"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { useSessionPresence } from "./use-auth-island";

/**
 * The nav slot that swaps for signed-in visitors.
 *
 * SSR always renders the signed-out variant; the real verdict arrives after
 * hydration and swaps instantly — no fade, no transition, nothing to draw
 * attention to the change (enforced by qa:invariants rule F). The wrapper
 * reserves width so the swap causes no layout shift.
 */
export function AuthNavSlot({
  variant = "inline",
}: {
  variant?: "inline" | "stacked";
}) {
  const signedIn = useSessionPresence();
  const href = signedIn ? "/dashboard" : "/auth/login";
  const label = signedIn ? "Dashboard" : "Login";

  if (variant === "stacked") {
    return (
      <Link
        href={href}
        className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {label}
        {signedIn ? <ArrowRight aria-hidden className="size-3.5" /> : null}
      </Link>
    );
  }

  return (
    <span className="inline-flex min-w-[5.5rem] justify-end">
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground",
          "hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        )}
      >
        {label}
        {signedIn ? <ArrowRight aria-hidden className="size-3.5" /> : null}
      </Link>
    </span>
  );
}