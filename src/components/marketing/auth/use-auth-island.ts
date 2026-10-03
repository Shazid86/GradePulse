"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  EXPECT_SIGNED_IN_KEY,
  hasSessionCookie,
  missingCookieWarning,
  sessionCookieName,
} from "./session-cookie";

const BANNER_DISMISS_KEY = "gp:auth-banner-dismissed";
const WARNED_KEY = "gp:warned-auth-island";

/**
 * Client state for the marketing auth island.
 *
 * Two module-level stores (session presence, banner dismissal) shared by every
 * island component, so the nav CTA and the banner can never disagree and the
 * cookie is read exactly once per page load.
 *
 * The server snapshot always reports "logged out", so SSR output is stable and
 * identical on every prerendered public route — no Supabase call, no dynamic
 * rendering, no hydration mismatch. The real verdict arrives in an effect after
 * hydration, which swaps the CTA instantly (no transition — see rule F).
 */

// --- session presence ------------------------------------------------------
let signedIn = false;
let sessionResolved = false;
const sessionListeners = new Set<() => void>();

function subscribeSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

export function useSessionPresence(): boolean {
  useEffect(() => {
    if (sessionResolved) return;

    // All browser access lives in this effect body.
    const name = sessionCookieName(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const present = hasSessionCookie(document.cookie, name ?? "");

    if (process.env.NODE_ENV !== "production") {
      document.documentElement.dataset.gpAuth = present ? "in" : "out";
      const expected = window.sessionStorage.getItem(EXPECT_SIGNED_IN_KEY) === "1";
      if (
        expected &&
        !present &&
        name &&
        window.sessionStorage.getItem(WARNED_KEY) !== "1"
      ) {
        window.sessionStorage.setItem(WARNED_KEY, "1");
        console.warn(missingCookieWarning(name));
      }
    }

    sessionResolved = true;
    signedIn = present;
    for (const listener of sessionListeners) listener();
  }, []);

  return useSyncExternalStore(
    subscribeSession,
    () => signedIn,
    () => false
  );
}

// --- banner dismissal (per session) ---------------------------------------
let bannerDismissed = false;
const bannerListeners = new Set<() => void>();

function subscribeBanner(listener: () => void) {
  bannerListeners.add(listener);
  return () => {
    bannerListeners.delete(listener);
  };
}

/** Clears the store only; persisting to sessionStorage stays in the onClick. */
export function dismissBanner(): void {
  bannerDismissed = true;
  for (const listener of bannerListeners) listener();
}

/**
 * Returns [dismissed, dismissedKey]. The server snapshot reports dismissed so
 * the banner is absent from prerendered HTML and appears only after hydration.
 */
export function useBannerDismissed(): readonly [boolean, string] {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(BANNER_DISMISS_KEY) === "1") {
        bannerDismissed = true;
        for (const listener of bannerListeners) listener();
      }
    } catch {
      /* sessionStorage unavailable — the banner simply shows */
    }
  }, []);

  const dismissed = useSyncExternalStore(
    subscribeBanner,
    () => bannerDismissed,
    () => true
  );

  return [dismissed, BANNER_DISMISS_KEY] as const;
}