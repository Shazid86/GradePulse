import { Award, CalendarDays, GraduationCap, LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Main navigation. Add new routes here as features ship
 * (e.g. Calendar) — sidebar and mobile nav pick them up.
 */
export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Semesters", href: "/semesters", icon: GraduationCap },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "GPA", href: "/gpa", icon: Award },
];
