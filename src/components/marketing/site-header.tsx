"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Brand } from "@/components/layout/brand";
import { AuthNavSlot } from "@/components/marketing/auth/auth-nav-slot";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Public navigation. "/how-it-works" is deliberately absent: the page stays
 * live and directly reachable, it is simply no longer in the primary nav.
 */
export const PUBLIC_NAV = [
  { title: "Features", href: "/features" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
] as const;

const GET_STARTED_HREF = "/calculator";

function NavLink({
  href,
  title,
  active,
  onNavigate,
  className,
}: {
  href: string;
  title: string;
  active: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative rounded-md px-3 py-2 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {title}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-3 bottom-1 h-px origin-left bg-primary transition-transform duration-200 ease-out",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-hover:bg-border"
        )}
      />
    </Link>
  );
}

/** Public marketing header — never renders inside the authenticated app. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="GradePulse home"
        >
          <Brand />
        </Link>

        <nav aria-label="Primary" className="ml-3 hidden items-center md:flex">
          {PUBLIC_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              title={item.title}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden sm:inline-flex">
            <AuthNavSlot />
          </span>
          <Button size="sm" asChild className="h-9">
            <Link href={GET_STARTED_HREF}>Get Started</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 gap-0 border-border/60 bg-background/85 p-0 backdrop-blur-xl duration-[250ms]"
            >
              <SheetHeader className="h-16 justify-center border-b border-border/60 px-4 text-left">
                <SheetTitle className="text-sm">
                  <Brand />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Website navigation
                </SheetDescription>
              </SheetHeader>

              <nav aria-label="Mobile" className="flex flex-col gap-0.5 p-3">
                {PUBLIC_NAV.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    active={pathname === item.href}
                    onNavigate={() => setOpen(false)}
                    className="py-2.5 text-base"
                  />
                ))}
              </nav>

              <div className="mt-auto space-y-2 border-t border-border/60 p-4">
                <AuthNavSlot variant="stacked" />
                <Button className="w-full" asChild>
                  <Link
                    href={GET_STARTED_HREF}
                    onClick={() => setOpen(false)}
                  >
                    Get Started
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div aria-hidden className="gp-header-hairline absolute inset-x-0 bottom-0 h-px bg-border" />
    </header>
  );
}
