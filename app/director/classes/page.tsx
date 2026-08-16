import { requireRole } from "@/lib/auth";
import { getAllClasses } from "@/lib/queries";
import { deleteClass } from "@/lib/actions/classes";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { CreateClassForm } from "@/components/director/CreateClassForm";
import { DeleteActionButton } from "@/components/director/DeleteActionButton";
import { EditClassModal } from "@/components/director/EditClassModal";

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
        {classes.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary">
            Aucune classe. Créez la première ci-dessus.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div
                key={c.id}
                className="card flex items-center justify-between p-5"
              >
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface">
                    {c.name}
                  </span>
                  {c.level && (
                    <span className="font-label-caps text-label-caps text-secondary uppercase">
                      {c.level}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <EditClassModal schoolClass={c} />
                  <DeleteActionButton
                    id={c.id}
                    action={deleteClass}
                    label={`Supprimer ${c.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
