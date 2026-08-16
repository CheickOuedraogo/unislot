import { requireRole } from "@/lib/auth";
import { getAllSubjects } from "@/lib/queries";
import { deleteSubject } from "@/lib/actions/subjects";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { CreateSubjectForm } from "@/components/director/CreateSubjectForm";
import { DeleteActionButton } from "@/components/director/DeleteActionButton";
import { EditSubjectModal } from "@/components/director/EditSubjectModal";

export default async function SubjectsPage() {
  const user = await requireRole("director");
  const subjects = await getAllSubjects();

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director/subjects")}
    >
      <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
        Matières
      </h1>

      <CreateSubjectForm />

      <section className="flex flex-col gap-4">
        <h2 className="font-title-md text-title-md text-on-surface">
          Liste des matières ({subjects.length})
        </h2>
        {subjects.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary">
            Aucune matière pour le moment.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="card flex items-center justify-between p-5"
              >
                <span className="font-title-sm text-title-sm text-on-surface">
                  {s.name}
                </span>
                <div className="flex items-center gap-1">
                  <EditSubjectModal subject={s} />
                  <DeleteActionButton
                    id={s.id}
                    action={deleteSubject}
                    label={`Supprimer ${s.name}`}
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
