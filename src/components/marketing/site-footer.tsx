import { ArrowUpRight, Briefcase, Camera, GitBranch, Mail, Users } from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/layout/brand";

const NAVIGATION_LINKS = [
  { title: "Features", href: "/features" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
] as const;

const PRODUCT_LINKS = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Calculator", href: "/calculator" },
  { title: "Sign in", href: "/auth/login" },
] as const;

/**
 * Social icons are explicit `href="#"` placeholders — swap in real profile
 * URLs when they exist. Lucide has no brand glyphs, so the generic icon set
 * mirrors the one the contact page already uses.
 */
const SOCIAL_LINKS = [
  { label: "Email", href: "#", Icon: Mail },
  { label: "Facebook", href: "#", Icon: Users },
  { label: "Instagram", href: "#", Icon: Camera },
  { label: "LinkedIn", href: "#", Icon: Briefcase },
  { label: "GitHub", href: "#", Icon: GitBranch },
] as const;

const TAGLINE =
  "Track every mark. Understand your progress. Know what comes next.";

/**
 * Public marketing footer — a server component: no state, no effects, no
 * render-time clock (the copyright year is a literal). No database, no forms,
 * no newsletter.
 *
 * "/how-it-works" is intentionally unlinked here as well as in the header; the
 * page itself remains live at its URL.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/60">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <Brand />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground/90">
            {TAGLINE}
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground/70">
            GradePulse turns your marks, targets and GPA into one clear picture
            of where you stand — and what to do next.
          </p>
          <span className="inline-flex rounded-full border border-border/60 px-3 py-1 text-[11px] font-medium text-primary">
            Personal Academic Performance Command Center
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            NAVIGATION
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {NAVIGATION_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            GRADEPULSE
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {PRODUCT_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            CONNECT
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground/90">
            Questions, feedback or just a hello — every message is read.
          </p>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Icon aria-hidden className="size-4" />
              </Link>
            ))}
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Get in touch
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 sm:px-6">
          <p className="text-xs text-muted-foreground/80">© 2026 GradePulse.</p>
          <p className="text-xs text-muted-foreground/60">{TAGLINE}</p>
        </div>
      </div>
    </footer>
  );
}
