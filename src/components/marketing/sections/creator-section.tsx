"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";

import { useSessionPresence } from "@/components/marketing/auth/use-auth-island";

/**
 * Creator card on /about. The CTA swaps by session — no redirect either way:
 * visitors get the calculator, signed-in readers get their dashboard.
 */
export function CreatorSection() {
  const signedIn = useSessionPresence();

  return (
    <Section className="pt-10 sm:pt-12" width="wide">
      <Reveal variant="scale">
        <div className="gp-glass-deep overflow-hidden rounded-2xl">
          <div className="grid gap-0 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            {/*
              Creator photo placeholder — replace the inner div with an
              <Image src="/images/creator.jpg" … /> when the photo is ready.
            */}
            <div className="relative border-b border-border/60 md:border-b-0 md:border-r">
              <div
                aria-label="Placeholder for the creator's photo"
                role="img"
                className="flex aspect-square w-full items-center justify-center bg-muted/40 md:aspect-auto md:h-full"
              >
                <span className="gp-figure text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
                  photo
                </span>
              </div>
            </div>

            <div className="space-y-4 p-6 sm:p-8">
              <div>
                <p className="text-lg font-semibold">Shazid</p>
                <p className="mt-0.5 text-sm text-primary">
                  Creator of GradePulse
                </p>
              </div>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                GradePulse started as a way to answer one question reliably:
                with the marks I already have, what do I actually need on what
                is left? Answering it well meant building the calculation
                engine first and the interface second.
              </p>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                It is developed and maintained as a personal project, and it
                is designed to be used daily for the length of a degree rather
                than for a single exam season.
              </p>
              <Button asChild>
                <Link href={signedIn ? "/dashboard" : "/calculator"}>
                  {signedIn ? "Go to dashboard" : "Get started"}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
