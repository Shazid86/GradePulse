import type { Metadata } from "next";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import { CreatorSection } from "@/components/marketing/sections/creator-section";

export const metadata: Metadata = {
  title: "About — GradePulse",
  description:
    "Why GradePulse exists: a personal academic performance command center built by a student who needed the numbers to add up.",
};

const STORY = [
  "I built GradePulse because the numbers were never the hard part. Every semester produced the same question at 2 a.m.: with the marks already secured, what is actually needed on what is left?",
  "The answer had to be trustworthy. A projection that flatters you is worse than no projection at all, so the calculation engine came first — every figure is a calculation on records you entered, never a guess.",
  "The interface came second, and it stayed small on purpose: one place to record assessments, one place to see targets, one place to watch a GPA roll up.",
  "It is built and maintained as a personal project, designed to be used daily for the length of a degree rather than for a single exam season.",
  "Today GradePulse is yours before it is anyone else's — the tools are in place, and the semester you fill next is the first one that counts.",
] as const;

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
] as const;

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            About
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Built from a personal problem.
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Why GradePulse exists, and what it refuses to guess.
          </p>
        </Reveal>
      </div>

      {/* Creator card — CTA swaps with the session (client island). */}
      <CreatorSection />

      <Section eyebrow="Story" title="Why I built GradePulse." width="wide">
        <div className="max-w-2xl space-y-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {STORY.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Principles"
        title="Awareness before improvement."
        lead="Three decisions that shaped the product — knowing where you stand comes before moving the number."
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

