import Link from "next/link";
import { Brand } from "@/components/layout/brand";

/**
 * Public marketing footer. Contact/social tokens are explicit placeholders —
 * replace them with real details. No database, no forms.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 space-y-3 md:col-span-1">
          <Brand />
          <p className="max-w-xs text-sm text-muted-foreground">
            GradePulse is a personal academic performance command center —
            track every mark, understand your progress, know what comes next.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Product</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/features" className="hover:text-foreground">
                Features
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-foreground">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/auth/signup" className="hover:text-foreground">
                Get Started
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Company</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Contact</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>[your.email@example.com]</li>
            <li>Facebook — [your-profile]</li>
            <li>Instagram — [your-profile]</li>
            <li>LinkedIn — [your-profile]</li>
            <li>GitHub — [your-profile]</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} GradePulse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
