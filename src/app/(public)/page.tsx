import type { Metadata } from "next";

import {
  HeroActions,
  HeroCardCta,
} from "@/components/marketing/auth/hero-actions";
import { Float } from "@/components/marketing/motion/float";
import { Reveal } from "@/components/marketing/motion/reveal";
import { Tilt } from "@/components/marketing/motion/tilt";
import { AboutSection } from "@/components/marketing/sections/about-section";
import { ClosingCta } from "@/components/marketing/sections/closing-cta";
import { ContactSection } from "@/components/marketing/sections/contact-section";
import { FaqSection } from "@/components/marketing/sections/faq-section";
import { FeaturesSection } from "@/components/marketing/sections/features-section";
import { GpaSection } from "@/components/marketing/sections/gpa-section";
import { TargetEngineSection } from "@/components/marketing/sections/target-engine-section";
import { WhatIfSection } from "@/components/marketing/sections/what-if-section";
import { DemoDataNotice } from "@/components/marketing/visuals/demo-data-notice";
import {
  DEMO_COURSE,
  DEMO_GPA,
  DEMO_TARGET,
} from "@/components/marketing/visuals/demo-data";

export const metadata: Metadata = {
  title: "GradePulse — Personal Academic Performance Command Center",
  description:
    "Track every mark. Understand your progress. Know what comes next.",
};

const TRUST = [
  "Track every assessment",
  "Your data stays private",
  "Built for better discipline",
] as const;

/**
 * Homepage sequence: hero → features → target engine → what-if → GPA →
 * about → FAQ → contact → closing CTA. Anchor targets (#features, #about,
 * #faq) back the header navigation; #target-engine backs "See how it works".
 * All demo figures come from the locked fixture (engine-verified).
 */
export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
          <Reveal className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
              ● Your personal academic command center
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Take control of your academic performance.
            </h1>
            <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Track every mark. Understand where you stand. Know what you need
              on what&apos;s left.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroActions />
            </div>
            <p className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground/80">
              {TRUST.map((item, index) => (
                <span key={item} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden>·</span> : null}
                  {item}
                </span>
              ))}
            </p>
          </Reveal>

          {/* Demo card: locked fixture, CTA swapped by the auth island. */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <Reveal variant="scale" delay={80}>
              <Tilt>
                <Float duration={10}>
                  <div className="gp-glass-deep rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {DEMO_COURSE.name}
                        </p>
                        <p className="gp-figure mt-0.5 text-xs text-muted-foreground">
                          {DEMO_COURSE.code}
                        </p>
                      </div>
                      <span className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        Demo
                      </span>
                    </div>

                    <dl className="mt-5 space-y-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-sm text-muted-foreground">
                          Current
                        </dt>
                        <dd className="gp-figure text-lg font-medium">
                          {DEMO_COURSE.secured} / {DEMO_COURSE.total}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-sm text-muted-foreground">
                          Target
                        </dt>
                        <dd className="gp-figure text-lg font-medium text-primary">
                          {DEMO_TARGET.percent}%
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-sm text-muted-foreground">
                          Required
                        </dt>
                        <dd className="gp-figure text-lg font-medium">
                          {DEMO_TARGET.required} / {DEMO_TARGET.remaining}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-3">
                        <dt className="text-sm text-muted-foreground">
                          Semester GPA
                        </dt>
                        <dd className="gp-figure text-lg font-medium">
                          {DEMO_GPA.latest}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5">
                      <HeroCardCta />
                    </div>
                    <DemoDataNotice className="mt-4" />
                  </div>
                </Float>
              </Tilt>
            </Reveal>

            {/* Floating satellites — phase-shifted against the anchor. */}
            <Float
              className="absolute -top-4 right-1 sm:right-4"
              duration={8}
              delay={1200}
            >
              <div className="gp-glass rounded-full px-3.5 py-1.5">
                <p className="gp-figure text-xs font-medium">
                  Required — {DEMO_TARGET.required}/{DEMO_TARGET.remaining}
                </p>
              </div>
            </Float>
            <Float
              className="absolute -bottom-4 left-1 sm:left-4"
              duration={9}
              delay={600}
            >
              <div className="gp-glass rounded-full px-3.5 py-1.5">
                <p className="gp-figure text-xs font-medium">
                  GPA — {DEMO_GPA.latest}
                </p>
              </div>
            </Float>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <TargetEngineSection />
      <WhatIfSection />
      <GpaSection />
      <AboutSection />
      <FaqSection />
      <ContactSection />
      <ClosingCta />
    </>
  );
}

