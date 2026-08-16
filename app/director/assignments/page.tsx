import { requireRole } from "@/lib/auth";
import {
  getAllAssignments,
  getAllClasses,
  getAllSubjects,
  getAllTeachers,
} from "@/lib/queries";
import { deleteAssignment } from "@/lib/actions/assignments";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { CreateAssignmentForm } from "@/components/director/CreateAssignmentForm";
import { DeleteActionButton } from "@/components/director/DeleteActionButton";
import { EditAssignmentModal } from "@/components/director/EditAssignmentModal";

export default async function AssignmentsPage() {
  const user = await requireRole("director");
  const [assignments, teachers, subjects, classes] = await Promise.all([
    getAllAssignments(),
    getAllTeachers(),
    getAllSubjects(),
    getAllClasses(),
  ]);

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director/assignments")}
    >
      <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
        Assignations
      </h1>
      <p className="font-body-md text-body-md text-secondary">
        Associez un enseignant à une matière pour une classe donnée.
      </p>

      <CreateAssignmentForm
        teachers={teachers}
        subjects={subjects}
        classes={classes}
      />

      <section className="flex flex-col gap-4">
        <h2 className="font-title-md text-title-md text-on-surface">
          Assignations existantes ({assignments.length})
        </h2>
        {assignments.length === 0 ? (
          <p className="font-body-sm text-body-sm text-secondary">
            Aucune assignation. Créez la première ci-dessus.
          </p>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high">
                <tr className="font-label-caps text-label-caps text-secondary uppercase">
                  <th className="px-4 py-3">Classe</th>
                  <th className="px-4 py-3">Enseignant</th>
                  <th className="px-4 py-3">Matière</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-outline-variant font-body-sm text-body-sm"
                  >
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {a.class_name}
                    </td>
                    <td className="px-4 py-3 text-secondary">{a.teacher_name}</td>
                    <td className="px-4 py-3 text-secondary">{a.subject_name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <EditAssignmentModal
                          assignment={a}
                          teachers={teachers}
                          subjects={subjects}
                          classes={classes}
                        />
                        <DeleteActionButton
                          id={a.id}
                          action={deleteAssignment}
                          label={`Supprimer l'assignation ${a.teacher_name} / ${a.subject_name} / ${a.class_name}`}
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
