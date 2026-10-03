"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useSessionPresence } from "./use-auth-island";

/**
 * Hero CTAs. The primary action is the same for everyone; only the quiet
 * secondary link changes — "Sign in" for visitors, "Go to dashboard" for
 * signed-in readers. No redirect either way.
 */
export function HeroActions() {
  const signedIn = useSessionPresence();

  return (
    <>
      <Button size="lg" asChild>
        <Link href="/calculator">
          Get Started
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Button>
      <Button size="lg" variant="ghost" asChild>
        <Link href={signedIn ? "/dashboard" : "/auth/login"}>
          {signedIn ? "Go to dashboard" : "Sign in"}
          {signedIn ? <ArrowRight aria-hidden className="size-4" /> : null}
        </Link>
      </Button>
    </>
  );
}