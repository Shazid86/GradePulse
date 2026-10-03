"use client";

import { ArrowUpRight, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { Brand } from "./brand";
import { markExpectSignedIn } from "./expect-signed-in";
import { navItems } from "./nav-items";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 p-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="glass sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r lg:flex">
      <div className="flex h-14 items-center border-b border-border/60 px-4">
        <Brand />
      </div>
      <SidebarNav />
      <div className="mt-auto border-t border-border/60 p-3">
        <Link
          href="/"
          onClick={markExpectSignedIn}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground outline-none hover:bg-sidebar-accent/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Globe aria-hidden="true" className="size-3.5 shrink-0" />
          Product site
          <ArrowUpRight aria-hidden="true" className="ml-auto size-3.5 shrink-0" />
        </Link>
        <p className="mt-2 px-2 text-[11px] leading-relaxed text-muted-foreground/80">
          Personal Academic Performance Command Center
        </p>
      </div>
    </aside>
  );
}
