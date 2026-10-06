"use client";

import { Check, ChevronDown, Lightbulb } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";

const QUESTIONS = [
  {
    q: "What is GradePulse?",
    a: "A personal academic performance command center. Record every mark once and see where you stand, what remains, and what the rest of the semester has to deliver.",
  },
  {
    q: "Is GradePulse free?",
    a: "Yes. The calculator works without an account, and tracking your own semester is free to start.",
  },
  {
    q: "Where is my academic data stored?",
    a: "In your own account, scoped at the database level — not just hidden in the interface. Nothing is shared or sold.",
  },
  {
    q: "Can I edit or delete assessments?",
    a: "Yes. Every assessment can be corrected or removed, and the totals recalculate from the records you keep.",
  },
  {
    q: "Does GradePulse work on mobile?",
    a: "Yes. The dashboard, calendar and all public pages are built small-first and work from a phone browser.",
  },
  {
    q: "Does GradePulse support dark mode?",
    a: "Yes. Dark is the default look, with a light theme available — same numbers, same layout.",
  },
] as const;

const PROMISES = [
  "Free to start — the calculator needs no account.",
  "Your records stay private to your account.",
  "Works on any device, in light or dark mode.",
] as const;

/** "#faq" anchor target — single-open accordion, aria-expanded on each row. */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" eyebrow="FAQ" width="wide">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple answers. Better understanding.
            </h2>
          </Reveal>
          <ul className="mt-6 space-y-3">
            {PROMISES.map((promise, index) => (
              <li key={promise}>
                <Reveal delay={index * 70} variant="card">
                  <div className="gp-card group flex items-start gap-3 rounded-xl p-4">
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary/15"
                    >
                      <Check className="size-4" />
                    </span>
                    <p className="self-center text-sm text-muted-foreground">
                      {promise}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal delay={PROMISES.length * 70} variant="card">
            <div className="gp-card group mt-3 flex items-start gap-3 rounded-xl p-4">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary/15"
              >
                <Lightbulb className="size-4" />
              </span>
              <p className="self-center text-xs leading-relaxed text-muted-foreground">
                Tip: try the calculator first — it answers the engine question
                before you create anything.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={90}>
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-background/60">
            {QUESTIONS.map((item, index) => {
              const expanded = open === index;
              return (
                <li key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : index)}
                    aria-expanded={expanded}
                    aria-controls={`faq-panel-${index}`}
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3.5 text-left text-sm font-medium transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {item.q}
                    <ChevronDown
                      aria-hidden
                      className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        expanded ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  <div
                    id={`faq-panel-${index}`}
                    hidden={!expanded}
                    className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground"
                  >
                    {item.a}
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
