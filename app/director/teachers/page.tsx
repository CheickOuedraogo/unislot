import { requireRole } from "@/lib/auth";
import { getAllTeachers } from "@/lib/queries";
import { deleteTeacher } from "@/lib/actions/auth";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { CreateTeacherForm } from "@/components/director/CreateTeacherForm";
import { DeleteActionButton } from "@/components/director/DeleteActionButton";
import { TeacherStatusButton } from "@/components/director/TeacherStatusButton";

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
        {teachers.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary">
            Aucun enseignant. Créez le premier compte ci-dessus.
          </p>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high">
                <tr className="font-label-caps text-label-caps text-secondary uppercase">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-outline-variant font-body-sm text-body-sm"
                  >
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {t.name}
                    </td>
                    <td className="px-4 py-3 text-secondary">{t.email}</td>
                    <td className="px-4 py-3">
                      {t.is_active ? (
                        <span className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-on-success bg-success rounded-full px-2.5 py-0.5">
                          <span className="size-1.5 rounded-full bg-on-success" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-on-error bg-error rounded-full px-2.5 py-0.5">
                          <span className="size-1.5 rounded-full bg-on-error" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <TeacherStatusButton id={t.id} isActive={t.is_active} />
                        <DeleteActionButton
                          id={t.id}
                          action={deleteTeacher}
                          label={`Supprimer ${t.name}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
