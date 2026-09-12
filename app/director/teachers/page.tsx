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
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Enseignants
          </h1>
          <p className="text-sm text-muted-foreground">
            {teachers.length} enseignant{teachers.length > 1 ? "s" : ""}
          </p>
        </div>
        <CreateTeacherForm />
      </section>

      <TeachersTable teachers={teachers} />
    </AppShell>
  );
}