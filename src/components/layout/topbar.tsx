"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Brand } from "./brand";
import { SidebarNav } from "./app-sidebar";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Topbar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-3 md:px-4">
      <a
        href="#main"
        className="sr-only rounded-md px-2 py-1 text-sm outline-none focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:bg-background focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>

      {/* Mobile navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-14 justify-center border-b border-border/60 px-4 text-left">
            <SheetTitle className="text-sm">
              <Brand />
            </SheetTitle>
            <SheetDescription className="sr-only">
              Application navigation
            </SheetDescription>
          </SheetHeader>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:hidden">
        <Brand />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserMenu email={email} />
      </div>
    </header>
  );
}
