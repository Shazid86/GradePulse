import { LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Main navigation. Add new routes here as features ship
 * (e.g. Semesters, Calendar) — sidebar and mobile nav pick them up.
 */
export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
];
