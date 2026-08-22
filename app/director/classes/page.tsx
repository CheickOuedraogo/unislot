import { requireRole } from "@/lib/auth";
import { getAllClasses } from "@/lib/queries";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { CreateClassForm } from "@/components/director/CreateClassForm";
import { ClassCard } from "@/components/director/ClassCard";

export default async function ClassesPage() {
  const user = await requireRole("director");
  const classes = await getAllClasses();

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director/classes")}
    >
      <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
        Classes
      </h1>

      <CreateClassForm />

      <section className="flex flex-col gap-4">
        <h2 className="font-title-md text-title-md text-on-surface">
          Liste des classes ({classes.length})
        </h2>
        <p className="font-body-sm text-body-sm -mt-2 text-secondary">
          Cliquez sur une classe pour gérer ses matières et ses enseignants.
        </p>
        {classes.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary">
            Aucune classe. Créez la première ci-dessus.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <ClassCard key={c.id} schoolClass={c} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
