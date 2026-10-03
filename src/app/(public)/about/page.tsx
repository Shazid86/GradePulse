import type { Metadata } from "next";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "About — GradePulse",
  description:
    "Why GradePulse exists: a personal academic performance command center built by a student who needed the numbers to add up.",
};

const PRINCIPLES = [
  {
    title: "No hard-coded academic rules",
    body: "Assessment structures, weights and grading scales belong to the institution, not the software. GradePulse stores them as data, so any course on any scheme works without a code change.",
  },
  {
    title: "Arithmetic, not prediction",
    body: "Every figure is a calculation on records you entered. Projections say what a given outcome would produce — they never claim to know what you will do.",
  },
  {
    title: "Your records are yours",
    body: "Academic data is private by default, scoped to the signed-in account at the database level, not just in the interface.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            About
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Built because the numbers were never the hard part.
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            GradePulse is a personal academic performance command center: one
            place to record every mark, and one place to see what those marks
            mean — where you stand, what remains, and what the rest of the
            semester has to deliver.
          </p>
        </Reveal>
      </div>

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
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section
        eyebrow="Principles"
        title="Three decisions that shaped the product."
        width="wide"
        className="border-b-0"
      >
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 md:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <li
              key={principle.title}
              className="bg-background/80 backdrop-blur-sm"
            >
              <Reveal delay={index * 70} className="h-full">
                <div className="flex h-full flex-col p-5 sm:p-6">
                  <p className="text-sm font-medium">{principle.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {principle.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}