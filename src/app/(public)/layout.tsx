import { AuthBanner } from "@/components/marketing/auth/auth-banner";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

/**
 * Public marketing layout group — completely separate from the
 * authenticated (app) layout.
 *
 * Deliberately reads no session: `cookies()`/`headers()` here would opt all six
 * public routes out of static prerendering. The auth island decides what to
 * show in the browser instead (components/marketing/auth/*), and no Supabase
 * client is imported anywhere under this subtree (qa:invariants rule D).
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col">
      {/*
        Background depth: one faint grid plus one slow ambient glow. Both are
        background-image layers inside a clipped, viewport-fixed element, so
        they can never create horizontal overflow (qa:invariants rule B) and
        never sit between the reader and the content.
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="gp-grid absolute inset-0" />
        <div className="gp-ambient gp-drift absolute inset-0" />
      </div>

      <a
        href="#content"
        className="sr-only rounded-md px-2 py-1 text-sm outline-none focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-background focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>
      <SiteHeader />
      <AuthBanner />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
