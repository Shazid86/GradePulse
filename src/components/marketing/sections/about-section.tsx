import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";

/**
 * "#about" anchor target — the homepage slice of the story, signed by the
 * creator, with the full narrative kept on /about.
 */
export function AboutSection() {
  return (
    <Section id="about" eyebrow="Looking forward" width="default">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Today it&apos;s yours. Tomorrow, everyone&apos;s.
          </h2>
          <div className="mt-5 space-y-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              GradePulse began as a tool for one semester — built to answer a
              single question honestly: with the marks I already have, what do
              I need on what is left?
            </p>
            <p>
              The engine is finished and the interface is yours. What comes
              next is simpler than what came before: open it, add a course, and
              watch your own numbers replace the demo ones.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Read the full story
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Reveal>

        <Reveal delay={90} variant="card">
          <figure className="gp-card rounded-2xl p-6 sm:p-7">
            <blockquote className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              &ldquo;The numbers were never the hard part. The hard part was
              trusting one answer to a question every student asks at 2 a.m.
              — what do I need on what&apos;s left?&rdquo;
            </blockquote>
            <figcaption className="mt-5 border-t border-border/60 pt-4">
              <span className="block text-sm font-medium">Shazid</span>
              <span className="mt-0.5 block text-sm text-primary">
                Creator of GradePulse
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
