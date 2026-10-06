import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  ListChecks,
  Target,
  TrendingUp,
} from "lucide-react";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";

const FEATURES = [
  {
    icon: ListChecks,
    title: "Assessment Tracking",
    body: "Every test, assignment and exam recorded against the structure your course actually uses.",
  },
  {
    icon: BookOpen,
    title: "Course Overview",
    body: "Weighted totals, category comparisons and a dated trend for each course — from one set of records.",
  },
  {
    icon: Target,
    title: "Smart Categories",
    body: "Weights, grades and grading scales stay data, so any course on any scheme works without a code change.",
  },
  {
    icon: CalendarDays,
    title: "Assessment History",
    body: "Every mark stays dated and auditable, so the running total can always be checked.",
  },
  {
    icon: TrendingUp,
    title: "Personalized Experience",
    body: "Targets, projections and GPA configured the way your institution grades — not the way software assumes.",
  },
  {
    icon: GraduationCap,
    title: "Better Study Habits",
    body: "A target you can read is a target you can plan around. Know what the next assessment has to deliver.",
  },
] as const;

/**
 * "#features" anchor target — the first section under the hero, reached by
 * the Features nav link from any public route.
 */
export function FeaturesSection() {
  return (
    <Section
      id="features"
      eyebrow="Powerful features"
      title="Everything you need to understand your marks."
      lead="Six modules that all read the same stored records, so every figure on screen agrees with every other."
      width="wide"
    >
      <ul className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <li key={feature.title}>
            <Reveal delay={index * 70} variant="card" className="h-full">
              <div className="gp-card group flex h-full flex-col rounded-2xl p-5 sm:p-6">
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary/15"
                >
                  <feature.icon className="size-4" />
                </span>
                <p className="mt-4 text-sm font-medium">{feature.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

