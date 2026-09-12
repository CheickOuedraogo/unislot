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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";
import { TeacherStatusBadge } from "@/components/director/TeacherStatus";
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
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" size={18} />
        Retour aux enseignants
      </Link>

      <Card className="flex flex-col items-start gap-5 p-6 md:flex-row md:items-center">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
            {initials(teacher.first_name, teacher.last_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {teacher.name}
            </h1>
            <TeacherStatusBadge active={teacher.is_active} />
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {teacher.email}
          </p>
        </div>
        <TeacherStatusButton id={teacher.id} isActive={teacher.is_active} />
      </Card>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs tracking-wider text-muted-foreground uppercase">
            Heures totales
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {Math.round(stats.totalHours * 100) / 100} h
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs tracking-wider text-muted-foreground uppercase">
            Classes assignées
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {classCount}
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs tracking-wider text-muted-foreground uppercase">
            Matières assignées
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {teacher.assignments.length}
          </span>
        </Card>
      </section>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Matières et classes
        </h2>
        <TeacherAssignments
          teacherId={teacher.id}
          assignments={teacher.assignments}
          subjectsByClass={subjectsByClass}
          classes={classes}
        />
      </Card>

      <Card className="p-6">
        <EditTeacherForm
          userId={teacher.id}
          firstName={teacher.first_name}
          lastName={teacher.last_name}
          email={teacher.email}
        />
      </Card>

      <Card className="flex flex-col gap-3 border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-base font-semibold text-destructive">
          Zone dangereuse
        </h2>
        <p className="text-sm text-muted-foreground">
          La suppression est définitive et ne peut pas être annulée. Les
          assignations associées seront également supprimées.
        </p>
        <DeleteTeacherButton id={teacher.id} name={teacher.name} />
      </Card>
    </AppShell>
  );
}