import Link from "next/link";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";

/** Final conversion block — one action, pointed at the calculator. */
export function ClosingCta() {
  return (
    <Section
      title="Small marks build bigger results."
      lead="Track every assessment in one place and always know what the next one has to deliver."
      className="border-b-0"
    >
      <Reveal>
        <div className="gp-card flex flex-col items-start gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Start with one semester. The dashboard fills in from there.
          </p>
          <Button size="lg" asChild className="shrink-0">
            <Link href="/calculator">Start tracking your semester →</Link>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
