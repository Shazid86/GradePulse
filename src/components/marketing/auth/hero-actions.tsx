"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useSessionPresence } from "./use-auth-island";

/**
 * Hero CTAs: one primary action for everyone (the calculator), plus a quiet
 * anchor to the engine demo. The nav island keeps its own Login/Dashboard
 * swap, so the hero itself needs no session branching.
 */
export function HeroActions() {
  return (
    <>
      <Button size="lg" asChild>
        <Link href="/calculator">
          Get Started
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link href="/#target-engine">See how it works</Link>
      </Button>
    </>
  );
}

/**
 * Demo-card action. Visitors are offered the calculator; signed-in readers
 * get "Continue to your dashboard →". No redirect either way.
 */
export function HeroCardCta() {
  const signedIn = useSessionPresence();

  if (signedIn) {
    return (
      <Button asChild>
        <Link href="/dashboard">
          Continue to your dashboard
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild>
      <Link href="/calculator">
        Get Started
        <ArrowUpRight aria-hidden className="size-4" />
      </Link>
    </Button>
  );
}