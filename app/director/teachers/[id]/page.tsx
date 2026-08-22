import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  getAllClasses,
  getAllClassSubjects,
  getTeacherById,
  getTeacherStats,
} from "@/lib/queries";
import { navItemsFor } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icon";
import { EditTeacherForm } from "@/components/director/EditTeacherForm";
import { TeacherStatusButton } from "@/components/director/TeacherStatusButton";
import { DeleteTeacherButton } from "@/components/director/DeleteTeacherButton";
import { TeacherAssignments } from "@/components/director/TeacherAssignments";

export const metadata: Metadata = {
  title: "Détail enseignant",
};

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("director");

  const [teacher, stats, classes, classSubjects] = await Promise.all([
    getTeacherById(id),
    getTeacherStats(id),
    getAllClasses(),
    getAllClassSubjects(),
  ]);
  if (!teacher) notFound();

  const subjectsByClass: Record<string, { id: string; name: string }[]> = {};
  for (const pair of classSubjects) {
    (subjectsByClass[pair.classId] ??= []).push({
      id: pair.subjectId,
      name: pair.name,
    });
  }

  const classCount = new Set(teacher.assignments.map((a) => a.className)).size;

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/director/teachers")}
    >
      <Link
        href="/director/teachers"
        className="inline-flex items-center gap-1.5 font-body-sm text-body-sm text-secondary hover:text-primary transition-colors w-fit"
      >
        <Icon name="arrow_back" size={18} />
        Retour aux enseignants
      </Link>

      <section className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
        <span
          className="inline-flex items-center justify-center size-14 shrink-0 rounded-2xl bg-primary text-on-primary font-headline-md text-headline-md font-bold"
          aria-hidden="true"
        >
          {initials(teacher.first_name, teacher.last_name)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {teacher.name}
            </h1>
            {teacher.is_active ? (
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
          </div>
          <p className="font-body-sm text-body-sm text-secondary mt-1 truncate">
            {teacher.email}
          </p>
        </div>
        <TeacherStatusButton id={teacher.id} isActive={teacher.is_active} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <div className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
            Heures totales
          </span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            {Math.round(stats.totalHours * 100) / 100} h
          </span>
        </div>
        <div className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
            Classes assignées
          </span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            {classCount}
          </span>
        </div>
        <div className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
            Matières assignées
          </span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            {teacher.assignments.length}
          </span>
        </div>
      </section>

      <section className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-title-md text-title-md text-on-surface">
          Matières et classes
        </h2>
        <TeacherAssignments
          teacherId={teacher.id}
          assignments={teacher.assignments}
          subjectsByClass={subjectsByClass}
          classes={classes}
        />
      </section>

      <section className="card bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <EditTeacherForm
          userId={teacher.id}
          firstName={teacher.first_name}
          lastName={teacher.last_name}
          email={teacher.email}
        />
      </section>

      <section className="border border-error/40 rounded-xl bg-error-container/30 p-6 flex flex-col gap-3">
        <h2 className="font-title-md text-title-md text-on-surface">
          Zone dangereuse
        </h2>
        <p className="font-body-sm text-body-sm text-secondary">
          La suppression est définitive et ne peut pas être annulée. Les
          assignations associées seront également supprimées.
        </p>
        <DeleteTeacherButton id={teacher.id} name={teacher.name} />
      </section>
    </AppShell>
  );
}
