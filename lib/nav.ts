import type { Role } from "@/lib/types";
import type { NavItem } from "@/components/layout/TopNavBar";

const BASE_NAV: Record<Role, Omit<NavItem, "active">[]> = {
  director: [
    { label: "Tableau de bord", href: "/director" },
    { label: "Enseignants", href: "/director/teachers" },
    { label: "Classes", href: "/director/classes" },
    { label: "Emploi du temps", href: "/timetable" },
    { label: "Profil", href: "/profile" },
  ],
  teacher: [
    { label: "Tableau de bord", href: "/teacher" },
    { label: "Profil", href: "/profile" },
  ],
};

export function navItemsFor(role: Role, activeHref: string): NavItem[] {
  return BASE_NAV[role].map((item) => ({
    ...item,
    active: item.href === activeHref,
  }));
}
