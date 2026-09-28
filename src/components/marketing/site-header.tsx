"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Brand } from "@/components/layout/brand";
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

export const PUBLIC_NAV = [
  { title: "Features", href: "/features" },
  { title: "How It Works", href: "/how-it-works" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
] as const;

function NavLinks({
  onNavigate,
  horizontal,
}: {
  onNavigate?: () => void;
  horizontal?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={horizontal ? "Primary" : "Mobile"}
      className={horizontal ? "flex items-center gap-1" : "flex flex-col gap-1 p-2"}
    >
      {PUBLIC_NAV.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
              horizontal && "text-muted-foreground hover:text-foreground",
              !horizontal && "hover:bg-accent",
              isActive && (horizontal ? "text-foreground" : "bg-accent")
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

/** Public marketing header — never renders inside the authenticated app. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-md"
          aria-label="GradePulse home"
        >
          <Brand />
        </Link>

        <div className="hidden items-center md:flex">
          <NavLinks horizontal />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Get Started</Link>
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
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="h-16 justify-center border-b border-border/60 px-4 text-left">
                <SheetTitle className="text-sm">
                  <Brand />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Website navigation
                </SheetDescription>
              </SheetHeader>
              <NavLinks onNavigate={() => setOpen(false)} />
              <div className="space-y-2 border-t border-border/60 p-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
