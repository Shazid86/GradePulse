import Link from "next/link";

import { Brand } from "@/components/layout/brand";

const PRODUCT_LINKS = [
  { title: "Features", href: "/features" },
  { title: "Calculator", href: "/calculator" },
  { title: "Get Started", href: "/auth/signup" },
] as const;

const COMPANY_LINKS = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
] as const;

/**
 * Public marketing footer. Contact/social tokens are explicit placeholders —
 * replace them with real details. No database, no forms, no newsletter.
 *
 * "/how-it-works" is intentionally unlinked here as well as in the header; the
 * page itself remains live at its URL.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/60">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 space-y-3 md:col-span-1">
          <Brand />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground/90">
            Track every mark. Understand your progress. Know what comes next.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
            Product
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
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
            Company
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {COMPANY_LINKS.map((item) => (
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
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
            Contact
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground/90">
            <li>[your.email@example.com]</li>
            <li>Facebook — [your-profile]</li>
            <li>Instagram — [your-profile]</li>
            <li>LinkedIn — [your-profile]</li>
            <li>GitHub — [your-profile]</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 sm:px-6">
          <p className="text-xs text-muted-foreground/80">
            © {new Date().getFullYear()} GradePulse. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built as a personal academic performance command center.
          </p>
        </div>
      </div>
    </footer>
  );
}
