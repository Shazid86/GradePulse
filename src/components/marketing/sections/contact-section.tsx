import {
  Briefcase,
  Camera,
  GitBranch,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/motion/reveal";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";

/**
 * Placeholder contact channels — every row is an explicit `href="#"` and
 * visibly marked "Coming soon". Never invent real addresses or handles.
 */
const CHANNELS = [
  { icon: Mail, label: "Email" },
  { icon: Phone, label: "Phone" },
  { icon: Users, label: "Facebook" },
  { icon: Camera, label: "Instagram" },
  { icon: Briefcase, label: "LinkedIn" },
  { icon: GitBranch, label: "GitHub" },
] as const;

export function ContactSection() {
  return (
    <Section
      eyebrow="Let's connect"
      title="Let's build something meaningful."
      lead="Questions, corrections or feature ideas — the details below open up soon."
      width="wide"
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
        {CHANNELS.map((channel, index) => (
          <li key={channel.label}>
            <Reveal delay={index * 70} variant="card" className="h-full">
              <a
                href="#"
                className="gp-card group flex h-full items-center gap-3 rounded-xl p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`${channel.label} — coming soon`}
              >
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary/15"
                >
                  <channel.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {channel.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    Coming soon
                  </span>
                </span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal delay={140}>
        <div className="gp-glass mt-8 flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              Have an idea worth discussing?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              The full contact page goes live with the first real channel.
            </p>
          </div>
          <Button size="lg" asChild className="shrink-0">
            <Link href="/contact">Send a message →</Link>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
