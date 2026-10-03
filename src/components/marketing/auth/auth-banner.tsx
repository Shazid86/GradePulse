"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";

import { dismissBanner, useBannerDismissed, useSessionPresence } from "./use-auth-island";

/**
 * Quiet notice for signed-in visitors on the public pages.
 *
 * Deliberately not a redirect: the marketing pages stay readable and the
 * dashboard is one click away. Absent from prerendered HTML, appears after
 * hydration, dismissible per session. Instant show/hide (rule F).
 */
export function AuthBanner() {
  const signedIn = useSessionPresence();
  const [dismissed, dismissKey] = useBannerDismissed();

  if (!signedIn || dismissed) return null;

  return (
    <div className="border-b border-border/50 bg-primary/5">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6">
        <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground sm:text-sm">
          You&apos;re logged in.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-sm"
        >
          Go to your dashboard
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
        <button
          type="button"
          aria-label="Dismiss notice"
          onClick={() => {
            try {
              window.sessionStorage.setItem(dismissKey, "1");
            } catch {
              /* storage unavailable — dismiss for this page view */
            }
            dismissBanner();
          }}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      </div>
    </div>
  );
}