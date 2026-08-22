import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  getAllTeachers,
  getAvailableSubjectsForClass,
  getClassById,
  getSubjectsOfClass,
} from "@/lib/queries";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icon";
import { EditClassModal } from "@/components/director/EditClassModal";
import { DeleteActionButton } from "@/components/director/DeleteActionButton";
import { deleteClass } from "@/lib/actions/classes";
import {
  ClassSubjects,
  type ClassSubjectItem,
} from "@/components/director/ClassSubjects";

export const metadata: Metadata = { title: "Détail classe" };

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("director");
  const schoolClass = await getClassById(id);
  if (!schoolClass) notFound();

  const [subjects, availableSubjects, teachers] = await Promise.all([
    getSubjectsOfClass(id),
    getAvailableSubjectsForClass(id),
    getAllTeachers(),
  ]);

  const items: ClassSubjectItem[] = subjects.map((s) => ({
    subjectId: s.subjectId,
    name: s.name,
    teachers: s.teachers.map((t) => ({
      assignmentId: t.assignmentId,
      teacherName: t.teacherName,
    })),
  }));

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director/classes")}
    >
      <Link
        href="/director/classes"
        className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-secondary hover:text-primary transition-colors w-fit"
      >
        <Icon name="arrow_back" size={18} />
        Retour aux classes
      </Link>

      <section className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <span
          className="inline-flex items-center justify-center size-14 shrink-0 rounded-2xl bg-primary text-on-primary font-headline-md text-headline-md font-bold uppercase"
          aria-hidden="true"
        >
          {schoolClass.level || schoolClass.name.charAt(0)}
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
            {schoolClass.name}
          </h1>
          <p className="font-body-sm text-body-sm text-secondary mt-1">
            Niveau : {schoolClass.level || "—"} ·{" "}
            {items.length} matière{items.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <EditClassModal schoolClass={schoolClass} />
          <DeleteActionButton
            id={schoolClass.id}
            action={deleteClass}
            label={`Supprimer ${schoolClass.name}`}
            confirmText={`Supprimer ${schoolClass.name}`}
          />
        </div>
      </section>

      <ClassSubjects
        classId={schoolClass.id}
        className={schoolClass.name}
        subjects={items}
        availableSubjects={availableSubjects}
        teachers={teachers.filter((t) => t.is_active)}
      />
    </AppShell>
  );
}
