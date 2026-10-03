import type { Metadata } from "next";
import {
  Briefcase,
  Camera,
  GitBranch,
  Mail,
  Users,
} from "lucide-react";

import { Reveal } from "@/components/marketing/motion/reveal";

export const metadata: Metadata = {
  title: "Contact — GradePulse",
  description:
    "Get in touch with the creator of GradePulse. Contact details and social profiles.",
};

/**
 * Placeholder contact rows.
 *
 * Replace `value` with the real detail and, where it applies, give the row a
 * `href` (e.g. "mailto:you@example.com" or a profile URL) to turn it into a
 * link. Deliberately no form and no backend: there is nothing to store here.
 */
const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "[your.email@example.com]",
    href: null,
  },
  {
    icon: Users,
    label: "Facebook",
    value: "[your-profile]",
    href: null,
  },
  {
    icon: Camera,
    label: "Instagram",
    value: "[your-profile]",
    href: null,
  },
  {
    icon: Briefcase,
    label: "LinkedIn",
    value: "[your-profile]",
    href: null,
  },
  {
    icon: GitBranch,
    label: "GitHub",
    value: "[your-profile]",
    href: null,
  },
] as const;

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Contact
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions, corrections and feature requests.
        </h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          GradePulse is a personal project, so messages reach the person who
          builds it. The details below are placeholders until they are filled
          in.
        </p>
      </Reveal>

      <ul className="mt-10 space-y-3">
        {CHANNELS.map((channel, index) => {
          const body = (
            <>
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/60 text-muted-foreground"
              >
                <channel.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {channel.label}
                </span>
                <span className="gp-figure mt-0.5 block truncate text-sm text-muted-foreground">
                  {channel.value}
                </span>
              </span>
            </>
          );

          return (
            <li key={channel.label}>
              <Reveal delay={index * 60}>
                {channel.href ? (
                  <a
                    href={channel.href}
                    className="gp-glass flex items-center gap-3 rounded-xl p-4 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="gp-glass flex items-center gap-3 rounded-xl p-4">
                    {body}
                  </div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ul>

      <Reveal delay={320} className="mt-8">
        <p className="text-xs leading-relaxed text-muted-foreground/80">
          These entries are intentionally unlinked placeholders. Add an email
          address or a profile URL to make a row actionable.
        </p>
      </Reveal>
    </div>
  );
}