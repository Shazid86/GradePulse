import { ArrowUpRight, Briefcase, Camera, GitBranch, Mail, Users } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/layout/brand";

const NAVIGATION_LINKS = [
  { title: "Features", href: "/#features" },
  { title: "About", href: "/#about" },
  { title: "FAQ", href: "/#faq" },
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

/**
 * Public marketing footer — a server component: no state, no effects, no
 * render-time clock (the copyright year is a literal). No database, no forms,
 * no newsletter.
 *
 * NAVIGATION mirrors the header anchors (Features/About/FAQ on "/");
 * "/features", "/how-it-works" and "/contact" stay reachable without being
 * in either list — Contact through "Get in touch ↗" below.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/60">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <span className="flex items-center gap-2.5">
            <BrandMark />
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight">
                GradePulse
              </span>
              <span className="block text-xs text-muted-foreground/80">
                Academic Performance Tracker
              </span>
            </span>
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground/90">
            GradePulse helps you understand where your marks actually go —
            one assessment at a time.
          </p>
          <span className="inline-flex rounded-full border border-border/60 px-3 py-1 text-[11px] font-medium text-primary">
            ✨ Built for better academic discipline
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
            Follow the journey and explore the work behind GradePulse.
          </p>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex size-11 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
          <p className="text-xs text-muted-foreground/80">
            © 2026 GradePulse. · Built independently by Shazid.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built with 💚 and discipline.
          </p>
        </div>
      </div>
    </footer>
  );
}
