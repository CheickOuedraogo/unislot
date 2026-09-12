import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import {
  getAllTeachers,
  getClassesForUser,
  getClassSubjectTeachers,
  getSlotsForClass,
  getSubjectsForClass,
} from "@/lib/queries";
import { navItemsFor } from "@/lib/nav";
import { parseWeekStart, formatWeekRange } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { ClassSelector } from "@/components/timetable/ClassSelector";
import { WeekNavigator } from "@/components/timetable/WeekNavigator";
import { TimetableClient } from "@/components/timetable/TimetableClient";
import { ExportPdfButton } from "@/components/timetable/ExportPdfButton";

export const metadata: Metadata = {
  title: "Emploi du temps",
};

type Props = {
  searchParams: Promise<{ class?: string; week?: string }>;
};

export default async function TimetablePage({ searchParams }: Props) {
  const user = await requireUser();
  const { class: classParam, week } = await searchParams;

  const classes = await getClassesForUser(user);
  const selectedId = classes.some((c) => c.id === classParam)
    ? classParam!
    : classes[0]?.id ?? "";

  const weekStart = parseWeekStart(week);

  if (!selectedId) {
    return (
      <AppShell
        user={{ name: user.name, role: user.role }}
        navItems={navItemsFor(user.role, "/timetable")}
      >
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Emploi du temps
        </h1>
        <p className="font-body-sm text-body-sm text-secondary">
          Aucune classe disponible pour le moment.
        </p>
      </AppShell>
    );
  }

  const [slots, subjects, teachers, subjectTeachers] = await Promise.all([
    getSlotsForClass(selectedId),
    getSubjectsForClass(user, selectedId),
    getAllTeachers(),
    getClassSubjectTeachers(selectedId),
  ]);

  const selectedClass = classes.find((c) => c.id === selectedId);

  return (
    <AppShell
      user={{ name: user.name, role: user.role }}
      navItems={navItemsFor(user.role, "/timetable")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Emploi du temps
              {selectedClass && (
                <span className="text-secondary"> — {selectedClass.name}</span>
              )}
            </h1>
            <WeekNavigator
              weekStart={weekStart.toISOString().slice(0, 10)}
              classId={selectedId}
              label={formatWeekRange(weekStart)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ClassSelector
              classes={classes}
              selectedId={selectedId}
              weekStart={weekStart.toISOString().slice(0, 10)}
            />
            <ExportPdfButton
              slots={slots}
              className={selectedClass?.name ?? ""}
              weekLabel={formatWeekRange(weekStart)}
            />
          </div>
        </div>
        <TimetableClient
          slots={slots}
          subjects={subjects}
          teachers={teachers}
          subjectTeachers={subjectTeachers}
          classId={selectedId}
          weekStart={weekStart.toISOString().slice(0, 10)}
          user={{ id: user.id, role: user.role, name: user.name }}
        />
      </div>
    </AppShell>
  );
}
