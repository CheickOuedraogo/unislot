import { requireRole } from "@/lib/auth";
import { getAllTeachers } from "@/lib/queries";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { CreateTeacherForm } from "@/components/director/CreateTeacherForm";
import { TeachersTable } from "@/components/director/TeachersTable";

export default async function TeachersPage() {
  const user = await requireRole("director");
  const teachers = await getAllTeachers();

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director/teachers")}
    >
      <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
        Enseignants
      </h1>

      <CreateTeacherForm />

      <section className="flex flex-col gap-4">
        <h2 className="font-title-md text-title-md text-on-surface">
          Liste des enseignants ({teachers.length})
        </h2>
        <TeachersTable teachers={teachers} />
      </section>
    </AppShell>
  );
}
