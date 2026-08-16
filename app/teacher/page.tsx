import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getTeacherAssignments, getTeacherStats } from "@/lib/queries";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { StatCards } from "@/components/teacher/StatCards";
import { ClassCards } from "@/components/teacher/ClassCards";

export const metadata: Metadata = {
  title: "Tableau de bord enseignant",
};

export default async function TeacherDashboard() {
  const user = await requireRole("teacher");
  const [assignments, stats] = await Promise.all([
    getTeacherAssignments(user.id),
    getTeacherStats(user.id),
  ]);

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/teacher")}
    >
      <section className="flex flex-col gap-2">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background">
          Tableau de bord enseignant
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Aperçu de votre emploi du temps et de vos heures.
        </p>
      </section>
      <StatCards stats={stats} />
      <ClassCards classes={assignments} />
    </AppShell>
  );
}
